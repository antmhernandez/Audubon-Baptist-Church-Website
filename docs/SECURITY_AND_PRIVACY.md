# Security and Privacy

Church technology contains unusually sensitive information because ordinary administrative data can reveal personal hardships, family situations, health concerns, counseling needs, and financial activity.

## Rules for the prototype

The current GitHub Pages version is public.

Therefore:
- use sample data only;
- do not enter real private prayer requests;
- do not enter member contact information;
- do not enter giving information;
- do not enter passwords or secrets;
- do not treat the role switcher as authentication.

Browser-local edits are for demonstration and disappear when browser storage is cleared.

## Production requirements

### Authentication

Use a mature authentication provider. Do not build password storage from scratch.

Require:
- verified email;
- secure sessions;
- rate limiting;
- password reset;
- optional multi-factor authentication for administrators;
- session revocation.

### Authorization

Enforce access in the database/API layer.

A user who manually requests a leadership URL must still be denied if the account lacks leadership permission.

### Prayer privacy

Each request should carry explicit visibility:
- public;
- member;
- ministry/group;
- leadership;
- pastoral.

Recommended fields:
- submitter;
- visibility;
- display name preference;
- request text;
- moderator approval;
- expiration/review date;
- status;
- updated timestamp.

Public requests should never become public by default.

### Financial separation

Do not store card numbers or bank credentials.

Use a PCI-compliant giving/payment provider.

Restrict giving administration separately from general site administration.

### Audit trail

Production administration should record:
- who changed content;
- what changed;
- when;
- significant permission changes;
- publication/unpublication.

### Secrets

Production secrets belong in encrypted hosting/environment settings, not in GitHub source files.

### Backups

Maintain:
- database backups;
- source history in GitHub;
- media master backups independent of the streaming provider;
- documented recovery instructions.

### Minimum-data principle

Do not collect information simply because it might someday be useful. Every stored member field should have a clear church purpose and retention policy.
