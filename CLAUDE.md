# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run the app:
```
./run.sh
```
or directly:
```
python3 server.py
```
This starts a local server at http://127.0.0.1:8420. No build step, no package manager, no dependencies to install (pure Python 3 stdlib backend, vanilla JS frontend — no `node_modules`, no `requirements.txt`). There is no test suite and no linter configured in this repo.

## Architecture

This is a local single-user web app (all UI text in Spanish) for practicing English, backed by a flat JSON file instead of a database.

**Backend (`server.py`)** — a single-file `http.server`-based Python server with no third-party dependencies:
- Serves static files from `static/`.
- `GET /api/data` — returns the full contents of `data.json` (or a default empty shape if the file doesn't exist yet).
- `POST /api/data` — overwrites `data.json` with the full JSON body sent by the client (atomic write via temp file + `os.replace`). There is no partial-update endpoint; the frontend always reads/writes the entire state blob.
- `POST /api/check-writing` — proxies free-text submissions to the public LanguageTool API (`api.languagetool.org`) for grammar checking and returns simplified match results. Requires internet access; fails gracefully with a 502 if unreachable.

**Frontend** — vanilla JS SPA, no framework, no bundler:
- `static/index.html` — defines all tab/subtab sections as hidden `<section>`/`<div>` panels; JS toggles `.active` classes to switch views.
- `static/app.js` — main app logic. A single global `state` object (vocab, phrases, phrasalVerbs, writings, dailyChallenge, stats, mistakes, categoryStats, savedExpressions, pathProgress) is the in-memory source of truth. `loadState()` fetches it from `/api/data` on startup; `saveState()` POSTs the entire object back after any mutation — there's no diffing, so any code that changes `state` should call `saveState()` afterward. Tab navigation is driven by the `TAB_RENDERERS` map (tab name → render function) and `activateTab()`.
- `static/path.js` — a self-contained module for the "Ruta B2→C1-C2" tab, a structured 6-month curriculum. `PATH_WEEKS` hardcodes the week-by-week content (checklist items, quiz, writing prompt); per-week progress is persisted under `state.pathProgress`, keyed by week id. Loaded before `app.js` in `index.html`.
- Flashcards use a Leitner spaced-repetition system: `LEITNER_INTERVALS` (in `app.js`) defines the day-interval per box (0–6), and each vocab item tracks its own `box`/`due` date.

**Data (`data.json`)** — the entire app's persistent state as one JSON document, read/written wholesale by the two endpoints above. `data.json.bak-*` files are manual point-in-time backups, not something the app manages automatically.
