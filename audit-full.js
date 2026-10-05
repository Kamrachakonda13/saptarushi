// audit-full.js
// Full project audit. Run: node audit-full.js
// Outputs a structured report. Does not modify anything.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, 'content');
const TELUGU = /[\u0C00-\u0C7F]/;
const LATIN = /[A-Za-z]/;
// Foreign scripts to flag
const FOREIGN = {
  Devanagari: /[\u0900-\u097F]/g,
  Kannada:    /[\u0C80-\u0CFF]/g,
  Malayalam:  /[\u0D00-\u0D7F]/g,
  Tamil:      /[\u0B80-\u0BFF]/g,
  Cyrillic:   /[\u0400-\u04FF]/g,
  Arabic:     /[\u0600-\u06FF]/g,
  Burmese:    /[\u1000-\u109F]/g,
  Thai:       /[\u0E00-\u0E7F]/g,
  CJK:        /[\u4E00-\u9FFF]/g,
  Korean:     /[\uAC00-\uD7AF]/g,
  Japanese:   /[\u3040-\u30FF]/g,
};

const R = { ok: [], warn: [], fail: [], info: [] };
function OK(msg)   { R.ok.push(msg);   console.log('  ✓ ' + msg); }
function WARN(msg) { R.warn.push(msg); console.log('  ⚠ ' + msg); }
function FAIL(msg) { R.fail.push(msg); console.log('  ✗ ' + msg); }
function INFO(msg) { R.info.push(msg); console.log('  · ' + msg); }

// ============================================================
console.log('\n══════════════════════════════════════════');
console.log(' FULL PROJECT AUDIT');
console.log('══════════════════════════════════════════\n');

// ---------- 1. CORE FILES ----------
console.log('▶ Core files');
const REQUIRED = [
  'index.html', 'books.html', 'about.html', 'temples.html', 'panchangam.html',
  'styles.css', 'app.js', 'build.js', 'serve.js', 'data.js',
  'sankalpam-regions.js', 'sankalpam-widget.js', 'sankalpam-sync.js',
  'sankalpam-quick.js', 'panchang-app.js',
  'search.js', 'feed.xml', 'search-index.json', 'temples.json',
];
REQUIRED.forEach(f => {
  fs.existsSync(path.join(ROOT, f)) ? OK(f) : FAIL('missing ' + f);
});
// Optional
['audio.html', 'admin.html'].forEach(f => {
  const exists = fs.existsSync(path.join(ROOT, f));
  INFO(f + ': ' + (exists ? 'present' : 'absent (feature hidden?)'));
});

// ---------- 2. DATA.JS PARSE ----------
console.log('\n▶ data.js');
let D = null;
try {
  D = require('./data.js');
  OK('data.js loads cleanly');
  OK('deities: ' + (D.deities || []).length);
  OK('books: ' + (D.books || []).length);
  OK('audio: ' + (D.audio || []).length);
  OK('features: ' + JSON.stringify(D.features || {}));
} catch (e) {
  FAIL('data.js: ' + e.message);
}

// ---------- 3. FEATURE FLAGS ----------
console.log('\n▶ Feature flags');
if (D && D.features) {
  if (D.features.audio === false) OK('audio hidden (feature flag)');
  else WARN('audio is visible');
}

// ---------- 4. CONTENT FILES ----------
console.log('\n▶ Content files');
let contentFiles = [];
if (fs.existsSync(CONTENT_DIR)) {
  contentFiles = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('-content.js'));
  OK(contentFiles.length + ' content files found');
  contentFiles.forEach(f => {
    const p = path.join(CONTENT_DIR, f);
    const src = fs.readFileSync(p, 'utf8');
    // Syntax check
    try {
      delete require.cache[require.resolve(p)];
      const C = require(p);
      const counts = [
        'stotras:' + ((C.stotras || []).length),
        'poojas:' + ((C.poojas || []).length),
        'mantras:' + ((C.mantras || []).length),
        'prasadam:' + ((C.prasadam || []).length),
        'homa:' + ((C.homa || []).length),
      ].join(' ');
      // Foreign-script check
      let foreign = [];
      Object.keys(FOREIGN).forEach(name => {
        const m = src.match(FOREIGN[name]);
        if (m) foreign.push(name + ':' + m.length);
      });
      const verified = C.verified ? `verified:${C.verified.confidence || '?'}` : 'unverified';
      const tag = foreign.length ? ' ⚠ ' + foreign.join(',') : '';
      const line = f.padEnd(38) + ' ' + counts.padEnd(60) + ' ' + verified + tag;
      if (foreign.length) WARN(line); else OK(line);
    } catch (e) {
      FAIL(f + ': ' + e.message);
    }
  });
}

// ---------- 5. STANDALONE STOTRA FILES ----------
console.log('\n▶ Standalone stotra files');
['lalitha-sahasranamam.js', 'sita-sahasranamam.js', 'lalitha-trishati.js', 'vishnu-sahasranamam.js'].forEach(f => {
  const p = path.join(CONTENT_DIR, f);
  if (!fs.existsSync(p)) { WARN('missing ' + f); return; }
  try {
    delete require.cache[require.resolve(p)];
    const M = require(p);
    const verseCount = (M.verses || []).length;
    const namavaliCount = (M.namavali || []).length;
    OK(f.padEnd(38) + ' verses:' + verseCount + (namavaliCount ? ' namavali:' + namavaliCount : ''));
  } catch (e) {
    FAIL(f + ': ' + e.message);
  }
});

// ---------- 6. DEITY REGISTRATION ----------
console.log('\n▶ Deity registration');
if (D && fs.existsSync(CONTENT_DIR)) {
  const registered = new Set((D.deities || []).map(d => d.slug));
  const fileSlugs = new Set(contentFiles.map(f => f.replace(/-content\.js$/, '')));
  // Files not registered
  let orphanFiles = [...fileSlugs].filter(s => !registered.has(s));
  if (orphanFiles.length) {
    WARN('content files not registered in data.js:');
    orphanFiles.forEach(s => console.log('      ' + s));
  } else {
    OK('every content file is registered');
  }
  // Registered but no file
  let missingFiles = (D.deities || []).filter(d => {
    const hasFlag = d.content && Object.values(d.content).some(v => v);
    const hasFile = fs.existsSync(path.join(CONTENT_DIR, d.slug + '-content.js'));
    return hasFlag && !hasFile;
  });
  if (missingFiles.length) {
    WARN('deities with content flag but no file:');
    missingFiles.forEach(d => console.log('      ' + d.slug));
  } else {
    OK('every flagged deity has a content file');
  }
  // Registered deities with all-false flags but a file exists
  let flagOff = (D.deities || []).filter(d => {
    const allOff = !d.content || !Object.values(d.content).some(v => v);
    const hasFile = fs.existsSync(path.join(CONTENT_DIR, d.slug + '-content.js'));
    if (!allOff || !hasFile) return false;
    try {
      const C = require(path.join(CONTENT_DIR, d.slug + '-content.js'));
      const hasContent = ['stotras','poojas','mantras','prasadam','homa'].some(k => (C[k] || []).length);
      return hasContent;
    } catch (_) { return false; }
  });
  if (flagOff.length) {
    WARN('content exists but flags are OFF:');
    flagOff.forEach(d => console.log('      ' + d.slug));
  } else {
    OK('no dormant content waiting on flags');
  }
}

// ---------- 7. GENERATED PAGES ----------
console.log('\n▶ Generated pages');
const genPages = ['index.html', 'books.html', 'about.html', 'temples.html', 'panchangam.html'];
genPages.forEach(f => {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) { FAIL('missing ' + f); return; }
  const src = fs.readFileSync(p, 'utf8');
  const corruptions = [];
  Object.keys(FOREIGN).forEach(name => {
    const m = src.match(FOREIGN[name]);
    if (m) corruptions.push(name + ':' + m.length);
  });
  if (corruptions.length) WARN(f + ' has foreign scripts: ' + corruptions.join(','));
  else OK(f);
});

// ---------- 8. DEITY PAGES ----------
console.log('\n▶ Deity pages');
const deityDir = path.join(ROOT, 'deity');
if (fs.existsSync(deityDir)) {
  const pages = fs.readdirSync(deityDir).filter(f => f.endsWith('.html'));
  OK(pages.length + ' deity pages generated');
  if (D) {
    const registered = (D.deities || []).length;
    if (pages.length < registered) {
      WARN('registered ' + registered + ' but only ' + pages.length + ' pages generated');
    } else {
      OK('page count matches or exceeds registered deities');
    }
  }
} else {
  FAIL('deity/ directory missing');
}

// ---------- 9. STOTRA / POOJA / MANTRA / PRASADAM / HOMA PAGES ----------
console.log('\n▶ Content detail pages');
['stotras', 'poojas', 'mantras', 'prasadam', 'homa'].forEach(kind => {
  const dir = path.join(ROOT, kind);
  if (!fs.existsSync(dir)) { WARN(kind + '/ missing'); return; }
  const pages = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  OK(kind.padEnd(10) + ' ' + pages.length + ' pages');
});

// ---------- 10. TEMPLE PAGES ----------
console.log('\n▶ Temple pages');
const templeDir = path.join(ROOT, 'temples');
if (fs.existsSync(templeDir)) {
  const pages = fs.readdirSync(templeDir).filter(f => f.endsWith('.html'));
  OK(pages.length + ' temple pages');
  try {
    const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'temples.json'), 'utf8'));
    OK('temples.json items: ' + (T.items || []).length);
    if (pages.length !== (T.items || []).length) {
      WARN('page count mismatch: ' + pages.length + ' pages vs ' + (T.items || []).length + ' items');
    }
  } catch (e) { FAIL('temples.json: ' + e.message); }
} else {
  WARN('temples/ directory missing');
}

// ---------- 11. ASSETS ----------
console.log('\n▶ Assets');
['assets/deities', 'assets/temples', 'media/audio'].forEach(d => {
  const p = path.join(ROOT, d);
  if (!fs.existsSync(p)) { INFO(d + '/ missing'); return; }
  const count = fs.readdirSync(p).filter(f => !f.startsWith('.')).length;
  OK(d + ' ' + count + ' entries');
});

// ---------- 12. CORRUPTION SWEEP ----------
console.log('\n▶ Corruption sweep (JS files)');
const JS_SCAN = ['sankalpam-regions.js', 'sankalpam-widget.js', 'app.js', 'build.js'];
JS_SCAN.forEach(f => {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) return;
  const src = fs.readFileSync(p, 'utf8');
  const issues = [];
  Object.keys(FOREIGN).forEach(name => {
    const m = src.match(FOREIGN[name]);
    if (m) issues.push(name + ':' + m.length);
  });
  if (issues.length) WARN(f + ': ' + issues.join(','));
  else OK(f + ' clean');
});

// ---------- 13. BOOKS ----------
console.log('\n▶ Book library');
if (D) {
  const total = (D.books || []).length;
  const comingSoon = (D.books || []).filter(b => b.comingSoon).length;
  const withChapters = (D.books || []).filter(b => (b.chapters || []).length).length;
  OK('total books: ' + total);
  OK('with chapters: ' + withChapters);
  if (comingSoon) WARN('comingSoon books: ' + comingSoon);
}

// ---------- 13. SEARCH INDEX ----------
console.log('\n▶ Search index');
const sip = path.join(ROOT, 'search-index.json');
if (fs.existsSync(sip)) {
  try {
    const si = JSON.parse(fs.readFileSync(sip, 'utf8'));
    OK('search-index.json: ' + (si.items || []).length + ' entries');
    const byType = {};
    (si.items || []).forEach(i => { byType[i.type] = (byType[i.type] || 0) + 1; });
    OK('breakdown: ' + JSON.stringify(byType));
  } catch (e) { FAIL('search-index.json: ' + e.message); }
} else {
  WARN('search-index.json missing');
}

// ---------- 14. RSS FEED ----------
console.log('\n▶ RSS feed');
const rssPath = path.join(ROOT, 'feed.xml');
if (fs.existsSync(rssPath)) {
  const src = fs.readFileSync(rssPath, 'utf8');
  const items = (src.match(/<item>/g) || []).length;
  OK('feed.xml: ' + items + ' items');
} else {
  WARN('feed.xml missing');
}

// ---------- 15. ADMIN DATA ----------
console.log('\n▶ Admin data');
['content/admin-data.json', 'content/token.txt'].forEach(f => {
  const exists = fs.existsSync(path.join(ROOT, f));
  INFO(f + ': ' + (exists ? 'present' : 'absent'));
});

// ============================================================
console.log('\n══════════════════════════════════════════');
console.log(' SUMMARY');
console.log('══════════════════════════════════════════');
console.log('  ✓ OK      ' + R.ok.length);
console.log('  ⚠ Warnings ' + R.warn.length);
console.log('  ✗ Fails    ' + R.fail.length);
console.log('  · Info     ' + R.info.length);
console.log('══════════════════════════════════════════\n');

if (R.fail.length) {
  console.log('FAILURES:');
  R.fail.forEach(m => console.log('  ✗ ' + m));
  console.log('');
}
if (R.warn.length) {
  console.log('WARNINGS:');
  R.warn.forEach(m => console.log('  ⚠ ' + m));
  console.log('');
}