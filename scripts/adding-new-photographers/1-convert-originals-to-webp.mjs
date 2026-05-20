import fs from "fs";
import path from "path";
import sharp from "sharp";

// UPDATE THIS!!!: Process both new photographers
const authors = ["matthew-brady", "julia-margaret-cameron"];

const IMG_ROOT = "C:\\Users\\elcar\\Documents\\WEBs\\Mosaic\\IMGs";
const supportedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".tiff",
  ".tif",
  ".bmp",
  ".webp",
];

function toWebpName(filename) {
  return path.parse(filename).name + ".webp";
}

async function convertToWebp(imageName, originalsDir, outputDir) {
  const inputFile = path.join(originalsDir, imageName);
  const outputFile = path.join(outputDir, toWebpName(imageName));
  try {
    await sharp(inputFile).webp({ quality: 95 }).toFile(outputFile);
    console.log(`Converted ${inputFile} -> ${outputFile}`);
  } catch (err) {
    console.error(`Error converting ${inputFile}:`, err);
  }
}

async function main() {
  for (const author of authors) {
    const originalsDir = path.join(IMG_ROOT, author, "originals");
    const outputDir = path.join(IMG_ROOT, author, "originalsWEBP");

    if (
      !fs.existsSync(originalsDir) ||
      !fs.lstatSync(originalsDir).isDirectory()
    ) {
      console.error("Originals folder not found for photographer:", author);
      continue;
    }
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const images = fs
      .readdirSync(originalsDir)
      .filter((img) =>
        supportedExtensions.includes(path.extname(img).toLowerCase()),
      );

    console.log(
      `\nStarting conversion for ${author}... Found ${images.length} images.`,
    );

    for (const image of images) {
      await convertToWebp(image, originalsDir, outputDir);
    }
    console.log(`All originals converted for ${author}`);
  }
}

main().catch((err) => {
  console.error(err);
});
