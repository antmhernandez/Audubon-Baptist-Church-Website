# Pastor's GitHub Editing Guide

October 18, 2026

## Invite a collaborator

1. Ask Pastor Jeff for his GitHub username.
2. Open https://github.com/antmhernandez/Audubon-Baptist-Church-Website
3. Select **Settings → Collaborators → Add people**.
4. Enter his GitHub username, send the invitation, and ask him to accept it.
5. Have all collaborators use two-factor authentication.

This repository is currently owned by a personal account. A collaborator has write access. Consider a church-owned GitHub organization for long-term ownership and separate code-review policies.

## Where to edit wording

| Subject | File |
| --- | --- |
| Home welcome / Sunday note / Facebook banner | `index.html` |
| Visit, parking, schedule, directions | `visit.html` |
| Sermon page introductory copy | `sermons.html` |
| Historical sermon titles and audio links | `sermons.js` |
| Beliefs | `beliefs.html` |
| Our Story, pastors, mission | `about.html` |
| Newsletter archive | `archive.html` |
| Giving page | `give.html` |
| Shared navigation | `site.js` |
| Recently published sermon links | `sermon-catalog.json` |
| Colors, spacing, typography | `styles.css` |

## Make a safe edit

1. Open a file in the repository.
2. Click the **pencil icon** to edit.
3. Change only the visible words between HTML tags. Keep tags and attributes unchanged.
4. Select **Commit changes** and **Create a new branch**.
5. Submit a **Pull Request** for review.
6. After approval, merge the pull request to `main`. The connected Cloudflare site then redeploys.

Example:

```html
<p class="home-welcome">A rich legacy. A church reborn.</p>
```

Changing the text is safe; changing `class="home-welcome"` can affect design.

## Important

The existing member/admin controls are prototype features, not secure credentials or a production content-management system. Avoid storing confidential church information until authentication and server-side permissions are implemented.

Please confirm current church schedule, directions/parking, nursery, accessibility, contact information, giving arrangements, and current livestream methods before publishing them as current facts.

GitHub help: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository
