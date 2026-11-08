import fs from "fs";
import path from "path";

let sharp;

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

function printUsage() {
  console.log(
    "Usage: node scripts/adding-new-photographers/1-convert-originals-to-webp.mjs --folder <slug> [--folder <slug> ...]",
  );
}

function parseFolders(argv) {
  const folders = [];

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--folder") {
      const value = argv[++i];
      if (!value) throw new Error("Missing value for --folder");
      folders.push(value);
    } else if (argv[i] === "-h" || argv[i] === "--help") {
      return null;
    } else {
      throw new Error(`Unknown argument: ${argv[i]}`);
    }
  }

  return folders;
}

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
  let folders;
  try {
    folders = parseFolders(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    printUsage();
    process.exit(1);
  }

  if (!folders || folders.length === 0) {
    printUsage();
    process.exit(1);
  }

  ({ default: sharp } = await import("sharp"));

  for (const author of folders) {
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
  process.exitCode = 1;
});
