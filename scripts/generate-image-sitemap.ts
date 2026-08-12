import { config } from "dotenv";
config();
config({ path: ".env.local", override: true });
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateImageSitemap() {
  // Fetch all resized images
  const { data: images, error } = await supabase
    .from("images_resize")
    .select(
      "id, base_url, filename, title, description, author, width, height, orientation, color, nudity",
    )
    .limit(5000);

  if (error) {
    console.error("Error fetching images_resize:", error);
    return;
  }

  // Fetch all photographers
  const { data: photographers, error: photographerError } = await supabase
    .from("photographers")
    .select("name, surname, origin");

  if (photographerError) {
    console.error("Error fetching photographers:", photographerError);
    return;
  }

  // Create XML sitemap
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Add homepage with featured images (first 10 images)
  sitemap += `  <url>
    <loc>https://www.mosaic.photography/</loc>
`;

  images.slice(0, 10).forEach((image) => {
    sitemap += makeImageXml(image, undefined);
  });

  sitemap += `  </url>
`;

  // Add photographer pages with their images
  photographers.forEach((photographer) => {
    // Build photographer slug
    const slug = `${photographer.surname}`.toLowerCase().replace(/\s+/g, "-");
    const photographerImages = images.filter(
      (img) =>
        img.author &&
        img.author.toLowerCase().includes(photographer.surname.toLowerCase()),
    );

    if (photographerImages.length > 0) {
      sitemap += `  <url>
    <loc>https://www.mosaic.photography/photographers/${slug}</loc>
`;

      photographerImages.forEach((image) => {
        sitemap += makeImageXml(image);
      });

      sitemap += `  </url>
`;
    }
  });

  // Close sitemap
  sitemap += `</urlset>`;

  // Write to file
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(path.join(publicDir, "image-sitemap.xml"), sitemap);
  console.log("Image sitemap generated successfully!");
}

// Size buckets the resize pipeline actually generates (no upscaling —
// a bucket only exists when the original is at least that wide).
// Keep in sync with S3_SIZE_WIDTHS in src/utils/imageResizingS3.ts.
const S3_SIZE_WIDTHS = [400, 600, 800, 1200, 1600];

// Largest size bucket guaranteed to exist for an image of the given width.
// Falls back to originalsWEBP (always present) when width is unknown or
// smaller than every bucket.
function bestSizeFolder(width?: number): string {
  if (!width) return "originalsWEBP";
  const available = S3_SIZE_WIDTHS.filter((w) => w <= width);
  return available.length > 0
    ? `w${available[available.length - 1]}`
    : "originalsWEBP";
}

// Helper function to create <image:image> block
function makeImageXml(
  image: {
    base_url: string;
    filename: string;
    title?: string;
    description?: string;
    author?: string;
    width?: number;
    height?: number;
    orientation?: string;
    color?: string;
    nudity?: string;
  },
  geo_location?: string,
) {
  // base_url already contains the full CDN base path; just append size bucket + filename
  const filenameWebp = image.filename.replace(/\.[^/.]+$/, ".webp");
  // A few filenames contain characters that must be percent-encoded to fetch:
  // spaces and non-ASCII ("gärtners") are invalid in a sitemap <loc>, and a
  // literal "+" is decoded as a space by the CDN, so the object 403s unless
  // sent as %2B. encodeURI leaves "+" alone, hence the extra replace.
  const loc = encodeURI(
    `${image.base_url}/${bestSizeFolder(image.width)}/${filenameWebp}`,
  ).replace(/\+/g, "%2B");
  return `    <image:image>
      <image:loc>${loc}</image:loc>
      <image:title>${escapeXml(
        image.title || "Vintage Photography",
      )}</image:title>
      <image:caption>${escapeXml(
        image.description || "Vintage nude photography from Mosaic Gallery",
      )}</image:caption>
      ${
        geo_location
          ? `<image:geo_location>${escapeXml(
              geo_location,
            )}</image:geo_location>`
          : ""
      }
      <image:license>https://creativecommons.org/publicdomain/mark/1.0/</image:license>
    </image:image>
`;
}

// XML escaping utility
function escapeXml(unsafe: string): string {
  return unsafe
    ? unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case "<":
            return "&lt;";
          case ">":
            return "&gt;";
          case "&":
            return "&amp;";
          case "'":
            return "&apos;";
          case '"':
            return "&quot;";
          default:
            return c;
        }
      })
    : "";
}

// Run the generator
generateImageSitemap().catch(console.error);
