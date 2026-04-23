// COBA PNS Service Worker v1.0.0
const CACHE_NAME = "cobapns-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-cpns.png",
];

// Pages to pre-cache for offline access
const PRECACHE_URLS = [
  "/",
  "/login",
  "/dashboard",
  "/dashboard/exams",
  "/dashboard/learning",
];

// ── Install: cache static shell ───────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── Activate: purge old caches ────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ── Fetch: Network-first with cache fallback ──────────────────────────────────
self.addEventListener("fetch", (event) => {
  // Skip non-GET, chrome-extension, and API routes
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("/api/") ||
    event.request.url.startsWith("chrome-extension")
  ) {
    return;
  }

  // For navigation requests: network-first
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone + cache fresh response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Offline fallback: serve cached version or root
          return caches.match(event.request).then(
            (cached) => cached || caches.match("/")
          );
        })
    );
    return;
  }

  // For static assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Only cache same-origin successful responses
        if (
          !response ||
          response.status !== 200 ||
          response.type !== "basic"
        ) {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      });
    })
  );
});
