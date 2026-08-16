const CACHE_NAME = 'cordoval-codebase-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/icon.png'
];

// Install Event - Pre-cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching core local codebase shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First when Online to update local saved codebase, Cache Fallback when Offline
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip API proxy routes or non-GET requests from service worker caching
  if (req.method !== 'GET' || url.pathname.startsWith('/api/') || url.pathname.startsWith('/podcast')) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        // If request succeeded, update local saved codebase in cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If offline or network fetch fails, serve from saved local cache
        return caches.match(req).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to index.html for SPA navigation requests when offline
          if (req.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline and content not cached', { status: 503 });
        });
      })
  );
});

// Listen for update messages from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
