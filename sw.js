/* =========================================================
   AMONG CREATORS PACK · SERVICE WORKER v2.2
   "Divino, grande, majestuoso y ultra potente"
   ---------------------------------------------------------
   Versión mejorada con:
   - Precache completo (incluyendo CHANGELOG.md y gracias.md)
   - Estrategias diferenciadas por tipo de recurso
   - Soporte offline robusto
   - Limpieza automática de cachés viejas
   - Mensajería desde la página
   - Soporte de screenshots para el manifest
   ========================================================= */

const SW_VERSION = 'v2.2.0';

// Nombres de las cachés
const CACHE_STATIC = `among-static-${SW_VERSION}`;
const CACHE_DYNAMIC = `among-dynamic-${SW_VERSION}`;
const CACHE_IMAGES = `among-images-${SW_VERSION}`;
const CACHE_FONTS = `among-fonts-${SW_VERSION}`;
const CACHE_CHANGELOG = `among-changelog-${SW_VERSION}`;

// Recursos críticos para precachear al instalar
const PRECACHE_URLS = [
  './',
  './index.html',
  './gracias.html',
  './offline.html',
  './manifest.json',
  './icon.png',
  './CHANGELOG.md',
  './gracias.md'
];

// Dominios externos que queremos cachear dinámicamente
const EXTERNAL_CACHEABLE = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net'
];

// Dominios que NUNCA deben cachearse (siempre red)
const NEVER_CACHE = [
  'formspree.io',
  'drive.google.com',
  'goo.su',
  'discord.com',
  'discord.gg'
];

/* =========================================================
   INSTALL · Precachea todo lo crítico
   ========================================================= */
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

/* =========================================================
   ACTIVATE · Limpia cachés viejas y toma control
   ========================================================= */
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
      // Borra todas las cachés que no sean de la versión actual
      const nombresCaches = await caches.keys();
      await Promise.all(
        nombresCaches
          .filter(nombre => !CACHES_VALIDAS.includes(nombre))
          .map(nombre => {
            console.log(`[SW] 🗑️ Eliminando caché obsoleta: ${nombre}`);
            return caches.delete(nombre);
          })
      );

      // Toma control de todas las pestañas abiertas
      await self.clients.claim();

      // Notifica a las pestañas que el SW está listo
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

/* =========================================================
   FETCH · Enruta cada petición a la estrategia adecuada
   ========================================================= */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejamos GET
  if (request.method !== 'GET') return;

  // Ignorar esquemas no-http
  if (!url.protocol.startsWith('http')) return;

  // Ignorar el propio Service Worker
  if (url.pathname.endsWith('sw.js')) return;

  // Ignorar dominios que NUNCA deben cachearse
  if (NEVER_CACHE.some(dominio => url.hostname.includes(dominio))) {
    return;
  }

  // --- Fuentes de Google: Cache-First ---
  if (EXTERNAL_CACHEABLE.includes(url.hostname)) {
    event.respondWith(cacheFirst(request, CACHE_FONTS));
    return;
  }

  // --- CHANGELOG.md: Network-First con caché dedicado ---
  if (url.pathname.endsWith('CHANGELOG.md') || url.pathname.endsWith('gracias.md')) {
    event.respondWith(networkFirst(request, CACHE_CHANGELOG));
    return;
  }

  // --- Imágenes: Cache-First ---
  if (
    request.destination === 'image' ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|bmp|avif)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request, CACHE_IMAGES));
    return;
  }

  // --- HTML/CSS/JS/JSON propios: Stale-While-Revalidate ---
  if (
    request.destination === 'document' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    /\.(html|css|js|json)$/i.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request, CACHE_STATIC));
    return;
  }

  // --- Todo lo demás: Network-First ---
  event.respondWith(networkFirst(request, CACHE_DYNAMIC));
});

/* =========================================================
   ESTRATEGIA 1: Cache-First
   Mira en caché primero, si no está va a la red y guarda.
   ========================================================= */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      // Guardamos una copia en segundo plano
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Fallback para imágenes rotas
    if (request.destination === 'image') {
      const fallback = await cache.match('./icon.png');
      if (fallback) return fallback;
    }
    throw err;
  }
}

/* =========================================================
   ESTRATEGIA 2: Stale-While-Revalidate
   Devuelve la versión en caché al instante y actualiza en segundo plano.
   ========================================================= */
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

/* =========================================================
   ESTRATEGIA 3: Network-First
   Intenta red primero, si falla va a caché.
   ========================================================= */
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

/* =========================================================
   FALLBACK OFFLINE
   ========================================================= */
async function offlineFallback(request) {
  // Si es una navegación, mostramos la página offline
  if (request.destination === 'document') {
    const cache = await caches.open(CACHE_STATIC);
    const offlinePage = await cache.match('./offline.html');
    if (offlinePage) return offlinePage;
  }
  
  // Si es un recurso, devolvemos un error controlado
  return new Response('Recurso no disponible offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

/* =========================================================
   MENSAJES DESDE LA PÁGINA
   La página puede pedirle cosas al SW:
   - SKIP_WAITING: activa el nuevo SW inmediatamente
   - CLEAR_CACHE: borra todas las cachés
   - GET_VERSION: pide la versión del SW
   - PRECACHE_CHANGELOG: fuerza a cachear el CHANGELOG
   ========================================================= */
self.addEventListener('message', (event) => {
  const { type } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      console.log('[SW] ⏭️ Skip waiting solicitado');
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      console.log('[SW] 🧹 Limpieza de caché solicitada');
      event.waitUntil(
        caches.keys()
          .then(nombres => Promise.all(nombres.map(n => caches.delete(n))))
          .then(() => {
            event.source?.postMessage({ type: 'CACHE_CLEARED' });
            console.log('[SW] ✅ Caché limpiada');
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
      console.log('[SW] 📄 Forzando precache del CHANGELOG');
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

    default:
      console.log('[SW] Mensaje desconocido:', type);
  }
});

/* =========================================================
   SYNC EN SEGUNDO PLANO (para futuras features)
   ========================================================= */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-feedback') {
    console.log('[SW] 🔄 Sincronización en segundo plano solicitada');
  }
});

/* =========================================================
   PUSH NOTIFICATIONS (para futuras features)
   ========================================================= */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nueva actualización del pack',
      icon: './icon.png',
      badge: './icon.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || './' }
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Among Creators Pack',
        options
      )
    );
  } catch (err) {
    console.error('[SW] Error en push:', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data.url || './')
  );
});

console.log(`[SW ${SW_VERSION}] 📦 Script cargado`);
