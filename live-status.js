/**
 * Audubon public Home: Facebook Live status and safe link.
 *
 * Always exposes the official church Facebook link.
 * On Cloudflare Pages, optionally checks /api/live using a server-side
 * Pages Function. On GitHub Pages or without Meta credentials, status is
 * "not verified" (never assume an offline or a live broadcast).
 */
(function () {
  const FACEBOOK_PAGE = "https://www.facebook.com/audubonbaptistchurch/";
  const STATUS_ENDPOINT = "api/live";
  const REFRESH_MS = 120000;

  const section = document.getElementById("facebookLive");
  const label = document.getElementById("facebookLiveStatus");
  const description = document.getElementById("facebookLiveDescription");
  const link = document.getElementById("facebookLiveLink");
  const dot = document.getElementById("facebookLiveDot");

  if (!section || !label || !description || !link || !dot) return;

  function verifiedFacebookUrl(candidate) {
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:" &&
          ["facebook.com", "www.facebook.com", "m.facebook.com"]
            .includes(url.hostname)) return url.href;
    } catch { /* Retain official Page link. */ }
    return FACEBOOK_PAGE;
  }

  function render(status) {
    const isLive = status && status.state === "live";
    section.classList.toggle("is-live", Boolean(isLive));
    dot.classList.toggle("is-live", Boolean(isLive));

    if (isLive) {
      label.textContent = status.source === "manual"
        ? "Livestream announced" : "LIVE on Facebook";
      description.textContent = "Join Audubon's Facebook broadcast.";
      link.textContent = "Watch the livestream ↗";
      link.href = verifiedFacebookUrl(status.url);
    } else if (status && status.state === "not-reported") {
      label.textContent = "No live video reported";
      description.textContent =
        "Facebook may still have a broadcast—open the church Page to check.";
      link.textContent = "Check Facebook for live video ↗";
      link.href = FACEBOOK_PAGE;
    } else {
      label.textContent = "Facebook livestream";
      description.textContent =
        "Live status is not verified here yet. Open Audubon's Facebook Page.";
      link.textContent = "Open Audubon on Facebook ↗";
      link.href = FACEBOOK_PAGE;
    }
  }

  async function checkLiveStatus() {
    if (document.hidden || !navigator.onLine) return;

    try {
      const response = await fetch(STATUS_ENDPOINT, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) return render(null);
      const status = await response.json();
      render(status);
    } catch {
      render(null);
    }
  }

  render(null);
  checkLiveStatus();
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) checkLiveStatus();
  });
  window.addEventListener("online", checkLiveStatus);
  setInterval(checkLiveStatus, REFRESH_MS);
})();
