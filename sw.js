const CACHE = 'vastgoed-v16';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // API calls nooit cachen
  if (e.request.url.includes('api.anthropic.com') ||
      e.request.url.includes('workers.dev') ||
      e.request.url.includes('pdok.nl') ||
      e.request.url.includes('kadaster.nl')) return;

  // Netwerk eerst, dan cache als fallback (network-first strategie)
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Sla verse versie op in cache
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
