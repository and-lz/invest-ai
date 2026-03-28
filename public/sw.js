// Service Worker for PWA — selective caching of static assets only
const CACHE_VERSION = "v2";
const CACHE_NAME = `fortuna-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-icon-180.png",
];

// Install: pre-cache static assets only (no HTML pages)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch strategy:
// - Static assets (/_next/static/): cache-first (hashed, immutable)
// - Navigation (HTML pages): network-only, offline fallback to cached shell
// - API routes: network-only (HTTP cache headers handle caching)
// - Everything else: network-only
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-HTTP requests
  if (!url.protocol.startsWith("http")) return;

  // Ignore external APIs and auth
  if (
    url.pathname.startsWith("/api/auth") ||
    url.hostname.includes("googleapis.com")
  ) {
    return;
  }

  // Cache-first for immutable Next.js static assets (hashed filenames)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // Pre-cached static assets: cache-first
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // Navigation requests: network-only with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/manifest.json").then(() =>
          new Response(
            "<!DOCTYPE html><html><body><h1>Offline</h1><p>Please check your connection.</p></body></html>",
            { status: 503, headers: { "Content-Type": "text/html" } },
          ),
        ),
      ),
    );
    return;
  }

  // Everything else (API, etc.): network-only, no SW caching
});
