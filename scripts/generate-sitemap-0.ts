import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap0() {
  // Fetch all photographers
  const { data: photographers, error: photographerError } = await supabase
    .from("photographers")
    .select("surname");

  if (photographerError) {
    console.error("Error fetching photographers:", photographerError);
    return;
  }

  // Static pages
  const staticPages = [
    {
      loc: "https://www.mosaic.photography/",
      lastmod: new Date().toISOString(),
      changefreq: "weekly",
      priority: "1.0",
    },
    {
      loc: "https://www.mosaic.photography/photo-curations",
      lastmod: new Date().toISOString(),
      changefreq: "weekly",
      priority: "0.8",
    },
    {
      loc: "https://www.mosaic.photography/faq",
      lastmod: new Date().toISOString(),
      changefreq: "weekly",
      priority: "0.7",
    },
    {
      loc: "https://www.mosaic.photography/legal/privacy-policy",
      lastmod: new Date().toISOString(),
      changefreq: "weekly",
      priority: "0.6",
    },
    {
      loc: "https://www.mosaic.photography/legal/terms-of-service",
      lastmod: new Date().toISOString(),
      changefreq: "weekly",
      priority: "0.6",
    },
    {
      loc: "https://www.mosaic.photography/legal/credits",
      lastmod: new Date().toISOString(),
      changefreq: "weekly",
      priority: "0.5",
    },
  ];

  // Build XML
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
    xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

  // Add static pages
  staticPages.forEach((page) => {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${page.loc}</loc>\n`;
    sitemap += `    <lastmod>${page.lastmod}</lastmod>\n`;
    sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${page.priority}</priority>\n`;
    sitemap += `  </url>\n`;
  });

  // Add photographer pages
  if (photographers) {
    photographers.forEach((photographer) => {
      const slug = `${photographer.surname}`.toLowerCase().replace(/\s+/g, "-");
      sitemap += `  <url>\n`;
      sitemap += `    <loc>https://www.mosaic.photography/photographers/${slug}</loc>\n`;
      sitemap += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.7</priority>\n`;
      sitemap += `  </url>\n`;
    });
  }

  sitemap += `</urlset>`;

  // Write to file
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(path.join(publicDir, "sitemap-0.xml"), sitemap);
  console.log("sitemap-0.xml generated successfully!");
}

generateSitemap0().catch(console.error);
