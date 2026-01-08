const CACHE_NAME = 'ledgerone-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const results = await Promise.allSettled(
        ASSETS_TO_CACHE.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "no-cache" });
            if (!response.ok) throw new Error(`Failed: ${url}`);
            await cache.put(url, response);
          } catch (err) {
            console.warn("Cache failed for:", url, err);
          }
        })
      );
      return results;
    })
  );

  self.skipWaiting();
});


// Activate: Clean old caches
self.addEventListener('activate', (event) => {
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
  self.clients.claim();
});

// Fetch: Network first, then fall back to cache + dynamic caching for external libs
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If valid response, clone it and save to cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If it's a navigation request (routing), return index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return null;
        });
      })
  );
});


self.addEventListener("message", (event) => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    const { title, body } = event.data.payload;

    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: "/icons/ios/192.png",
        tag: "ledgerone-daily-reminder",
      })
    );
  }
});