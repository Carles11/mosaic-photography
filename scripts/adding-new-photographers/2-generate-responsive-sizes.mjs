import fs from "fs";
import path from "path";

let sharp;

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

function printUsage() {
  console.log(
    "Usage: node scripts/adding-new-photographers/2-generate-responsive-sizes.mjs --folder <slug> [--folder <slug> ...]",
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
  process.exitCode = 1;
});
