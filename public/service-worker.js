const CACHE_NAME = "mosaic-cache-v1";

// Static assets to cache
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/favicons/site.webmanifest",
  "/favicons/android-chrome-192x192.png",
  "/favicons/android-chrome-512x512.png",
  "/favicons/apple-touch-icon.png",
  "/favicons/favicon-32x32.png",
  "/favicons/favicon-16x16.png",
  "/favicons/favicon.ico",
];

// Install event - precache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((networkResponse) => {
          // Optionally cache new requests
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
      );
    })
  );
});
