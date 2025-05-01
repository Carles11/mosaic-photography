// Import Workbox library
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js"
);

// Ensure Workbox is loaded
if (workbox) {
  console.log("Workbox is loaded");

  // Add runtime caching for Next.js static files
  workbox.routing.registerRoute(
    /^https:\/\/www\.mosaic\.photography\/_next\/.*/,
    new workbox.strategies.NetworkFirst({
      cacheName: "next-static",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // Cache for 7 days
        }),
      ],
    })
  );

  // Add runtime caching for other assets if needed
} else {
  console.error("Workbox failed to load");
}

// Existing listeners (unchanged)
self.addEventListener("install", () => {
  console.log("Service Worker installing...");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== "your-new-cache-name") {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log("Fetch event for:", event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
