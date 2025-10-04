import fs from "fs";
import path from "path";
import sharp from "sharp";

const ORIGINALS_PATH = "C:\\Users\\elcar\\Documents\\WEBs\\Mosaic\\IMGs";
const TARGET_WIDTHS = [400, 600, 800, 1200, 1600];
const INPUT_FOLDER = "originals";
const OUTPUT_BASE_PATH = ORIGINALS_PATH;
const supportedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".tiff",
  ".tif",
  ".bmp",
  ".webp",
];

// >>> Specify photographer folder here <<<
const PHOTOGRAPHER = "anne-brigman"; // Change to desired folder

function isSupportedImage(file) {
  return supportedExtensions.includes(path.extname(file).toLowerCase());
}

function toWebpName(filename) {
  return path.parse(filename).name + ".webp";
}

async function getImageWidth(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    return metadata.width;
  } catch (err) {
    console.warn(`Could not get width for ${imagePath}:`, err);
    return null;
  }
}

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
  if (!imageWidth) return;

  for (const width of TARGET_WIDTHS) {
    const outputFolder = path.join(OUTPUT_BASE_PATH, authorFolder, `w${width}`);
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }
    const outputFile = path.join(outputFolder, toWebpName(imageName));

    if (imageWidth >= width) {
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
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
        console.log(`Deleted upscaled file: ${outputFile}`);
      }
    }
  }
}

async function main() {
  // Only process specified photographer
  const author = PHOTOGRAPHER;
  const authorOriginalsWebp = path.join(ORIGINALS_PATH, author, INPUT_FOLDER);
  if (
    !fs.existsSync(authorOriginalsWebp) ||
    !fs.lstatSync(authorOriginalsWebp).isDirectory()
  ) {
    console.error(`No originals folder found for ${authorOriginalsWebp}`);
    return;
  }

  const images = fs.readdirSync(authorOriginalsWebp).filter(isSupportedImage);

  for (const image of images) {
    await processImage(author, image);
  }

  console.log(`All images for ${PHOTOGRAPHER} processed and cleaned!`);
}

main().catch((err) => {
  console.error(err);
});
