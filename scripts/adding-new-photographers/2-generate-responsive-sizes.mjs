import fs from "fs";
import path from "path";
import sharp from "sharp";

// Process both new photographers
const authors = ["matthew-brady", "julia-margaret-cameron"];

const IMG_ROOT = "C:\\Users\\elcar\\Documents\\WEBs\\Mosaic\\IMGs";
const TARGET_WIDTHS = [400, 600, 800, 1200, 1600];

async function getImageWidth(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    return metadata.width;
  } catch (err) {
    console.warn(`Could not get width for ${imagePath}:`, err);
    return null;
  }
}

async function processImage(author, imageName) {
  const originalsDir = path.join(IMG_ROOT, author, "originalsWEBP");
  const inputFile = path.join(originalsDir, imageName);

  if (!fs.existsSync(inputFile)) {
    console.warn(`Missing original: ${inputFile}`);
    return;
  }

  const imageWidth = await getImageWidth(inputFile);
  if (!imageWidth) return;

  for (const width of TARGET_WIDTHS) {
    const outputFolder = path.join(IMG_ROOT, author, `w${width}`);

    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    const outputFile = path.join(outputFolder, imageName);

    // Only resize if the original is larger or equal to the target width
    if (imageWidth >= width) {
      try {
        await sharp(inputFile)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 85 }) // slightly more compressed for smaller sizes
          .toFile(outputFile);
        console.log(`Resized ${inputFile} -> w${width}`);
      } catch (err) {
        console.error(`Error resizing ${inputFile} to w${width}:`, err);
      }
    } else {
      // Clean up if a smaller image was previously upscaled here by accident
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
        console.log(`Skipped and cleaned upscaled file: ${outputFile}`);
      }
    }
  }
}

async function main() {
  for (const author of authors) {
    const originalsDir = path.join(IMG_ROOT, author, "originalsWEBP");

    if (
      !fs.existsSync(originalsDir) ||
      !fs.lstatSync(originalsDir).isDirectory()
    ) {
      console.error(
        `Missing originalsWEBP folder for ${author}. Did Step 1 finish?`,
      );
      continue;
    }

    const images = fs
      .readdirSync(originalsDir)
      .filter((img) => path.extname(img).toLowerCase() === ".webp");

    console.log(
      `\nGenerating responsive sizes for ${author}... (${images.length} images)`,
    );

    for (const image of images) {
      await processImage(author, image);
    }
    console.log(`All responsive sizes generated for ${author}`);
  }
}

main().catch((err) => {
  console.error(err);
});
