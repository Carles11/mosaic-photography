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
      // Runtime cache for Next.js static files
      urlPattern: /^https:\/\/www\.mosaic\.photography\/_next\/.*/i,
      handler: "NetworkFirst", // Prioritize fresh resources
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
  // Exclude JSON files (including app-build-manifest.json) from being precached
  buildExcludes: [
    () => {
      return true;
    },
  ],
  // General settings to enable seamless updates
  skipWaiting: true,
  clientsClaim: true,
};
