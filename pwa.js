/**
 * Audubon Sermon Studio — PWA registration
 *
 * This tiny file makes the Media Studio installable on supported phones,
 * tablets, and desktop browsers. The service worker caches only the
 * application shell; selected sermon videos remain local and are NOT cached.
 */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(error => {
      console.warn("Audubon PWA registration failed:", error);
    });
  });
}