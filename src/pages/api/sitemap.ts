import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

// In-memory cache for the sitemap
let sitemapCache: string | null = null;
let cacheTimestamp: number | null = null;

// Cache duration in milliseconds (e.g., 24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Utility function to escape special characters in XML
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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
      // Ensure `url` is properly formatted and skip invalid entries
      if (!url || !url.startsWith("http")) {
        console.warn("Skipping invalid URL:", url);
        return "";
      }

      const escapedUrl = escapeXml(url); // Escape special characters in the URL
      const lastmod = new Date(last_modified).toISOString();

      return `
        <url>
          <loc>${escapedUrl}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
          <lastmod>${lastmod}</lastmod>
        </url>
      `;
    });

    // Filter out any empty entries (invalid URLs)
    const validSitemapEntries = sitemapEntries.filter(
      (entry) => entry.trim() !== ""
    );

    // Generate the final sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${validSitemapEntries.join("")}
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
