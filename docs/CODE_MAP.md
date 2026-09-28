# Code Map

This is a quick orientation for someone opening the repository for the first time.

## Public pages

Each public page is mostly content and semantic HTML.

Shared public behavior is in `site.js`.

Home-specific member summary behavior is in `app.js`.

The sermon archive has its own `sermons.js`.

`archive.html` is a static historical-resource page for selected newsletters and older sermon-series links. It must keep historical material clearly distinguished from current church information.

## Private/member pages

- `member.html` / `member.js`
- `calendar.html` / `calendar.js`

These share browser-local prototype data through the `abcDemoV3` local-storage record.

## Operator pages

- `admin.html` / `admin.js`
- `media-studio.html` / `media-studio.js`

The Media Studio is intentionally isolated from ordinary administration.

## Naming conventions

- `*-page`, `*-section`, `*-panel` — layout regions
- `*-button`, `*-link` — actions/navigation
- `*-list`, `*-grid` — repeated content collections
- `data-*` attributes — JavaScript hooks for repeated controls
- IDs — unique JavaScript hooks; change carefully

## JavaScript organization convention

When adding code, prefer this order:

1. constants/configuration;
2. state;
3. storage helpers;
4. formatting helpers;
5. render functions;
6. action helpers;
7. event listeners;
8. initial render.

Use section comments for large files.

Prefer named functions for behavior that has a meaningful name. Avoid large anonymous event-listener bodies.

## Comments

Comments should explain:

- why a behavior exists;
- where a maintainer is expected to change a setting;
- privacy/security boundaries;
- prototype-vs-production differences.

Avoid comments that merely repeat the code.


## Progressive Web App

The PWA is the entire church website, not a separate Sermon Studio application.

- `app.html` — installation/help page
- `manifest.webmanifest` — app identity, start URL, icons, shortcuts
- `pwa.js` — install button, platform-aware fallback instructions, service-worker registration/update check
- `sw.js` — network-first app-shell/offline fallback
- `audubon-app-icon-192.png` / `audubon-app-icon-512.png` — broad-compatibility install icons

All pages may expose a `data-install-app` button. Do not create separate install logic per page.

## Sermon media model

The featured sermon record reserves:

- `videoUrl`
- `audioUrl`

The public Sermons page can switch between video and lower-data audio playback.

The Media Studio describes how these derivatives will be generated. The future NAS/FFmpeg worker—not browser JavaScript—will create the actual media files.
