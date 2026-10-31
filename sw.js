const CACHE = 'samsara-app-2026.10.31.1';
const BASE = ['./', './index.html', './manifest.webmanifest', './icono-192.png', './icono-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(claves => Promise.all(claves.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate' && /\/(index\.html)?$/i.test(url.pathname)) {
    e.respondWith(fetch(req)
      .then(r => {
        if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copia)); }
        return r;
      })
      .catch(() => caches.match('./index.html')));
    return;
  }
  if (/\.(png|webmanifest)$/i.test(url.pathname)) e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
