/** @type {import('workbox-build').GenerateSWOptions} */
console.log("pwa.config.js is being used!");
module.exports = {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/cdn\.mosaic\.photography\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "cdn-images",
        expiration: {
          maxEntries: 300,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern:
        /^https:\/\/res\.cloudinary\.com\/dktizqbky\/image\/upload\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "cloudinary-images",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      // Cache all files under the _next directory (e.g., app-build-manifest.json)
      urlPattern: /^https:\/\/www\.mosaic\.photography\/_next\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-static",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // Cache for 7 days
        },
      },
    },
  ],
  // Add a reference to your custom Service Worker
  customWorkerDir: "src/sw-custom.js", // Path to your custom Service Worker file
  // Exclude unused service-worker.js from being precached
  buildExcludes: [], // /sw\.js$/, /_next\/.*\.json$/ ------- Exclude JSON files that shouldn't be precached
  // General settings to enable seamless updates
  skipWaiting: true,
  clientsClaim: true,
};
