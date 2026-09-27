# Lean Hybrid Self-Hosted Production Plan

Last reviewed: 2026-09-27

## Goal

Keep Audubon's recurring infrastructure cost extremely low while retaining:

- a fast public website even if the church loses power or internet;
- church ownership of the complete sermon archive;
- private church data stored on church-controlled hardware;
- only the newest 2–4 sermons stored online for convenient public playback;
- automatic sermon publishing and rotation;
- an inexpensive offsite backup for irreplaceable data.

## Recommended architecture

```
GitHub
  │ source / docs
  ▼
Cloudflare Pages
  │ public site / PWA shell
  │
  ├──────────────► Cloudflare R2
  │                 newest 4 web-ready sermons
  │                 thumbnails / recent-sermons.json
  │
  └──────────────► api.audubon...
                    Cloudflare Tunnel
                           │
                           ▼
                    Church NAS / server
                    ├─ PostgreSQL
                    ├─ application API
                    ├─ member/auth data
                    ├─ events / RSVPs
                    ├─ prayer / groups
                    ├─ sermon metadata
                    ├─ FFmpeg media worker
                    └─ complete local media archive
                           │
                           ▼
                    encrypted offsite backup
                    Backblaze B2
```

## Why this is economical

### Public site

Use Cloudflare Pages for the public application shell and static assets.

Cloudflare currently charges nothing for static asset requests and the Workers Free plan includes a large daily request allowance for light dynamic functions.

The public site therefore remains online even if the church NAS is temporarily unavailable.

### Recent sermon delivery

Use a Cloudflare R2 Standard bucket for only the newest four web-ready sermons.

R2 currently includes:

- 10 GB-month of Standard storage free each month;
- 1 million Class A operations;
- 10 million Class B operations;
- no internet egress charge.

A one-hour sermon encoded around 2–3 Mbps is roughly 1–1.5 GB. Four recent sermons should normally fit comfortably inside the 10 GB free allowance.

Do not deliver video through the Cloudflare Tunnel. The tunnel is for the small application API. Public media should come from R2.

## Church NAS

Recommended minimum layout:

- small x86 mini-tower / NAS-capable computer;
- 16 GB RAM;
- SSD for operating system / containers;
- 2 NAS-grade hard disks in a **ZFS mirror / RAID 1**;
- UPS battery backup.

Two drives in RAID 1 / ZFS mirror provide one-drive fault tolerance but only the capacity of one drive.

Example:

- 2 × 8 TB disks
- approximately 8 TB usable before filesystem overhead

RAID is not a backup.

### Services on the NAS

Run through Docker or native services:

- PostgreSQL
- Audubon application API
- mature authentication layer
- FFmpeg media worker
- backup agent (restic)
- `cloudflared` Tunnel connector

Private member data stays in PostgreSQL on the NAS.

## Weekly sermon publishing automation

The media workflow should be event-driven rather than relying on a blind Sunday cron job.

### Safe sequence

1. Sunday recording lands on the NAS in the ingest directory.
2. Administrator opens Media Studio.
3. Administrator scrubs to the sermon beginning and clicks **Set start here**.
4. Administrator marks the ending.
5. Administrator enters title, Scripture, speaker, series, and tags.
6. NAS FFmpeg worker:
   - clips start/end;
   - normalizes speech;
   - creates a 720p or efficient 1080p H.264/AAC web copy;
   - creates thumbnail;
   - optionally creates MP3/audio-only copy.
7. Worker uploads the new public derivative to R2.
8. Worker verifies the uploaded object is readable.
9. Worker updates `recent-sermons.json` with newest sermon first.
10. Website immediately begins showing the new sermon.
11. If more than four online sermons exist, worker removes the oldest R2 video and related derivative files.
12. **Nothing is deleted from the NAS archive.**

This order matters: the old sermon is not removed until the replacement has successfully uploaded and the manifest has been updated.

## Public sermon manifest

Example:

```json
{
  "updated": "2026-09-27T16:00:00Z",
  "sermons": [
    {
      "id": "2026-09-27",
      "title": "Example",
      "scripture": "John 10:1-18",
      "video": "https://media.example.org/sermons/2026-09-27/sermon.mp4",
      "thumbnail": "https://media.example.org/sermons/2026-09-27/poster.jpg"
    }
  ]
}
```

The Cloudflare-hosted site can read this tiny JSON file without querying the NAS, so the four recent sermons remain available during a church internet outage.

## Private application traffic

The member/admin application talks to the NAS API through a named Cloudflare Tunnel.

Advantages:

- no router port forwarding;
- no public origin IP required;
- outbound-only connection from the church;
- Cloudflare security is applied before requests reach the NAS.

If the church NAS or internet is down:

- public pages still work;
- the newest R2 sermons still play;
- private member/admin actions are temporarily unavailable.

This is a reasonable tradeoff for avoiding a monthly managed database fee.

## Backup plan

Use three levels.

### 1. ZFS / RAID mirror

Protects against a single disk failure.

### 2. Local snapshots

Frequent ZFS snapshots protect against accidental edits/deletions for a retention window.

Suggested:

- hourly: 24 hours;
- daily: 30 days;
- monthly: 12 months.

### 3. Offsite backup

Use encrypted `restic` backups to Backblaze B2 for:

- PostgreSQL dumps;
- app configuration;
- member data;
- documents;
- thumbnails;
- published sermon derivatives;
- selected irreplaceable media masters.

Backblaze B2 pay-as-you-go storage is currently about $6.95/TB-month.

For the full raw media archive, the most economical option may be a large external USB drive rotated offsite instead of cloud-copying many terabytes.

## Cost expectation

### Recurring cloud cost at modest usage

- Cloudflare Pages: $0
- Cloudflare R2 recent sermons: likely $0 while below free allowance
- Cloudflare Tunnel: available on Cloudflare plans and no separate video-delivery role
- Backblaze B2 backup:
  - 100 GB ≈ well under $1/month at current storage rates
  - 1 TB ≈ $6.95/month
  - 2 TB ≈ $13.90/month
- domain name: typically roughly $10–25/year depending registrar/TLD

### One-time local equipment

If starting from nothing:

- suitable used/new mini-tower: roughly $150–350
- 2 × NAS hard drives: roughly $250–400 depending capacity
- SSD: roughly $30–60
- UPS: roughly $80–150

Expected one-time total: approximately $500–900 if buying everything new enough to be reliable, potentially much less with donated/reused hardware.

## Recommended practical starting point

1. Keep the current prototype on GitHub Pages while leadership reviews it.
2. Move the final public shell to Cloudflare Pages.
3. Buy/build the NAS only after leadership approves the project.
4. Put PostgreSQL + API + FFmpeg worker on NAS.
5. Use R2 for newest four public sermons.
6. Use Cloudflare Tunnel for small authenticated API traffic only.
7. Use B2 for encrypted critical-data backup.
8. Add an offsite rotating USB disk if preserving every raw sermon recording is important.
