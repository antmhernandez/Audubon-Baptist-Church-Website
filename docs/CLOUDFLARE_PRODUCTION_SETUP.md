# Cloudflare Production Deployment — Audubon Baptist Church

Prepared October 18, 2026. Target: a reviewed public launch in November 2026.

## Recommended architecture

- **GitHub:** readable source code, content revisions, pull-request review.
- **Cloudflare Pages:** public website and installable PWA.
- **Cloudflare Pages Function:** optional Facebook Live status API at `/api/live`.
- **Cloudflare R2 Standard:** **2–4 most recent sermons** as compressed web video and audio-only files, using a bucket connected to a media subdomain for caching.
- **Church Linux workstation:** original recordings, historical archive, FFmpeg transcoding and uploads; NOT the origin for most viewer requests.
- **Offsite backup:** encrypted backup to an independent provider or an offsite drive.
- **Future database/auth:** a proper hosted database and real role permissions before member/admin functions go live.

### Avoid serving public website traffic from the laptop

The media computer is an archive and processing workstation, not a reliable public CDN. Historical entries can initially link to the existing church archive/Facebook. Later a secure on-demand worker can restore an archived sermon temporarily into R2 for delivery. If direct NAS streaming is considered, assess home upload speed, power failure, security and operating costs first.

## 1. Prepare the repository

1. Review `docs/PASTOR_GITHUB_EDITING.md` and get Pastor Jeff's approval of public copy.
2. Confirm current schedule, visitor/parking/children details, contact information, staff, giving, media rights, livestream practice, and selected domain.
3. Preserve the **old achurchinthepark.org WordPress website** and its audio files during migration. The current prototype links directly to files on that domain. Repointing its DNS before migrating/redirecting those URLs would break working sermon playback.
4. Agree on a church-owned GitHub and Cloudflare account/ownership plan, two administrators, and a PR review rule.
5. Do not publish private member/prayer data using existing prototype role controls. They are browser-local demonstrations, not secure authentication.

## 2. Create Cloudflare Pages deployment

1. Create/sign into a Cloudflare account the church controls.
2. Cloudflare dashboard → **Workers & Pages → Create application → Pages → Import an existing Git repository**.
3. Connect GitHub and authorize the `antmhernandez/Audubon-Baptist-Church-Website` repository (or a church-owned replacement).
4. Project name: `audubon-baptist-church` (example; name must be available).
5. Production branch: `main`.
6. Framework preset: **None**.
7. Build command: **`exit 0`**.
8. Build output directory: **`.`** (repository root containing `index.html`).
9. Root directory: repository root; do not move the `functions/` folder into a static output subfolder.
10. Deploy and open the assigned `*.pages.dev` address.
11. Confirm Home, Visit, Sermons/audio, Get the App, Facebook banner, archive and responsive layouts. Test PWA install on iPhone/Android.
12. A GitHub merge into `main` automatically triggers a Pages deployment. Pull requests should produce preview builds.

Cloudflare docs:
- https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- https://developers.cloudflare.com/pages/functions/get-started/
- https://developers.cloudflare.com/pages/configuration/git-integration/

## 3. Domain and old-site preservation

**Safest first month:** keep the existing church website unchanged and publish the new site on `*.pages.dev` or a suitable subdomain, for example `new.achurchinthepark.org`, if church leadership controls the domain's DNS.

In Pages → project → **Custom domains**, add the selected subdomain and follow Cloudflare's DNS instructions. Do not switch the church's root/www domain before preserving WordPress archives, media files, redirects, mail records, SPF/DKIM/DMARC, and any existing integrations.

Apex/root domain cutover must be scheduled and reviewed separately.

Docs: https://developers.cloudflare.com/pages/configuration/custom-domains/

## 4. Configure recent sermon storage

1. Dashboard → **R2 → Create bucket**; example bucket name `audubon-public-sermons`.
2. Use **Standard** storage (the free allowance applies there).
3. Connect a custom domain such as `media.achurchinthepark.org` in bucket Settings → Public access → Custom Domains after DNS is available.
4. Upload **only processed, public delivery copies**, for example:
   - `sermons/2026-11-01-slug/video-720p.mp4`
   - `sermons/2026-11-01-slug/audio-64k.mp3`
5. Set correct `Content-Type` and public caching headers. R2 custom domains permit Cloudflare's cache; `r2.dev` development URLs do not support edge caching.
6. Keep originals on the church Linux archive and independently backed up.
7. In `sermon-catalog.json`, enter published records under `recent` once the media URLs have been verified.

**Retention algorithm (future worker):** process new video → upload video/audio → verify public playback → update public catalog → move the fifth-oldest record into `archive` with a working destination → delete its old public R2 objects **only after verifying the archive copy and backups**. Limit recent to 2–4 according to available space and preference. Never automatically delete church masters.

`sermon-catalog.json` schema: `schemaVersion:1` with `recent` and `archive` arrays. Each record may have `title`, `date`, `scripture`, `speaker`, `videoUrl`, `audioUrl`, `archiveUrl`.

### Media limitations

R2 serves files; it does **not automatically transcode** large uploads into adaptive streams. Start with FFmpeg-generated H.264/AAC 720p MP4 with fast-start plus a smaller audio file. Cloudflare's R2 CDN cacheable-object limit on Free/Pro/Business plans is **512 MB per file**, so longer videos may not be cached at edge (though delivery still works). Segmenting HLS or upgrading to Cloudflare Stream is an optional later improvement.

## 5. Facebook Live checker

This repository already includes:

- `index.html` — prominent Facebook livestream banner;
- `live-status.js` — browser checker and always-available Facebook link;
- `functions/api/live.js` — server-side Cloudflare Pages Function.

The banner **always works as a link** to the church Page. Until Meta access is configured it shows an **unverified** status, not a false assertion that church is live or offline.

To enable authorized automatic checks:

1. Have an authorized Audubon Facebook Page administrator verify that Meta currently permits the church app to read its Page-owned live-video status.
2. Establish an approved Meta app / Page access token with the necessary permissions; do not assume Page Live data is openly accessible.
3. In Cloudflare Pages → project → Settings → **Variables and Secrets**, configure:
   - `FB_PAGE_ID`: numeric Audubon Facebook Page ID (environment variable);
   - `FB_PAGE_ACCESS_TOKEN`: private **secret**;
   - `FB_GRAPH_VERSION`: optional supported version (currently default in code is `v26.0`; verify at setup).
4. Redeploy Pages, then test `https://YOUR-PAGES-DOMAIN/api/live`. It should return JSON with `state: live | not-reported | unknown`.
5. Test a real live broadcast, non-live condition, missing permissions, and token expiry before relying on its announcement.

Alternatively, for manual Sunday announcement when Meta access is unavailable, configure `LIVE_MANUAL_ACTIVE=true` and optionally `LIVE_MANUAL_URL` (must be a Facebook URL). Set it back to false when the broadcast ends. This is an **announcement**, not automatic detection.

The function never returns the Meta token to the browser. Rate/permissions/API versions must be reviewed with current Meta documentation before launch.

## 6. Budget

Cloudflare Pages static delivery: **$0** on its Free tier within published limits; Pages Free currently allows **500 builds/month**.

R2 Standard:
- First **10 GB-month**, **1 million Class A operations**, **10 million Class B operations** free per month.
- Above included allowance: **$0.015/GB-month**; Class A **$4.50/million**, Class B **$0.36/million**.
- R2 egress bandwidth is free under published R2 pricing.
- Example: if four compressed video/audio pairs total less than 10 GB, the storage portion can be **$0**.
- Other costs: domain renewal, offsite backup, electricity, replacement disks, any future database/auth provider.

Cloudflare Stream alternative: **$5 per 1,000 minutes stored** and **$1 per 1,000 minutes delivered**; it simplifies transcoding and adaptive playback but will generally cost more than bare R2 at modest usage.

Sources:
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/cache/interaction-cloudflare-products/r2/
- https://developers.cloudflare.com/stream/pricing/

## 7. Pre-launch acceptance test

- All public church facts approved by Pastor Jeff.
- Appropriate rights/licensing for sermon audio, copyrighted songs, photographs, and livestream footage.
- Existing public audio archives still work; no broken old-domain links.
- All pages load, mobile navigation works, PWA reinstall/update works, Facebook link functions if live API is unavailable.
- HTTPS/domain/DNS/email records verified and rollback plan documented.
- R2 video/audio available from two phones or networks.
- Archives and backup restored in a real test.
- Unsecured member/admin prototype does not collect real private information.
- Ownership, billing alerts, disaster recovery and monthly restore-test owner assigned.

**Launch staging before changing official domain.** A Cloudflare Pages deploy is not the same as a secure member-platform launch.
