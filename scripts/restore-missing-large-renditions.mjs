// Restore missing w1200/w1600 renditions on S3.
//
// Background: the June 2026 resize automation stopped generating (and cleaned
// up) upscaled renditions, so images narrower than 1200/1600px lost their
// w1200/w1600 files on S3. Google Images had already indexed those URLs, so
// they now 403 and the images fell out of the index.
//
// This script server-side-copies each image's originalsWEBP file into any
// missing w1200/w1600 key. No pixels are upscaled — the URL simply resolves
// again with the best-quality file we have. Rows whose originalsWEBP is also
// missing (DB/S3 filename mismatches) are written to
// restore-failures.txt for manual cleanup.
//
// Requirements: AWS CLI configured with write access to the bucket, and
// NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env(.local).
//
// Usage:
//   node scripts/restore-missing-large-renditions.mjs --dry-run   # report only
//   node scripts/restore-missing-large-renditions.mjs             # copy files

import { execFileSync } from "child_process";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const { supabaseAdmin } = await import("./lib/supabaseAdmin.mjs");

const BUCKET = "mosaic.photography";
const CDN_HOST = "https://cdn.mosaic.photography/";
const TARGET_FOLDERS = ["w1200", "w1600"];
const DRY_RUN = process.argv.includes("--dry-run");

function toWebp(filename) {
  return filename.replace(/\.[^/.]+$/, ".webp");
}

// List filenames in an S3 "folder" (prefix). Returns a Set.
//
// Uses s3api's JSON output rather than `aws s3 ls`: the latter's columnar
// output can't be split on whitespace safely (some filenames contain spaces)
// and mangles non-ASCII characters, which silently hides objects that exist.
//
// PYTHONIOENCODING is required because the AWS CLI is a Python program: with a
// piped (non-tty) stdout on Windows it encodes output using the locale
// codepage, so a key like "…gärtners…" comes back as bytes Node then misreads
// as UTF-8 — the object looks missing and gets reported as unrecoverable.
const AWS_ENV = { ...process.env, PYTHONIOENCODING: "utf-8" };

function listFolder(prefix) {
  try {
    const out = execFileSync(
      "aws",
      [
        "s3api",
        "list-objects-v2",
        "--bucket",
        BUCKET,
        "--prefix",
        `${prefix}/`,
        "--query",
        "Contents[].Key",
        "--output",
        "json",
      ],
      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, env: AWS_ENV },
    );
    const keys = JSON.parse(out || "null") || [];
    return new Set(
      keys
        .map((key) => key.slice(`${prefix}/`.length))
        // Ignore nested keys; we only want objects directly in this folder
        .filter((name) => name && !name.includes("/")),
    );
  } catch {
    // Folder doesn't exist / empty listing
    return new Set();
  }
}

// The AWS CLI ships as a frozen binary that ignores PYTHONIOENCODING, so any
// non-ASCII character in a listed key still comes back as U+FFFD and can never
// be matched against the (correct) database value. Passing the key *in* works
// fine, so for those few filenames we ask about the single object directly
// instead of trusting the bulk listing.
const isAscii = (s) => /^[\x20-\x7e]*$/.test(s);

function objectExists(key) {
  try {
    const out = execFileSync(
      "aws",
      [
        "s3api",
        "list-objects-v2",
        "--bucket",
        BUCKET,
        "--prefix",
        key,
        "--max-items",
        "1",
        "--query",
        "length(Contents)",
        "--output",
        "json",
      ],
      { encoding: "utf8", env: AWS_ENV },
    );
    return (JSON.parse(out.trim() || "null") || 0) > 0;
  } catch {
    return false;
  }
}

// Is `name` present in `folder`? Uses the cheap bulk listing for ordinary
// ASCII filenames and a direct lookup for the ones it cannot represent.
function hasObject(listing, prefix, folder, name) {
  return isAscii(name)
    ? listing.has(name)
    : objectExists(`${prefix}/${folder}/${name}`);
}

function copyObject(prefix, fromFolder, toFolder, filename) {
  const src = `s3://${BUCKET}/${prefix}/${fromFolder}/${filename}`;
  const dst = `s3://${BUCKET}/${prefix}/${toFolder}/${filename}`;
  if (DRY_RUN) {
    console.log(`[dry-run] would copy ${src} -> ${dst}`);
    return;
  }
  execFileSync("aws", ["s3", "cp", src, dst, "--only-show-errors"], {
    stdio: "inherit",
    env: AWS_ENV,
  });
}

async function main() {
  const { data: images, error } = await supabaseAdmin
    .from("images_resize")
    .select("base_url, filename, width")
    .limit(5000);

  if (error) {
    console.error("Error fetching images_resize:", error);
    process.exit(1);
  }

  // Group rows by base_url so each S3 folder is listed only once
  const groups = new Map();
  for (const img of images) {
    if (!img.base_url || !img.filename) continue;
    if (!groups.has(img.base_url)) groups.set(img.base_url, []);
    groups.get(img.base_url).push(img);
  }

  let restored = 0;
  let alreadyOk = 0;
  const failures = [];

  for (const [baseUrl, rows] of groups) {
    const prefix = baseUrl.replace(CDN_HOST, "").replace(/\/+$/, "");
    console.log(`\n== ${prefix} (${rows.length} images)`);

    const originals = listFolder(`${prefix}/originalsWEBP`);
    const existing = Object.fromEntries(
      TARGET_FOLDERS.map((f) => [f, listFolder(`${prefix}/${f}`)]),
    );

    for (const row of rows) {
      const name = toWebp(row.filename);
      for (const folder of TARGET_FOLDERS) {
        if (hasObject(existing[folder], prefix, folder, name)) {
          alreadyOk++;
          continue;
        }
        if (!hasObject(originals, prefix, "originalsWEBP", name)) {
          failures.push(`${prefix}/${folder}/${name} (no originalsWEBP source)`);
          continue;
        }
        copyObject(prefix, "originalsWEBP", folder, name);
        restored++;
      }
    }
  }

  console.log(`\nDone. renditions ok: ${alreadyOk}, ${DRY_RUN ? "would restore" : "restored"}: ${restored}, unrecoverable: ${failures.length}`);

  if (failures.length > 0) {
    fs.writeFileSync("restore-failures.txt", failures.join("\n"));
    console.log(
      "Rows with no originalsWEBP on S3 (DB/S3 filename mismatch — fix these in images_resize) written to restore-failures.txt",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
