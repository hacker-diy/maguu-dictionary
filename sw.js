
const CACHE_NAME = 'pagecaster-v2';
const OFFLINE_URLS = [
  '.',
  'icons/pagecaster-128.png',
  'icons/pagecaster-192.png',
  'icons/pagecaster-512.png',
  'icons/pagecaster.svg',
  'index.html',
  'manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(OFFLINE_URLS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  event.respondWith((async () => {
    try {
      const net = await fetch(req);
      const cache = await caches.open(CACHE_NAME);
      if (req.method === 'GET' && new URL(req.url).origin === location.origin) {
        cache.put(req, net.clone());
      }
      return net;
    } catch (e) {
      const cached = await caches.match(req);
      if (cached) return cached;
      if (req.mode === 'navigate') {
        return caches.match('index.html');
      }
      throw e;
    }
  })());
});
