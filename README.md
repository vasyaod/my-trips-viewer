# Static page engine for GEO-data

## Demo

https://vasyaod.github.io/my-trips

## Boilerplate

https://vasyaod.github.io/my-trips-boilerplate

## How to setup

 1. Fork the repo (or create a new repo)
 2. Clone the fork
 3. Create and setup a KEY for deploying github-pages as described here https://github.com/peaceiris/actions-gh-pages#1-add-ssh-deploy-key
 4. Edit data model in `initial-data` directory (data model is described bellow)
 5. Push it to Github and wait until Github executes the workflow (.github/etl.yml)

## Structure

There are three parts here

 * `elt` generates data (make image and video previews) of trips for the `viewer`
 * `viewer` is a template/view or single page site for github
 * `previewer` is generate page previews for social networks

## Data model


