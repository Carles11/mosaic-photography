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
          maxAgeSeconds: 60 * 60 * 24 * 31, // 31 days
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
          maxAgeSeconds: 60 * 60 * 24 * 31,
        },
      },
    },
  ],
  // Add a reference to your custom Service Worker
  customWorkerDir: "src/sw-custom.js", // Path to your custom Service Worker file
  // Exclude unused service-worker.js from being precached
  buildExcludes: [/service-worker\.js$/],
  // General settings to enable seamless updates
  skipWaiting: true,
  clientsClaim: true,
};
