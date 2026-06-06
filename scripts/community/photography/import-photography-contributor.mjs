import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import sharp from "sharp";
import { supabaseAdmin } from "../../lib/supabaseAdmin.mjs";

const contributorSlug = process.argv[2];
const isDryRun = process.argv.includes("--dry-run");
const skipConvert = process.argv.includes("--skip-convert");
const skipS3 = process.argv.includes("--skip-s3");

if (!contributorSlug) {
  console.error(
    "Usage: node scripts/contributors/import-contributor.mjs <contributor-slug> [--dry-run] [--skip-convert] [--skip-s3]",
  );
  process.exit(1);
}

const ROOT = "C:\\Users\\elcar\\Documents\\WEBs\\Mosaic\\Contributors";
const contributorDir = path.join(ROOT, contributorSlug);

// Width variants to generate (must match what your CDN/frontend expects)
const TARGET_WIDTHS = [400, 600, 800, 1200, 1600];

const SUPPORTED_ORIGINALS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".tif",
  ".tiff",
  ".webp",
  ".nef", // Nikon RAW — was missing from your script, present in older ones
];

function getPrintQuality(width, height) {
  const megapixels = (width * height) / 1_000_000;

  if (megapixels >= 20) return "professional";
  if (megapixels >= 10) return "excellent";
  if (megapixels >= 4) return "good";

  return "standard";
}

function filenameToTitle(filename) {
  return path
    .parse(filename)
    .name.replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function toWebpName(filename) {
  return path.parse(filename).name + ".webp";
}

// ─── Step helpers ────────────────────────────────────────────────────────────

/**
 * Step 1 — Convert originals → lossless-ish WEBP (originalsWEBP/)
 * Mirrors your old convert-to-webp script.
 */
async function convertOriginalsToWebp(originalsDir, webpDir) {
  console.log("");
  console.log("── Step 1: Converting originals to WEBP ──");

  if (!fs.existsSync(webpDir)) {
    fs.mkdirSync(webpDir, { recursive: true });
  }

  const images = fs
    .readdirSync(originalsDir)
    .filter((f) => SUPPORTED_ORIGINALS.includes(path.extname(f).toLowerCase()));

  for (const imageFile of images) {
    const inputPath = path.join(originalsDir, imageFile);
    const outputPath = path.join(webpDir, toWebpName(imageFile));

    if (fs.existsSync(outputPath)) {
      console.log(`  skip (exists): ${imageFile}`);
      continue;
    }

    try {
      await sharp(inputPath).rotate().webp({ quality: 95 }).toFile(outputPath);
      console.log(`  ✅ converted: ${imageFile}`);
    } catch (err) {
      console.error(`  ❌ error converting ${imageFile}:`, err.message);
    }
  }
}

/**
 * Step 2 — Generate responsive width variants from the WEBP originals (w400/, w600/ …)
 * Mirrors your old generate-sizes script.
 */
async function generateWidthVariants(webpDir, contributorDir) {
  console.log("");
  console.log("── Step 2: Generating width variants ──");

  const images = fs
    .readdirSync(webpDir)
    .filter((f) => path.extname(f).toLowerCase() === ".webp");

  for (const imageFile of images) {
    const inputPath = path.join(webpDir, imageFile);
    const metadata = await sharp(inputPath).metadata();
    const originalWidth = metadata.width;

    for (const width of TARGET_WIDTHS) {
      const outputDir = path.join(contributorDir, `w${width}`);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.join(outputDir, imageFile);

      if (originalWidth >= width) {
        if (fs.existsSync(outputPath)) {
          console.log(`  skip (exists): w${width}/${imageFile}`);
          continue;
        }

        try {
          await sharp(inputPath)
            .rotate()
            .resize({ width, withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(outputPath);

          console.log(`  ✅ w${width}: ${imageFile}`);
        } catch (err) {
          console.error(`  ❌ w${width} error for ${imageFile}:`, err.message);
        }
      } else {
        // Image is narrower than this breakpoint — remove any stale upscaled file
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
          console.log(`  🗑  removed upscaled: w${width}/${imageFile}`);
        }
      }
    }
  }
}

/**
 * Step 3 — Sync originals (non-WEBP) to S3 under /originals
 * Mirrors your old sync-originals.sh.
 */
function syncOriginalsToS3(originalsDir, s3BaseUrl, dryRun) {
  console.log("");
  console.log("── Step 3: Syncing originals to S3 ──");

  const cmd = [
    "aws s3 sync",
    `"${originalsDir}"`,
    `${s3BaseUrl}/originals`,
    dryRun ? "--dryrun" : "",
  ]
    .filter(Boolean)
    .join(" ");

  console.log(" ", cmd);
  execSync(cmd, { stdio: "inherit" });
}

/**
 * Step 4 — Sync WEBP originals + width variants to S3, excluding the raw originals folder.
 * Mirrors your old sync-webp.sh.
 */
function syncWebpToS3(contributorDir, s3BaseUrl, dryRun) {
  console.log("");
  console.log("── Step 4: Syncing WEBP variants to S3 ──");

  const cmd = [
    "aws s3 sync",
    `"${contributorDir}"`,
    s3BaseUrl,
    '--exclude "originals/*"',
    '--exclude "contributor.json"',
    '--exclude "images.json"',
    dryRun ? "--dryrun" : "",
  ]
    .filter(Boolean)
    .join(" ");

  console.log(" ", cmd);
  execSync(cmd, { stdio: "inherit" });
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log("");
console.log("=== Mosaic Contributor Importer ===");
console.log("");

console.log("Contributor:", contributorSlug);
console.log("Folder:", contributorDir);

if (!fs.existsSync(contributorDir)) {
  console.error("❌ Contributor folder not found");
  process.exit(1);
}

const contributorJsonPath = path.join(contributorDir, "contributor.json");

if (!fs.existsSync(contributorJsonPath)) {
  console.error("❌ contributor.json not found");
  process.exit(1);
}

const imagesJsonPath = path.join(contributorDir, "images.json");
let imageOverrides = {};

if (fs.existsSync(imagesJsonPath)) {
  imageOverrides = JSON.parse(fs.readFileSync(imagesJsonPath, "utf8"));
  console.log("✅ images.json found");
}

const contributorData = JSON.parse(
  fs.readFileSync(contributorJsonPath, "utf8"),
);

const s3BaseUrl = `s3://mosaic.photography/mosaic-collections/community/photography/${contributorData.slug}`;
const cdnBaseUrl = `https://cdn.mosaic.photography/mosaic-collections/community/photography/${contributorData.slug}`;

const originalsDir = path.join(contributorDir, "originals", "used");
const webpDir = path.join(contributorDir, "originalsWEBP");

if (!fs.existsSync(originalsDir)) {
  console.error("❌ originals/used folder not found");
  process.exit(1);
}

// ── Image conversion & resizing ───────────────────────────────────────────────

if (skipConvert) {
  console.log("");
  console.log("⏭  Skipping image conversion and resizing (--skip-convert)");
} else {
  await convertOriginalsToWebp(originalsDir, webpDir);
  await generateWidthVariants(webpDir, contributorDir);
}

// ── Supabase: upsert contributor ──────────────────────────────────────────────

console.log("");
console.log("── Supabase: contributor record ──");

const { data: existingContributor, error: lookupError } = await supabaseAdmin
  .from("contributors")
  .select("*")
  .eq("slug", contributorData.slug)
  .maybeSingle();

if (lookupError) {
  console.error(lookupError);
  process.exit(1);
}

let contributor = existingContributor;

if (!contributor) {
  console.log("Creating contributor...");

  const { data: newContributor, error } = await supabaseAdmin
    .from("contributors")
    .insert({
      slug: contributorData.slug,
      name: contributorData.name,
      bio: contributorData.bio,
      description: contributorData.description,
      website: contributorData.website,
      instagram: contributorData.instagram,
      featured: contributorData.featured,
      license_default: contributorData.license_default,
      country: contributorData.country,
      email: contributorData.email,
      source_type: contributorData.source_type,
      submission_notes: contributorData.submission_notes,
      default_license_url: contributorData.default_license_url,
      nudity: contributorData.nudity,
      workType: contributorData.workType, // ⚠ check your DB column name — was camelCase in original
      category: contributorData.category,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    process.exit(1);
  }

  contributor = newContributor;
  console.log("✅ Contributor created");
} else {
  console.log("✅ Contributor already exists");
}

const contributorId = contributor.id;

// After contributor is created/found, try to pull avatar_url from user_profiles
const { data: userProfile } = await supabaseAdmin
  .from("user_profiles")
  .select("avatar_url")
  .eq("email", contributorData.email)
  .maybeSingle();

if (userProfile?.avatar_url) {
  await supabaseAdmin
    .from("contributors")
    .update({ avatar_url: userProfile.avatar_url })
    .eq("id", contributorId);

  console.log("✅ avatar_url copied from user_profiles");
} else {
  console.log("ℹ️  No matching user_profiles record found, avatar_url skipped");
}

// ── Supabase: image records ───────────────────────────────────────────────────

console.log("");
console.log("── Supabase: image records ──");

const imageFiles = fs
  .readdirSync(originalsDir)
  .filter((file) =>
    SUPPORTED_ORIGINALS.includes(path.extname(file).toLowerCase()),
  )
  .sort();

console.log(`Found ${imageFiles.length} image(s)`);

const imageRecords = [];

const { data: minImage } = await supabaseAdmin
  .from("contributor_images")
  .select("image_id")
  .lt("image_id", 0)
  .order("image_id", { ascending: true })
  .limit(1);

let nextNegativeId = minImage?.[0]?.image_id ? minImage[0].image_id - 1 : -1;

for (const imageFile of imageFiles) {
  const imagePath = path.join(originalsDir, imageFile);

  const rotatedMetadata = await sharp(imagePath)
    .rotate()
    .toBuffer({ resolveWithObject: true });

  const width = rotatedMetadata.info.width;
  const height = rotatedMetadata.info.height;
  const orientation = width > height ? "horizontal" : "vertical";
  const printQuality = getPrintQuality(width, height);

  const overrides = imageOverrides[imageFile] || {};

  imageRecords.push({
    contributor_id: contributorId,
    image_id: nextNegativeId--,

    filename: imageFile,
    base_url: cdnBaseUrl,

    title: overrides.title ?? filenameToTitle(imageFile),
    description: overrides.description ?? filenameToTitle(imageFile),

    year: overrides.year ?? null,

    width,
    height,

    orientation,
    print_quality: printQuality,

    attribution: contributorData.name,

    license: contributorData.license_default,
    license_url: contributorData.default_license_url,

    featured: overrides.featured ?? false,
    nudity: overrides.nudity ?? false,

    published: true,
  });
}

if (isDryRun) {
  console.log("");
  console.log("=== DRY RUN — Supabase payload ===");
  console.log(JSON.stringify(imageRecords, null, 2));
  console.log("");
  console.log("S3 sync commands that would run:");
  syncOriginalsToS3(originalsDir, s3BaseUrl, true);
  syncWebpToS3(contributorDir, s3BaseUrl, true);
  process.exit(0);
}

const { error: insertError } = await supabaseAdmin
  .from("contributor_images")
  .insert(imageRecords);

if (insertError) {
  console.error(insertError);
  process.exit(1);
}

console.log(`✅ Inserted ${imageRecords.length} image record(s) into Supabase`);

// ── S3 sync ───────────────────────────────────────────────────────────────────

if (skipS3) {
  console.log("");
  console.log("⏭  Skipping S3 sync (--skip-s3)");
} else {
  syncOriginalsToS3(originalsDir, s3BaseUrl, false);
  syncWebpToS3(contributorDir, s3BaseUrl, false);
}

console.log("");
console.log(
  `✅ Done! Imported ${imageRecords.length} image(s) for ${contributorSlug}`,
);
