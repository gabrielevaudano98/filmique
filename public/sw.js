const CACHE_NAME = 'filmique-v1';
const API_CACHE_NAME = 'filmique-api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
];

const allCaches = [CACHE_NAME, API_CACHE_NAME];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching app shell');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.error("Failed to cache static assets:", err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!allCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // For API calls to Supabase, use a "stale-while-revalidate" strategy.
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        
        const fetchPromise = fetch(request).then((networkResponse) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        }).catch(err => {
          console.warn('Network request failed, serving stale content if available.', err);
        });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // For static assets, use a "cache-first" strategy.
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});