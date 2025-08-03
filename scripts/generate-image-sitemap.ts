import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateImageSitemap() {
  // Fetch all images
  const { data: images, error } = await supabase
    .from("images")
    .select("id, url, title, description, author");

  if (error) {
    console.error("Error fetching images:", error);
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

  // Add homepage with featured images
  sitemap += `  <url>
    <loc>https://www.mosaic.photography/</loc>
`;

  // Add first 10 images to homepage
  images.slice(0, 10).forEach((image) => {
    sitemap += `    <image:image>
      <image:loc>${image.url}</image:loc>
      <image:title>${escapeXml(image.title || "Vintage Photography")}</image:title>
      <image:caption>${escapeXml(image.description || "Vintage nude photography from Mosaic Gallery")}</image:caption>
      <image:license>https://creativecommons.org/publicdomain/mark/1.0/</image:license>
    </image:image>
`;
  });

  sitemap += `  </url>
`;

  // Add photographer pages with their images
  photographers.forEach((photographer) => {
    const photographerImages = images.filter(
      (image) =>
        image.author === `${photographer.name} ${photographer.surname}`,
    );

    if (photographerImages.length > 0) {
      const slug = `${photographer.name}-${photographer.surname}`
        .toLowerCase()
        .replace(/\s+/g, "-");

      sitemap += `  <url>
    <loc>https://www.mosaic.photography/photographers/${slug}</loc>
`;

      photographerImages.forEach((image) => {
        sitemap += `    <image:image>
      <image:loc>${image.url}</image:loc>
      <image:title>${escapeXml(image.title || `Photography by ${photographer.name} ${photographer.surname}`)}</image:title>
      <image:caption>${escapeXml(image.description || `Vintage photography by ${photographer.name} ${photographer.surname}`)}</image:caption>
      <image:geo_location>${escapeXml(photographer.origin || "")}</image:geo_location>
      <image:license>https://creativecommons.org/publicdomain/mark/1.0/</image:license>
    </image:image>
`;
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

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
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
  });
}

// Run the generator
generateImageSitemap().catch(console.error);
