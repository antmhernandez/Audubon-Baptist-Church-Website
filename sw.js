/**
 * Audubon Baptist Church — application service worker
 * ------------------------------------------------------------
 * Prefer the live network version whenever online.
 * Cache only the known static app shell as an offline fallback.
 * Never cache uploaded sermon video or future private API responses here.
 */

const CACHE_NAME = "audubon-church-shell-v3";

const APP_SHELL = [
  "./index.html",
  "./visit.html",
  "./sermons.html",
  "./beliefs.html",
  "./about.html",
  "./give.html",
  "./app.html",
  "./member.html",
  "./calendar.html",
  "./admin.html",
  "./media-studio.html",
  "./styles.css",
  "./site.js",
  "./app.js",
  "./sermons.js",
  "./member.js",
  "./calendar.js",
  "./admin.js",
  "./media-studio.js",
  "./pwa.js",
  "./manifest.webmanifest",
  "./audubon-app-icon.svg",
  "./audubon-app-icon-192.svg",
  "./audubon-app-icon-512.svg",
  "./audubon-app-icon-192.png",
  "./audubon-app-icon-512.png"
];

const CACHEABLE_PATHS = new Set(
  APP_SHELL.map(item => new URL(item, self.location.href).pathname)
);

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
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

  const isNavigation = request.mode === "navigate";
  const isKnownShellFile = CACHEABLE_PATHS.has(url.pathname);

  if (!isNavigation && !isKnownShellFile) return;

  event.respondWith(
    fetch(request, { cache: "no-store" })
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }

        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;

        if (isNavigation) return caches.match("./index.html");

        throw new Error("Offline resource unavailable");
      })
  );
});
