// run this script to update image orientations in the Supabase database
// Do this every time you add new images
// Ensure you have the necessary environment variables set in .env.local
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// Usage: yarn update-orientations

const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Use environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing Supabase credentials. Please check your .env.local file.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getImageDimensions(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`,
      );
    }

    const buffer = await response.buffer();
    const { width, height } = await sharp(buffer).metadata();

    return { width, height };
  } catch (error) {
    console.error(`Error processing ${imageUrl}: ${error.message}`);
    return null;
  }
}

function determineOrientation(width, height) {
  if (width === height) return "square";
  return width > height ? "horizontal" : "vertical";
}

async function updateImageOrientation(id, imageUrl) {
  try {
    const dimensions = await getImageDimensions(imageUrl);
    if (!dimensions) return false;

    const { width, height } = dimensions;
    const orientation = determineOrientation(width, height);

    const { error } = await supabase
      .from("images")
      .update({ orientation })
      .eq("id", id);

    if (error) {
      console.error(`Error updating image ${id}: ${error.message}`);
      return false;
    }

    console.log(`Updated image ${id} with orientation: ${orientation}`);
    return true;
  } catch (error) {
    console.error(`Error processing image ${id}: ${error.message}`);
    return false;
  }
}

async function updateAllImagesOrientation() {
  console.log("Starting image orientation update process...");

  // Get all images that don't have orientation set
  const { data: images, error } = await supabase
    .from("images")
    .select("id, url")
    .is("orientation", null);

  if (error) {
    console.error("Error fetching images:", error.message);
    return;
  }

  console.log(`Found ${images.length} images to process`);

  // Process images in batches to avoid overwhelming the server
  const batchSize = 5;
  let processed = 0;
  let successful = 0;

  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    const promises = batch.map((img) =>
      updateImageOrientation(img.id, img.url),
    );

    const results = await Promise.all(promises);
    successful += results.filter(Boolean).length;
    processed += batch.length;

    console.log(
      `Progress: ${processed}/${images.length} (${successful} successful)`,
    );

    // Small delay to prevent rate limiting
    if (i + batchSize < images.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(
    `Process complete. Successfully updated ${successful}/${images.length} images.`,
  );
}

// Run the script
updateAllImagesOrientation()
  .catch((error) => console.error("Script failed:", error))
  .finally(() => console.log("Script execution finished"));
