# Role and Permission Model

The prototype demonstrates five levels.

## 1. Public

No sign-in required.

May see:
- home page;
- beliefs;
- visit information;
- public ministries;
- public sermons;
- public events;
- public announcements;
- public prayer items explicitly approved for publication;
- public giving page.

Cannot see member identities, private RSVPs, private prayer requests, group discussion, leadership material, or administration.

## 2. Church Member

Authenticated person approved as a church member.

May additionally see:
- member announcements;
- member prayer list;
- member events;
- RSVP and signup state;
- churchwide member discussion;
- permitted directory information if that feature is later approved.

## 3. Ministry / Group Member

A church member assigned to one or more groups.

May additionally see:
- group-specific posts;
- group calendars;
- ministry documents;
- group prayer items;
- service assignments.

Group membership should be additive: belonging to one ministry must not expose another ministry's restricted information.

## 4. Church Leadership

A trusted leadership role.

May additionally see:
- leadership-only prayer items;
- planning materials;
- moderation queues;
- approved member-management information;
- selected ministry administration.

Leadership is not automatically equivalent to full technical or financial administration.

## 5. Administrator

Site administration role.

May:
- edit public content;
- publish sermons;
- manage events;
- manage selected accounts and permissions;
- moderate submissions;
- configure website features.

Production should support narrower administrator capabilities, for example:
- Content Editor
- Sermon / Media Editor
- Calendar Editor
- Prayer Moderator
- User Administrator
- Giving Administrator

A media volunteer should not automatically receive access to private pastoral matters or giving data.

## Authorization principle

The production system must enforce permissions on the server/database layer, not merely hide buttons in the browser.

The current GitHub Pages prototype only demonstrates how these views might look. Selecting “Administrator” in the prototype does not grant access to any real data.
