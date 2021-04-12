# Static page engine for GEO-data

## Demo

https://vasyaod.github.io/my-trips or https://github.com/vasyaod/my-tracks

## How to setup

 1. Create a repo for github pages (for example https://github.com/vasyaod/my-tracks)
 2. Create a repo for data model (for example https://github.com/vasyaod/my-tracks-data), the repo can has absolutely any name.
 3. 

## Structure

There are three parts here

 * `elt` generates data (make image and video previews) of trips for the `viewer`
 * `viewer` is a template/view or a single page site for github
 * `previewer` is generate page previews for social networks

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