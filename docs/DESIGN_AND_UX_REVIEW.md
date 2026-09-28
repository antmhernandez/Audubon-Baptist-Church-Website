# Design and Information Architecture Review

Last reviewed: 2026-09-27

## Purpose

The prototype had become functionally rich but visually over-segmented: too many cards, too many equally weighted calls to action, and too little distinction between public storytelling and application tools.

This pass uses two reference groups:

1. high-traffic church websites with mature visitor/member flows;
2. editorial/minimal design references emphasizing typography, asymmetry, and negative space.

## Church-site patterns worth adapting

### Elevation Church
Source: https://www.elevationchurch.org/

Useful pattern:
- one clear welcome statement;
- immediate connection action;
- latest sermon surfaced very early;
- only then broader participation choices.

Adaptation for Audubon:
- hero should communicate identity first;
- latest sermon should be a major visual moment;
- secondary tools should not compete with the welcome.

### Church of the Highlands
Source: https://www.churchofthehighlands.com/

Useful pattern:
- “Plan Your Visit” and recent messages are top-level first actions;
- home page acts as a guided entry point rather than a directory;
- deeper ministries live farther down or on dedicated pages.

Adaptation for Audubon:
- Visit / Sermons / This Week / Member Home become the four principal paths;
- administrative/member functionality moves off the public page.

### The Village Church
Source: https://www.thevillagechurch.net/

Useful pattern:
- belonging statement;
- Sunday experience;
- beliefs/pathway;
- latest sermon;
- resources and connection afterward.

Adaptation for Audubon:
- public narrative should read in a human sequence rather than as feature modules;
- beliefs and story should support the visitor journey, not interrupt it.

### Life.Church
Source: https://www.life.church/

Useful pattern:
- emotionally clear invitation;
- “next steps” rather than feature inventory;
- New Here content is practical and reassuring.

Adaptation for Audubon:
- use plain-language next steps;
- keep first-visit information short, useful, and warm.

### Passion City Church
Source: https://passioncitychurch.com/

Useful pattern:
- confident mission-led typography;
- large whitespace;
- strong statements rather than many small cards.

Adaptation for Audubon:
- use “A Church in the Park” as a large identity statement;
- let typography and rhythm carry more of the design.

## Editorial / aesthetic references

Awwwards references:
- https://www.awwwards.com/inspiration/exhibition-page
- https://www.awwwards.com/inspiration/asymmetrical-layout-marga-navarro
- https://www.awwwards.com/editorial-new-variable-typeface-by-locomotive-wins-site-of-the-month-october.html

Useful principles:
- strong typography can be the principal visual material;
- asymmetrical grids create identity without decorative clutter;
- negative space creates hierarchy;
- not every piece of content needs a bordered container;
- restrained motion/hover should reinforce navigation rather than distract;
- editorial pacing can mix large statements, narrow text columns, rules, and full-width color fields.

## Audubon-specific design direction

### Visual language
- primary: historic Audubon deep red;
- supporting: warm paper/cream, charcoal, restrained park green;
- display type: editorial serif;
- interface/body type: clean sans-serif;
- use thin rules and oversized typography instead of card outlines;
- use the cross-like Audubon mark sparingly as a brand anchor.

### Public home-page flow

1. **Identity / Sunday**
   - “A Church in the Park”
   - one welcome sentence
   - Plan Your Visit / Latest Sermon
   - service time + address

2. **Start Here**
   - four simple text routes: Visit, Sermon, This Week, Member Home

3. **Plan Your Visit**
   - concise practical information
   - no multi-card FAQ wall

4. **Latest Sermon**
   - visually dominant media feature
   - archive remains secondary

5. **This Week**
   - event timeline/list rather than cards

6. **Belief + Story**
   - large editorial statements;
   - short supporting copy;
   - pastors presented as a restrained list rather than profile cards

7. **Church Family / Giving**
   - strong, simple handoffs to Member Home and secure giving

## Application pages

Member Home, Calendar, Admin, and Media Studio should share the same typography, colors, header, and spacing but should remain more functional than the public site.

The public site is storytelling.
The private tools are applications.

Do not make the public home page look like an application dashboard.

## Accessibility and usability constraints

- preserve large touch targets;
- preserve visible focus states;
- maintain high contrast;
- respect reduced-motion preferences;
- avoid tiny text in essential controls;
- keep mobile navigation simple;
- avoid horizontal dependence for core functionality;
- do not hide critical visit information behind animation or hover.


## Second artistic pass

The follow-up refinement intentionally adds variation without returning to card-heavy composition.

Implemented patterns:

- a short Sunday-rhythm section using large display type plus ruled editorial rows;
- a mission interlude built around Audubon's existing “Going Beyond Ourselves with the Gospel” language;
- a large 2017 typographic anchor in the church-history section;
- more developed giving copy and a final visit invitation before the footer;
- active-section navigation for long-page orientation;
- a subtle scroll-progress indicator;
- a back-to-top control that appears only after meaningful scrolling;
- Escape-key handling for the mobile menu;
- shared weekly-announcement content on Member Home;
- a Media Studio step indicator that now advances as the administrator uploads, trims, enters metadata, and prepares publication.

The goal remains variety through typography, proportion, pacing, rules, and color fields—not through visual clutter.


## Multi-page simplification

The landing page should be a doorway, not a directory.

Implemented public structure:

- **Home** — identity, Sunday essentials, three primary destinations, latest-sermon teaser;
- **Visit** — location, published schedule information, contact, and future first-visit details;
- **Sermons** — featured sermon and searchable archive;
- **Beliefs** — focused doctrinal summary and link to the existing approved material;
- **Our Story & Mission** — 2017 revitalization story, pastors, and “Going Beyond Ourselves with the Gospel”;
- **Give** — focused secure-giving handoff concept.

The shared public header is:

**Home · Visit · Sermons · About ▾ · Give · Member**

The About menu contains only:

- Beliefs
- Our Story & Mission

Public guests do not see an events list on Home. A member, group member, leader, or administrator preview receives a compact **Your week at Audubon** section with only the next two relevant items plus links to Member Home and the full Calendar.

Member Home is organized as a private application with one content area visible at a time:

- Overview
- Calendar
- Prayer
- Groups
- Conversations
- Lists & signups
- Serve
- Administrator links when appropriate

This keeps detailed calendar interaction on the dedicated Calendar page while Home and Member Home provide brief summaries and clear handoffs.


## Comprehensive product polish — 2026-09-28

A subsequent full-site pass compared Audubon’s public/member/application flows with mature church-site patterns and, more importantly, recovered additional language and media from Audubon’s own published archive.

The governing implementation record is:

`docs/COMPREHENSIVE_PRODUCT_POLISH_2026-09-28.md`

Key direction from this pass:

- prefer Audubon’s own historical/public language over generic church-site copy;
- label historical material as historical when its 2026 status is not established;
- make Visit practical rather than aspirational;
- make Sermons a real playable library rather than a visual placeholder;
- keep the public Home a doorway with four clear routes: Visit, Sermons, Our Story, Church Family;
- use administrative tools to surface missing leadership confirmations instead of hiding uncertainty in public copy;
- keep the PWA integrated with the website and preserve the public/private cache boundary;
- refine application tools for usefulness without making the public site feel like a dashboard.

The benchmark set included Church of the Highlands, The Village Church, Capitol Hill Baptist Church, and Redeemer Presbyterian Church. Their useful patterns were adapted selectively; Audubon’s own language, history, scale, and ministry needs remain the source of identity.
