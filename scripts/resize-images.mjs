import fs from "fs";
import path from "path";
import sharp from "sharp";

const ORIGINALS_PATH = "C:\\Users\\elcar\\Documents\\WEBs\\Mosaic\\IMGs";
const TARGET_WIDTHS = [400, 600, 800, 1200, 1600];
const INPUT_FOLDER = "originals";
const OUTPUT_BASE_PATH = ORIGINALS_PATH;
const supportedExtensions = [".jpg", ".jpeg", ".png", ".tiff", ".bmp", ".webp"];

// Utility: check if file is an image we want to process
function isSupportedImage(file) {
  return supportedExtensions.includes(path.extname(file).toLowerCase());
}

// Utility: Remove extension and add .webp
function toWebpName(filename) {
  return path.parse(filename).name + ".webp";
}

// Get image width using sharp (async)
async function getImageWidth(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    return metadata.width;
  } catch (err) {
    console.warn(`Could not get width for ${imagePath}:`, err);
    return null;
  }
}

// Resize or remove images according to logic
async function processImage(authorFolder, imageName) {
  const originalWebpFolder = path.join(
    OUTPUT_BASE_PATH,
    authorFolder,
    INPUT_FOLDER
  );
  const inputFile = path.join(originalWebpFolder, imageName);

  if (!fs.existsSync(inputFile)) {
    console.warn(`Missing original: ${inputFile}`);
    return;
  }

  const imageWidth = await getImageWidth(inputFile);

  // If we can't read width, skip this image
  if (!imageWidth) return;

  for (const width of TARGET_WIDTHS) {
    const outputFolder = path.join(OUTPUT_BASE_PATH, authorFolder, `w${width}`);
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }
    const outputFile = path.join(outputFolder, toWebpName(imageName));

    if (imageWidth >= width) {
      // Should exist, (re)create
      try {
        await sharp(inputFile)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(outputFile);
        console.log(`Resized ${inputFile} -> ${outputFile}`);
      } catch (err) {
        console.error(`Error resizing ${inputFile} to width ${width}:`, err);
      }
    } else {
      // Should NOT exist, delete if it does
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
        console.log(`Deleted upscaled file: ${outputFile}`);
      }
    }
  }
}

// Main script: walk through each photographer folder in originalsWEBP
async function main() {
  const authors = fs.readdirSync(ORIGINALS_PATH).filter((dir) => {
    const fullPath = path.join(ORIGINALS_PATH, dir);
    return fs.lstatSync(fullPath).isDirectory();
  });

  for (const author of authors) {
    const authorOriginalsWebp = path.join(ORIGINALS_PATH, author, INPUT_FOLDER);
    if (
      !fs.existsSync(authorOriginalsWebp) ||
      !fs.lstatSync(authorOriginalsWebp).isDirectory()
    )
      continue;

    const images = fs.readdirSync(authorOriginalsWebp).filter(isSupportedImage);

    for (const image of images) {
      await processImage(author, image);
    }
  }

  console.log("All images processed and cleaned!");
}

main().catch((err) => {
  console.error(err);
});
