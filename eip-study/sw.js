// 오프라인 지원: 캐시를 먼저 보여주고 뒤에서 최신본으로 갱신(stale-while-revalidate)
const CACHE = 'eip-study-v5';
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'data/written.js', 'data/practical.js', 'data/written2.js', 'data/written3.js', 'data/practical2.js', 'data/toc.js', 'data/theory1.js', 'data/theory2.js', 'data/theory3.js', 'data/theory4.js', 'data/theory5.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
