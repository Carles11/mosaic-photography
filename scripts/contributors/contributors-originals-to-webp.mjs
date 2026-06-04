import fs from "fs";
import path from "path";
import sharp from "sharp";

// ==================================================
// CONFIG
// ==================================================

const CONTRIBUTOR = "elcarles";

// DO NOT CHANGE THIS PATH. MOVE YOUR photographer named folder with IMAGES TO THIS LOCATION INSTEAD.
const ROOT = "C:\\Users\\elcar\\Documents\\WEBs\\Mosaic\\Contributors";

// ==================================================

const originalsDir = path.join(ROOT, CONTRIBUTOR, "originals", "used");

const outputDir = path.join(ROOT, CONTRIBUTOR, "originalsWEBP");

const supportedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".tiff",
  ".tif",
  ".bmp",
  ".webp",
  ".NEF",
];

function toWebpName(filename) {
  return path.parse(filename).name + ".webp";
}

async function convertToWebp(imageName) {
  const inputFile = path.join(originalsDir, imageName);

  const outputFile = path.join(outputDir, toWebpName(imageName));

  try {
    await sharp(inputFile)
      .webp({
        quality: 95,
      })
      .toFile(outputFile);

    console.log(`Converted ${inputFile} -> ${outputFile}`);
  } catch (err) {
    console.error(`Error converting ${inputFile}:`, err);
  }
}

async function main() {
  if (
    !fs.existsSync(originalsDir) ||
    !fs.lstatSync(originalsDir).isDirectory()
  ) {
    console.error(`Originals folder not found: ${originalsDir}`);
    return;
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {
      recursive: true,
    });
  }

  const images = fs
    .readdirSync(originalsDir)
    .filter((img) =>
      supportedExtensions.includes(path.extname(img).toLowerCase()),
    );

  for (const image of images) {
    await convertToWebp(image);
  }

  console.log(`Finished converting originals for ${CONTRIBUTOR}`);
}

main().catch(console.error);
