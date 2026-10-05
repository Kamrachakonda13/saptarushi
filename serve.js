// Saptarushi — full-featured server
// Static files + media uploads (files & folders) + admin content API + PDF text extraction
// Usage:  node serve.js [port]
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFile } = require('child_process');
const DC_STORE = require('./tools/deity-content-store');

const root = __dirname;
require('./lib/env').loadEnv();
// CLI arg wins, then $PORT, then 4173.
const port = Number(process.argv[2] || process.env.PORT || 4173);

// ---------------------------------------------------------------------------
// Admin authentication
// The password is NEVER stored in source. Put ADMIN_PASS in .env (gitignored)
// or export it in the environment. There is deliberately no built-in default:
// if it is missing the server refuses to start rather than falling back to a
// well-known password. Passwords are never returned to the browser and are
// never stored in plaintext — only a salted PBKDF2 hash in content/admin-auth.json
// (also gitignored). Changing the password via the admin portal re-hashes it.
// ---------------------------------------------------------------------------
const ADMIN_USER = String(process.env.ADMIN_USER || 'admin').trim();
const AUTH_STORE = path.join(__dirname, 'content', 'admin-auth.json');
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const sessions = new Map();

function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(String(password), s, 120000, 32, 'sha256').toString('hex');
  return { salt: s, hash };
}
function verifyPassword(password, record) {
  if (!record || !record.hash || !record.salt) return false;
  const derived = crypto.pbkdf2Sync(String(password), record.salt, 120000, 32, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(record.hash, 'hex'));
}
function loadAuth() {
  try {
    if (fs.existsSync(AUTH_STORE)) return JSON.parse(fs.readFileSync(AUTH_STORE, 'utf8'));
  } catch (_) {}
  // First run: seed the credential store from ADMIN_PASS.
  const initial = String(process.env.ADMIN_PASS || '');
  if (!initial) {
    console.error('\n  FATAL: ADMIN_PASS is not set.\n');
    console.error('  Create a .env file next to serve.js (copy .env.example) containing:');
    console.error('      ADMIN_USER=admin');
    console.error('      ADMIN_PASS=<a strong password you choose>\n');
    console.error('  Or export it for one run:  ADMIN_PASS=... node serve.js\n');
    console.error('  There is no default password on purpose. Aborting.\n');
    process.exit(1);
  }
  if (initial.length < 10) {
    console.error('\n  FATAL: ADMIN_PASS must be at least 10 characters. Aborting.\n');
    process.exit(1);
  }
  const record = hashPassword(initial);
  const auth = { username: ADMIN_USER, ...record, createdAt: new Date().toISOString() };
  safeWrite(AUTH_STORE, JSON.stringify(auth, null, 2));
  console.log('→ Created credential store content/admin-auth.json from ADMIN_PASS.');
  return auth;
}
function saveAuth(username, password) {
  const record = hashPassword(password);
  safeWrite(AUTH_STORE, JSON.stringify({ username, ...record, updatedAt: new Date().toISOString() }, null, 2));
  return record;
}
let AUTH = null;

function issueSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { user, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}
function validSession(token) {
  if (!token) return false;
  const session = sessions.get(String(token));
  if (!session) return false;
  if (session.expiresAt <= Date.now()) { sessions.delete(String(token)); return false; }
  return true;
}

// ---------------------------------------------------------------------------
const MEDIA_DIR = path.join(root, 'media');
const UPLOAD_DIR = path.join(root, 'uploads');
const CONTENT_DIR = path.join(root, 'content');
const BOOKS_DIR = path.join(root, 'books');
const DATA_STORE = path.join(CONTENT_DIR, 'admin-data.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.pdf': 'application/pdf',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
  '.oga': 'audio/ogg', '.m4a': 'audio/mp4', '.aac': 'audio/aac',
  '.flac': 'audio/flac', '.opus': 'audio/opus', '.webm': 'audio/webm',
  '.mp4': 'video/mp4', '.txt': 'text/plain; charset=utf-8',
  '.ttf': 'font/ttf', '.otf': 'font/otf',
};

const AUDIO_EXTS = new Set(['.mp3', '.wav', '.ogg', '.oga', '.m4a', '.aac', '.flac', '.opus', '.webm']);

// ---------------------------------------------------------------------------
// ensure dirs exist
[MEDIA_DIR, UPLOAD_DIR, CONTENT_DIR, path.join(MEDIA_DIR, 'audio'), path.join(MEDIA_DIR, 'books'), path.join(CONTENT_DIR, 'books')].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

function safeWrite(p, data) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, data);
}

AUTH = loadAuth();

// ---------------------------------------------------------------------------
// Publishing
// ---------------------------------------------------------------------------
// The public site is a static build: build.js inlines books, deity content,
// stotra and pooja pages into HTML. Before this existed, saving in the admin
// wrote to content/admin-data.json and nothing read it, so an edit looked like
// it had worked and never reached a reader. The build takes ~0.1s, so every
// admin save republishes immediately instead of asking anyone to remember a
// manual step.
const BUILD_SCRIPT = path.join(root, 'build.js');
let buildState = { running: false, at: null, ok: null, error: null, log: '' };

function runBuild() {
  if (buildState.running) return Promise.resolve(buildState);
  buildState = { running: true, at: new Date().toISOString(), ok: null, error: null, log: '' };
  return new Promise(resolve => {
    const child = require('child_process').spawn(process.execPath, [BUILD_SCRIPT], {
      cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    const cap = s => { out += s; if (out.length > 8000) out = out.slice(-8000); };
    child.stdout.on('data', cap);
    child.stderr.on('data', cap);
    const done = code => {
      buildState.running = false;
      buildState.ok = code === 0;
      buildState.error = code === 0 ? null : ('build exited ' + code);
      buildState.log = out.trim().split('\n').slice(-12).join('\n');
      resolve(buildState);
    };
    child.on('close', done);
    child.on('error', e => { buildState.error = e.message; done(1); });
    // Never let a wedged build hold a request open indefinitely.
    setTimeout(() => { try { child.kill('SIGKILL'); } catch (_) {} }, 60000).unref();
  });
}

function readStore() {
  try {
    if (fs.existsSync(DATA_STORE)) return JSON.parse(fs.readFileSync(DATA_STORE, 'utf-8'));
  } catch (_) { /* fall through */ }
  return { audio: [], books: [], home: {}, media: [], pages: {} };
}
function writeStore(store) { safeWrite(DATA_STORE, JSON.stringify(store, null, 2)); }

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}

function body(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/* --------------------------------------------------------------------------
   Multipart form-data parser (no external deps)
   Buffer => [{ name, filename, type, data }]
-------------------------------------------------------------------------- */
function parseMultipart(buf, boundary) {
  const parts = [];
  const delim = Buffer.from('--' + boundary);
  let pos = 0;
  while (pos >= 0) {
    const start = buf.indexOf(delim, pos);
    if (start === -1) break;
    pos = start + delim.length;
    // closing delimiter "--boundary--"
    if (buf[pos] === 45 && buf[pos + 1] === 45) break;
    // headers end at the first blank line
    const hEnd = buf.indexOf('\r\n\r\n', pos);
    if (hEnd === -1) break;
    const headersText = buf.slice(pos, hEnd).toString('utf-8');
    const hMatch = headersText.match(/name="([^"]*)"(?:;\s*filename="([^"]*)")?/);
    if (!hMatch) { pos = hEnd + 4; continue; }
    const name = hMatch[1];
    const filename = hMatch[2] ? path.basename(hMatch[2].replace(/\\/g, '/')) : undefined;
    const tm = headersText.match(/Content-Type:\s*([^\r\n]+)/i);
    const type = tm ? tm[1].trim() : '';
    const bodyEnd = buf.indexOf('\r\n--' + boundary, hEnd + 4);
    if (bodyEnd === -1) break;
    const data = buf.slice(hEnd + 4, bodyEnd);
    parts.push({ name, filename, type, data });
    pos = bodyEnd;
  }
  return parts;
}

function collectUploads(req) {
  return body(req).then(buf => {
    const ct = req.headers['content-type'] || '';
    if (!/multipart\/form-data/.test(ct)) {
      // JSON payload
      try { return { fields: JSON.parse(buf.toString('utf-8')), files: [] }; }
      catch (_) { return { fields: {}, files: [] }; }
    }
    const m = ct.match(/boundary=(?:"([^"]+)"|([^;]+))/);
    const boundary = m ? (m[1] || m[2]).trim() : '';
    const parts = parseMultipart(buf, boundary);
    const fields = {};
    const files = [];
    for (const p of parts) {
      if (p.filename !== undefined) files.push(p);
      else fields[p.name] = p.data.toString('utf-8');
    }
    return { fields, files };
  });
}

function slugify(s) {
  return String(s || '').toLowerCase().trim()
    .replace(/[^\w\- ]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function uniquePath(filePath, keepExt = true) {
  let base = filePath;
  const ext = path.extname(filePath);
  if (!keepExt) base = filePath.replace(/\.[^.]+$/, '');
  let out = base, i = 1;
  while (fs.existsSync(out)) { out = base.replace(/\.[^.]+$/, '') + '-' + i++ + ext; }
  return out;
}

/* --------------------------------------------------------------------------
   PDF text extraction via Python (pdfminer.six / pypdf in the venv)
   Falls back gracefully; returns raw text extracted from the PDF.
-------------------------------------------------------------------------- */
const PYTHON = path.join(root, '.venv', 'bin', 'python3');
function extractPdfText(pdfPath) {
  const script = `
import sys, io
try:
    from pdfminer.high_level import extract_text
except Exception:
    try:
        from pypdf import PdfReader
        r = PdfReader(sys.argv[1])
        print("\\n\\n".join((p.extract_text() or "") for p in r.pages))
    except Exception as e:
        print("ERROR:" + str(e))
        sys.exit(0)
    sys.exit(0)
text = extract_text(sys.argv[1])
print(text)
`;
  return new Promise(resolve => {
    if (!fs.existsSync(PYTHON)) return resolve('');  // pdfminer not installed
    execFile(PYTHON, ['-c', script, pdfPath], { timeout: 60000, maxBuffer: 32 * 1024 * 1024 }, (err, stdout) => {
      if (err) return resolve('');
      resolve(stdout || '');
    });
  });
}


/* --------------------------------------------------------------------------
   OCR for scanned images/PDFs. Uses system tesseract + pdftoppm when present.
   OCR results are stored under content/ocr so they can be rendered later.
-------------------------------------------------------------------------- */
function runCommand(cmd, args, timeout = 120000) {
  return new Promise(resolve => {
    execFile(cmd, args, { timeout, maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return resolve('');
      resolve(String(stdout || '').trim());
    });
  });
}
async function ocrFile(filePath, originalName) {
  const ext = path.extname(originalName || filePath).toLowerCase();
  const tesseract = process.platform === 'win32' ? 'tesseract.exe' : 'tesseract';
  const pdftoppm = process.platform === 'win32' ? 'pdftoppm.exe' : 'pdftoppm';
  if (!require('child_process').execFile) return '';
  if (ext === '.pdf') {
    if (!await commandExists(pdftoppm) || !await commandExists(tesseract)) return '';
    const tmpDir = path.join(UPLOAD_DIR, 'ocr-' + Date.now() + '-' + Math.random().toString(36).slice(2));
    fs.mkdirSync(tmpDir, { recursive: true });
    const prefix = path.join(tmpDir, 'page');
    await runCommand(pdftoppm, ['-jpeg', '-r', '180', filePath, prefix], 180000);
    let pages = fs.readdirSync(tmpDir).filter(f => /^page-\d+\.jpg$/i.test(f)).sort();
    let out = [];
    for (const f of pages.slice(0, 80)) {
      const text = await runCommand(tesseract, [path.join(tmpDir, f), 'stdout', '-l', 'eng+tel'], 120000);
      if (text) out.push('--- Page ' + (out.length + 1) + ' ---\n' + text);
    }
    fs.rmSync(tmpDir, { recursive: true, force: true });
    return out.join('\n\n').trim();
  }
  if (/\.(png|jpe?g|webp|bmp|tiff?)$/i.test(ext) && await commandExists(tesseract)) {
    return await runCommand(tesseract, [filePath, 'stdout', '-l', 'eng+tel'], 120000);
  }
  return '';
}
function commandExists(cmd) {
  return new Promise(resolve => execFile(cmd, ['--version'], { timeout: 5000 }, err => resolve(!err)));
}
function saveOcrResult(rel, text, source) {
  const key = String(rel || source || '').replace(/[^a-zA-Z0-9._/-]+/g, '_').replace(/^\/+/, '');
  const out = path.join(CONTENT_DIR, 'ocr', key + '.json');
  safeWrite(out, JSON.stringify({ source, text, updated: new Date().toISOString() }, null, 2));
  return '/content/ocr/' + key + '.json';
}

/* --------------------------------------------------------------------------
   saveManifest: write a media JSON so the browser player can rebuild lists
-------------------------------------------------------------------------- */
function rebuildAudioManifest() {
  const dir = path.join(MEDIA_DIR, 'audio');
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const folder of fs.readdirSync(dir)) {
    const fdir = path.join(dir, folder);
    if (!fs.statSync(fdir).isDirectory()) continue;
    for (const f of fs.readdirSync(fdir)) {
      const ext = path.extname(f).toLowerCase();
      if (!AUDIO_EXTS.has(ext)) continue;
      const stat = fs.statSync(path.join(fdir, f));
      out.push({ folder, file: f, name: path.parse(f).name, url: '/media/audio/' + folder + '/' + f, size: stat.size, added: stat.birthtimeISO_NS > 0 ? stat.mtime.toISOString() : '' });
    }
  }
  safeWrite(path.join(root, 'media', 'audio-index.json'), JSON.stringify(out, null, 2));
  return out;
}

function generateBookPage(book) {
  const t = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const deity = String(book.deity || 'venkateswara').toLowerCase().split(/[^a-z]+/).filter(Boolean)[0] || 'venkateswara';
  const fallbackImg = fs.existsSync(path.join(root, 'assets', 'deities', deity + '.jpg')) ? '../assets/deities/' + deity + '.jpg' : '../assets/deities/venkateswara.jpg';
  const img = book.imageUrl || book.coverUrl || fallbackImg;
  return `<!DOCTYPE html>
<html lang="en" data-text-size="base">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${t(book.title || book.en || book.slug)} | Saptarushi</title>
<meta name="description" content="${t(book.title || book.en || '')} — read in English and Telugu."/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Karla:wght@400;500;600;700&family=Noto+Serif+Telugu:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="../styles.css?v=38"/>
</head>
<body>
<div class="bg-parch text-ink min-h-screen">
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="../index.html"><span class="brand-mark">✦</span>
        <span class="leading-none"><span class="brand-name">Saptarushi</span><span class="brand-tag">తెలుగు భక్తి</span></span>
      </a>
      <nav class="main-nav">
        <a href="../audio.html">Audio</a>
        <a href="../books.html" class="active">Books</a>
        <a href="../temples.html">Temples</a>
        <a href="../panchangam.html">Panchang</a>
        <a href="../about.html">About</a>
      </nav>
      <div class="header-right">
        <span class="textsize-label">Text size</span>
        <div class="textsize-group" role="group" aria-label="Text size">
          <button class="textsize-btn" data-size="base" aria-label="Text size A">A</button>
          <button class="textsize-btn" data-size="large" aria-label="Text size A+">A+</button>
          <button class="textsize-btn" data-size="xlarge" aria-label="Text size A++">A++</button>
        </div>
        <button class="menu-trigger" id="menuTrigger" aria-label="Open menu">☰</button>
      </div>
    </div>
  </header>
  <nav class="mobile-nav" id="mobileNav">
    <a href="../index.html">Home</a>
    <a href="../audio.html">Audio</a>
    <a href="../books.html" class="active">Books</a>
    <a href="../temples.html">Temples</a>
    <a href="../panchangam.html">Panchang</a>
    <a href="../about.html">About</a>
  </nav>
<main>
<section class="book-top">
  <a class="back-link" href="../books.html">← All books</a>
  <div class="book-layout">
    <aside class="book-aside">
      <figure class="book-cover-fig"><img class="book-cover-img" style="width:100%;height:auto;aspect-ratio:1/1" src="${img}" alt="${t(book.title || '')}" loading="lazy"/></figure>
      <h1 class="book-h1">${t(book.title || book.en || book.slug)}</h1>
      <p class="book-te-title" lang="te">${t(book.titleTe || book.te || '')}</p>
      <p class="book-meta-line">${t(book.sub || book.meta || 'From the library')}</p>
    </aside>
  </div>
</section>
</main>
   <script src="../lang-editor.js"></script>
   <script src="../media-player.js"></script>
   <script src="../text-editor.js"></script>
   <script src="../book-view.js"></script>
  <script>
    document.getElementById('menuTrigger').addEventListener('click', function () { document.getElementById('mobileNav').classList.toggle('open'); });
    document.querySelectorAll('#mobileNav a').forEach(function (a) { a.addEventListener('click', function () { document.getElementById('mobileNav').classList.remove('open'); }); });
    var o = localStorage.getItem('deepam-textsize'); if (o) document.documentElement.setAttribute('data-text-size', o);
    document.querySelectorAll('.textsize-btn').forEach(function (b, i, arr) { b.addEventListener('click', function () { var sizes = ['base','large','xlarge']; document.documentElement.setAttribute('data-text-size', sizes[i]); localStorage.setItem('deepam-textsize', sizes[i]); arr.forEach(function (x, j) { x.classList.toggle('active', j === i); }); }); });
  </script>
</body>
</html>`;
}


// Admin-created books live in content/books/<slug>.json and are rendered by the
// dynamic reader at /books/<slug>.html. The listing pages are static, so those
// books were reachable only if you already knew the URL: they never appeared in
// books.html, the homepage preview or search. Injecting them at request time
// keeps one source of truth and needs no rebuild.
const ADMIN_BOOK_SLUG = /^[a-z0-9][a-z0-9\-]*$/i;

function adminBooks() {
  const dir = path.join(CONTENT_DIR, 'books');
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
    const slug = f.replace(/\.json$/, '');
    if (!ADMIN_BOOK_SLUG.test(slug)) continue;
    try {
      const b = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      if (!b || (b.title === undefined && b.en === undefined)) continue;
      // A file only counts as an admin book if it is either registered in the
      // store or has the admin payload shape. This deliberately skips unrelated
      // JSON that happens to live in the same folder.
      const store = readStore();
      const registered = (store.books || []).some(x => x.slug === slug);
      const looksAdmin = typeof b.text === 'string' || typeof b.textTe === 'string';
      if (!registered && !looksAdmin) continue;
      // Skip anything the build already renders as a static page.
      if (fs.existsSync(path.join(BOOKS_DIR, slug + '.html'))) continue;
      out.push({
        slug,
        title: b.title || b.en || slug,
        titleTe: b.titleTe || b.te || '',
        meta: b.sub || b.meta || 'Added in the admin portal',
        deity: b.deity || '',
        isNew: b.isNew !== false,
      });
    } catch (_) { /* skip unreadable book file */ }
  }
  return out;
}

function adminBookCards() {
  return adminBooks().map(b => {
    const img = (() => {
      const d = String(b.deity || '').toLowerCase().split(/[^a-z]+/).filter(Boolean)[0];
      const p = d && path.join(root, 'assets', 'deities', d + '.jpg');
      return p && fs.existsSync(p) ? 'assets/deities/' + d + '.jpg' : '';
    })();
    const t = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    return `<a class="book-card" href="/books/${encodeURIComponent(b.slug)}.html">`
      + (img ? `<img class="book-cover-img" src="/${t(img)}" alt="${t(b.title)}" loading="lazy"/>` : '')
      + `<div class="min-w-0 flex-1">`
      + `<p class="book-te" lang="te">${t(b.titleTe || b.title)}</p>`
      + `<p class="book-en">${t(b.title)}</p>`
      + `<p class="book-meta">${t(b.meta)}</p>`
      + `</div></a>`;
  }).join('\n');
}

// Inject before the closing tag of the first matching container.
function injectBefore(html, needle, addition) {
  const at = html.indexOf(needle);
  if (at < 0 || !addition) return html;
  return html.slice(0, at) + addition + html.slice(at);
}

function generateAudioPage(track) {
  const t = (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  return `<!DOCTYPE html><html lang="en" data-text-size="base"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${t(track.name || track.en || track.slug)} | Saptarushi</title><link rel="stylesheet" href="../styles.css?v=39"/></head><body>
<div class="bg-parch text-ink min-h-screen"><header class="site-header"><div class="header-inner">
<a class="brand" href="../index.html"><span class="brand-mark">✦</span><span class="leading-none"><span class="brand-name">Saptarushi</span><span class="brand-tag">తెలుగు భక్తి</span></span></a>
<nav class="main-nav"><a href="../audio.html" class="active">Audio</a><a href="../books.html">Books</a><a href="../temples.html">Temples</a><a href="../panchangam.html">Panchang</a><a href="../about.html">About</a></nav>
</div></header><main><section class="section-page py-top"><a class="back-link" href="../audio.html">← All audio</a>
<div class="page-head audio-detail-head"><p class="hero-eyebrow">${t(track.deity || 'Audio library')}</p><h1>${t(track.name || track.en || track.slug)}</h1><p>${t(track.folder || 'From the audio library')} · ${t(track.file || '')}</p></div>
<div class="audio-detail-management"><div class="audio-detail-player" id="audioDetailPlayer"></div></div>
</section></main></div><script>window.__AUDIO_TRACK__=${JSON.stringify(track)};</script>
<script src="../data.js"></script><script src="../media-player.js?v=40"></script><script src="../text-editor.js"></script><script src="../app.js" data-base="../"></script>
<script>document.addEventListener('DOMContentLoaded',function(){var box=document.getElementById('audioDetailPlayer');if(window.MediaPlayer&&window.__AUDIO_TRACK__)MediaPlayer.renderList(box,[window.__AUDIO_TRACK__]);});</script></body></html>`;
}

/* --------------------------------------------------------------------------
   HTTP server
-------------------------------------------------------------------------- */
// ---------------------------------------------------------------------------
// Path exposure guard
// ---------------------------------------------------------------------------
// The server hands out anything under the project root, which used to include
// /.env and content/admin-auth.json. That published the admin password in
// plaintext and a PBKDF2 hash+Salt to any anonymous visitor, and an account
// takeover followed from it (verified, not theoretical). Nothing the public
// site serves reads these paths: build.js inlines content into the HTML, so
// content/ is build-time input only, and data.js / stotras-runtime.js live at
// the root where they are still reachable.
//
// Two rules, both default-deny for anything that smells private:
//   1. Any path segment beginning with "." is refused. Covers .env, .git,
//      .venv, .content-backup and every editor/OS sidecar.
//   2. An explicit list of build-time and server-side directories and files.
const PRIVATE_DIRS = ['content', 'uploads', 'tools', 'app', 'node_modules', '.venv', '.git'];
const PRIVATE_FILES = new Set([
  'admin-auth.json', 'admin-data.json', 'token.txt', 'env.js',
  // Server and build sources: nothing links to them, and they describe how the
  // admin guard works, which is not something to hand out. Deliberately NOT
  // listed: data.js, app.js, search.js and friends, which every page loads.
  'serve.js', 'build.js', 'build-rss.js', 'build-search-index.js',
  'check-content.js', 'check-deity-state.js',
]);

function exposureReason(pathname) {
  const clean = pathname.replace(/^\/+/, '');
  if (!clean) return null;
  const segments = clean.split('/').filter(Boolean);
  // Traversal that escaped root is handled separately, but refuse it here too
  // rather than letting it reach the filesystem check.
  if (segments.includes('..')) return 'path traversal';
  if (segments.some(s => s.startsWith('.'))) return 'dotfile';
  const top = segments[0];
  if (PRIVATE_DIRS.includes(top)) return 'build-time directory';
  if (segments.length === 1 && PRIVATE_FILES.has(top)) return 'server-side file';
  if (segments.length === 1 && /\.(bak|orig|rej|swp)$/i.test(top)) return 'backup file';
  return null;
}

function clientIp(req) {
  return String(req.socket && req.socket.remoteAddress || 'unknown');
}

// Login throttling. Password guessing was previously unmetered: 25 consecutive
// failures produced 25 identical 401s with no lockout and no delay.
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILS = 5;
const loginFails = new Map(); // ip -> { count, firstAt, lockedUntil }

function loginBlocked(ip) {
  const rec = loginFails.get(ip);
  if (!rec) return 0;
  if (rec.lockedUntil && rec.lockedUntil > Date.now()) return Math.ceil((rec.lockedUntil - Date.now()) / 1000);
  if (Date.now() - rec.firstAt > LOGIN_WINDOW_MS) loginFails.delete(ip);
  return 0;
}
function noteLoginFailure(ip) {
  const rec = loginFails.get(ip) || { count: 0, firstAt: Date.now(), lockedUntil: 0 };
  if (Date.now() - rec.firstAt > LOGIN_WINDOW_MS) { rec.count = 0; rec.firstAt = Date.now(); }
  rec.count += 1;
  if (rec.count >= LOGIN_MAX_FAILS) rec.lockedUntil = Date.now() + LOGIN_WINDOW_MS;
  loginFails.set(ip, rec);
  return rec;
}
function clearLoginFailures(ip) { loginFails.delete(ip); }

http.createServer((req, res) => {
  const urlObj = new URL(req.url, 'http://localhost');
  let url = decodeURIComponent(urlObj.pathname);
  const query = Object.fromEntries(urlObj.searchParams);

  // ---- CORS ----
  // Was Access-Control-Allow-Origin: *, which let any site on the internet
  // script authenticated calls against this server from a visitor's browser.
  // The admin panel is same-origin, so no CORS grant is needed; localhost is
  // echoed back only to keep split-port dev workflows working.
  const origin = String(req.headers.origin || '');
  if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Pin, X-Admin-Token');
  }
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  // ---- Refuse private paths before anything else touches them ----
  // Skipped for /api/* because that prefix is the route namespace, not the
  // physical api/ directory; the API does its own per-endpoint auth.
  if (!url.startsWith('/api/')) {
    const leak = exposureReason(url);
    if (leak) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
  }

  // =================== API routes ===================
  if (url.startsWith('/api/')) {
    const p = url.slice(5);

    // ---------- auth ----------
    if (p === 'login' && req.method === 'POST') {
      const ip = clientIp(req);
      const wait = loginBlocked(ip);
      if (wait) {
        return json(res, 429, {
          ok: false,
          error: `Too many failed sign-in attempts. Try again in ${Math.ceil(wait / 60)} minute(s).`,
          retryAfter: wait,
        });
      }
      return collectUploads(req).then(({ fields }) => {
        const user = String(fields.user || fields.username || '').trim();
        const pass = String(fields.pass || fields.password || '');
        const ok = user === AUTH.username && verifyPassword(pass, AUTH);
        if (!ok) {
          const rec = noteLoginFailure(ip);
          const left = Math.max(0, LOGIN_MAX_FAILS - rec.count);
          return json(res, 401, {
            ok: false,
            error: left > 0
              ? `Wrong username or password. ${left} attempt(s) left before a temporary lockout.`
              : 'Wrong username or password.',
          });
        }
        clearLoginFailures(ip);
        const token = issueSession(user);
        json(res, 200, { ok: true, token, user });
      });
    }

    function sessionToken(req) { return req.headers['x-admin-token'] || req.headers['x-admin-pin'] || ''; }
    function authed(req) { return validSession(sessionToken(req)); }

    if (p === 'logout' && req.method === 'POST') {
      sessions.delete(String(sessionToken(req)));
      return json(res, 200, { ok: true });
    }

    // Session probe. Sessions live in an in-memory Map, so every server restart
    // invalidates all tokens while browsers keep them in localStorage. Client
    // code must be able to tell a genuinely valid session from a stale one,
    // otherwise admin-only controls stay visible and simply fail on save.
    if (p === 'session' && req.method === 'GET') {
      if (!authed(req)) return json(res, 401, { ok: false, error: 'Not authorised' });
      // sessions maps token -> { user, expiresAt }, so return the username
      // itself rather than the whole record.
      const record = sessions.get(String(sessionToken(req)));
      return json(res, 200, {
        ok: true,
        user: (record && record.user) || AUTH.username,
        expiresAt: record ? record.expiresAt : null,
      });
    }

    // Password change. The password itself is never returned or exposed by the API.
    if (p === 'auth/change-password' && req.method === 'POST') {
      if (!authed(req)) return json(res, 401, { ok: false, error: 'Not authorised' });
      return collectUploads(req).then(({ fields }) => {
        const current = String(fields.currentPassword || '');
        const next = String(fields.newPassword || '');
        if (!verifyPassword(current, AUTH)) return json(res, 400, { ok: false, error: 'Current password is incorrect' });
        if (next.length < 10) return json(res, 400, { ok: false, error: 'New password must be at least 10 characters' });
        AUTH = { username: AUTH.username, ...saveAuth(AUTH.username, next) };
        // Invalidate every existing session after a credential change.
        sessions.clear();
        return json(res, 200, { ok: true });
      });
    }

    // ---------- GET media list ----------
    if (p === 'media' && req.method === 'GET') {
      if (!authed(req)) return json(res, 401, { error: 'Not authorised' });
      const audioIndex = rebuildAudioManifest();
      const bookDir = path.join(MEDIA_DIR, 'books');
      const books = [];
      if (fs.existsSync(bookDir)) {
        for (const f of fs.readdirSync(bookDir).sort()) books.push({ file: f, url: '/media/books/' + f });
      }
      return json(res, 200, { audio: audioIndex, books });
    }

    // ---------- GET public-page registry (admin) ----------
    if (p === 'pages' && req.method === 'GET') {
      if (!authed(req)) return json(res, 401, { error: 'Not authorised' });
      const pages = [];
      function walk(dir, prefix) {
        if (!fs.existsSync(dir)) return;
        for (const name of fs.readdirSync(dir).sort()) {
          const full = path.join(dir, name);
          const stat = fs.statSync(full);
          if (stat.isDirectory() && !['assets', 'media', 'uploads', 'content', '.git', '.venv', '__MACOSX'].includes(name)) walk(full, prefix + name + '/');
          else if (stat.isFile() && name.endsWith('.html') && name !== 'admin.html') pages.push({ key: '/' + prefix + name, label: (prefix + name).replace(/\.html$/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), url: prefix + name });
        }
      }
      walk(root, '');
      pages.unshift({ key: '/', label: 'Home', url: 'index.html' });
      return json(res, 200, pages);
    }

    // ---------- GET admin data ----------
    if (p === 'content' && req.method === 'GET') {
      if (!authed(req)) return json(res, 401, { error: 'Not authorised' });
      return json(res, 200, readStore());
    }

    // ---------- POST save content (admin) ----------
    if (p === 'content' && req.method === 'POST') {
      if (!authed(req)) return json(res, 401, { error: 'Not authorised' });
      return collectUploads(req).then(({ fields }) => {
        const store = readStore();
        try {
          const patch = JSON.parse(fields.data || '{}');
          for (const k of ['home', 'audio', 'books', 'templeNotes', 'pages', 'assets']) {
            if (k in patch) store[k] = patch[k];
          }
          writeStore(store);
          // Home copy and temple notes are baked into static HTML, so a save
          // has to republish or the edit stays invisible.
          return runBuild().then(() => json(res, 200, { ok: true, saved: true, published: true }));
        } catch (e) { json(res, 400, { error: 'Bad JSON — ' + e.message }); }
      });
    }

    // ---------- POST uploads (files & folders) ----------
    if (p === 'upload' && req.method === 'POST') {
      if (!authed(req)) return json(res, 401, { error: 'Not authorised' });
      return collectUploads(req).then(async ({ fields, files }) => {
        const dest = String(fields.dest || 'audio');           // audio | books | misc
        const folder = String(fields.folder || 'library');     // sub-folder label
        if (!/^[a-zA-Z0-9_\- ]+$/.test(folder)) return json(res, 400, { error: 'Invalid folder name' });
        const safeDest = /^(audio|books|files)$/.test(dest) ? dest : 'files';
        const requestedSlot = query.path && /^[a-zA-Z0-9_\-/]+$/.test(query.path) ? query.path : (safeDest + '/' + folder);
        const slot = requestedSlot.replace(/^\/+/, '');
        const target = path.normalize(path.join(MEDIA_DIR, slot));
        if (!target.startsWith(MEDIA_DIR)) return json(res, 403, { error: 'Forbidden path' });
        if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
        const saved = [];
        for (const f of files) {
          if (!f.data.length) continue;
          const filename = path.basename(String(f.filename || ''));
          if (!filename || filename === '.' || filename === '..') continue;
          const filePath = uniquePath(path.join(target, filename));
          fs.writeFileSync(filePath, f.data);
          const rel = path.relative(MEDIA_DIR, filePath).split(path.sep).join('/');
          const item = { file: f.filename, type: f.type, size: f.data.length, url: '/media/' + rel };
          if (/\.(pdf|png|jpe?g|webp|bmp|tiff?)$/i.test(f.filename)) {
            const ocrText = await ocrFile(filePath, f.filename);
            if (ocrText) {
              item.ocrText = ocrText;
              item.ocrUrl = saveOcrResult(rel, ocrText, item.url);
            }
          }
          saved.push(item);
        }
        const audioIndex = rebuildAudioManifest();
        const store = readStore();
        store.assets = store.assets || [];
        saved.forEach(function(item) {
          const id = 'media:' + String(item.url).replace(/^\/media\//,'').replace(/[^a-zA-Z0-9_-]+/g,'-').toLowerCase();
          const entry = { id, name: item.file, url: item.url, type: item.type || '', size: item.size, ocrText: item.ocrText || '', ocrUrl: item.ocrUrl || '', updated: new Date().toISOString() };
          const idx = store.assets.findIndex(a => a.id === id);
          if (idx >= 0) store.assets[idx] = { ...store.assets[idx], ...entry };
          else store.assets.push(entry);
          if (/^\/media\/audio\//.test(item.url)) {
            store.audio = store.audio || [];
            const ai = store.audio.findIndex(a => a.url === item.url);
            const ae = { id: 'audio:' + item.url, slug: path.parse(item.file).name, url: item.url, folder: item.url.split('/')[3] || 'library', file: item.file, name: path.parse(item.file).name, deity: 'library', updated: new Date().toISOString() };
            if (ai >= 0) store.audio[ai] = { ...store.audio[ai], ...ae }; else store.audio.push(ae);
          }
        });
        writeStore(store);
        json(res, 200, { ok: true, count: saved.length, saved, audioIndex });
      });
    }

    // ---------- POST save book (admin) ----------
    if (p === 'book' && req.method === 'POST') {
      if (!authed(req)) return json(res, 401, { error: 'Not authorised' });
      return collectUploads(req).then(({ fields }) => {
        try {
          const book = JSON.parse(fields.data || '{}');
          if (!book.slug || !book.title) return json(res, 400, { error: 'Book needs slug + title' });
          const store = readStore();
          const idx = store.books.findIndex(b => b.slug === book.slug);
          if (idx >= 0) {
            // Edit: keep the original NEW flag / first-added date so a
            // re-save does not re-flag the book as new.
            const prev = store.books[idx];
            if (typeof book.isNew === 'undefined' && typeof prev.isNew !== 'undefined') book.isNew = prev.isNew;
            if (!book.addedAt && prev.addedAt) book.addedAt = prev.addedAt;
            store.books[idx] = book;
          } else {
            // New upload: flag the tile as NEW until a reader opens it.
            book.isNew = true;
            book.addedAt = new Date().toISOString();
            store.books.push(book);
          }
          writeStore(store);
          // also write a friendly JSON per book for the reader
          safeWrite(path.join(CONTENT_DIR, 'books', book.slug + '.json'), JSON.stringify(book, null, 2));
          // Republish so the title actually appears on the site. The build is
          // fast enough to do synchronously without the admin feeling a wait.
          return runBuild().then(() => json(res, 200, { ok: true, slug: book.slug, published: true }));
        } catch (e) { json(res, 400, { error: 'Bad JSON — ' + e.message }); }
      });
    }

    // ---------- GET book by slug ----------
    if (/^book\//.test(p) && req.method === 'GET') {
      const slug = p.slice(5);
      const store = readStore();
      const book = store.books.find(b => b.slug === slug);
      if (book) return json(res, 200, book);
      if (fs.existsSync(path.join(BOOKS_DIR, slug + '.html'))) return json(res, 200, {});
      return json(res, 404, { error: 'Book not found' });
    }

    // ---------- GET book folder list ----------
    if (p === 'books' && req.method === 'GET') {
      const store = readStore();
      return json(res, 200, { store: store.books, files: fs.readdirSync(BOOKS_DIR).filter(f => f.endsWith('.html')) });
    }

    // ---------- Public library index ----------
    // Book text is public by nature, but the admin store carries internal
    // bookkeeping (isNew, addedAt, ids) that no reader needs. This is the only
    // unauthenticated surface for admin-created books, and it deliberately
    // projects a narrow set of fields.
    if (p === 'library' && req.method === 'GET') {
      const store = readStore();
      return json(res, 200, {
        books: (store.books || []).map(b => ({
          slug: b.slug, en: b.en || b.title, te: b.te || '', deity: b.deity || '',
          meta: b.meta || '', chapters: b.chapters || [], isNew: !!b.isNew,
          source: b.source || 'admin',
        })),
      });
    }

    // ---------- DELETE book ----------
    // Previously the UI only removed the entry from the admin store. The
    // per-book JSON on disk was left behind and the dynamic route kept serving
    // the page at HTTP 200, so "deleted" books stayed publicly reachable.
    if (/^book\//.test(p) && req.method === 'DELETE') {
      if (!authed(req)) return json(res, 401, { error: 'Not authorised' });
      const slug = decodeURIComponent(p.slice(5));
      if (!/^[a-z0-9][a-z0-9\-]*$/i.test(slug)) return json(res, 400, { error: 'Invalid slug' });
      const store = readStore();
      const before = (store.books || []).length;
      store.books = (store.books || []).filter(b => b.slug !== slug);
      const wasAdminBook = store.books.length !== before;
      writeStore(store);
      // Remove the content file that feeds the dynamic book route.
      const contentFile = path.join(CONTENT_DIR, 'books', slug + '.json');
      let removedContent = false;
      if (fs.existsSync(contentFile)) { fs.unlinkSync(contentFile); removedContent = true; }
      // A generated static page would keep serving too, so clear it and let the
      // rebuild regenerate the listing without this title.
      const staticPage = path.join(BOOKS_DIR, slug + '.html');
      let removedPage = false;
      if (fs.existsSync(staticPage)) { fs.unlinkSync(staticPage); removedPage = true; }
      return runBuild().then(() => json(res, 200, {
        ok: true, slug, wasAdminBook, removedContent, removedPage,
      }));
    }

    // ---------- DELETE media ----------
    if (/^media\//.test(p) && req.method === 'DELETE') {
      if (!authed(req)) return json(res, 401, { error: 'Not authorised' });
      const rel = decodeURIComponent(url.slice(11));
      const target = path.normalize(path.join(MEDIA_DIR, rel));
      if (!target.startsWith(MEDIA_DIR)) return json(res, 403, { error: 'Forbidden' });
      if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
      rebuildAudioManifest();
      return json(res, 200, { ok: true });
    }

    // ---------- POST OCR image/PDF (admin) ----------
    if (p === 'ocr' && req.method === 'POST') {
      if (!authed(req)) return json(res, 401, { error: 'Not authorised' });
      return collectUploads(req).then(async ({ files }) => {
        const f = files.find(x => /\.(pdf|png|jpe?g|webp|bmp|tiff?)$/i.test(x.filename));
        if (!f) return json(res, 400, { error: 'Upload a PDF or image' });
        const tmp = path.join(UPLOAD_DIR, uniquePath(f.filename));
        fs.writeFileSync(tmp, f.data);
        const text = await ocrFile(tmp, f.filename);
        try { fs.unlinkSync(tmp); } catch (_) {}
        if (!text) return json(res, 422, { error: 'OCR could not read this file. Install Tesseract OCR and language packs (English/Telugu).' });
        json(res, 200, { ok: true, text, filename: f.filename, wordCount: text.split(/\s+/).filter(Boolean).length });
      });
    }

    // ---------- POST extract PDF text (admin) ----------
    if (p === 'extract-pdf' && req.method === 'POST') {
      if (!authed(req)) return json(res, 401, { error: 'Not authorised' });
      return collectUploads(req).then(async ({ files }) => {
        const pdf = files.find(f => /\.pdf$/i.test(f.filename));
        if (!pdf) return json(res, 400, { error: 'No PDF file provided' });
        const tmp = path.join(UPLOAD_DIR, uniquePath(pdf.filename));
        fs.writeFileSync(tmp, pdf.data);
        const text = await extractPdfText(tmp);
        if (/^ERROR:/.test(text.trim())) return json(res, 422, { error: 'PDF text extraction failed — install pdfminer.six in .venv: pip install pdfminer.six', detail: text.trim() });
        json(res, 200, { ok: true, text, filename: pdf.filename, wordCount: text.trim().split(/\s+/).length });
      });
    }

    // ---------- POST update audio metadata (admin) ----------
    if (p === 'audio-meta' && req.method === 'POST') {
      if (!authed(req)) return json(res, 401, { error: 'Not authorised' });
      return collectUploads(req).then(({ fields }) => {
        try {
          const meta = JSON.parse(fields.data || '{}');
          if (!meta.url || !meta.name) return json(res, 400, { error: 'Need url + name' });
          // url like /media/audio/folder/file.mp3
          const m = String(meta.url).match(/^\/media\/audio\/([^/]+)\/([^/]+)$/);
          if (!m) return json(res, 400, { error: 'Invalid audio URL' });
          const folder = m[1];
          const file = m[2];
          const target = path.normalize(path.join(MEDIA_DIR, 'audio', folder, file));
          if (!target.startsWith(MEDIA_DIR)) return json(res, 403, { error: 'Forbidden path' });
          if (!fs.existsSync(target)) return json(res, 404, { error: 'File not found' });
          // Store metadata in the admin store
          const store = readStore();
          store.audio = store.audio || [];
          const idx = store.audio.findIndex(a => a.url === meta.url);
          const entry = { url: meta.url, folder, file, name: meta.name, deity: meta.deity || 'library', updated: new Date().toISOString() };
          if (idx >= 0) store.audio[idx] = entry; else store.audio.push(entry);
          writeStore(store);
          json(res, 200, { ok: true, entry });
        } catch (e) { json(res, 400, { error: 'Bad JSON — ' + e.message }); }
      });
    }

    // ---------- deity content (stotras, poojas, mantras, prasadam, homa) -----
    // These 279 items lived only in content/<slug>-content.js with no admin
    // surface, so correcting a typo in a stotra meant editing source by hand.
    if (p === 'deity-content/index' && req.method === 'GET') {
      if (!authed(req)) return json(res, 401, { error: 'Not authorised' });
      return json(res, 200, { kinds: DC_STORE.KINDS, bodyField: DC_STORE.BODY_FIELD, deities: DC_STORE.index() });
    }

    if (p === 'deity-content' && req.method === 'GET') {
      if (!authed(req)) return json(res, 401, { error: 'Not authorised' });
      const slug = String(query.deity || '').trim();
      if (!/^[a-z0-9][a-z0-9\-]*$/i.test(slug)) return json(res, 400, { error: 'Invalid deity slug' });
      const data = DC_STORE.read(slug);
      if (!data) return json(res, 404, { error: 'No content file for ' + slug });
      if (data.__error) return json(res, 500, { error: data.__error });
      return json(res, 200, data);
    }

    // Upsert or delete a single item, then republish.
    if (p === 'deity-content' && req.method === 'POST') {
      if (!authed(req)) return json(res, 401, { error: 'Not authorised' });
      return collectUploads(req).then(async ({ fields }) => {
        let msg;
        try { msg = JSON.parse(fields.data || '{}'); }
        catch (e) { return json(res, 400, { error: 'Bad JSON — ' + e.message }); }
        const slug = String(msg.deity || '').trim();
        const kind = String(msg.kind || '').trim();
        if (!/^[a-z0-9][a-z0-9\-]*$/i.test(slug)) return json(res, 400, { error: 'Invalid deity slug' });
        if (!DC_STORE.KINDS.includes(kind)) return json(res, 400, { error: 'Unknown content kind' });

        const data = DC_STORE.read(slug);
        if (!data || data.__error) return json(res, 404, { error: 'No content file for ' + slug });
        if (!Array.isArray(data[kind])) data[kind] = [];

        if (msg.op === 'delete') {
          const before = data[kind].length;
          data[kind] = data[kind].filter(it => it.slug !== msg.itemSlug);
          if (data[kind].length === before) return json(res, 404, { error: 'No item with slug ' + msg.itemSlug });
          DC_STORE.write(slug, data);
          // build.js emits one page per item, and it never prunes pages for items
          // that no longer exist. Without this, a deleted stotra kept its own
          // page published and reachable -- the same orphan the book delete had.
          const pageDirs = { stotras: 'stotras', poojas: 'poojas', mantras: 'mantras', homa: 'homa', prasadam: 'prasadam' };
          const dir = pageDirs[kind];
          let removedPage = false;
          if (dir) {
            const page = path.join(root, dir, msg.itemSlug + '.html');
            if (fs.existsSync(page)) { fs.unlinkSync(page); removedPage = true; }
          }
          return runBuild().then(() => json(res, 200, {
            ok: true, op: 'delete', remaining: data[kind].length, removedPage, published: true,
          }));
        }

        const item = msg.item || {};
        item.slug = DC_STORE.ensureSlug(item.slug, item.te, item.en);
        if (!item.slug) return json(res, 400, { error: 'An item needs a slug or a title' });
        item.te = String(item.te || '');
        item.en = String(item.en || '');
        if (!item.te && !item.en) return json(res, 400, { error: 'An item needs Telugu or English text' });
        if (Array.isArray(msg.body)) {
          const field = DC_STORE.BODY_FIELD[kind];
          item[field] = msg.body.map(x => String(x)).filter(x => x.trim().length);
        }
        const idx = data[kind].findIndex(it => it.slug === item.slug);
        if (idx >= 0) data[kind][idx] = Object.assign({}, data[kind][idx], item);
        else data[kind].push(item);
        DC_STORE.write(slug, data);
        return runBuild().then(() => json(res, 200, {
          ok: true, op: idx >= 0 ? 'update' : 'create', slug: item.slug,
          count: data[kind].length, published: true,
        }));
      });
    }

    // ---------- publishing ----------
    if (p === 'publish' && req.method === 'POST') {
      if (!authed(req)) return json(res, 401, { error: 'Not authorised' });
      return runBuild().then(state => json(res, state.ok ? 200 : 500, {
        ok: !!state.ok, at: state.at, error: state.error, log: state.log,
      }));
    }
    if (p === 'publish-status' && req.method === 'GET') {
      return json(res, 200, buildState);
    }

    // ---------- GET health ----------
    if (p === 'health') return json(res, 200, { ok: true, name: 'Saptarushi server', port });

    return json(res, 404, { error: 'Unknown API route: /api/' + p });
  }

  // =================== Static files ===================
  if (url === '/') url = '/index.html';

  // directory listing for /media
  if (url === '/media' || url === '/media/') {
    return json(res, 200, rebuildAudioManifest());
  }

  const file = path.normalize(path.join(root, url));
  if (!file.startsWith(root + path.sep) && file !== path.join(root, 'index.html')) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  // books created in the admin portal have no static page — serve a reader shell
  if (!fs.existsSync(file) && /^\/books\/[a-z0-9\-]+\.html$/.test(url)) {
    const slug = url.split('/').pop().replace(/\.html$/, '');
    try {
      const book = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, 'books', slug + '.json'), 'utf-8'));
      if (book) {
        const shell = generateBookPage(book);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': Buffer.byteLength(shell) });
        return res.end(shell);
      }
    } catch (_) { /* fall through to 404 */ }
  }
  if (!fs.existsSync(file) && /^\/audio\/[a-z0-9\-]+\.html$/.test(url)) {
    const slug = url.split('/').pop().replace(/\.html$/, '');
    const store = readStore();
    const storedTrack = (store.audio || []).find(item => item.slug === slug);
    const track = storedTrack || {
      slug,
      name: query.name || slug,
      en: query.en || query.name || slug,
      te: query.te || '',
      deity: query.deity || 'library',
      url: query.url || '',
      file: query.file || '',
      folder: query.folder || ''
    };
    if (track) {
      const shell = generateAudioPage(track);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': Buffer.byteLength(shell) });
      return res.end(shell);
    }
  }
  // ---------------------------------------------------------------------
  // Audio/video files: stream with HTTP Range support instead of loading
  // the whole file into memory. Without this, scrubbing/seeking in the
  // player breaks, some mobile browsers (notably iOS Safari) refuse to
  // play the file at all, and the whole mp3 gets buffered into RAM per
  // request even if the listener only plays the first 10 seconds.
  // ---------------------------------------------------------------------
  const ext = path.extname(file).toLowerCase();
  const STREAMED_EXTS = new Set(['.mp3', '.wav', '.ogg', '.oga', '.m4a', '.aac', '.flac', '.opus', '.webm', '.mp4']);
  if (STREAMED_EXTS.has(ext)) {
    return fs.stat(file, (statErr, stat) => {
      if (statErr) { res.writeHead(404); return res.end('Not found'); }
      const mime = MIME[ext] || 'application/octet-stream';
      const range = req.headers.range;
      const commonHeaders = {
        'Content-Type': mime,
        'Accept-Ranges': 'bytes',
        // audio files rarely change once uploaded — let the browser cache them
        'Cache-Control': 'public, max-age=604800',
      };
      if (!range) {
        // No range requested — send the whole file, but still as a stream
        // (not buffered into memory) and still advertise range support.
        res.writeHead(200, Object.assign({ 'Content-Length': stat.size }, commonHeaders));
        return fs.createReadStream(file).pipe(res);
      }
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) { res.writeHead(416, { 'Content-Range': 'bytes */' + stat.size }); return res.end(); }
      let start = match[1] ? parseInt(match[1], 10) : 0;
      let end = match[2] ? parseInt(match[2], 10) : stat.size - 1;
      if (isNaN(start) || isNaN(end) || start > end || end >= stat.size) {
        res.writeHead(416, { 'Content-Range': 'bytes */' + stat.size });
        return res.end();
      }
      res.writeHead(206, Object.assign({
        'Content-Range': 'bytes ' + start + '-' + end + '/' + stat.size,
        'Content-Length': (end - start + 1),
      }, commonHeaders));
      fs.createReadStream(file, { start, end }).pipe(res);
    });
  }

  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(file).toLowerCase();
    // List pages get admin-created books spliced in, so a title saved in the
    // admin portal is actually discoverable without a rebuild.
    if (ext === '.html') {
      let html = data.toString('utf8');
      // Replace the build's marker rather than pattern-matching markup, so a
      // change to the surrounding template cannot silently break this.
      const slotMark = '<!--ADMIN_BOOKS-->';
      if (html.includes(slotMark)) {
        html = html.split(slotMark).join(adminBookCards());
        const body = Buffer.from(html, 'utf8');
        res.writeHead(200, { 'Content-Type': MIME['.html'], 'Content-Length': body.length });
        return res.end(body);
      }
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, () => {
  console.log('Saptarushi serving at http://localhost:' + port);
  console.log('Admin portal:  http://localhost:' + port + '/admin.html');
});