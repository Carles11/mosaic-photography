import { NextApiRequest, NextApiResponse } from "next";
import { getAllImageUrls, getLastModifiedDate } from "@/lib/content";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const baseUrl = "https://www.mosaic.photography";
  const urls = await getAllImageUrls(); // Fetch dynamic URLs

  const sitemap = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>
      ${await Promise.all(
        urls.map(
          async (url) => `
        <url>
          <loc>${baseUrl}${url}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
          <lastmod>${await getLastModifiedDate(url)}</lastmod>
        </url>
      `
        )
      ).then((entries) => entries.join(""))}
    </urlset>
  `.trim();

  res.setHeader("Content-Type", "application/xml");
  res.status(200).send(sitemap);
}
