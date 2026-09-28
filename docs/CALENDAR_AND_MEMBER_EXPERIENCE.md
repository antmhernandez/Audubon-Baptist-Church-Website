# Calendar and Member Experience

## Purpose

The calendar should answer a member's practical question quickly:

> What is happening at Audubon during the next several weeks, and what do I need to respond to?

The dedicated member calendar lives at:

`calendar.html`

## Prototype behavior

The calendar requires at least a **Church Member** role in the prototype.

A signed-out visitor sees a member-access gate. Production will replace the role chooser with real authentication.

The default view shows **three months at a time**.

Members can:

- see three month grids together;
- move backward or forward three months;
- return to the current three-month range;
- click a day to see event details;
- filter churchwide, member, and ministry events;
- RSVP Going / Maybe;
- download an event as an `.ics` file for a personal calendar;
- see a short upcoming-event list.

Ministry/group events appear only to Group Members or higher.

Administrators can open a simple event composer on the calendar page.

## Home-page relationship

The public site keeps a short upcoming-events summary because visitors should still know that the church has an active life.

Authenticated members receive a prominent **Open 3-month member calendar** action both in the public events section and in the member dashboard.

## Data model

Prototype event shape:

```json
{
  "id": "event-...",
  "dateISO": "2026-10-10",
  "time": "09:00",
  "title": "Event title",
  "audience": "churchwide | member | group",
  "description": "Short explanation",
  "source": "published | sample | admin-demo"
}
```

Production should add:

- recurrence rules;
- ministry/group ID;
- RSVP capacity;
- volunteer-task relationships;
- event owner;
- approval/publication state;
- reminder settings;
- attachments;
- calendar synchronization metadata.

## Production security

The current page reads browser-local prototype data. It is not a private calendar merely because the interface is gated.

Production must enforce event visibility and RSVP access on the server/database layer.


## Personal-calendar export

The prototype now generates `.ics` event files with:

- explicit `America/Kentucky/Louisville` local time;
- start and end time;
- a default one-hour duration when no duration is stored;
- event location;
- creation timestamp;
- escaped title/description/location values.

Production events should store explicit duration/end time rather than relying on the prototype default.
