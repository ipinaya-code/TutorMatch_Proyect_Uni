// Service Worker: caché dinámica para uso Offline-First (stale-while-revalidate)
const CACHE = 'tutormatch-v1'
self.addEventListener('install', (e) => { self.skipWaiting() })
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))))
})
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(e.request)
      const net = fetch(e.request).then((r) => { cache.put(e.request, r.clone()); return r }).catch(() => hit)
      return hit || net
    })
  )
})
