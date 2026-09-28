# Facebook Sermon Import — Future Integration

Status: **planned, not implemented**

## Goal

Allow an approved Audubon media administrator to select a church-owned Facebook service video as a sermon source when the original local recording is unavailable or inconvenient to use.

## Important boundary

Do **not** build this by scraping a public Facebook URL in the browser.

A stable implementation should use an authenticated server-side Meta integration and only access Page media Audubon is authorized to retrieve.

Meta's APIs and permissions change. Re-check the current Meta Graph API documentation and app-review requirements at implementation time.

## Intended workflow

1. Administrator opens Sermon Studio.
2. Source chooser offers:
   - Local/NAS recording (preferred)
   - Audubon Facebook Page (optional)
3. If Facebook is selected, the server requests available Page-owned videos using Audubon's authorized Page credentials.
4. Administrator chooses the service recording.
5. Server copies the permitted source into temporary ingest storage.
6. Sermon Studio creates the same trim/metadata job used for local video.
7. Worker creates:
   - web video;
   - audio-only derivative;
   - thumbnail/caption derivatives if enabled.
8. Worker publishes the newest delivery copies.
9. Worker verifies publication before deleting any rotated online sermon.
10. Temporary Facebook ingest copy is removed according to retention policy.

## Why server-side?

Page access tokens and other credentials must not be exposed to browser JavaScript.

The server can also:

- validate that the media belongs to the authorized Page;
- handle expiring media URLs;
- retry downloads safely;
- log import history;
- enforce administrator permissions.

## Preferred source order

1. Original service recording on church storage.
2. Authorized Facebook Page import.
3. Manual download/import by an approved administrator when platform/API limitations require it.

The Facebook integration is a convenience source, not the archive of record.
