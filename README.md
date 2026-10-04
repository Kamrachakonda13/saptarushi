# Saptarushi

A Telugu devotional website — stotras, mantras, poojas, homa procedures, prasadam
recipes, temple listings, an almanac (panchangam), and long-form books.

It is a **static site**: plain HTML, CSS and browser JavaScript with **no web
framework and no build toolchain**. No `package.json`, no `node_modules`, no
bundler. A single Node script generates the pages and another serves them.

- **416 HTML pages** across deities, books, stotras, mantras, poojas, homa,
  prasadam and temples, plus a client-side almanac and a search index.
- **Runtime:** Node ≥ 20 (developed on v26). Uses only Node built-ins.
- **Offline-friendly:** the panchangam ephemeris engine and fonts are vendored
  locally, so the almanac computes without a network call.

---

## Quick start

```bash
git clone https://github.com/Kamrachakonda13/saptarushi.git
cd saptarishi

cp .env.example .env      # then edit .env and set ADMIN_PASS
node serve.js             # http://localhost:4173
```

The server **refuses to start** if `ADMIN_PASS` is unset — there is deliberately
no default password. The admin portal is at `/admin.html`.

```bash
node serve.js 8080        # CLI arg overrides $PORT
```

## Regenerating the site

Almost all HTML is **generated output**. Edit the source data, not the HTML.

```bash
node build.js
```

| Source of truth | Produces |
| --- | --- |
| `data.js` | site metadata, deity definitions, book/audio entries |
| `stotras.json` | scraped stotra library |
| `temples.json`, `temples-content.json` | temple listings and bilingual detail |
| `content/<slug>-content.js` | per-deity stotras, poojas, mantras, homa, prasadam |
| `build.js` | the generator itself |

`build.js` also writes `stotras-runtime.js`, `temples-data.js`,
`search-index.json` and `feed.xml`.

**Convention:** if you change page structure or navigation, edit `build.js` and
rebuild — never hand-edit a generated page. See `AGENTS.md` for the full
conventions.

## Configuration

Configuration lives in `.env` (gitignored). Copy `.env.example` and fill it in.
Real environment variables take precedence over the file.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `ADMIN_USER` | yes | `admin` | Admin portal username |
| `ADMIN_PASS` | **yes** | *(none)* | Admin portal password, min 10 chars. No default — the server aborts without it |
| `PORT` | no | `4173` | Dev server port (`node serve.js <port>` wins) |
| `SITE_URL` | no | `https://saptarushi.example` | Public origin used for RSS `<link>`/`<guid>`. **Set this before launch** |

`.env` is loaded by `serve.js`, `build.js` and `build-rss.js` via `lib/env.js`,
a dependency-free parser (the project has no package manager, so `dotenv` is
not used).

### Credential storage

On first run `ADMIN_PASS` seeds `content/admin-auth.json` as a **salted PBKDF2
hash** (120k iterations, SHA-256). The plaintext is never written to disk and
never sent to the browser. Changing the password in the admin portal re-hashes
it. Both `.env` and `content/admin-auth.json` are gitignored.

## Optional: PDF text extraction

The admin portal's "extract text from PDF" feature is the **only** part that
needs Python. Everything else is pure Node.

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-pdf.txt
```

Without a venv the server still runs; PDF extraction just fails with an
explanatory message. `.venv/` is gitignored.

## Not in this repository

Excluded via `.gitignore` to keep the repo small and free of secrets:

| Path | Why |
| --- | --- |
| `.env`, `.env.local` | Contains the admin password |
| `content/admin-auth.json` | Salted password hash |
| `content/token.txt` | Third-party token |
| `downloaded-files-from-freegurukul/` | 147 MB of third-party source PDFs used for scraping |
| `media/audio/` | ~103 MB of uploaded audio; keep large binaries out of git history |
| `.venv/`, `__pycache__/`, `*.bak`, `.content-backup/` | Local/derived files |

Audio lives on disk only. To restore it, drop the files back into
`media/audio/` and restart — `serve.js` rebuilds `media/audio-index.json`.

## Layout

```
build.js              static site generator (the 400+ page builder)
serve.js              dev server + admin/content/media/PDF APIs
data.js               main content metadata, deities, books, audio
app.js                browser runtime: filters, audio player, chat assistant
search.js             client-side search over search-index.json
lib/env.js            dependency-free .env loader
lib/clean-stotra.js   stotra text cleanup helper
content/              per-deity content modules (admin-managed data lives here)
assets/               images, vendored ephemeris engine + licences (assets/vendor/LICENSES.md)
media/                uploaded audio (gitignored)
build-search-index.js generates search-index.json
build-rss.js          generates feed.xml
requirements.txt      reference index of every external dependency
requirements-pdf.txt  optional Python deps for PDF extraction
api/                  API contract docs
AGENTS.md              conventions for AI agents working in this repo
```

## Admin API

All under `/api`, session-token authenticated via `X-Admin-Token` after
`POST /api/login`. See `api/panchang-api-contract.md` and `AGENTS.md`.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/login` | Exchange credentials for a session token |
| `GET/POST /api/content` | Read / write admin-managed content |
| `POST /api/book` | Persist book text |
| `GET /api/media`, `POST /api/upload` | List / upload media |
| `POST /api/extract-pdf` | Extract PDF text (needs `.venv`, see above) |
| `GET /api/health` | Liveness check |

## Licence

Third-party vendored components keep their own licences — see
`assets/vendor/LICENSES.md`.