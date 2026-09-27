# Recommended Architecture

## Current demo

The first version is intentionally simple:

```
GitHub repository
   ↓
GitHub Pages
   ↓
Static HTML + CSS + JavaScript
```

This makes the prototype externally viewable with almost no infrastructure.

The role selector and edits in the prototype use browser-local storage. They demonstrate the interface only and are **not secure authentication or shared persistence**.

## Production target

```
                         ┌───────────────────────┐
                         │ GitHub                │
                         │ source + documentation│
                         └───────────┬───────────┘
                                     │ deploy
                                     ▼
┌────────────────┐        ┌───────────────────────┐
│ Visitor/member │───────▶│ Web application / PWA │
└────────────────┘        └───────┬──────┬────────┘
                                  │      │
                         auth/data│      │media
                                  ▼      ▼
                       ┌──────────────┐  ┌────────────────┐
                       │ PostgreSQL / │  │ Video provider │
                       │ Supabase     │  │ YouTube/Bunny  │
                       └──────────────┘  └────────────────┘
                                  │
                                  │ protected operations
                                  ▼
                       ┌─────────────────────┐
                       │ Media worker        │
                       │ FFmpeg / mini-PC    │
                       └─────────────────────┘
```

## Recommended components

### Application

**Next.js + TypeScript** is the preferred production framework because it supports public pages, authenticated application routes, server-side operations, good SEO, and PWA behavior in one codebase.

### Authentication and database

**PostgreSQL with Supabase** is the leading recommendation for the first production implementation.

Reasons:
- relational data fits events, users, groups, roles, sermons, RSVPs, and prayer requests;
- managed authentication;
- row-level security;
- straightforward backups and migrations;
- avoids writing our own password system.

### Hosting

The demo can use GitHub Pages.

The production application should move to a managed web runtime/CDN such as Cloudflare or another provider capable of server-side application behavior. GitHub remains the source repository even after the runtime moves elsewhere.

### Sermon media

Do not store the main sermon-video archive in Git.

Recommended initial choices:
1. YouTube for the lowest-cost launch;
2. Bunny Stream for inexpensive independent video delivery;
3. a more sophisticated video API later if needed.

Store sermon metadata in the church database, while the video provider stores/transcodes/delivers the actual media.

### Church media workstation

A Raspberry Pi or mini-PC can be useful for:
- retaining master recordings;
- FFmpeg trim/audio jobs;
- upload automation;
- backup synchronization.

It should not be the default public internet-facing application server.

## Data boundaries

### Suitable for public repository

- application source;
- generic site copy;
- documentation;
- database migrations/schema;
- non-secret configuration templates.

### Never commit

- passwords;
- API keys;
- database credentials;
- member exports;
- private prayer requests;
- giving records;
- pastoral notes;
- uploaded master sermon files;
- production environment files containing secrets.

## PWA before native apps

The initial member experience should be an installable Progressive Web App:
- one codebase;
- works on iPhone, Android, tablets, and desktops;
- can later support notifications and offline conveniences.

A native mobile app should be considered only after actual usage shows that app-store distribution or device-specific features justify the additional maintenance burden.
