# Contributing / Maintaining the Audubon Website

Thank you for helping maintain the church website.

## Before editing

Read:

1. `docs/EDITING_GUIDE.md`
2. `docs/CODE_MAP.md`
3. `AGENTS.md`

If changing church facts, also read `docs/SOURCE_CONTENT_NOTES.md`.

If changing sermon/video behavior, also read `docs/MEDIA_WORKFLOW.md`.

## Basic rule

Keep the site understandable for the next person.

Prefer:

- plain HTML, CSS, and JavaScript;
- descriptive names;
- small named functions;
- comments explaining *why* something exists;
- one responsibility per page/tool;
- explicit privacy boundaries.

Avoid:

- giant anonymous event handlers;
- unexplained magic numbers;
- private church data in Git;
- video files in Git;
- secrets/API keys in source;
- clever abstractions that make ordinary edits harder.

## Before committing

Check:

- JavaScript syntax;
- referenced HTML IDs;
- desktop layout;
- phone layout;
- keyboard navigation;
- public/member/admin visibility;
- unconfirmed church facts remain qualified.

## Commit messages

Use short descriptions of what changed, for example:

- `Clarify visitor directions`
- `Add ministry-group calendar filter`
- `Improve sermon trim controls`
- `Document giving-provider handoff`

## Production warning

The current GitHub Pages deployment is a prototype.

Browser-local role switching is not authentication.
Browser-local storage is not a church database.
