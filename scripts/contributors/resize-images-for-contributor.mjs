import fs from "fs";
import path from "path";
import sharp from "sharp";

// ==================================================
// CONFIG
// ==================================================

const CONTRIBUTOR = "elcarles";

// DO NOT CHANGE THIS PATH. MOVE YOUR photographer named folder with IMAGES TO THIS LOCATION INSTEAD.
const ROOT = "C:\\Users\\elcar\\Documents\\WEBs\\Mosaic\\Contributors";

const TARGET_WIDTHS = [400, 600, 800, 1200, 1600];

// ==================================================

const INPUT_FOLDER = "originalsWEBP";

const supportedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".tiff",
  ".tif",
  ".bmp",
  ".webp",
];

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

async function processImage(imageName) {
  const inputFile = path.join(ROOT, CONTRIBUTOR, INPUT_FOLDER, imageName);

  if (!fs.existsSync(inputFile)) {
    console.warn(`Missing original: ${inputFile}`);

    return;
  }

  const imageWidth = await getImageWidth(inputFile);

  if (!imageWidth) return;

  for (const width of TARGET_WIDTHS) {
    const outputFolder = path.join(ROOT, CONTRIBUTOR, `w${width}`);

    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, {
        recursive: true,
      });
    }

    const outputFile = path.join(outputFolder, toWebpName(imageName));

    if (imageWidth >= width) {
      try {
        await sharp(inputFile)
          .rotate()
          .resize({
            width,
            withoutEnlargement: true,
          })
          .webp({
            quality: 85,
          })
          .toFile(outputFile);

        console.log(`Created w${width}: ${imageName}`);
      } catch (err) {
        console.error(`Error creating w${width} for ${imageName}:`, err);
      }
    } else {
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);

        console.log(`Deleted upscaled version: ${outputFile}`);
      }
    }
  }
}

async function main() {
  const originalsFolder = path.join(ROOT, CONTRIBUTOR, INPUT_FOLDER);

  if (
    !fs.existsSync(originalsFolder) ||
    !fs.lstatSync(originalsFolder).isDirectory()
  ) {
    console.error(`Folder not found: ${originalsFolder}`);

    return;
  }

  const images = fs.readdirSync(originalsFolder).filter(isSupportedImage);

  for (const image of images) {
    await processImage(image);
  }

  console.log(`Finished processing contributor ${CONTRIBUTOR}`);
}

main().catch(console.error);
