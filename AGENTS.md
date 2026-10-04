# AGENTS.md

This repository is a static devotional website that serves HTML, CSS, JS, audio, and book content without a framework or build pipeline. Most work should be done in the source data and runtime scripts, not by editing generated static output by hand.

## Quick start

- Run the site locally:
  - `cd saptarishi-main`
  - `node serve.js 4173`
- Regenerate generated pages after changing source data or page templates:
  - `node build.js`

## Project layout

- `index.html`, `audio.html`, `books.html`, `about.html`, `temples.html`, `panchangam.html` are generated/published pages.
- `build.js` reads `data.js`, `stotras.json`, `temples.json`, and `temples-content.json` and writes many of the site pages.
- `serve.js` is the runtime server for local development and admin APIs; it serves static files and exposes content/admin endpoints.
- `app.js` is the client-side runtime for the browser: text size controls, filters, audio player, and the in-page assistant/chat UI.
- `data.js` is the main source of content metadata, deity definitions, and book/audio entries.
- `content/admin-data.json` is runtime-managed admin content and should be treated as generated data unless the task is explicitly about admin features.
- `assets/` and `media/` hold images, vendor assets, and uploaded/generated media.

## Editing conventions

- Prefer changing the source data files (`data.js`, `stotras.json`, `temples.json`, `temples-content.json`) rather than editing generated HTML pages directly.
- If you change template structure or site navigation, update the generator logic in `build.js` and then regenerate the site.
- Keep logic in plain browser-friendly JavaScript; avoid introducing a framework or package manager unless the task specifically requires it.
- If content is meant to be admin-managed, check `serve.js` and the admin routes before changing storage/JSON behavior.

## Runtime and content notes

- The site is intentionally static and offline-friendly; many assets are vendored locally rather than fetched from npm packages.
- Port defaults: `4173`.
- `requirements.txt` is a reference file for external dependencies and not a normal Python install requirement for running the site.
- The project includes an API contract document at [api/panchang-api-contract.md](api/panchang-api-contract.md) and a vendor license reference at [assets/vendor/LICENSES.md](assets/vendor/LICENSES.md).

## Safe defaults for AI agents

- Do not assume a Node build tool exists beyond the repo scripts; prefer `node serve.js` / `node build.js`.
- When fixing content issues, trace the data flow from `build.js` into the generated HTML or runtime data before patching generated output.
- Keep changes small and targeted to the source-of-truth file that owns the behavior.
- If a task touches media uploads or admin features, inspect `serve.js` before editing browser code, because the server owns file handling and API responses.

## Relevant docs

- [api/panchang-api-contract.md](api/panchang-api-contract.md)
- [assets/vendor/LICENSES.md](assets/vendor/LICENSES.md)
- [requirements.txt](requirements.txt)
