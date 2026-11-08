#!/usr/bin/env node
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  console.log(
    'Usage: node scripts/adding-new-photographers/run-pipeline.mjs --folder <slug> --author "<display name>"',
  );
}

const args = process.argv.slice(2);
let folder = "";
let author = "";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--folder") {
    folder = args[++i] || "";
  } else if (args[i] === "--author") {
    author = args[++i] || "";
  } else if (args[i] === "-h" || args[i] === "--help") {
    usage();
    process.exit(0);
  } else {
    console.error(`Unknown argument: ${args[i]}`);
    usage();
    process.exit(1);
  }
}

if (!folder || !author) {
  usage();
  process.exit(1);
}

const python = process.platform === "win32" ? "python" : "python3";

const steps = [
  {
    name: "1/3 Convert originals to WebP",
    command: process.execPath,
    args: [
      path.join(scriptDir, "1-convert-originals-to-webp.mjs"),
      "--folder",
      folder,
    ],
  },
  {
    name: "2/3 Generate responsive sizes",
    command: process.execPath,
    args: [
      path.join(scriptDir, "2-generate-responsive-sizes.mjs"),
      "--folder",
      folder,
    ],
  },
  {
    name: "3/3 Generate Supabase CSV",
    command: python,
    args: [
      path.join(scriptDir, "3-generate-supabase-csv.py"),
      "--folder",
      folder,
      "--author",
      author,
    ],
  },
];

for (const step of steps) {
  console.log(`\n=== ${step.name} ===`);
  const result = spawnSync(step.command, step.args, { stdio: "inherit" });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`Step failed: ${step.name} (exit ${result.status})`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nPipeline complete.");
