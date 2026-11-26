/* Cleat Board — offline support.
   Bump VERSION whenever you upload a new build so coaches get the "new version" banner. */
const VERSION = '1.2.0';
const APP_CACHE = `ssm-app-${VERSION}`;
const FONT_CACHE = 'ssm-fonts';
const LIB_CACHE = 'cb-libs';
// Sign-in library loaded from the CDN. Keep this in step with the <script> tag in index.html.
const LIB_URLS = ['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.2/dist/umd/supabase.min.js'];

const APP_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', event => {
  // 'reload' skips the browser's HTTP cache so a new version never installs stale files.
  event.waitUntil(Promise.all([
    caches.open(APP_CACHE).then(cache =>
      cache.addAll(APP_FILES.map(url => new Request(url, { cache: 'reload' })))),
    // Best effort: a CDN hiccup shouldn't stop the app installing.
    caches.open(LIB_CACHE).then(cache => cache.addAll(LIB_URLS)).catch(() => {})
  ]));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('ssm-app-') && key !== APP_CACHE)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Page loads: always serve the cached app instantly, then refresh the cache in the background.
// Updates are picked up through a new VERSION of this file, which shows the update banner.
async function handleNavigation(request) {
  const cache = await caches.open(APP_CACHE);
  const cached = await cache.match('./index.html');
  if (cached) return cached;
  try {
    return await fetch(request);
  } catch (error) {
    return new Response('Cleat Board is offline and not cached yet. Open it once with a connection.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Google Fonts and the sign-in library: serve from cache, refresh in the background.
async function handleFont(request, cacheName = FONT_CACHE) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(response => {
      if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached || Response.error());
  return cached || network;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(handleFont(request));
    return;
  }
  if (LIB_URLS.includes(request.url)) {
    event.respondWith(handleFont(request, LIB_CACHE));
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
