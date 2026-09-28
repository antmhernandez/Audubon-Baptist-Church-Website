/**
 * Audubon Baptist Church — PWA install/update helper
 * ------------------------------------------------------------
 * Shared by the public site and member/operator pages.
 * The installed PWA is the SAME website, not a separate mobile fork.
 */

let deferredInstallPrompt = null;

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true;
}

function platformFamily() {
  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";

  if (/iPad|iPhone|iPod/.test(userAgent)
      || (platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    return "ios";
  }

  if (/Android/i.test(userAgent)) return "android";
  if (/Macintosh|Mac OS X/i.test(userAgent)) return "mac";
  if (/Windows/i.test(userAgent)) return "windows";

  return "other";
}

function installInstructions() {
  const platform = platformFamily();

  if (platform === "ios") {
    return {
      heading: "Add Audubon to your Home Screen",
      steps: [
        "Open the browser Share menu.",
        "Choose “Add to Home Screen.”",
        "Turn on “Open as Web App” if that option is shown.",
        "Tap “Add.”"
      ],
      note: "On current iPhone and iPad versions, installation is available from the Share menu in supported browsers."
    };
  }

  if (platform === "android") {
    return {
      heading: "Install Audubon on Android",
      steps: [
        "Open your browser menu.",
        "Choose “Install app” or “Add to Home screen.”",
        "Confirm the installation."
      ],
      note: "Chrome and Samsung Internet usually provide the most app-like Android installation."
    };
  }

  if (platform === "mac") {
    return {
      heading: "Install Audubon on your Mac",
      steps: [
        "In Chrome or Edge, use the Install icon in the address bar or the browser menu.",
        "In Safari, choose File → Add to Dock.",
        "Confirm the app name and install."
      ],
      note: "The exact menu wording depends on the browser."
    };
  }

  if (platform === "windows") {
    return {
      heading: "Install Audubon on your computer",
      steps: [
        "In Chrome or Edge, use the Install icon in the address bar or the browser menu.",
        "Choose “Install Audubon Baptist Church.”",
        "Confirm the installation."
      ],
      note: "If your browser does not offer PWA installation, you can still bookmark the site or open it in a browser that supports installation."
    };
  }

  return {
    heading: "Install Audubon",
    steps: [
      "Open your browser menu.",
      "Look for “Install app,” “Add to Home screen,” or a similar command.",
      "If your browser does not provide that command, bookmark the site or use another modern browser with PWA installation support."
    ],
    note: "PWA installation is controlled by the operating system and browser, so there is no single install API that works identically everywhere."
  };
}

function ensureInstallDialog() {
  let dialog = document.getElementById("pwaInstallDialog");
  if (dialog) return dialog;

  const info = installInstructions();
  const stepsHtml = info.steps
    .map(step => "<li>" + step + "</li>")
    .join("");

  dialog = document.createElement("dialog");
  dialog.id = "pwaInstallDialog";
  dialog.className = "signin-dialog app-install-dialog";
  dialog.innerHTML =
    '<div class="dialog-card">'
    + '<div class="dialog-heading">'
    + '<div><p class="editorial-kicker">Get the Audubon App</p>'
    + '<h2>' + info.heading + '</h2></div>'
    + '<button class="dialog-close" type="button" data-close-install-dialog aria-label="Close">×</button>'
    + '</div>'
    + '<ol class="install-steps">' + stepsHtml + '</ol>'
    + '<p class="microcopy">' + info.note + '</p>'
    + '<div class="button-row">'
    + '<a class="button secondary" href="app.html">Installation help</a>'
    + '<button class="button primary" type="button" data-close-install-dialog>Got it</button>'
    + '</div></div>';

  document.body.appendChild(dialog);

  dialog.querySelectorAll("[data-close-install-dialog]").forEach(button => {
    button.addEventListener("click", () => {
      if (dialog.close) dialog.close();
      else dialog.removeAttribute("open");
    });
  });

  return dialog;
}

function updateInstallButtons() {
  const installed = isStandalone();

  document.querySelectorAll("[data-install-app]").forEach(button => {
    if (installed) {
      button.textContent = "App installed";
      button.disabled = true;
      button.setAttribute("aria-label", "Audubon app is already installed");
    } else {
      button.disabled = false;
    }
  });
}

async function requestInstall() {
  if (isStandalone()) return;

  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    updateInstallButtons();
    return;
  }

  const dialog = ensureInstallDialog();

  if (dialog.showModal) dialog.showModal();
  else dialog.setAttribute("open", "");
}

function wireInstallButtons() {
  document.querySelectorAll("[data-install-app]").forEach(button => {
    button.addEventListener("click", requestInstall);
  });

  updateInstallButtons();
}

async function registerAndRefreshServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register("./sw.js", {
      updateViaCache: "none"
    });

    registration.update().catch(() => {});
  } catch (error) {
    console.warn("Audubon PWA registration failed:", error);
  }
}

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  updateInstallButtons();
});

document.addEventListener("DOMContentLoaded", () => {
  wireInstallButtons();
  registerAndRefreshServiceWorker();
});
