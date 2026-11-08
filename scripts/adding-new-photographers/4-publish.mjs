#!/usr/bin/env node
// Publish a public-domain photographer: S3 upload → CDN check → `photographers` row → `images_resize` rows.
// Replaces RUNBOOKS routine 1 steps 8–11. Supabase is written only after every file answers 200 on the CDN.
//
// Usage (repo root):
//   node scripts/adding-new-photographers/4-publish.mjs --folder rudolf-koppitz          # plan only (reads, aws --dryrun)
//   node scripts/adding-new-photographers/4-publish.mjs --folder rudolf-koppitz --yes    # upload + insert
//   options: --csv <path> (default: newest images_resize_{folder}_*.csv in Mosaic\Supabase), --self-test
//
// Needs: AWS CLI logged in; NEXT_PUBLIC_SUPABASE_URL (.env) + SUPABASE_SERVICE_ROLE_KEY (.env.local).
// Node 20: run with NODE_OPTIONS=--experimental-websocket (supabase-js); Node 22+ needs nothing.
// Never deletes anything (no `--delete`, no SQL delete); rollback commands are printed only.

import { execFileSync } from "child_process";
import assert from "assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(scriptDir, "..", "..");
const IMG_ROOT = "C:\\Users\\elcar\\Documents\\WEBs\\Mosaic\\IMGs";
const CSV_ROOT = "C:\\Users\\elcar\\Documents\\WEBs\\Mosaic\\Supabase";
const BUCKET = "mosaic.photography";
const PREFIX = "mosaic-collections/public-domain-collection";
// Post-upload check only; app code builds URLs with src/utils/imageResizingS3.ts.
const CDN = `https://cdn.mosaic.photography/${PREFIX}`;
const WIDTHS = [400, 600, 800, 1200, 1600]; // same as 2-generate-responsive-sizes.mjs
const BATCH = 200;
const PAGE = 1000;

// RFC 4180: quoted fields, "" escapes, CRLF/LF, BOM.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c !== '"') field += c;
      else if (text[i + 1] === '"') (field += '"'), i++;
      else quoted = false;
    } else if (c === '"') quoted = true;
    else if (c === ",") row.push(field), (field = "");
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field), rows.push(row), (row = []), (field = "");
    } else field += c;
  }
  if (field || row.length) row.push(field), rows.push(row);
  const [header, ...body] = rows.filter((r) => r.some((v) => v !== ""));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

function selfTest() {
  const csv =
    '\uFEFFfilename,year,moderation\r\na_b.webp,1910,"{""banned"": {""web"": false}, ""x"": null}"\r\n' +
    '"c,d.webp",,"line\nbreak"\n';
  assert.deepStrictEqual(parseCsv(csv), [
    { filename: "a_b.webp", year: "1910", moderation: '{"banned": {"web": false}, "x": null}' },
    { filename: "c,d.webp", year: "", moderation: "line\nbreak" },
  ]);
  assert.deepStrictEqual(JSON.parse(parseCsv(csv)[0].moderation).banned, { web: false });
  console.log("self-test ok");
}

function usage() {
  console.log("Usage: node scripts/adding-new-photographers/4-publish.mjs --folder <slug> [--csv <path>] [--yes]");
}

function fail(errors) {
  console.error(`\n✖ ${errors.length} problem(s), nothing remote was written:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const stem = (f) => f.replace(/\.[^.]+$/, "");
const isDate = (s) =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);
const emptyToNull = (v) => (v === "" ? null : v);

// ---- args ----
const args = process.argv.slice(2);
let folder = "";
let csvPath = "";
let yes = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--folder") folder = args[++i] || "";
  else if (args[i] === "--csv") csvPath = args[++i] || "";
  else if (args[i] === "--yes") yes = true;
  else if (args[i] === "--self-test") selfTest(), process.exit(0);
  else if (args[i] === "-h" || args[i] === "--help") usage(), process.exit(0);
  else console.error(`Unknown argument: ${args[i]}`), usage(), process.exit(1);
}
if (!folder) usage(), process.exit(1);

// ---- 1. validate locally ----
const errors = [];
const dir = path.join(IMG_ROOT, folder);
const webpDir = path.join(dir, "originalsWEBP");
if (!fs.existsSync(webpDir)) fail([`missing ${webpDir}`]);

const pjPath = path.join(dir, "_commons", "photographer.json");
let pj = {};
try {
  pj = JSON.parse(fs.readFileSync(pjPath, "utf8"));
} catch (e) {
  fail([`cannot read ${pjPath}: ${e.message}`]);
}
// web reads intro_md/biography_md; mobile reads intro/biography (plain text, SHOULD_RENDER_MARKDOWN=false).
for (const k of ["name", "surname", "author", "slug", "origin", "intro", "intro_md", "biography", "biography_md"]) {
  if (typeof pj[k] !== "string" || !pj[k].trim()) errors.push(`photographer.json: "${k}" missing or empty`);
}
if (!isDate(pj.birthdate)) errors.push('photographer.json: "birthdate" must be YYYY-MM-DD');
if (pj.deceasedate != null && !isDate(pj.deceasedate)) errors.push('photographer.json: "deceasedate" must be YYYY-MM-DD or null');
if (typeof pj.slug === "string" && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(pj.slug)) {
  errors.push(`photographer.json: slug "${pj.slug}" must be lowercase ASCII words joined by "-"`);
}

if (!csvPath) {
  const re = new RegExp(`^images_resize_${folder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}_.*\\.csv$`);
  const found = fs.existsSync(CSV_ROOT) ? fs.readdirSync(CSV_ROOT).filter((f) => re.test(f)) : [];
  found.sort((a, b) => fs.statSync(path.join(CSV_ROOT, b)).mtimeMs - fs.statSync(path.join(CSV_ROOT, a)).mtimeMs);
  if (!found.length) fail([`no images_resize_${folder}_*.csv in ${CSV_ROOT} (pass --csv)`]);
  csvPath = path.join(CSV_ROOT, found[0]);
}
const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));

const webps = fs.readdirSync(webpDir).filter((f) => f.toLowerCase().endsWith(".webp"));
const webpStems = new Set(webps.map(stem));
const rowByStem = new Map();
for (const r of rows) {
  const s = stem(r.filename || "");
  if (rowByStem.has(s)) errors.push(`CSV: duplicate row for ${r.filename}`);
  rowByStem.set(s, r);
  if (!webpStems.has(s)) errors.push(`CSV row without originalsWEBP file: ${r.filename}`);
  if (r.author !== pj.author) errors.push(`CSV ${r.filename}: author "${r.author}" ≠ photographer.json "${pj.author}"`);
  if (r.base_url !== `${CDN}/${folder}`) errors.push(`CSV ${r.filename}: base_url "${r.base_url}" ≠ ${CDN}/${folder}`);
  if (!["nude", "not-nude"].includes(r.nudity)) errors.push(`CSV ${r.filename}: nudity "${r.nudity}"`);
  if (!/^\d{4}$/.test(r.year)) errors.push(`CSV ${r.filename}: year "${r.year}" (edit the CSV)`);
  if (!["vertical", "horizontal", "square"].includes(r.orientation)) {
    errors.push(`CSV ${r.filename}: orientation "${r.orientation}" (edit the CSV)`);
  }
  if (!(Number(r.width) > 0) || !(Number(r.height) > 0)) errors.push(`CSV ${r.filename}: width/height missing`);
  if (r.moderation) {
    try {
      JSON.parse(r.moderation);
    } catch {
      errors.push(`CSV ${r.filename}: moderation is not valid JSON`);
    }
  }
}
for (const f of webps) if (!rowByStem.has(stem(f))) errors.push(`originalsWEBP file without CSV row: ${f}`);

const portraits = webps.filter((f) => f.startsWith(`000_aaa_${folder}.`) || f.startsWith(`000_aaa_${folder}_`));
const otherAaa = webps.filter((f) => f.startsWith("000_aaa") && !portraits.includes(f));
if (portraits.length !== 1 || otherAaa.length) {
  errors.push(`need exactly one 000_aaa_${folder}.* portrait in originalsWEBP, found: ${[...portraits, ...otherAaa].join(", ") || "none"}`);
}

// Same grid the app requests: originalsWEBP + every w{n} with n ≤ width (2-generate never upscales).
const expected = [];
for (const f of webps) {
  const width = Number(rowByStem.get(stem(f))?.width) || 0;
  for (const sub of ["originalsWEBP", ...WIDTHS.filter((w) => w <= width).map((w) => `w${w}`)]) {
    if (fs.existsSync(path.join(dir, sub, f))) expected.push(`${sub}/${f}`);
    else errors.push(`missing local rendition ${sub}/${f}`);
  }
}
if (errors.length) fail(errors);

// ---- remote reads (no writes) ----
dotenv.config({ path: path.join(repoRoot, ".env"), quiet: true });
dotenv.config({ path: path.join(repoRoot, ".env.local"), override: true, quiet: true });
const { supabaseAdmin: db } = await import("../lib/supabaseAdmin.mjs");

async function must(query, what) {
  const { data, error } = await query;
  if (error) console.error(`✖ ${what}: ${error.message}`), process.exit(1);
  return data;
}

const cols = "id, author, slug";
const byAuthor = await must(db.from("photographers").select(cols).eq("author", pj.author), "read photographers");
const bySlug = await must(db.from("photographers").select(cols).eq("slug", pj.slug), "read photographers");
const slugOwner = bySlug.find((p) => p.author !== pj.author);
if (slugOwner) fail([`slug "${pj.slug}" already belongs to "${slugOwner.author}" (id ${slugOwner.id})`]);
const existingPhotographer = byAuthor[0] ?? null;

const existingFiles = new Set();
for (let from = 0; ; from += PAGE) {
  const page = await must(
    db.from("images_resize").select("filename").eq("author", pj.author).order("id").range(from, from + PAGE - 1),
    "read images_resize",
  );
  page.forEach((r) => existingFiles.add(r.filename));
  if (page.length < PAGE) break;
}
const newRows = rows.filter((r) => !existingFiles.has(r.filename));

// ---- plan ----
const s3Target = `s3://${BUCKET}/${PREFIX}/${folder}`;
console.log(`\n=== Plan: ${folder} ${yes ? "(--yes)" : "(plan only)"} ===`);
console.log(`CSV: ${csvPath}`);
console.log("Local files:");
for (const sub of fs.readdirSync(dir).filter((d) => d !== "_commons" && fs.statSync(path.join(dir, d)).isDirectory())) {
  console.log(`  ${sub.padEnd(14)} ${fs.readdirSync(path.join(dir, sub)).length}`);
}
console.log(`S3 target: ${s3Target}  (excluding _commons/, never --delete)`);
console.log(`CDN checks after upload: ${expected.length}`);
if (existingPhotographer) {
  console.log(`photographers: exists, skipped (id ${existingPhotographer.id}, slug "${existingPhotographer.slug}")`);
  if (existingPhotographer.slug !== pj.slug) console.log(`  ⚠ existing slug differs from photographer.json "${pj.slug}" — not updated`);
} else {
  console.log(`photographers: insert author "${pj.author}", slug "${pj.slug}", ${pj.birthdate}–${pj.deceasedate ?? "?"}, ${pj.origin}`);
}
console.log(`images_resize: ${newRows.length} to insert, ${rows.length - newRows.length} already present`);

// ---- 2. S3 sync (dry run first, always) ----
const syncArgs = ["s3", "sync", dir, s3Target, "--exclude", "_commons/*"];
const dry = execFileSync("aws", [...syncArgs, "--dryrun"], { encoding: "utf8" });
console.log(`\n--- aws s3 sync --dryrun ---\n${dry.trim() || "(nothing to upload)"}`);
if (/_commons/.test(dry)) fail(["dry run would upload _commons/ — exclude not working"]);
if (!yes) {
  console.log("\nPlan only. Re-run with --yes to upload and insert.");
  process.exit(0);
}
execFileSync("aws", syncArgs, { stdio: "inherit" });
const uploadedCount = dry.split("\n").filter((l) => l.includes("upload:")).length;

// ---- 3. CDN check ----
const cdnFailures = [];
const queue = [...expected];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    for (let key; (key = queue.shift()); ) {
      const [sub, file] = key.split("/");
      const url = `${CDN}/${folder}/${sub}/${encodeURIComponent(file)}`;
      try {
        const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(15000) });
        if (res.status !== 200) cdnFailures.push(`${res.status} ${url}`);
      } catch (e) {
        cdnFailures.push(`${e.message} ${url}`);
      }
    }
  }),
);
if (cdnFailures.length) {
  console.error(`\n✖ ${cdnFailures.length} CDN check(s) failed, Supabase not touched:`);
  cdnFailures.forEach((f) => console.error(`  ${f}`));
  process.exit(1);
}
console.log(`\nCDN: ${expected.length}/${expected.length} returned 200`);

// ---- 4 + 5. Supabase writes ----
let photographerId = existingPhotographer?.id ?? null;
let photographerInserted = false;
const insertedIds = [];

function report(ok) {
  console.log(`\n=== Report (${ok ? "done" : "STOPPED"}) ===`);
  console.log(`S3: ${uploadedCount} file(s) uploaded to ${s3Target}`);
  console.log(`CDN: ${expected.length} checked, all 200`);
  console.log(`photographers: ${photographerInserted ? "inserted" : "exists, skipped"} (id ${photographerId ?? "?"})`);
  console.log(`images_resize: ${insertedIds.length} inserted, ${rows.length - newRows.length} skipped (already present)`);
  console.log("Note: no unique constraint on images_resize.filename (duplicates exist); re-runs dedupe by author+filename.");
  console.log("\nRollback (printed only, NOT executed):");
  if (insertedIds.length) console.log(`  delete from public.images_resize where id in (${insertedIds.join(", ")});`);
  if (photographerInserted) console.log(`  delete from public.photographers where id = ${photographerId};`);
  console.log(`  aws s3 rm ${s3Target} --recursive --dryrun`);
}

if (!existingPhotographer) {
  const { data, error } = await db
    .from("photographers")
    .insert({
      name: pj.name,
      surname: pj.surname,
      author: pj.author,
      slug: pj.slug,
      origin: pj.origin,
      intro: pj.intro,
      intro_md: pj.intro_md,
      biography: pj.biography,
      biography_md: pj.biography_md,
      birthdate: `${pj.birthdate}T00:00:00Z`,
      deceasedate: pj.deceasedate ? `${pj.deceasedate}T00:00:00Z` : null,
      website: pj.website ?? null,
      instagram: pj.instagram ?? null,
      random_order: Math.random(), // every row has one; the web orders photographers by it
    })
    .select("id")
    .single();
  if (error) console.error(`✖ insert photographers: ${error.message}`), report(false), process.exit(1);
  photographerId = data.id;
  photographerInserted = true;
}

for (let i = 0; i < newRows.length; i += BATCH) {
  const batch = newRows.slice(i, i + BATCH).map((r) => ({
    base_url: r.base_url,
    filename: r.filename,
    author: r.author,
    title: emptyToNull(r.title),
    description: emptyToNull(r.description),
    year: Number(r.year),
    orientation: r.orientation,
    color: emptyToNull(r.color),
    nudity: r.nudity,
    gender: emptyToNull(r.gender),
    width: Number(r.width),
    height: Number(r.height),
    print_quality: emptyToNull(r.print_quality),
    moderation: r.moderation ? JSON.parse(r.moderation) : null,
  }));
  const { data, error } = await db.from("images_resize").insert(batch).select("id");
  if (error) console.error(`✖ insert images_resize: ${error.message}`), report(false), process.exit(1);
  insertedIds.push(...data.map((r) => r.id));
}

report(true);
