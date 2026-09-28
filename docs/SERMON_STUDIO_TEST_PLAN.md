# Sermon Studio Test Plan

Last reviewed: 2026-09-28

## Purpose

Use this checklist when testing `media-studio.html` on a laptop, tablet, or phone.

The prototype never uploads the selected video to GitHub.

## Desktop test

1. Open Media Studio.
2. Preview as Administrator.
3. Select a local video.
4. Confirm filename, file size, and duration appear.
5. Try:
   - −30 seconds;
   - −5 seconds;
   - play/pause;
   - +5 seconds;
   - +30 seconds.
6. Test keyboard:
   - Space;
   - Left / Right;
   - Shift + Left / Right;
   - I for start;
   - O for end.
7. Set sermon start.
8. Set sermon end.
9. Preview only the selected clip.
10. Enter:
    - title;
    - Scripture;
    - speaker;
    - series;
    - tags.
11. Change an audio option.
12. Confirm the ready-check updates.
13. Save a draft.
14. Refresh the page.
15. Restore the draft.
16. Re-select the original source video and confirm trim points can be restored.
17. Prepare the publication job.
18. Download the JSON job file.
19. Open the JSON file and confirm the values match the UI.

## Phone / tablet test

Use the deployed HTTPS site.

Expected behavior:

- file picker can choose a video available to the browser/device;
- video plays inline where the browser permits it;
- transport buttons are large enough for touch;
- the five transport buttons fit in one touch row;
- trim sliders remain usable;
- metadata fields are readable without horizontal scrolling.

On browsers that expose the PWA installation prompt, **Install Sermon Studio** appears.

On platforms that do not expose that prompt, use the browser's normal “Add to Home Screen” capability if available.

## Draft limitation

A browser draft stores:

- trim coordinates;
- sermon metadata;
- audio settings;
- source filename.

It does **not** store the source video itself.

This is deliberate: raw video should not be copied into browser-local storage.

## Job JSON contract

The exported processing job contains:

- `schemaVersion`;
- source filename/size/duration;
- trim start/end seconds;
- audio choices;
- sermon metadata;
- public retention target (`keepRecentOnline: 4`);
- `retainMasterOnNas: true`.

This can become the contract consumed by the future church NAS worker.

## Future integration test

When the NAS worker exists:

1. upload/copy the source service recording to the NAS;
2. export the job JSON from Sermon Studio;
3. place/send the job beside the source;
4. worker validates source filename;
5. worker runs FFmpeg;
6. worker produces web video + optional audio;
7. worker retains the master locally;
8. worker uploads the recent derivative;
9. worker verifies remote availability;
10. worker updates the recent-sermons manifest;
11. worker removes the fifth-oldest remote derivative only after success.
