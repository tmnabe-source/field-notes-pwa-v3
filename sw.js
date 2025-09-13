// sw.js  (force refresh v3)
const CACHE = 'field-notes-v3-' + Date.now();
const ASSETS = ['./','./index.html','./manifest.webmanifest'];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // switch immediately
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k.startsWith('field-notes-') && k !== CACHE) ? caches.delete(k) : null));
    await self.clients.claim(); // control existing clients
  })());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(net => {
        if (e.request.method === 'GET' && net.ok) {
          const clone = net.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return net;
      }).catch(() => caches.match('./index.html')))
    );
  }
});
