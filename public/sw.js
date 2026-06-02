/**
 * Kaiveron Service Worker — minimal PWA support
 *
 * Strategy:
 *   - API calls (/api/v1/*): network-first (always try network, fall back to cache)
 *   - Static assets (JS, CSS, images, fonts): cache-first
 *   - Navigation (HTML pages): network-first with offline fallback page
 */

const CACHE_NAME = "kaiveron-v2";
const OFFLINE_URL = "/offline.html";

const STATIC_ASSETS = [
  "/",
  OFFLINE_URL,
];

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  // Activate immediately without waiting for old SW to expire
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin requests
  if (request.method !== "GET") return;
  if (!url.origin.startsWith(self.location.origin) && !url.hostname.includes("fonts.g")) return;

  // API calls → network-first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets (JS, CSS, images, fonts) → cache-first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|avif|ico|woff2?)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation requests → network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(navigationFetch(request));
    return;
  }
});

// ─── Strategies ───────────────────────────────────────────────────────────────

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Asset unavailable offline", { status: 503 });
  }
}

async function navigationFetch(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached = await caches.match(OFFLINE_URL);
    return cached ?? new Response("You are offline", { status: 503 });
  }
}
