import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// S3/CDN base path for w1600 images
const CDN_BASE =
  "https://cdn.mosaic.photography/mosaic-collections/public-domain-collection";

async function generateImageSitemap() {
  // Fetch all resized images
  const { data: images, error } = await supabase
    .from("images_resize")
    .select(
      "id, base_url, filename, title, description, author, width, height, orientation, color, nudity"
    );

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
        img.author.toLowerCase().includes(photographer.surname.toLowerCase())
    );

    if (photographerImages.length > 0) {
      sitemap += `  <url>
    <loc>https://www.mosaic.photography/photographers/${slug}</loc>
`;

      photographerImages.forEach((image) => {
        sitemap += makeImageXml(image, photographer.origin);
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
  geo_location?: string
) {
  // Construct w1600 CDN URL
  // base_url example: "jane-de-la-vaudere-1857-1908"
  // filename example: "some-image.webp"
  const loc = `${CDN_BASE}/${image.base_url}/w1600/${image.filename}`;
  return `    <image:image>
      <image:loc>${loc}</image:loc>
      <image:title>${escapeXml(
        image.title || "Vintage Photography"
      )}</image:title>
      <image:caption>${escapeXml(
        image.description || "Vintage nude photography from Mosaic Gallery"
      )}</image:caption>
      ${
        geo_location
          ? `<image:geo_location>${escapeXml(
              geo_location
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
