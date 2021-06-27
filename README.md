# Static page engine for GEO-data

## Demo

 * https://github.com/vasyaod/my-tracks (non moderated content which is working by [the next principals](./how-my-tracks-works.md))
 * https://vasyaod.github.io/my-trips

## How to setup

 1. Create a repo for github page (for example https://github.com/vasyaod/my-tracks)
 2. Create a repo for data model (for example https://github.com/vasyaod/my-tracks-data), the repo can has absolutely any name.
 3. Copy [the Github Action Workflow](./github-wf.yml) to data model repo as /.workflows/etl.yml (for example https://github.com/vasyaod/my-tracks-data/blob/main/.github/workflows/etl.yml)
 4. Replace the github page repo param in the workflow file to your
 5. Add ACTIONS_DEPLOY_KEY as a deploy key to the github page repo and as a secret to data model repo. More information https://github.com/peaceiris/actions-gh-pages#%EF%B8%8F-create-ssh-deploy-key
 6. Done. Now any changes of data model in the appropriate repo will trigger regeneration of github pages.

## Structure

There are three parts here

 * `elt` generates data (make image and video previews) of trips for the `viewer`
 * `viewer` is a template/view or a single page site for github
 * `previewer` is generate page previews for social networks
 * `tagger` tries automatically to classifficate a track based on previous given tags and preview image (rastered map)

## Data model

TBD

## Viewer

Viewer is a template/view or a single page site for github.

### Build viewer locally for debuging purpose

```bash
cd viewer
npm install
npm run build
```

### Run 'viewer' in dev mode (local server)

Since Webpack is using for assembling of the viewer we have good opportunity to run dev local server
on http://localhost:8080

```bash
cd viewer
npm install
npm run dev
```