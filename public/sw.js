/**
 * Kaiveron Service Worker — intentionally inert (caches nothing).
 *
 * History: earlier versions cached JS/HTML/API responses. On an actively-shipping
 * app that repeatedly served stale bundles after deploys ("I still see the old
 * version") and once broke auth by caching /auth/me. The caching wasn't worth it.
 *
 * This worker has NO fetch handler, so every request goes straight to the
 * network — always fresh. On activate it deletes any caches left by older
 * versions so previously-stuck clients drop their stale assets. Combined with a
 * `Cache-Control: no-cache` header on /sw.js (see next.config), the browser
 * always picks up the latest worker.
 */
const SW_VERSION = "kaiveron-v5-inert";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// No fetch handler on purpose — the browser handles every request directly.
void SW_VERSION;
