/**
 * Kaiveron Service Worker — minimal PWA support
 *
 * Strategy:
 *   - API calls (/api/v1/*): network-first (always try network, fall back to cache)
 *   - Static assets (JS, CSS, images, fonts): stale-while-revalidate
 *     (serve cached for speed, but always refetch in the background so a new
 *     deploy is picked up on the next load — no more stuck-on-old-bundle)
 *   - Navigation (HTML pages): network-first with offline fallback page
 */

const CACHE_NAME = "kaiveron-v4";
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

  // API / auth calls → never let the SW touch them. Intercepting authenticated
  // requests (esp. /api/v1/auth/*) can drop the Authorization header or serve a
  // cached response, breaking the session (isAuthenticated=true but user=null).
  // Pass straight through to the network/browser.
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Static assets (JS, CSS, images, fonts) → stale-while-revalidate
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|avif|ico|woff2?)$/)
  ) {
    event.respondWith(staleWhileRevalidate(request));
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

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  // Serve cached immediately if present, but always kick off the refetch so the
  // next navigation gets the latest deploy. No cached copy → wait for network.
  return cached || network;
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
