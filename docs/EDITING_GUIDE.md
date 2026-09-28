# Human Editing Guide

Last reviewed: 2026-09-28

This repository is intentionally plain HTML, CSS, and JavaScript so that a reasonably technical church volunteer can understand and modify it without a framework.

The governing readability policy is `docs/HUMAN_MAINTAINABILITY_STANDARD.md`.

For the current feature-by-feature design/content rationale, also read `docs/COMPREHENSIVE_PRODUCT_POLISH_2026-09-28.md`.

## Start here

For most changes, use this map:

| What you want to change | File |
| --- | --- |
| Home page layout | `index.html` |
| Plan Your Visit content | `visit.html` |
| Sermon page layout | `sermons.html` |
| Sermon archive metadata, historical audio URLs, search/sort behavior | `sermons.js` |
| Beliefs copy | `beliefs.html` |
| Church history / mission | `about.html` |
| Giving explanation | `give.html` |
| Shared public navigation / member button | `site.js` |
| Home member-only weekly summary | `app.js` |
| Member area layout | `member.html` |
| Member area behavior | `member.js` |
| Three-month calendar | `calendar.html` + `calendar.js` |
| Site administration | `admin.html` + `admin.js` |
| Sermon upload / trim tool | `media-studio.html` + `media-studio.js` |
| Colors, spacing, typography, responsive layout | `styles.css` |
| Whole-site app install/update behavior | `app.html`, `manifest.webmanifest`, `pwa.js`, `sw.js` |

## Safe editing habits

1. Change one thing at a time.
2. Keep IDs used by JavaScript unchanged unless you also update the corresponding JavaScript.
3. Do not place passwords, API keys, member records, prayer requests, financial records, or raw sermon video in GitHub.
4. Keep real sermon video out of this repository.
5. After editing JavaScript, run a syntax check.
6. After editing HTML, confirm every `getElementById(...)` target still exists.
7. Test desktop and phone widths.
8. Keep unconfirmed church facts marked as unconfirmed.

## How pages are connected

### Public site

`site.js` provides shared behavior for the public pages:

- mobile menu;
- About dropdown;
- Member button / prototype sign-in;
- role preview state.

The public pages are:

- `index.html` — Home
- `visit.html` — Visit
- `sermons.html` — Sermons
- `beliefs.html` — Beliefs
- `about.html` — Our Story & Mission
- `give.html` — Give

### Member application

`member.html` contains one private application shell.

`member.js` switches among:

- Overview
- Prayer
- Groups
- Conversations
- Lists & signups
- Serve

The Calendar remains a separate full page because its three-month layout needs more space.

### Administration

`admin.html` is the ordinary content-management prototype.

`media-studio.html` is deliberately separate because video work is a specialized workflow.

## Stylesheet notes

`styles.css` grew through several prototype passes. Later rules intentionally override some earlier prototype rules.

The important current design variables are near the later **Editorial redesign** section:

- `--audubon-red`
- `--audubon-green`
- `--audubon-paper`
- `--audubon-ink`
- `--display`
- `--sans`

For future cleanup, the stylesheet can eventually be split into:

- `css/base.css`
- `css/public.css`
- `css/member.css`
- `css/calendar.css`
- `css/media.css`

Do that only as a deliberate refactor with visual regression testing; the current single file is stable.

## Browser-local prototype data

Several prototype pages share:

`localStorage["abcDemoV3"]`

That browser-local object currently holds items such as:

- selected preview role;
- events;
- RSVPs;
- prayer-request samples;
- featured sermon metadata;
- media draft settings.

This is not a production database.

## Sermon Studio

The current Sermon Studio is designed around the weekly task:

1. Choose the service video.
2. Use `−30`, `−5`, play/pause, `+5`, and `+30` to find the sermon.
3. Press **Set start here** or keyboard `I`.
4. Find the end.
5. Press **Set end here** or keyboard `O`.
6. Preview the selected clip.
7. Enter title, Scripture, speaker, series, and tags.
8. Choose simple audio options.
9. Save a draft if desired.
10. Prepare the publication job.

Keyboard shortcuts:

- Space — play/pause
- Left / Right — 5 seconds
- Shift + Left / Right — 30 seconds
- I — mark sermon start
- O — mark sermon end

## Draft behavior

Media drafts store metadata and trim coordinates in the browser.

They do **not** store the selected video file.

When restoring a draft, re-select the original video file and then restore the saved settings.

## Installable phone/tablet app

The entire Audubon site is one installable PWA.

The prominent **Get the App!** control appears in the site/application headers. It uses a native browser install prompt when available and otherwise shows short manual instructions.

`app.html` is the dedicated installation/help page.

`manifest.webmanifest` identifies the installed application as **Audubon Baptist Church** and opens at `index.html`.

`pwa.js`:
- wires install buttons;
- detects standalone mode;
- provides platform-aware fallback instructions;
- asks the service worker to check for updates when a page opens.

`sw.js` uses **network first** for the public/static app shell. When online, the deployed website is preferred; the cache is used as an offline fallback.

Member Home, Calendar, Site Admin, and Media Studio are deliberately excluded from the general offline cache so future personalized/private responses do not become a caching footgun.

Never add uploaded sermon video or future authenticated/private API responses to the general service-worker cache.

## Where production work will change things

The current prototype stops at “Prepare & post.”

The production version should send the selected file and editing instructions to the church NAS/media worker:

```
browser / tablet
  -> authenticated upload
  -> church NAS temporary ingest
  -> FFmpeg trim / normalize / encode
  -> full local archive retained
  -> newest public derivative uploaded to R2
  -> recent-sermons manifest updated
  -> oldest online derivative removed only after successful replacement
```

Keep that network/worker code separate from the browser editor so the editor remains understandable.
