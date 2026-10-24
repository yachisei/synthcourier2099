/* Offline support: app files are cached on first visit; CDN files (Tailwind, icons, fonts) are cached as they load. */
const CACHE = 'sc-v5';
const APP = ['./', './index.html', './style.css', './game.js', './auth.js', './features.js', './favicon.svg', './manifest.webmanifest',
    './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(caches.open(CACHE).then(async cache => {
        const hit = await cache.match(e.request);
        const net = fetch(e.request).then(r => { if (r && (r.ok || r.type === 'opaque')) cache.put(e.request, r.clone()); return r; }).catch(() => hit);
        return hit || net;   // cached copy first (fast + offline), refreshed in the background
    }));
});
