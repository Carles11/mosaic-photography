// Existing listeners from the old service-worker.js
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  // Perform install steps
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    // Example of clearing old caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Customize cache cleanup logic if needed
          if (cacheName !== 'your-new-cache-name') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  console.log('Fetch event for:', event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// New listeners
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  const data = event.data ? event.data.text() : 'Default push message';
  event.waitUntil(
    self.registration.showNotification('Push Notification', {
      body: data,
      icon: '/icons/mosaic-icon.png', // Path to your notification icon
      tag: 'push-notification',
    })
  );
});

self.addEventListener('sync', (event) => {
  console.log('Sync event triggered:', event.tag);
  if (event.tag === 'test-sync') {
    event.waitUntil(
      fetch('/api/sync-data')
        .then((response) => response.json())
        .then((data) => console.log('Data fetched during sync:', data))
        .catch((error) => console.error('Error during sync:', error))
    );
  }
});

self.addEventListener('periodicsync', (event) => {
  console.log('Periodic Sync event triggered:', event.tag);
  if (event.tag === 'test-periodic-sync') {
    event.waitUntil(
      fetch('/api/periodic-data')
        .then((response) => response.json())
        .then((data) => console.log('Data fetched during periodic sync:', data))
        .catch((error) => console.error('Error during periodic sync:', error))
    );
  }
});