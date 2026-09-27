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
