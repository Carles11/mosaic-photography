/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.mosaic.photography",
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ["/admin", "/internal"],
  robotsTxtOptions: {
    additionalSitemaps: [
      "https://www.mosaic.photography/sitemap.xml",
      "https://www.mosaic.photography/image-sitemap.xml",
      "https://www.mosaic.photography/collection-sitemap.xml",
    ],
  },
};
