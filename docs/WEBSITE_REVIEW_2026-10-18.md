# Audubon website review — October 18, 2026

Scope: October 18 repository `main` and the media-pipeline implementation branch. This is a **source/design-architecture review**, not a claim of a full rendered-browser accessibility audit or of access to Cloudflare, church DNS, or the physical laptop.

## What already works in the prototype

- The public website is a coherent multi-page HTML/CSS/JavaScript site; GitHub Pages is a reasonable continued host.
- The PWA has network-first public file caching. Neither uploaded sermon videos nor private member pages are in its offline shell.
- The historical Sermons page already offers existing Audubon public audio and a searchable library.
- The Media Studio supports local file preview, trim sliders, audio choices, sermon metadata, saved browser-local drafts, and downloadable processing JSON.
- The homepage has an official Facebook Page link and the live-status widget does not assert unverified broadcast status.
- The current/recent sermon catalog is separated from older historical material, and remains empty until real delivery files are verified.
- `scripts/validate-site.mjs` checks some source/HTML/JavaScript issues in GitHub Actions.

## Important implementation boundary

A **public GitHub Pages site is not an authenticated application server**. The prototype member sign-in, role switcher, calendar changes, prayer lists, and administrative editing are demonstration-only local browser state. Never populate them with real confidential data.

`functions/api/live.js` works only if deployed on Cloudflare Pages, not on GitHub Pages. R2 storage can be used separately, with no Cloudflare Pages migration.

The new `scripts/sermon-worker.py` is a **manual local FFmpeg + rclone helper**, not a browser-connected service. It processes Studio-exported jobs and can upload and restore processed delivery objects. It does not make GitHub commits or run unattended retention.

## Priority 0 — before a production church-domain launch

1. **Confirm every public church fact** with Pastor Jeff: current Sunday hours, address, contact details, pastoral copy, ministry programs, giving provider, and worship/livestream practices. The current home page deliberately labels the worship times as historical/unconfirmed; remove the awkward disclaimer *only after* confirmation and replace with approved, direct visitor copy.
2. **Legacy archive and domain safety:** preserve the existing `achurchinthepark.org` WordPress files/audio URLs before any apex/www DNS changes. Keep email MX/SPF/DKIM/DMARC and redirects intact.
3. **Private-feature boundary:** production public access must not invite members to submit real prayer requests, giving information, or personal RSVPs to local-storage prototype screens. Either clearly disable those public entries at launch, or implement real server-side authentication and authorization first.
4. **Security/ownership:** church-owned accounts, two admins, least-privilege R2 credentials, no secrets in Git, real backup restore test, HTTPS, media rights/minor consent, and a domain cutover/rollback plan.
5. **Accessibility testing:** manual keyboard and screen-reader checks on public site and mobile; test header navigation, focus order, dialogs, contrast, font scaling, link targets, labels, and tap sizes.

## Priority 1 — useful November site and weekly sermons

1. **Media:** connect first real recording through Studio JSON → Linux FFmpeg processor → R2 Standard → verified HTTPS URLs → GitHub `sermon-catalog.json` publication. The PR adds a native video disclosure on recent sermon cards, so visitors can watch without leaving the Sermons page.
2. **Serious backup:** preserve full master media on local storage with a separate external drive/remote encrypted offsite copy. RAID mirroring alone is not backup.
3. **Visual hierarchy:** on Home, preserve the restrained burgundy/cream editorial aesthetic and simple Visit/Sermons/Story entry routes. Reduce repeated low-priority calls to action; make verified Sunday time/address and current sermon the two easiest facts to locate.
4. **Real approved imagery:** if leadership agrees, add one or two optimized, properly permissioned images of the building/congregation or church life, with meaningful alt text. The current site is text-forward; photography can help new visitors recognize the place while preserving restraint. Do not use generic stock photos or photos of minors without permission.
5. **Navigation polish:** audit mobile dropdown, sign-in labels and links for a visitor who is not in demo mode. A confusing non-working "Member sign in" experience is worse than a clearly postponed feature.
6. **Observability:** set up an availability/uptime check and a privacy-conscious, low-cost traffic view; avoid adding intrusive trackers without church approval.

## Priority 2 — after public launch and validated weekly workflow

1. **True media administration:** secure admin login, browser uploads to private temporary ingest storage, authenticated one-time upload grants, file limits/inspection, and a single background FFmpeg job at a time. No S3/R2 write secrets may appear in web JavaScript.
2. **Managed sermon publication:** durable sermon IDs, proper indexed metadata (speaker, date, Scripture, series, tags), thumbnail/poster, audio/video selection, captions/transcripts and accessible player labels. Maintain the public catalog on stable URLs even if the laptop is offline.
3. **Archive restoration:** request an old sermon from the local library; a protected worker stages a viewing copy into R2, then publishes only once verified. Rate-limit requests and never expose raw drive shares over the Internet.
4. **Secure membership:** backend auth/database and server-side roles for members, groups, leaders, and administrators, before live RSVP/prayer/forum/direct-messaging features. Use a mature managed provider initially unless the church can support local database operations.
5. **Maintainability:** `styles.css` is currently about 123 KB with acknowledged overlapping prototype-era layers. After launch, extract tokens/base/public/member/calendar/admin/media styles into readable modules with browser regression checks rather than stacking additional overriding selectors.
6. **Automated tests:** current CI covers JavaScript syntax, local links/IDs, JSON and CSS braces, but not real mobile layout, media playback, accessibility, network failures, or permission enforcement. Add automated browser testing and security regression checks as production features are introduced.
7. **SEO:** after choosing the church's permanent primary domain, introduce a matching canonical URL strategy, sitemap, social share image, and structured data based only on verified facts.

## Recommended first milestone

**One verified sermon, end-to-end, with no credentials in Git and no permanent data lost.** This proves the division of responsibility before buying more equipment or introducing a second website host.

Related: `docs/GITHUB_PAGES_R2_LINUX_QUICKSTART.md`, `docs/HANDOFF_2026-10-18.md`, `docs/LINUX_MEDIA_ARCHIVE_PLAN.md`, `docs/SECURITY_AND_PRIVACY.md`.
