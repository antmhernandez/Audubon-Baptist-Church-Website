# Development Roadmap

## Phase 0 — Leadership prototype

**Current phase**

Goals:
- establish design direction;
- give pastor/leadership something external to review;
- demonstrate public/member/admin concepts;
- agree on scope before recurring costs.

Deliverables:
- GitHub-hosted public prototype;
- responsive design;
- beliefs/about/sermons/events/connect/give sections;
- role previews;
- member-area concepts;
- administrator workflow concepts;
- planning documentation.

## Phase 1 — Confirmed public website

Replace every placeholder with approved information.

Add:
- confirmed service times and location;
- leadership/staff;
- contact form;
- Plan Your Visit page;
- fuller beliefs page;
- ministries;
- real sermon embeds;
- real event calendar;
- accessibility and SEO pass;
- church domain.

At this phase, GitHub Pages can remain acceptable if all content is public and editing through code is temporarily acceptable.

## Phase 2 — Database and secure administration

Move to application hosting and add:
- Supabase/PostgreSQL project;
- authentication;
- production role model;
- database-backed pages;
- administrator content editor;
- audit logging;
- real event editing;
- sermon metadata management.

This is the point at which administrators can safely edit shared content on the web.

## Phase 3 — Member area

Add:
- approved account workflow;
- member dashboard;
- prayer submissions and moderation;
- real RSVPs;
- volunteer task signup;
- ministry groups;
- notification preferences;
- private announcements.

## Phase 4 — Sermon media workflow

Add:
- video upload or provider link;
- start/end trim controls;
- audio normalization/gain;
- title/reference/speaker/tags;
- thumbnail selection;
- optional audio-only output;
- captions/transcripts;
- automated publishing job;
- master-file backup workflow.

## Phase 5 — Giving integration

After church leadership selects a provider:
- secure hosted payment handoff or provider component;
- designated funds;
- one-time/recurring gifts;
- clear privacy language;
- restricted financial administrator role.

The site should not store raw card or bank credentials.

## Phase 6 — Discussion and communications

Add structured forum areas:
- churchwide announcements;
- questions;
- ministry boards;
- project/event conversations;
- moderation;
- mentions and notifications.

Direct messaging should be evaluated separately rather than assumed.

## Phase 7 — Optional advanced features

Potential additions:
- podcast feed;
- livestream;
- sermon transcript search;
- church directory;
- facility requests;
- nursery/volunteer rotations;
- push notifications;
- QR event check-in;
- native iOS/Android shell if the PWA proves insufficient.

## Decision gates

Before advancing phases, ask:
1. Are people actually using the current feature?
2. Is the next feature solving a repeated church problem?
3. Does it introduce sensitive data?
4. What recurring cost does it add?
5. Who will maintain it?
6. Can the component be replaced later without rebuilding the whole platform?
