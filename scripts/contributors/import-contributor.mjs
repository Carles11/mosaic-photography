import fs from "fs";
import path from "path";
import sharp from "sharp";
import { supabaseAdmin } from "../lib/supabaseAdmin.mjs";

const contributorSlug = process.argv[2];
const isDryRun = process.argv.includes("--dry-run");

if (!contributorSlug) {
  console.error(
    "Usage: node scripts/contributors/import-contributor.mjs <contributor-slug>",
  );
  process.exit(1);
}

const ROOT = "C:\\Users\\elcar\\Documents\\WEBs\\Mosaic\\Contributors";
const contributorDir = path.join(ROOT, contributorSlug);

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

const baseUrl = `https://cdn.mosaic.photography/mosaic-collections/community/photography/${contributorData.slug}`;

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
      workType: contributorData.workType,
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

const originalsDir = path.join(contributorDir, "originals", "used");

if (!fs.existsSync(originalsDir)) {
  console.error("❌ originals/used folder not found");
  process.exit(1);
}

const supportedExtensions = [".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"];

const imageFiles = fs
  .readdirSync(originalsDir)
  .filter((file) =>
    supportedExtensions.includes(path.extname(file).toLowerCase()),
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

  const metadata = await sharp(imagePath).rotate().metadata();

  const width = metadata.width;
  const height = metadata.height;

  const orientation = width > height ? "horizontal" : "vertical";

  const printQuality = getPrintQuality(width, height);

  const overrides = imageOverrides[imageFile] || {};

  imageRecords.push({
    contributor_id: contributorId,
    image_id: nextNegativeId--,

    filename: imageFile,
    base_url: baseUrl,

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
  console.log("=== DRY RUN ===");
  console.log(JSON.stringify(imageRecords, null, 2));
  process.exit(0);
}

const { error: insertError } = await supabaseAdmin
  .from("contributor_images")
  .insert(imageRecords);

if (insertError) {
  console.error(insertError);
  process.exit(1);
}

console.log("");
console.log(`✅ Imported ${imageRecords.length} image(s)`);
