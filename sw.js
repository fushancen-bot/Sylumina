const CACHE = 'sylumina-journal-v1';

const PRECACHE = [
  './journal.html',
  './%E6%B1%87%E6%96%87%E6%98%8E%E6%9C%9D%E4%BD%93.otf',
  './manifest.json',
  './icon.svg',
];

// Install: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      // Cache each asset individually so one failure doesn't block the rest
      return Promise.allSettled(PRECACHE.map(url => cache.add(url)));
    })
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for same-origin, stale-while-revalidate for Google Fonts
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Google Fonts: serve from cache if available, update in background
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(CACHE).then(async cache => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then(res => {
          if (res.ok) cache.put(event.request, res.clone());
          return res;
        }).catch(() => null);
        return cached ?? await fetchPromise;
      })
    );
    return;
  }

  // Same-origin assets: cache-first, fall back to network
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(res => {
          if (res.ok) {
            caches.open(CACHE).then(cache => cache.put(event.request, res.clone()));
          }
          return res;
        });
      })
    );
  }
});
