# Sermon and Media Workflow

## Goal

A church administrator should be able to publish a sermon without becoming a video editor.

The common workflow should be:

1. upload or select a service recording;
2. identify sermon start;
3. identify sermon end;
4. enter title;
5. enter Scripture passage;
6. enter speaker;
7. add series/topics/tags;
8. adjust simple audio controls;
9. preview;
10. publish.

## Recommended editing scope

The web editor should begin with only the high-value operations:

- trim start/end;
- audio gain;
- speech loudness normalization;
- short fade in/out;
- title card or overlay;
- thumbnail;
- tags;
- captions;
- audio-only derivative.

Avoid trying to reproduce a full desktop nonlinear editor in the browser.

## Proposed processing architecture

```
Administrator
   │
   ▼
Website upload / media record
   │
   ├── metadata → PostgreSQL
   │
   └── processing request
          │
          ▼
      media worker
      (FFmpeg)
          │
          ├── web video
          ├── audio-only file
          ├── thumbnail
          └── captions / metadata
          │
          ▼
      streaming provider
```

## Storage strategy

Keep three concepts separate.

### Master

Original high-quality recording.

Recommended: church-owned physical storage plus an optional offsite backup.

### Delivery copy

Compressed/transcoded video served through YouTube, Bunny Stream, or another video CDN.

### Application record

Small database row containing:
- sermon title;
- date;
- speaker;
- Scripture;
- series;
- tags;
- media provider identifier;
- duration;
- publication state.

The database does not need to contain the actual video.

## Raspberry Pi / mini-PC role

A church computer can responsibly:
- ingest recordings;
- run FFmpeg;
- retain masters;
- upload completed media;
- synchronize backups.

It should not be the only public server for the church website.

## Future automation

A later phase could watch an upload folder and automatically:
- create a media record;
- generate waveform/preview;
- transcode a low-resolution editing proxy;
- upload output;
- notify an administrator that the sermon is ready for metadata and publication.


## Implemented leadership prototype

The repository now includes `media-studio.html` and `media-studio.js`.

The static prototype allows an administrator preview to:

1. choose or drag a local video file;
2. play and scrub through the recording;
3. jump backward or forward five seconds;
4. mark the sermon start at the current playhead;
5. mark the sermon end at the current playhead;
6. fine-tune start/end with range controls;
7. preview only the selected clip;
8. enter title, Scripture, speaker, series, and tags;
9. choose basic loudness/gain, fade, and audio-only options;
10. save the editing settings as a browser-local draft;
11. prepare a human-readable production processing job.

### Prototype boundary

The browser prototype deliberately does **not** upload, re-encode, or permanently retain the selected video file.

That work belongs to the production media worker. A likely production sequence is:

```
browser upload
   → protected temporary storage
   → FFmpeg worker reads trim/audio instructions
   → derivative video + optional audio copy
   → video/storage provider
   → sermon database record marked published
```

This preserves the simple user experience while keeping large-file processing away from the main web request and away from GitHub.


## Current enhanced prototype

The Sermon Studio now supports a more realistic weekly editing workflow:

- local video selection / drag-and-drop;
- inline video playback on supported mobile browsers;
- ±5-second and ±30-second seeking;
- keyboard shortcuts:
  - Space = play/pause;
  - Left / Right = 5 seconds;
  - Shift + Left / Right = 30 seconds;
  - I = set sermon start;
  - O = set sermon end;
- “Set start & jump ahead” and “Set end & review” helper actions;
- visual trim start/end sliders;
- selected-clip preview;
- title / Scripture / speaker / series / tags;
- speech normalization / gain / fades / audio-only choices;
- publication ready-check;
- browser-local draft save and restore;
- downloadable processing-job JSON;
- installable PWA shell for supported browsers.

### Processing-job JSON

The browser can export a small job file instead of trying to encode the sermon itself.

Example shape:

```json
{
  "schemaVersion": 1,
  "source": {
    "fileName": "Sunday-Service.mp4",
    "fileSize": 1234567890,
    "durationSeconds": 4510
  },
  "edit": {
    "trimStartSeconds": 1080.25,
    "trimEndSeconds": 3422.5,
    "normalizeSpeech": true,
    "gainDb": 0,
    "shortFade": true,
    "createAudioOnly": true
  },
  "sermon": {
    "title": "Example",
    "scripture": "John 10:1–18",
    "speaker": "Pastor Jeff Akin",
    "series": "",
    "tags": ["John"]
  },
  "publish": {
    "keepRecentOnline": 4,
    "retainMasterOnNas": true,
    "status": "ready-for-worker"
  }
}
```

This job file is intentionally small, human-readable, and easy to validate.

The future NAS worker can consume this job beside the original service recording.

### PWA / mobile testing

The whole church site now includes:

- `manifest.webmanifest`;
- `pwa.js`;
- `sw.js`;
- a simple Audubon app icon.

The service worker uses a network-first application shell: current deployed files are preferred when online and cached files are only a fallback.

It must never cache selected sermon videos or private uploaded media.

See `docs/SERMON_STUDIO_TEST_PLAN.md` for the current desktop and mobile test procedure.


## Public video and audio playback

Published sermons should expose two delivery choices when both derivatives exist:

1. **Watch video** — the normal web-video derivative.
2. **Listen only** — an audio-only derivative intended to use substantially less data and work well while driving or on slower connections.

The public Sermons page now contains both modes.

Prototype sermon records reserve:

- `videoUrl`
- `audioUrl`

The production worker should populate those fields only after the corresponding derivative has been successfully created and uploaded.

The Media Studio defaults **Create audio-only copy** to enabled so the lower-data option is part of the ordinary weekly workflow rather than an extra task.

## Facebook as a possible source

A future administrator workflow may offer **Import from Audubon Facebook** as an optional source.

Do not implement this as public-page scraping.

Preferred future approach:

1. Audubon authorizes a Meta integration for the Facebook Page.
2. A server-side integration (not browser JavaScript) requests only media that the church account is permitted to access.
3. The source is copied temporarily into the controlled media-ingest area.
4. The ordinary Sermon Studio trim/metadata workflow runs against that source.
5. The NAS retains the church-owned master/processed copy according to policy.
6. Temporary imported material is removed after successful processing.

Meta permissions and video-access fields have changed over time. Re-verify the current Meta Graph API and Page permissions immediately before implementing this integration.

The preferred source remains Audubon's original local service recording whenever it is available: it is more reliable, higher quality, and independent of a social-media platform.


## Existing Audubon audio now used in the prototype

The public Sermons page is no longer limited to placeholder playback. It now uses public audio URLs already published in Audubon’s existing archive for selected Ezra and Habakkuk sermons.

This serves two purposes:

1. leadership can evaluate the listening experience with real church content now;
2. the future media worker has a concrete public playback contract to target: a sermon record supplies metadata plus `videoUrl` and/or `audioUrl`.

The historical source files remain on Audubon’s existing web host; they are not copied into GitHub.

The current archive is historical, not a claim about the latest 2026 sermon. When the new weekly media workflow is connected, current sermon records should replace the historical featured default while preserving the same public player interface.
