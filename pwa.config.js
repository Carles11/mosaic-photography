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
      handler: "NetworkFirst",
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
  customWorkerDir: "src/sw-custom.js",

  // Exclude node/server-only and other unwanted files from the SW bundle.
  // Added explicit patterns for Next.js server-only manifests that caused 404 precache attempts.
  exclude: [
    /\.map$/, // Exclude source maps
    /^node_modules/, // Exclude all node_modules
    /^tr46/, // Exclude tr46 and mappingTable.json
    /\.json$/, // Exclude all JSON files (except manifest)
    /^workbox-.*$/, // Exclude workbox files

    // Broadly exclude Next.js server-side files (both relative and absolute paths)
    /\/?_next\/server\/.*/,
    /^_next\/server\/.*/,
    /_next\/server\/.*/,

    // Explicitly exclude known server-only manifests that Next may reference at runtime
    /next-font-manifest\.js$/,
    /dynamic-css-manifest\.js$/,
    /next-font-manifest\.js$/,
    /dynamic-css-manifest\.js$/,

    // Misc middleware artifacts
    /middleware-build-manifest\.js$/,
    /middleware-react-loadable-manifest\.js$/,
  ],

  skipWaiting: true,
  clientsClaim: true,
};
