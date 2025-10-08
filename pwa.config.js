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
    {
      // Cache Next.js image optimization endpoint (optional, adjust for prod if needed)
      urlPattern: /^https?:\/\/localhost:3000\/_next\/image\?/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-optimized-images",
        expiration: {
          maxEntries: 300,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "supabase-api",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 300, // 5 minutes
        },
      },
    },
  ],
  customWorkerDir: "src/sw-custom.js", // Path to your custom Service Worker file

  // Exclude node/server-only and other unwanted files from the SW bundle
  exclude: [
    /\.map$/, // Exclude source maps
    /^node_modules/, // Exclude all node_modules
    /^tr46/, // Exclude tr46 and mappingTable.json
    /\.json$/, // Exclude all JSON files (except manifest)
    /^workbox-.*$/, // Exclude workbox files
    /\/_next\/server\//, // Exclude all Next.js server files
    /middleware-build-manifest\.js$/, // Exclude middleware-build-manifest.js
    /middleware-react-loadable-manifest\.js$/, // Exclude middleware-react-loadable-manifest.js
  ],

  // General settings for seamless SW updates
  skipWaiting: true,
  clientsClaim: true,
};
