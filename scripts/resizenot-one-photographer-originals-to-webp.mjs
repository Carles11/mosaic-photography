import fs from "fs";
import path from "path";
import sharp from "sharp";

// Set photographer name here
const author = "anne-brigman"; // Change this for each photographer

// Paths
const IMG_ROOT = "C:\\Users\\elcar\\Documents\\WEBs\\Mosaic\\IMGs";
const originalsDir = path.join(IMG_ROOT, author, "originals");
const outputDir = path.join(IMG_ROOT, author, "originalsWEBP");
const supportedExtensions = [".jpg", ".jpeg", ".png", ".tiff", ".bmp", ".webp"];

// Utility: Remove extension and add .webp
function toWebpName(filename) {
  return path.parse(filename).name + ".webp";
}

async function convertToWebp(imageName) {
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
  if (
    !fs.existsSync(originalsDir) ||
    !fs.lstatSync(originalsDir).isDirectory()
  ) {
    console.error("Originals folder not found for photographer:", author);
    return;
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const images = fs
    .readdirSync(originalsDir)
    .filter((img) =>
      supportedExtensions.includes(path.extname(img).toLowerCase())
    );
  for (const image of images) {
    await convertToWebp(image);
  }
  console.log("All originals converted for", author);
}

main().catch((err) => {
  console.error(err);
});
