# Audubon Baptist Church Website

A public website and emerging member platform for Audubon Baptist Church.

## Current status

This repository currently contains a **pastor/demo prototype** designed to be hosted directly with GitHub Pages. The prototype demonstrates:

- a welcoming public church website;
- beliefs and Southern Baptist affiliation content;
- sermon-library and media-management concepts;
- church events and RSVP concepts;
- prayer-list privacy levels;
- a giving-integration concept;
- a member area;
- role-based views for Public, Church Member, Ministry/Group Member, Church Leadership, and Administrator;
- a browser-based administration concept.

> **Important:** the first prototype uses browser-local demo data only. Its role selector is a design demonstration, not secure authentication. Do not place private prayer requests, member data, financial information, or confidential church records into this version.

## View it on the web

After GitHub Pages is enabled for this repository, the prototype can be published at:

`https://antmhernandez.github.io/Audubon-Baptist-Church-Website/`

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the exact setup.

## Repository map

- `index.html` — public/member/admin prototype
- `styles.css` — responsive visual system
- `app.js` — interactive demo behavior and browser-local sample data
- `docs/PROJECT_VISION.md` — product purpose and principles
- `docs/ARCHITECTURE.md` — recommended technical architecture
- `docs/ROLE_AND_PERMISSION_MODEL.md` — public/member/leadership/admin access model
- `docs/ROADMAP.md` — phased development plan
- `docs/SECURITY_AND_PRIVACY.md` — privacy and security boundaries
- `docs/MEDIA_WORKFLOW.md` — sermon/video workflow
- `docs/DEPLOYMENT.md` — GitHub Pages instructions and future hosting
- `docs/PASTOR_DEMO_GUIDE.md` — suggested walkthrough for the prototype

## Development philosophy

1. **Simple for visitors.** A prospective attendee should immediately be able to understand who the church is, when it gathers, what it believes, and how to visit.
2. **Comfortable for all ages.** Typography, contrast, navigation, forms, and touch targets should be clear for both younger and older members.
3. **Private by design.** Public content, member content, leadership content, and administration must be intentionally separated.
4. **Own the architecture.** Keep the project in GitHub and avoid unnecessary vendor lock-in.
5. **Use specialists for sensitive infrastructure.** Payment processors, authentication providers, and video-delivery services should handle the responsibilities they are best equipped to secure.
6. **Build in phases.** Prove usefulness before adding complexity or recurring expenses.

## Proposed production stack

The current demo is dependency-free HTML/CSS/JavaScript so it can be published immediately with GitHub Pages. The recommended production evolution is:

- Next.js + TypeScript
- PostgreSQL / Supabase for application data and authentication
- Cloudflare or similar managed hosting/CDN
- YouTube or Bunny Stream initially for sermon video delivery
- FFmpeg on a church media workstation or server-side worker for sermon trimming/audio processing
- a dedicated giving provider such as Tithely/Stripe-backed church giving
- Progressive Web App first; native mobile apps only if later justified

## Content note

Some visible text and events in the prototype are intentionally marked as examples or placeholders. They must be confirmed by church leadership before a public production launch.
