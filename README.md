# Audubon Baptist Church Website

A public website and emerging member platform for Audubon Baptist Church.

## Current status

This repository contains a **leadership / pastor prototype** designed to run directly on GitHub Pages with no paid infrastructure.

The current prototype demonstrates a calmer, connected set of public and private church experiences:

- a welcoming public church website;
- a clearer "New here?" / visit pathway;
- beliefs and Southern Baptist affiliation content;
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
- a dedicated sermon Media Studio with local video selection, scrubbing, ±5-second navigation, start/end trim markers, clip preview, metadata, audio options, saved draft settings, and a production-job preview;
- a responsive interface designed to remain comfortable on phones and for less-technical users.

> **Important:** this is a public design prototype. The role switcher and "member sign in" flow are demonstrations, not secure authentication. Browser edits are not shared with other users. Do not place real private prayer requests, member data, financial information, pastoral information, credentials, or confidential church records into this version.

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

- `index.html` — focused public church website prototype
- `member.html` + `member.js` — dedicated member home
- `admin.html` + `admin.js` — dedicated site administration workspace
- `calendar.html` + `calendar.js` — member-only three-month calendar prototype
- `media-studio.html` + `media-studio.js` — administrator sermon upload/trim/publish workflow prototype
- `styles.css` — responsive visual and interaction system
- `app.js` — interactive demo behavior and browser-local sample data
- `AGENTS.md` — governing development instructions
- `docs/PROJECT_VISION.md` — product purpose and principles
- `docs/ARCHITECTURE.md` — recommended technical architecture
- `docs/ROLE_AND_PERMISSION_MODEL.md` — public/member/leadership/admin access model
- `docs/ROADMAP.md` — phased development plan
- `docs/SECURITY_AND_PRIVACY.md` — privacy and security boundaries
- `docs/MEDIA_WORKFLOW.md` — sermon/video workflow
- `docs/DEPLOYMENT.md` — GitHub Pages instructions and future hosting
- `docs/PASTOR_DEMO_GUIDE.md` — suggested walkthrough for church leadership
- `docs/CALENDAR_AND_MEMBER_EXPERIENCE.md` — calendar/member interaction model
- `docs/SOURCE_CONTENT_NOTES.md` — public church facts, sources, and items still needing confirmation

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
