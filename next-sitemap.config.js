/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.mosaic.photography",
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ["/admin", "/internal"],
  robotsTxtOptions: {
    additionalSitemaps: ["https://www.mosaic.photography/api/sitemap.xml"],
  },
};
