# Deployment: GitHub Pages

The current prototype is deliberately compatible with GitHub Pages.

## One-time GitHub setup

Repository:

`antmhernandez/Audubon-Baptist-Church-Website`

In GitHub:

1. Open the repository.
2. Choose **Settings**.
3. Choose **Pages** in the left sidebar.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch **main**.
6. Select folder **/(root)**.
7. Click **Save**.

After GitHub finishes publishing, the expected address is:

`https://antmhernandez.github.io/Audubon-Baptist-Church-Website/`

GitHub may take a short period to display the first successful deployment. The Pages settings screen will show the published URL.

## Updating the prototype

Because this version is plain HTML/CSS/JavaScript, every commit to the selected `main` branch becomes eligible for the next Pages deployment.

No npm install, compiler, or build server is required.

## What is safe to use on GitHub Pages

Good:
- public content;
- sample/demo data;
- public sermon embeds;
- public calendar information;
- public contact information.

Not safe:
- real member authentication;
- private prayer requests;
- confidential member records;
- private discussion;
- payment credentials;
- API secrets.

Those require the later database/application phase.

## Custom church domain

When leadership is ready, a domain such as `audubonbaptist.org` can point to the web application. Do not add a `CNAME` file until the church confirms the actual domain and DNS ownership.

## Future production deployment

When secure member/admin functionality is implemented, GitHub remains the code repository but GitHub Pages should no longer be the only runtime.

The application can then deploy automatically from GitHub to a managed web host while preserving the same source-control workflow.
