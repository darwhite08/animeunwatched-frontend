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

// ── Web Push (display only — still caches nothing) ──────────────────────────
// Backend payload shape: { title, body, url, tag, image }.
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { /* noop */ }
  const title = data.title || "Kaiveron";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    image: data.image || undefined,
    tag: data.tag || undefined,       // collapses duplicate notifications
    renotify: Boolean(data.tag),
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      // Focus an open tab on that URL if there is one, else open a new window.
      for (const client of list) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
