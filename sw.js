/**
 * Audubon Baptist Church — application service worker
 * ------------------------------------------------------------
 * PUBLIC APP-SHELL POLICY
 * - Prefer the live network version whenever online.
 * - Cache only public/static app-shell resources as an offline fallback.
 * - Member/admin/media-studio navigations are deliberately NOT cached.
 * - Never cache uploaded sermon video, private API responses, credentials,
 *   prayer data, giving data, or future personalized server responses.
 */

const CACHE_NAME = "audubon-church-shell-v4";

const PUBLIC_APP_SHELL = [
  "./index.html",
  "./visit.html",
  "./sermons.html",
  "./beliefs.html",
  "./about.html",
  "./give.html",
  "./app.html",
  "./styles.css",
  "./site.js",
  "./app.js",
  "./sermons.js",
  "./pwa.js",
  "./manifest.webmanifest",
  "./audubon-app-icon.svg",
  "./audubon-app-icon-192.svg",
  "./audubon-app-icon-512.svg",
  "./audubon-app-icon-192.png",
  "./audubon-app-icon-512.png"
];

const CACHEABLE_PATHS = new Set(
  PUBLIC_APP_SHELL.map(item => new URL(item, self.location.href).pathname)
);

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PUBLIC_APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
  if (!CACHEABLE_PATHS.has(url.pathname)) return;

  event.respondWith(
    fetch(request, { cache: "no-store" })
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });
        }

        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;

        throw new Error("Offline public resource unavailable");
      })
  );
});
