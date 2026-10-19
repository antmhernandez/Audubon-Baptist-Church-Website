# GitHub Pages + Cloudflare R2 + Linux laptop: first working sermon pipeline

Prepared October 18, 2026. **This is an implementation guide, not a claim that the church's Cloudflare account or laptop is configured.**

## Hosting decision

Keep the public HTML/CSS/JS and whole-site PWA on **GitHub Pages**. GitHub remains the sole source of website code. There is no need to deploy the same site to Cloudflare Pages just to use R2.

Use **R2 Standard** for the latest 2–4 processed video/audio pairs and the **Linux laptop** for original service recordings, local processing, historical delivery copies, and a separately protected backup.

The existing `functions/api/live.js` is a **Cloudflare Pages Function and does not run on GitHub Pages**. The Facebook Page link still works, with status unverified. Automatic live detection later requires a separate Cloudflare Worker (with an explicit API URL and CORS configuration), or a migration to Cloudflare Pages; do not imply the function is live today.

The static `sermon-catalog.json` is published by GitHub Pages. Edit/commit it after verification of each real R2 upload. There is no automatic browser-to-laptop upload yet.

## A. Set up the church-owned Cloudflare R2 account

1. Establish church-owned Cloudflare access, billing alerts, and at least two responsible administrators. Do not put tokens in GitHub.
2. In **R2**, create a bucket using **Standard** storage; for example `audubon-public-sermons` (choose the actual name and record it privately).
3. Keep the bucket private while testing uploads. Generate a bucket-scoped **Object Read & Write** R2 API token for this workstation, and store the Access Key ID and Secret Access Key safely. Avoid account-wide admin keys. A separate read-only key is appropriate for another machine.
4. Find the **Account ID** in Cloudflare and note the S3 endpoint `https://ACCOUNT_ID.r2.cloudflarestorage.com` (use a jurisdiction-specific endpoint if the bucket was created with one).
5. On the laptop, configure an `rclone` remote named `r2`:
   - `rclone config` → New remote → name `r2` → Amazon S3-compatible → provider **Cloudflare**;
   - supply the bucket-scoped R2 S3 credentials and the S3 endpoint;
   - review `rclone config file`, limit file permissions (`chmod 600 ~/.config/rclone/rclone.conf`), and keep the password vault recovery record with church leadership.
6. Verify access: `rclone lsd r2:` (if a bucket-scoped Object token cannot list buckets, instead run `rclone lsf r2:YOUR_BUCKET/ --max-depth 1` and see Cloudflare's `no_check_bucket` guidance).
7. For production public playback, add the domain's DNS zone to the **same Cloudflare account** and attach a custom domain such as `media.YOUR_CHURCH_DOMAIN` to the R2 bucket under **R2 → bucket → Settings → Custom Domains**. A custom domain supports CDN caching; the development-only `r2.dev` URL is not the production solution. Confirm caching behavior and file-size limits.
8. **Do not change the church's existing apex/www site, WordPress archive, or email DNS records** merely to attach media storage. If moving DNS nameservers is necessary, inventory and recreate all existing records first and coordinate with the domain owner.
9. Test one innocuous file, request it over the public HTTPS custom domain, and then remove the test object after verification. Never enable directory listing, unrestricted uploads or client-side R2 credentials.

Reference: https://developers.cloudflare.com/r2/pricing/ , https://developers.cloudflare.com/r2/buckets/public-buckets/ , https://developers.cloudflare.com/r2/api/tokens/ , https://developers.cloudflare.com/r2/examples/rclone/

## B. Inspect and prepare the Linux laptop (do not erase disks yet)

Before OS installation, record the model, CPU, RAM, SSD/HDD sizes and drive health, USB ports, Ethernet option, cooling, available church upload bandwidth, and whether the battery is healthy. Reuse a viable laptop first; spend money on reliable archival disks and independent backups before buying a new server.

Choose a supported Debian/Ubuntu LTS installation; use a wired connection, strong individual admin login, automatic security updates, and full-disk encryption where practical. Keep the laptop and attached media drives physically secure and ventilated.

On Debian/Ubuntu, after installing Linux:

```bash
sudo apt update
sudo apt install python3 ffmpeg rclone smartmontools restic
lsblk -o NAME,SIZE,FSTYPE,MODEL,MOUNTPOINTS
df -h
ffmpeg -version
ffprobe -version
rclone version
```

**Do not format or mount unknown old disks with write access until their contents and SMART health have been reviewed.** Plan a permanent storage mount rather than relying on a drive letter or removable auto-mount.

For a first manual test under the laptop operator's user account (later move into a dedicated least-privileged service account):

```bash
umask 077
mkdir -p ~/audubon-media/{incoming,masters,jobs,published/recent,published/archive,metadata,quarantine}
```

Do not expose SSH/SMB, the R2 S3 token, an unauthenticated job runner, or the raw media directory to the public Internet. The workstation is not the ordinary visitor-facing video server.

## C. Turn a Studio edit into real video and audio

1. Retain the original service video in `masters/` and ensure an independent backup exists.
2. On the existing public **Media Studio prototype**, choose the **matching original file**, set sermon start/end and details, then select **Download job JSON**.
3. Transfer the job JSON and matching video to the Linux laptop. The Studio does not yet upload files directly; its administrator switcher is not authentication.
4. Run `scripts/sermon-worker.py process`. It validates the job's input file name/size, safe trim times, and video/audio streams; runs FFmpeg; outputs a 720p H.264/AAC MP4 with fast-start; optionally generates an MP3; and writes a human-readable upload manifest. It does not publish anything or delete recordings.

Example (replace actual paths and sermon date):

```bash
python3 scripts/sermon-worker.py process \
  --source ~/audubon-media/masters/Sunday-Service.mp4 \
  --job ~/audubon-media/jobs/sunday-job.json \
  --date 2026-11-01 \
  --output ~/audubon-media/published/recent \
  --dry-run

# Inspect the dry run, then repeat without --dry-run to encode.
```

Encoding can take a while on older CPUs. Check audio, beginnings/endings, and file size before uploading. The script refuses to overwrite existing sermon directories.

## D. Upload, verify, publish, and restore

After successful processing, identify the new dated bundle directory and its `upload-manifest.json`.

```bash
python3 scripts/sermon-worker.py upload \
  --bundle ~/audubon-media/published/recent/2026-11-01-example-title \
  --bucket YOUR_ACTUAL_R2_BUCKET \
  --dry-run

# If paths and files are correct, repeat without --dry-run.
```

The uploader uses your locally configured `r2` rclone remote. It does **not** commit credentials, issue public URLs, change the GitHub catalog, or delete older objects. Test each resulting media URL using the actual bucket custom domain over HTTPS, including playback on a second network.

Only after playback passes, edit the public `sermon-catalog.json` in GitHub with the **actual verified** URLs and commit a reviewed change. Recent entries appear through `sermon-catalog.js`; keep at most four.

To copy a processed delivery file **back** from R2 onto a local computer, use:

```bash
python3 scripts/sermon-worker.py restore \
  --key sermons/2026-11-01-example-title/video-720p.mp4 \
  --dest ~/audubon-media/incoming/restored-video.mp4 \
  --bucket YOUR_ACTUAL_R2_BUCKET
```

This is a compressed delivery copy, **not** a substitute for the original master. Neither upload nor restore overwrites an existing file. Do not put personal/private videos in this public-media bucket.

## E. Retention and restoration rules

Until automation has passed real tests, do **not** delete the fifth-oldest R2 objects automatically. First verify: master still exists, independent backup successfully restores, previous sermon's archive link or restore procedure works, new sermon plays, and the GitHub catalog has been updated. Then a responsible human may remove redundant older public delivery objects.

An archived item with a `file://` or local-laptop URL is **not** a valid public `archiveUrl`. Initially use verified legacy WordPress/Facebook archive URLs; later add authenticated on-demand restoration. The public site should keep working when the laptop is powered off.

For later secure browser-based uploads, prefer church-admin authentication plus time-limited R2 upload authorization, a separate private ingest bucket, malware/file-type/size checks, and a limited background worker. Do not put an R2 write key in browser JavaScript. Large video uploads should go directly to object storage using an appropriate multipart upload protocol rather than through a simple Worker request body.

## F. Acceptance checklist

- [ ] GitHub Pages public site/PWA still loads with the Linux laptop offline.
- [ ] Original recording independently backed up; restoration has been tested.
- [ ] Media Studio JSON and matching source create a valid MP4 and MP3.
- [ ] R2 credentials work only for the intended bucket, stored outside Git.
- [ ] New R2 files load from two devices/networks using HTTPS.
- [ ] Public catalog contains only verified church-approved sermon metadata and URLs.
- [ ] A tested R2 restore returns a playable file.
- [ ] No private prayer/member information, keys, or recorded minors without consent appear in public storage.
- [ ] Existing `achurchinthepark.org` archive URLs remain functional through DNS changes.

Cloudflare R2's current free tier includes **10 GB-month Standard storage**, **1 million Class A** and **10 million Class B operations** per month, and zero R2 Internet egress fees, subject to plan/usage terms. Details: https://developers.cloudflare.com/r2/pricing/

**Known limitations:** No accounts, bucket, DNS, backup disks, or laptop were configured by adding this guide. The worker script is a first *manual* step and has no unattended scheduler, live authenticated upload endpoint, automatic catalog updates, or delete/rotation logic.
