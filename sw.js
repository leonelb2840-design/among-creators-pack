/* =========================================================
   AMONG CREATORS PACK · SERVICE WORKER v2.1
   "Divino, grande, majestuoso y ultra potente"
   ========================================================= */

const SW_VERSION = 'v2.1.0';
const CACHE_STATIC = `among-static-${SW_VERSION}`;
const CACHE_DYNAMIC = `among-dynamic-${SW_VERSION}`;
const CACHE_IMAGES = `among-images-${SW_VERSION}`;
const CACHE_FONTS = `among-fonts-${SW_VERSION}`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './gracias.html',
  './gracias.md',
  './manifest.json',
  './icon.png',
  './offline.html'
  './CHANGELOG.md'
];

const EXTERNAL_CACHEABLE = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net'
];

/* ========== INSTALL ========== */
self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] 🔧 Instalando...`);

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_STATIC);
      const results = await Promise.allSettled(
        PRECACHE_URLS.map(url => cache.add(url))
      );
      const fallidos = results.filter(r => r.status === 'rejected').length;
      if (fallidos > 0) {
        console.warn(`[SW] ⚠️ ${fallidos} recursos no se pudieron precachear`);
      } else {
        console.log(`[SW] ✅ ${PRECACHE_URLS.length} recursos precacheados`);
      }
      await self.skipWaiting();
    })()
  );
});

/* ========== ACTIVATE ========== */
self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] 🚀 Activando...`);

  const CACHES_VALIDAS = [CACHE_STATIC, CACHE_DYNAMIC, CACHE_IMAGES, CACHE_FONTS];

  event.waitUntil(
    (async () => {
      const nombresCaches = await caches.keys();
      await Promise.all(
        nombresCaches
          .filter(nombre => !CACHES_VALIDAS.includes(nombre))
          .map(nombre => {
            console.log(`[SW] 🗑️ Eliminando caché obsoleta: ${nombre}`);
            return caches.delete(nombre);
          })
      );

      await self.clients.claim();

      const clientes = await self.clients.matchAll({ type: 'window' });
      clientes.forEach(cliente => {
        cliente.postMessage({ type: 'SW_READY', version: SW_VERSION });
      });

      console.log(`[SW] ✅ Activado y controlando clientes`);
    })()
  );
});

/* ========== FETCH ========== */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;
  if (url.pathname.endsWith('sw.js')) return;
  if (url.hostname.includes('formspree.io')) return;
  if (url.hostname.includes('drive.google.com') || url.hostname.includes('goo.su')) return;

  if (EXTERNAL_CACHEABLE.includes(url.hostname)) {
    event.respondWith(cacheFirst(request, CACHE_FONTS));
    return;
  }

  if (request.destination === 'image' || /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_IMAGES));
    return;
  }

  if (
    request.destination === 'document' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    /\.(html|css|js|json|md)$/i.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request, CACHE_STATIC));
    return;
  }

  event.respondWith(networkFirst(request, CACHE_DYNAMIC));
});

/* ========== ESTRATEGIAS ========== */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    if (request.destination === 'image') {
      const fallback = await cache.match('./icons/icon.png');
      if (fallback) return fallback;
    }
    throw err;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || (await fetchPromise) || offlineFallback(request);
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return offlineFallback(request);
  }
}

async function offlineFallback(request) {
  if (request.destination === 'document') {
    const cache = await caches.open(CACHE_STATIC);
    const offlinePage = await cache.match('./offline.html');
    if (offlinePage) return offlinePage;
  }
  return new Response('Recurso no disponible offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

/* ========== MENSAJES ========== */
self.addEventListener('message', (event) => {
  const { type } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then(nombres =>
          Promise.all(nombres.map(n => caches.delete(n)))
        ).then(() => {
          event.source?.postMessage({ type: 'CACHE_CLEARED' });
        })
      );
      break;
    case 'GET_VERSION':
      event.source?.postMessage({ type: 'VERSION', version: SW_VERSION });
      break;
  }
});

console.log(`[SW ${SW_VERSION}] 📦 Script cargado`);
