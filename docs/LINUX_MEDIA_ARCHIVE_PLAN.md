# Linux Laptop as Audubon Sermon Archive and Media Workstation

Prepared October 18, 2026 — hardware is not yet connected.

## Purpose

The church-owned laptop should store the original/full sermon library, process recordings, and push the newest delivery copies to Cloudflare R2. It should not carry all public livestream traffic or serve as the only archive copy.

## First inspection

Before reformatting, record:
- exact laptop model, RAM, CPU, internal storage;
- USB 3.x ports and Ethernet availability;
- drive health (SMART where supported);
- church broadband upload speed;
- expected recording resolution/size and archive capacity;
- whether it can run unattended without sleep or overheating.

Choose **Debian 13 stable** or **Ubuntu Server LTS** for a familiar and well-supported Linux base. A laptop is convenient because its working battery can briefly bridge a power interruption, but batteries can deteriorate and require inspection.

## Hardware outline

- Laptop on wired Ethernet if possible; keep it ventilated.
- Internal SSD for OS and applications.
- Two independently connected external drives for local media data and a local backup or mirrored availability.
- Prefer powered USB enclosures/docks and reliable cables.
- A third backup **offsite**, such as an encrypted backup repository on Backblaze B2 or a drive stored at another building.

Two disks in RAID1 protect somewhat against a disk failure but are **not two independent backups**. Accidental deletion, malware, controller failure, fire, theft and corruption can affect both. External USB drive mirroring can also be fragile; two independent backup disks may be more useful for this small installation.

## Folder organization

```text
/srv/audubon-media/
  incoming/             unedited Sunday uploads
  masters/              retained originals
  jobs/                 Sermon Studio JSON edit instructions
  published/
    recent/             compressed R2-ready files
    archive/            optional restore-ready derivatives
  metadata/             public catalog and processing logs
  quarantine/           failed or suspicious inputs
```

Use filesystem permissions so only the dedicated media-service user can write processing folders. Media and secret tokens stay out of the public web root.

## Software

- Linux OS security updates;
- `ffmpeg` / `ffprobe` for clip/transcode/audio;
- `smartmontools` for disk checks when USB bridge supports SMART;
- `rclone` or an S3-compatible uploader for R2 (credentials stored securely);
- `restic` or BorgBackup for encrypted incremental backups;
- systemd service/timers only after manual procedures work reliably;
- a minimal job queue with bounded parallelism (start with one FFmpeg job).

**Do not expose SMB, SSH, drive mount points, or the FFmpeg worker to the public Internet.** An eventual control interface can use identity-protected Cloudflare Tunnel/Access, or another authenticated outbound-only communication system. It should never trust a public user-supplied shell command.

## Initial manual Sunday workflow

1. Export Sunday's recording from the camera/recording system.
2. Copy original to `masters/` and verify file integrity.
3. Open Sermon Studio on a computer, select the recording, set start/end and metadata.
4. Export the JSON job; save alongside the source.
5. Run FFmpeg on the workstation to produce:
   - 720p H.264/AAC MP4 (`+faststart`) for broad browser playback;
   - separate mono/stereo MP3 audio at a modest bitrate.
6. Listen/view the start and end, check loudness, and check file metadata.
7. Upload both files to the R2 public-media bucket under stable unique paths.
8. Check actual HTTPS playback on another device/network.
9. Update `sermon-catalog.json` with newest public media links.
10. Move former fifth-oldest entry to archive with a valid archive URL.
11. Delete an older R2 delivery copy **only after** master/backup and archive destination are checked.
12. Run backup and verify that new recordings appear in its manifest.

Do not start automatic deletion before these steps have been practiced manually.

## Archival playback strategy

**Phase 1 (recommended for November):**
- recent 2–4: video+audio stored on R2;
- historical sermons: links to the existing Audubon archive and/or Facebook, with an updated catalog;
- master/full recording files: church laptop with backups.

**Phase 2:**
- older recording is requested through an authenticated, rate-limited on-demand process;
- worker validates catalog ID, encodes/restores delivery copy if required;
- temporary public copy goes to R2 for broad viewing;
- worker returns a short-lived/public media link and later rotates it out, keeping masters.

Direct streaming from the laptop is possible technically but not recommended as the default. A handful of viewers may saturate upstream bandwidth; laptop power, connectivity and disk throughput are single points of failure. The public website must remain functional while the laptop is offline.

Cloudflare generally permits video over its CDN when the video is hosted on **Cloudflare R2/Stream**, not arbitrary off-platform video being fronted by Cloudflare's general-purpose CDN.

## Remote backup

For independent encrypted offsite storage, Backblaze B2 is an example (currently advertised starting **$6.95/TB-month**, first 10 GB free; actual usage/region may vary). Do not treat the Facebook Page as a replacement for church-owned independent backups.

A simple 3-2-1 policy:
- 3 copies (master, local backup, offsite backup);
- 2 independent storage devices/media;
- 1 offsite;
- quarterly test restore, monthly health check, a written contact and recovery procedure.

Prefer a backup tool with encryption, automatic retention/versioning, and integrity verification. Store recovery keys in a church-controlled password vault/recovery procedure, never in this public GitHub repository.

## Important distinction

The existing Sermon Studio **does not yet upload to or run FFmpeg on this laptop**. It can select a local file, mark trim points and export a JSON instruction file.

A future secured worker will consume that JSON after church leadership selects hardware and authenticates the upload system. Nothing in the current public PWA connects to an unconfigured NAS.
