/**
 * Audubon Sermon Studio — service worker
 *
 * IMPORTANT: Do not add uploaded sermon video URLs to APP_SHELL.
 * Large/private media must never be placed in this browser cache.
 */
const CACHE_NAME = "audubon-sermon-studio-v1";

const APP_SHELL = [
  "./media-studio.html",
  "./styles.css",
  "./media-studio.js",
  "./pwa.js",
  "./manifest.webmanifest",
  "./audubon-app-icon.svg"
];

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
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});