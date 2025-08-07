import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateCollectionSitemap() {
  // Fetch all collections (all are public)
  const { data: collections, error } = await supabase
    .from("collections")
    .select("id, updated_at");

  if (error) {
    console.error("Error fetching collections:", error);
    return;
  }

  // Create XML sitemap
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n`;

  collections.forEach((collection) => {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>https://www.mosaic.photography/profile/collections/${collection.id}</loc>\n`;
    sitemap += `    <lastmod>${new Date(collection.updated_at || Date.now()).toISOString()}</lastmod>\n`;
    sitemap += `    <changefreq>weekly</changefreq>\n`;
    sitemap += `    <priority>0.6</priority>\n`;
    sitemap += `  </url>\n`;
  });

  sitemap += `</urlset>`;

  // Write to file
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(path.join(publicDir, "collection-sitemap.xml"), sitemap);
  console.log("Collection sitemap generated successfully!");
}

generateCollectionSitemap().catch(console.error);
