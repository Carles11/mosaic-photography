import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

// In-memory cache for the sitemap
let sitemapCache: string | null = null;
let cacheTimestamp: number | null = null;

// Cache duration in milliseconds (e.g., 24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check if the sitemap is cached and still valid
  const now = Date.now();
  if (sitemapCache && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
    res.setHeader("Content-Type", "application/xml");
    return res.status(200).send(sitemapCache);
  }

  const baseUrl = "https://www.mosaic.photography";

  try {
    // Batch fetch all URLs and last modified dates
    const { data, error } = await supabase
      .from("images")
      .select("url, last_modified");

    if (error) {
      console.error("Error fetching image data:", error);
      return res.status(500).send("Failed to generate sitemap");
    }

    // Build sitemap entries
    const sitemapEntries = data.map(({ url, last_modified }) => {
      const lastmod = new Date(last_modified).toISOString();
      return `
        <url>
          <loc>${baseUrl}/${url}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
          <lastmod>${lastmod}</lastmod>
        </url>
      `;
    });

    // Generate the final sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${sitemapEntries.join("")}
      </urlset>`.trim();

    // Cache the sitemap
    sitemapCache = sitemap;
    cacheTimestamp = now;

    // Return the sitemap
    res.setHeader("Content-Type", "application/xml");
    return res.status(200).send(sitemap);
  } catch (err) {
    console.error("Unexpected error generating sitemap:", err);
    return res.status(500).send("Failed to generate sitemap");
  }
}
