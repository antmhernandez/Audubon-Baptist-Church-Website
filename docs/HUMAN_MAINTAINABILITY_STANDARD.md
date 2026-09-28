# Human-Readable Software Maintenance Standard

Last reviewed: 2026-09-28

## Purpose

Audubon Baptist Church should be able to maintain its software after the original builder, volunteer, or assistant is gone.

Readable code is therefore a product requirement, not a cosmetic preference.

This standard records the practices learned while converting the early prototype from rapidly generated code into source that a human maintainer can confidently inspect and modify.

## Core principle

**Optimize for the next careful human reader.**

A small amount of repetition is acceptable when it makes ownership, data flow, or church-specific behavior easier to understand.

Do not trade clarity for cleverness.

## File responsibilities

Each file should have one obvious reason to exist.

Examples:

- a page file owns its semantic content and layout;
- a page-specific JavaScript file owns that page's behavior;
- shared behavior belongs in a clearly named shared file;
- specialized tools, such as the Sermon Studio, remain isolated from ordinary site administration.

When a file becomes difficult to explain in one sentence, consider splitting it.

## Maintainer notes

Important files should begin with a short maintainer note that answers:

1. What does this file control?
2. What file(s) should be edited with it?
3. What privacy or production boundary matters here?
4. Where should a maintainer read more?

Do not turn headers into essays. Link to the relevant guide.

## Formatting

Use:

- UTF-8;
- LF line endings;
- two-space indentation;
- one logical statement per line where practical;
- blank lines between conceptual sections;
- descriptive variable and function names.

The repository `.editorconfig` records the mechanical defaults.

Do not minify source files committed for human maintenance.

## JavaScript structure

Prefer this order:

1. file purpose / maintainer note;
2. constants and settings;
3. state;
4. storage/data helpers;
5. formatting helpers;
6. render functions;
7. action/workflow helpers;
8. event listeners;
9. initial render.

Use section comments in large files.

Prefer named functions when a behavior has a meaningful name.

Avoid large anonymous event handlers and unexplained numeric constants.

## HTML structure

HTML should make the page's purpose visible without reading its JavaScript.

Use:

- semantic regions;
- useful headings;
- stable IDs only when JavaScript needs them;
- `data-*` attributes for repeated JavaScript hooks;
- comments at important maintenance boundaries.

Do not put secrets, credentials, or private church records in HTML.

## CSS structure

Use the central design variables instead of scattering new color values.

Group styles by feature or page.

Add a clear section heading before a substantial new style group.

Avoid adding a new override merely because an older selector is hard to understand; when the risk is manageable, repair the underlying rule.

A future stylesheet split should preserve these conceptual layers:

- base / tokens;
- shared components;
- public site;
- member application;
- calendar;
- administration;
- media tools;
- responsive rules.

## Comments

Comments should explain **intent**, not syntax.

Good comments explain:

- why a workflow is designed a certain way;
- where a church-specific setting belongs;
- which part is prototype-only;
- which data must remain private;
- why an unusual browser workaround exists.

Avoid comments such as “increment counter” directly above `counter += 1`.

## Configuration

Values that a maintainer may reasonably tune should be named constants near the top of the file.

Examples:

- seek intervals;
- number of media drafts retained;
- number of recent sermons kept online;
- cache names/versions;
- display limits.

Avoid unexplained “magic numbers” inside event handlers.

## Prototype vs. production

Every browser-local prototype feature must make its boundary clear.

Current examples:

- role selection is not authentication;
- localStorage is not a church database;
- hidden HTML is not authorization;
- local video selection is not an upload pipeline;
- generated processing JSON is not the NAS worker itself.

Production security must live on the server/database side.

## Progressive Web App policy

The installed PWA is the same web application, not a separate fork.

Therefore:

- the website remains the source of truth;
- the PWA uses the same URLs and code;
- when online, app-shell requests use a network-first strategy so the current deployment is preferred;
- cached public/static files are an offline fallback;
- member, administrator, and Media Studio routes are not part of the general offline cache;
- private API responses, uploaded sermon video, and other sensitive media must never be added to the general service-worker cache;
- installation UI must degrade gracefully when a browser does not expose a one-click install API.

Do not create separate Android/iOS code until a native-only requirement justifies it.

## Media workflow policy

The browser should make editing decisions easy.

The NAS/worker should do heavy processing.

Keep these responsibilities separate:

**Browser / PWA**
- choose source;
- navigate recording;
- mark trim;
- enter metadata;
- choose simple audio options;
- validate;
- submit/export a job.

**Worker**
- authenticate/validate source;
- run FFmpeg;
- create video/audio derivatives;
- retain archive;
- upload delivery copies;
- verify upload;
- rotate recent online sermons;
- update publication records.

## Validation before merge

For changes that affect behavior:

- JavaScript parses successfully;
- manifest/service worker parse successfully where applicable;
- JavaScript-referenced IDs exist;
- IDs are unique;
- internal links resolve;
- CSS braces are balanced;
- keyboard interaction still works;
- phone layout remains usable;
- public/member/admin boundaries remain correct.

For media changes, also run `docs/SERMON_STUDIO_TEST_PLAN.md`.

## Documentation rule

When a development pass teaches a reusable lesson, update the governing guide instead of leaving that lesson only in a chat or commit message.

This standard is intended to evolve with the project.
