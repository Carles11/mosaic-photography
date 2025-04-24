const CACHE_VERSION = process.env.VERSION || "v1";
const CACHE_NAME = `mosaic-cache-${CACHE_VERSION}`;

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
  self.skipWaiting(); // Optional: take over immediately
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
  self.clients.claim(); // Optional: take control of uncontrolled clients
});

// Fetch event - use stale-while-revalidate strategy
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          .catch(() => cachedResponse); // fallback to cache if network fails

        return cachedResponse || fetchPromise;
      });
    })
  );
});
