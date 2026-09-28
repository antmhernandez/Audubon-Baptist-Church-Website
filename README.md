# Audubon Baptist Church Website

A public website and emerging member platform for Audubon Baptist Church.

## Current status

This repository contains a **leadership / pastor prototype** designed to run directly on GitHub Pages with no paid infrastructure.

The current prototype demonstrates a typography-led, editorial public site plus a connected set of practical member and administrator tools:

- a short public landing page that routes visitors to focused pages;
- dedicated Visit, Sermons, Beliefs, Our Story & Mission, and Give pages;
- consistent top navigation with a compact About menu;
- a member-only upcoming-activity summary on Home;
- featured sermon presentation plus a searchable sample sermon library;
- a dedicated member-only three-month calendar with day details, filters, RSVPs, and personal-calendar downloads;
- a public upcoming-events summary with a prominent member-calendar pathway;
- a member sign-in experience for demonstrating private features;
- prayer-list privacy levels and browser-local sample submissions;
- ministry / service concepts;
- structured church discussion concepts;
- a giving-provider handoff concept;
- role-based views for Public Visitor, Church Member, Ministry/Group Member, Church Leadership, and Administrator;
- browser-based administration for announcements, events, and sermon metadata;
- a whole-site installable PWA with a prominent cross-platform “Get the App!” flow and network-first update behavior;
- sermon playback designed for either video or lower-data audio-only listening;
- a dedicated Sermon Studio with local video selection, ±5/±30-second seeking, keyboard shortcuts, start/end trim markers, clip preview, metadata, audio options, restoreable browser drafts, a publication ready-check, and downloadable NAS/FFmpeg processing-job JSON;
- a responsive interface designed to remain comfortable on phones and for less-technical users.

> **Important:** this is a public design prototype. The role switcher and "member sign in" flow are demonstrations, not secure authentication. Browser edits are not shared with other users. Do not place real private prayer requests, member data, financial information, pastoral information, credentials, or confidential church records into this version.

## For human maintainers

Start with:

- `docs/EDITING_GUIDE.md` — “where do I edit this?” reference;
- `docs/CODE_MAP.md` — how the repository is organized;
- `docs/HUMAN_MAINTAINABILITY_STANDARD.md` — governing standard for readable, hand-maintainable software;
- `CONTRIBUTING.md` — editing and validation habits;
- `.editorconfig` — shared two-space formatting defaults.

The source files now include maintainer notes and section comments. Keep those comments focused on intent, privacy boundaries, and safe modification points.

## View it on the web

GitHub Pages is configured to publish the repository's `main` branch from `/(root)`.

Expected public address:

`https://antmhernandez.github.io/Audubon-Baptist-Church-Website/`

GitHub Pages may take a short time to rebuild after a new commit. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for details.

## Quick prototype tour

1. Open the site as a **Public visitor**.
2. Use **Member sign in** to preview the private member experience.
3. Use the dark prototype bar at the top to switch among:
   - Public visitor
   - Church member
   - Ministry / group member
   - Church leadership
   - Administrator
4. Try sermon search and filtering.
5. As a member, RSVP to an event and add a sample prayer request.
6. As Administrator, edit the homepage announcement, add an event, edit featured sermon metadata, and preview a future media-processing job.
7. Use **Copy share link** in the prototype bar to copy the public URL.

All demo changes remain only in the current browser.

## Repository map

- `index.html` — concise public landing page / doorway
- `visit.html` — focused visitor information
- `sermons.html` + `sermons.js` — featured sermon and searchable archive
- `beliefs.html` — focused beliefs page
- `about.html` — church story, pastoral leadership, and mission
- `give.html` — focused giving handoff page
- `site.js` — shared public navigation, role preview, and member-entry behavior
- `member.html` + `member.js` — dedicated member home
- `admin.html` + `admin.js` — dedicated site administration workspace
- `calendar.html` + `calendar.js` — member-only three-month calendar prototype
- `media-studio.html` + `media-studio.js` — administrator sermon upload/trim/publish workflow prototype
- `app.html` — installation/help page for the Audubon web app
- `manifest.webmanifest` + `pwa.js` + `sw.js` — whole-site installable PWA and update/offline shell
- `styles.css` — responsive visual and interaction system
- `app.js` — interactive demo behavior and browser-local sample data
- `AGENTS.md` — governing development instructions
- `docs/PROJECT_VISION.md` — product purpose and principles
- `docs/ARCHITECTURE.md` — recommended technical architecture
- `docs/ROLE_AND_PERMISSION_MODEL.md` — public/member/leadership/admin access model
- `docs/ROADMAP.md` — phased development plan
- `docs/SECURITY_AND_PRIVACY.md` — privacy and security boundaries
- `docs/MEDIA_WORKFLOW.md` — sermon/video workflow
- `docs/SERMON_STUDIO_TEST_PLAN.md` — desktop/mobile test checklist and NAS job handoff
- `docs/DEPLOYMENT.md` — GitHub Pages instructions and future hosting
- `docs/PASTOR_DEMO_GUIDE.md` — suggested walkthrough for church leadership
- `docs/CALENDAR_AND_MEMBER_EXPERIENCE.md` — calendar/member interaction model
- `docs/SOURCE_CONTENT_NOTES.md` — public church facts, sources, and items still needing confirmation
- `docs/DESIGN_AND_UX_REVIEW.md` — church-site research, editorial design direction, and information architecture

## Development philosophy

1. **Simple for visitors.** A prospective attendee should immediately understand who the church is, how to visit, what it believes, and where to find sermons.
2. **Comfortable for all ages.** Typography, contrast, navigation, forms, and touch targets should be clear for younger and older members alike.
3. **Private by design.** Public content, member content, leadership content, and administration must be intentionally separated.
4. **Own the architecture.** Keep the project in GitHub and avoid unnecessary vendor lock-in.
5. **Use specialists for sensitive infrastructure.** Authentication, payments, and large-scale video delivery should use mature services rather than custom sensitive infrastructure.
6. **Build in phases.** Prove usefulness before adding complexity or recurring expenses.

## Proposed production evolution

The prototype intentionally uses dependency-free HTML/CSS/JavaScript so it can be shared immediately. The recommended secure production evolution remains:

- Next.js + TypeScript
- PostgreSQL / Supabase for application data and authentication
- Cloudflare or another managed application host/CDN
- YouTube or Bunny Stream initially for sermon video delivery
- FFmpeg on a church media workstation or server-side worker for sermon trimming/audio processing
- a dedicated giving provider
- Progressive Web App first; native apps only if later justified

## Content note

Visible service times, event information, sermon entries, ministry descriptions, and doctrinal/affiliation language that is marked as sample or unconfirmed must be reviewed by church leadership before the site becomes the church's public production website.
