const CACHE = 'sylumina-journal-v4';

const PRECACHE = [
  './journal.html',
  './habits.html',
  './%E6%B1%87%E6%96%87%E6%98%8E%E6%9C%9D%E4%BD%93.otf',
  './manifest.json',
  './icon.png',
];

// Install: cache static assets (not HTML — HTML is always fetched fresh)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.allSettled(PRECACHE.map(url => cache.add(url)))
    )
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

// Fetch strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Google Fonts: cache then update in background
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

  if (url.origin !== self.location.origin) return;

  // HTML: network-first so updates always show immediately;
  // fall back to cache only when truly offline
  if (event.request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request).then(res => {
        if (res.ok) {
          caches.open(CACHE).then(cache => cache.put(event.request, res.clone()));
        }
        return res;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Other assets (fonts, icons): cache-first
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
});
