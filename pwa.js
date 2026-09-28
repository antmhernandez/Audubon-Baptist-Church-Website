/**
 * Audubon Sermon Studio — PWA registration / install helper
 *
 * The selected sermon video is never cached by this code.
 * Only the app shell is handled by the service worker.
 */

let deferredInstallPrompt = null;
const installButton = document.getElementById("pwaInstallButton");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(error => {
      console.warn("Audubon PWA registration failed:", error);
    });
  });
}

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;

  if (installButton) installButton.classList.remove("hidden");
});

if (installButton) {
  installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;

    deferredInstallPrompt = null;
    installButton.classList.add("hidden");
  });
}

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  if (installButton) installButton.classList.add("hidden");
});