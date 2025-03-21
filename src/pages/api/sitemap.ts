import { NextApiRequest, NextApiResponse } from "next";
import { getAllImageUrls, getLastModifiedDate } from "@/lib/content";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // console.log("Sitemap API route triggered");

  const baseUrl = "https://www.mosaic.photography";
  const urls = await getAllImageUrls();

  const sitemapEntries = await Promise.all(
    urls.map(async (url) => {
      const lastmod = await getLastModifiedDate(url);
      return `
        <url>
          <loc>${baseUrl}/${url}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
          <lastmod>${lastmod}</lastmod>
        </url>
      `;
    })
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${sitemapEntries.join("")}
    </urlset>
  `.trim();

  res.setHeader("Content-Type", "application/xml");
  res.status(200).send(sitemap);
}
