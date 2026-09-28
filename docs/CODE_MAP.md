# Code Map

This is a quick orientation for someone opening the repository for the first time.

## Public pages

Each public page is mostly content and semantic HTML.

Shared public behavior is in `site.js`.

Home-specific member summary behavior is in `app.js`.

The sermon archive has its own `sermons.js`.

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
