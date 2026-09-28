# Comprehensive Product Polish — 2026-09-28

## Purpose

This document records a full iterative review of the Audubon Baptist Church website/PWA: public content, information architecture, member tools, administration, media, accessibility, maintainability, and visual presentation.

It is both an implementation log and a guide for the next pass.

This review does **not** treat any external church as a template to copy wholesale. The comparison set is useful because these sites have mature, high-traffic visitor and media flows:

- Church of the Highlands — https://www.churchofthehighlands.com/
- The Village Church — https://www.thevillagechurch.net/
- Capitol Hill Baptist Church — https://www.capitolhillbaptist.org/
- Redeemer Presbyterian Church — https://www.redeemerpca.com/

Audubon should remain visibly and verbally Audubon.

## Cross-site patterns worth keeping

### 1. Important actions are obvious

Mature church sites tend to put **Plan a Visit**, **Messages/Sermons**, and a connection pathway near the top rather than making visitors decode a large ministry directory.

Audubon adaptation:
- Home remains a doorway.
- Visit and Sermons remain primary.
- Church Family/Member Home now appears as a fourth clear doorway.
- Get the App remains prominent in the header.

### 2. Sermons are treated as a library, not a decorative feature

The Village Church provides a browsable sermon collection with filters; Capitol Hill Baptist exposes a substantial searchable/listed archive.

Audubon adaptation:
- historical church-published audio is now directly playable;
- archive records now include real dates, series, Scripture, speaker, source links, and media URLs;
- search, series filters, and newest/oldest sorting are available;
- video/audio playback is one coherent feature rather than two unrelated pages.

### 3. First-visit pages answer practical questions

Capitol Hill Baptist explicitly separates service times, what to expect, directions/parking, and accessibility.

Audubon adaptation:
- address, directions, phone, and previously published schedule are grouped clearly;
- practical pre-visit actions are prominent;
- unknown parking/entrance/children/accessibility details are stated honestly instead of filled with invented copy;
- Site Admin now includes a launch-readiness checklist for those missing facts.

### 4. Home pages use identity and story before feature inventory

Church of the Highlands and The Village Church lead with identity, visit, messages, belonging, and next steps.

Audubon adaptation:
- “A Church in the Park” remains the primary identity;
- “A Rich Legacy. A Church Reborn.” comes directly from Audubon’s existing site;
- “Simple. Missional. Stewarding.” is preserved as a clearly historical pastoral emphasis;
- the 2017 joining is presented early and simply.

### 5. Apps work best when they are integrated with the site

Large church sites often promote a dedicated app prominently.

Audubon adaptation:
- the PWA is one codebase with the website rather than a separate iOS/Android fork;
- install is prominent;
- native share is available;
- installed status is explained;
- online use prefers current deployed files;
- private member/admin routes stay out of the general offline cache.

---

# Feature-by-feature review

## Public Home

### Problems found
- Some prominent copy was generic prototype language rather than Audubon language.
- The historical 2023 sermon was labeled too much like a current/latest sermon.
- Member entry was available but less visible than Visit/Story/Sermons.

### Improvements implemented
- Replaced generic lead language with sourced Audubon phrases:
  - “A Rich Legacy. A Church Reborn.”
  - “Simple. Missional. Stewarding.” with historical context.
- Added a fourth doorway for Church Family/Member Home.
- Relabeled the sermon presentation as material from Audubon’s archive.
- Added structured Church schema data using confirmed address/phone only.
- Kept unconfirmed gathering times explicitly qualified.

## Navigation / information architecture

### Improvements implemented
- Preserved the restrained public header.
- Added the existing Newsletter Archive inside About.
- Added Newsletter Archive, Get the App, and Facebook to the public footer.
- Active public navigation now receives `aria-current="page"`.

## Plan Your Visit

### Problems found
- The page contained internal/prototype planning language.
- Useful facts were present, but practical actions were not visually grouped.

### Improvements implemented
- Rewrote the page for a visitor rather than a developer.
- Added direct Directions / Hear a Sermon / Call Us actions.
- Added the previously published Wednesday time alongside Sunday information.
- Kept the schedule qualification visible.
- Replaced placeholder prose with a useful statement about which arrival details still need confirmation.

## Sermons

### Problems found
- Historical archive cards were real titles but not actually playable in the new site.
- Public cards still exposed “feature in prototype” behavior.
- The 2023 archive item could be mistaken for a current sermon.
- Search had no sort control.

### Improvements implemented
- Connected real Audubon-published MP3/M4A files from the existing archive.
- Expanded the local archive dataset across Ezra and Habakkuk.
- Added Listen Now behavior that moves the chosen sermon into the audio player.
- Added newest/oldest sorting.
- Added original-archive links.
- Added archive dates to featured-sermon presentation.
- Kept Watch / Listen Only as explicit playback choices.
- Removed the public-facing “feature in prototype” interaction.

## Beliefs

### Problems found
- Earlier cards summarized generic evangelical doctrine in words not directly established by Audubon’s current public material.
- The page still spoke about what the prototype “could eventually” do.

### Improvements implemented
- Rebuilt the page around Audubon’s published claims:
  - Southern Baptist cooperation;
  - Baptist Faith and Message 2000 as a unifying statement;
  - fellowship with churches of similar doctrine.
- Added direct links to Audubon’s existing beliefs page and the official BF&M 2000.
- Removed speculative doctrinal copy.

## Our Story & Mission

### Improvements implemented
- Adopted Audubon’s existing page title: “A Rich Legacy. A Church Reborn.”
- Added the documented 1944 / 2013 / 2017 timeline.
- Added concise sourced pastoral biographies:
  - Jeff Akin;
  - Dan Hatfield, Ph.D.
- Preserved “Going Beyond Ourselves with the Gospel.”
- Added historical context for “Simple. Missional. Stewarding.”
- Linked the newsletter archive and source pages.

## Giving

### Problems found
- A fake “preview giving flow” control was visually polished but not useful to an ordinary visitor.
- Public copy emphasized system architecture more than the visitor’s need.

### Improvements implemented
- Removed the fake transaction flow.
- Gives visitors one truthful current action: call the church office for giving information.
- Keeps the security principle visible without pretending a provider has already been selected.
- Preserves the production rule that raw payment credentials belong with a specialist provider.

## PWA / Get the App

### Improvements implemented
- Added native Share where supported, with link-copy fallback.
- Added installed-app status text.
- Added three quick app-test destinations.
- Kept network-first public/static updates.
- Kept private routes outside the general offline cache.
- Continued broad icon support and iPhone home-screen support.

## Member Home

### Improvements implemented
- Reframed the welcome around prayer, gathering, service, and care.
- Added a low-data Sermons shortcut.
- Added a visible prayer-privacy legend.
- Improved the warning around real private prayer data.
- Re-formatted `member.js` for human maintenance.
- Corrected HTML escaping so encoded characters do not receive accidental trailing spaces.

## Calendar

### Problems found
- “Current quarter” was technically inaccurate: the interface shows a sliding current month + next two months.
- Event downloads used floating date/time values without an explicit Louisville timezone.
- Event locations were implicit.

### Improvements implemented
- Renamed the reset action to “Current 3 months.”
- Selects today by default.
- Added event locations.
- Shows human-readable audience labels.
- Improved selected-day detail.
- Generates calendar files with `America/Kentucky/Louisville`, a default one-hour duration, location, DTSTAMP, and stronger ICS escaping.
- Administrator event creation now supports a location field.

## Site Administration

### Improvements implemented
- Added a launch-readiness / leadership-confirmation checklist for:
  - current schedule;
  - current public email/contact preference;
  - parking/entrance;
  - children/nursery;
  - accessibility;
  - giving provider;
  - current staff/ministry list;
  - livestream/Facebook strategy.
- Added quick links to the public pages that require review.
- Checklist state is clearly identified as browser-local planning state.
- Event administration now stores location.

## Sermon Media Studio

### Improvements implemented
- Clarified that Audubon’s original local service recording is the preferred source.
- Documented the future authenticated Facebook-import option in the interface without pretending it is connected.
- Explicitly names video + audio derivatives in the publication handoff.
- Added a direct link from the studio back to the public sermon library.
- The secure NAS/worker remains deferred until hardware is available.

## Accessibility / responsive design

### Preserved or improved
- semantic headings and landmarks;
- skip links;
- keyboard navigation;
- focus-visible treatment;
- responsive mobile layouts;
- large touch targets;
- reduced-motion handling already present in the stylesheet;
- active navigation semantics;
- clear visibility labels for prayer and calendar content.

## Human maintainability

### Improvements implemented
- Re-formatted Home and Member behavior into named, readable functions.
- Kept new feature CSS in one clearly labeled section.
- Continued the repository rule that reusable lessons belong in documentation rather than chat history.
- Added this audit as a durable record for future iterations.

---

# Content drawn from Audubon’s existing / archived site

The pass deliberately reuses Audubon language where the source supports it:

- “A Church in the Park”
- “A Rich Legacy, A Church Reborn”
- “Going Beyond Ourselves with the Gospel”
- “Simple. Missional. Stewarding.”
- 1944 founding reference
- 2013 founding of The Church at Louisville
- 2017 joining of the two congregations
- current pastor roles/biographical facts
- Southern Baptist / Baptist Faith and Message 2000 language
- historical sermon titles, passages, dates, speaker, and audio files
- newsletter archive

Historical phrases are labeled as historical where current status is not established.

## Next facts needed from leadership

The largest remaining quality gains are content confirmations rather than interface invention:

1. current weekly gathering schedule;
2. current public email/contact preference;
3. parking / best entrance;
4. nursery / children arrangements;
5. accessibility details;
6. current staff and ministry list;
7. current giving method/provider;
8. current livestream/Facebook practice;
9. current 2026 sermon recording source.

Once those are confirmed, the remaining placeholder notices can be removed cleanly.


## Church Archive / newsletters

### Problem found
Audubon’s old public site contains a meaningful newsletter archive, but the new prototype only linked away to it. That left one of the old site’s primary content categories outside the new information architecture.

### Improvement implemented
- Added `archive.html` under the About menu.
- Selected newsletter entries are presented as short historical summaries with direct links to the original church-published articles.
- The archive page clearly warns that dates, staff assignments, events, and schedules inside historical newsletters are not current information.
- Added sermon-series links so older material remains reachable without crowding the main Sermons page.
- Added the archive to the public PWA shell for offline fallback.
