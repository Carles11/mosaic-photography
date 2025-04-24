/** @type {import('workbox-build').GenerateSWOptions} */
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
};
