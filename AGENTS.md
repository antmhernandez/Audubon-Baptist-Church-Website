# Audubon Baptist Church Website — Development Instructions

## Read first

Before making substantial changes, read:

1. `README.md`
2. `docs/EDITING_GUIDE.md`
3. `docs/CODE_MAP.md`
4. `docs/HUMAN_MAINTAINABILITY_STANDARD.md`
5. `docs/PROJECT_VISION.md`
6. `docs/ARCHITECTURE.md`
7. `docs/ROLE_AND_PERMISSION_MODEL.md`
8. `docs/SECURITY_AND_PRIVACY.md`
9. `docs/ROADMAP.md`
10. `docs/SOURCE_CONTENT_NOTES.md` when changing factual church copy.
11. `docs/DESIGN_AND_UX_REVIEW.md` when changing public-site layout, navigation, or visual design.

For media work also read `docs/MEDIA_WORKFLOW.md`. For calendar/member work also read `docs/CALENDAR_AND_MEMBER_EXPERIENCE.md`.

## Governing principles

- Build for a real local church, not a generic technology showcase.
- Keep public visitor tasks extremely easy.
- Favor readability, accessibility, calm visual design, and large touch targets.
- Preserve a good experience for older members and small mobile screens.
- Never commit secrets or real confidential member data.
- Treat prayer requests, pastoral information, member identities, RSVPs, and financial data as private unless explicitly published through an approved workflow.
- Authorization must eventually be enforced server-side/database-side; browser hiding is never security.
- Keep sermon media out of Git. Store metadata in the application and media with an appropriate video/storage provider.
- Use mature providers for authentication and payments rather than implementing sensitive primitives from scratch.
- Prefer replaceable integrations and financially modest infrastructure.
- Keep the whole application installable as one PWA before considering separate native apps.
- The PWA app shell must prefer current network files when online and must never cache uploaded sermon video or future private API responses.

## Current prototype status

The root HTML/CSS/JavaScript site is a public leadership prototype intended for GitHub Pages. Its role selector and content editing use local browser storage only. Do not mistake those controls for production authentication or shared persistence.

## Content discipline

Do not invent church facts such as:
- service times;
- addresses;
- staff names;
- formal doctrinal wording;
- ministry names;
- giving-provider relationships.

Clearly label unconfirmed material as sample or placeholder content until church leadership supplies it. Preserve the verified-vs-needs-confirmation distinctions in `docs/SOURCE_CONTENT_NOTES.md`; do not silently promote an older published schedule into a current fact.

## Change quality

When modifying the prototype:
- maintain responsive behavior;
- keep keyboard-usable controls;
- avoid unnecessary dependencies;
- test JavaScript syntax;
- verify that referenced DOM IDs exist;
- update documentation when architecture or privacy assumptions change;
- preserve readable formatting and maintainer comments; prefer small named functions over dense one-line logic.
