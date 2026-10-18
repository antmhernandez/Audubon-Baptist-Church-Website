/**
 * Cloudflare Pages Function: GET /api/live
 *
 * Optional Facebook Page Live check.
 *
 * Setup in Cloudflare Pages > Settings > Variables and Secrets:
 * - FB_PAGE_ID            (Page's numeric ID, plain environment variable)
 * - FB_PAGE_ACCESS_TOKEN  (secret: never commit or return it)
 * - FB_GRAPH_VERSION      (optional, default v26.0; verify supported version)
 *
 * Optional manual fallback if Meta API access is unavailable:
 * - LIVE_MANUAL_ACTIVE = "true"  (set only during a real broadcast)
 * - LIVE_MANUAL_URL = "https://www.facebook.com/..."
 *
 * Without credentials, returns "unknown", never falsely "offline".
 * Facebook Page API permissions/availability must be verified before launch.
 */

const PAGE_URL = "https://www.facebook.com/audubonbaptistchurch/";
const STATUS_CACHE_SECONDS = 90;

function facebookUrl(candidate) {
  try {
    const url = new URL(candidate);
    return url.protocol === "https:"
      && (url.hostname === "facebook.com"
        || url.hostname === "www.facebook.com"
        || url.hostname === "m.facebook.com")
      ? url.href : PAGE_URL;
  } catch {
    return PAGE_URL;
  }
}

function reply(state, url = PAGE_URL, detail = "unverified", status = 200) {
  return new Response(JSON.stringify({
    state,
    url: facebookUrl(url),
    source: detail,
    checkedAt: new Date().toISOString()
  }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=90",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export async function onRequestGet({ env }) {
  if (env.LIVE_MANUAL_ACTIVE === "true") {
    return reply("live", env.LIVE_MANUAL_URL || PAGE_URL, "manual");
  }

  const pageId = String(env.FB_PAGE_ID || "");
  const token = env.FB_PAGE_ACCESS_TOKEN;

  if (!/^\d+$/.test(pageId) || !token) {
    return reply("unknown", PAGE_URL, "not-configured");
  }

  const version = /^v\d+\.\d+$/.test(env.FB_GRAPH_VERSION || "")
    ? env.FB_GRAPH_VERSION : "v26.0";

  const apiUrl = new URL(
    `https://graph.facebook.com/${version}/${pageId}/live_videos`
  );
  apiUrl.searchParams.set("fields", "id,status,permalink_url");
  apiUrl.searchParams.set("limit", "10");

  try {
    const response = await fetch(apiUrl.href, {
      headers: { Authorization: `Bearer ${token}` },
      cf: { cacheTtl: STATUS_CACHE_SECONDS, cacheEverything: false }
    });

    if (!response.ok) return reply("unknown", PAGE_URL, "meta-unavailable");

    const body = await response.json();
    if (!Array.isArray(body.data)) {
      return reply("unknown", PAGE_URL, "unexpected-meta-response");
    }

    const live = body.data.find(item => (
      item && ["LIVE_NOW", "LIVE"].includes(item.status)
    ));

    if (live) {
      const url = live.permalink_url
        || (live.id ? `https://www.facebook.com/${pageId}/videos/${live.id}` : PAGE_URL);
      return reply("live", url, "meta");
    }

    // An authorized API response can report no currently live video, but
    // Facebook's visibility/permissions still determine its completeness.
    return reply("not-reported", PAGE_URL, "meta");
  } catch {
    return reply("unknown", PAGE_URL, "meta-unavailable");
  }
}
