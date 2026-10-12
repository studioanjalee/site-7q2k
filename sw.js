/* Kasaade.lk service worker – keeps the app shell available and always tries the network first,
   so new versions you upload appear right away. */
const CACHE = 'kasaade-v1';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'firebase-config.js', 'logo.webp', 'rings.webp', 'manifest.webmanifest', 'privacy.html', 'terms.html', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;   // Firebase, fonts etc. go straight to the network
  e.respondWith(
    fetch(r).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('index.html')))
  );
});
