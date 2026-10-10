const SW_VERSION = 'v2.3.0';
const CACHE_STATIC = `among-static-${SW_VERSION}`;
const CACHE_DYNAMIC = `among-dynamic-${SW_VERSION}`;
const CACHE_IMAGES = `among-images-${SW_VERSION}`;
const CACHE_FONTS = `among-fonts-${SW_VERSION}`;
const CACHE_CHANGELOG = `among-changelog-${SW_VERSION}`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './novedades.md',
  './collab.md',
  './gracias.html',
  './offline.html',
  './manifest.json',
  './icon.png',
  './CHANGELOG.md',
  './gracias.md'
];

const EXTERNAL_CACHEABLE = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net'
];

const NEVER_CACHE = [
  'formspree.io',
  'drive.google.com',
  'goo.su',
  'discord.com',
  'discord.gg'
];

self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] 🔧 Instalando...`);

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_STATIC);
      const results = await Promise.allSettled(
        PRECACHE_URLS.map(url => 
          cache.add(url).catch(err => {
            console.warn(`[SW] ⚠️ No se pudo precachear: ${url}`, err);
            return null;
          })
        )
      );
      const fallidos = results.filter(r => r.status === 'rejected' || r.value === null).length;
      const exitosos = PRECACHE_URLS.length - fallidos;
      
      console.log(`[SW] ✅ ${exitosos}/${PRECACHE_URLS.length} recursos precacheados`);
      if (fallidos > 0) {
        console.warn(`[SW] ⚠️ ${fallidos} recursos fallaron`);
      }
      
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] 🚀 Activando...`);

  const CACHES_VALIDAS = [
    CACHE_STATIC,
    CACHE_DYNAMIC,
    CACHE_IMAGES,
    CACHE_FONTS,
    CACHE_CHANGELOG
  ];

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
        cliente.postMessage({ 
          type: 'SW_READY', 
          version: SW_VERSION 
        });
      });

      console.log(`[SW] ✅ Activado y controlando clientes`);
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;
  if (url.pathname.endsWith('sw.js')) return;

  if (NEVER_CACHE.some(dominio => url.hostname.includes(dominio))) {
    return;
  }

  if (url.pathname.endsWith('.md')) {
    event.respondWith(networkFirst(request, CACHE_CHANGELOG));
    return;
  }

  if (EXTERNAL_CACHEABLE.includes(url.hostname)) {
    event.respondWith(cacheFirst(request, CACHE_FONTS));
    return;
  }

  if (
    request.destination === 'image' ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|bmp|avif)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request, CACHE_IMAGES));
    return;
  }

  if (
    request.destination === 'document' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    /\.(html|css|js|json)$/i.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request, CACHE_STATIC));
    return;
  }

  event.respondWith(networkFirst(request, CACHE_DYNAMIC));
});

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
      const fallback = await cache.match('./icon.png');
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

self.addEventListener('message', (event) => {
  const { type } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys()
          .then(nombres => Promise.all(nombres.map(n => caches.delete(n))))
          .then(() => {
            event.source?.postMessage({ type: 'CACHE_CLEARED' });
          })
      );
      break;

    case 'GET_VERSION':
      event.source?.postMessage({ 
        type: 'VERSION', 
        version: SW_VERSION 
      });
      break;

    case 'PRECACHE_CHANGELOG':
      event.waitUntil(
        (async () => {
          const cache = await caches.open(CACHE_CHANGELOG);
          try {
            await cache.add('./CHANGELOG.md');
            event.source?.postMessage({ 
              type: 'CHANGELOG_CACHED',
              success: true 
            });
          } catch (err) {
            event.source?.postMessage({ 
              type: 'CHANGELOG_CACHED',
              success: false,
              error: err.message 
            });
          }
        })()
      );
      break;
  }
});

console.log(`[SW ${SW_VERSION}] 📦 Script cargado`);