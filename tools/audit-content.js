// tools/audit-content.js — site-wide content consistency audit.
//
// Reports scraped site furniture that leaked into scripture, missing content,
// duplicates and empty fields. Read-only: it never writes.
//
// Run:  node tools/audit-content.js

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let problems = 0;
const note = (msg) => { problems++; console.log('  !! ' + msg); };

// ---------------------------------------------------------------- noise rules
const NOISE = {
  'breadcrumb trail': /→/,
  'buy prompt': /Click here to buy/i,
  'language bar': /Read in తెలుగు/i,
  'print advert': /తదుపరి ప్రచురణ|వాట్సాప్/,
  'reader disclaimer': /విప్రులకు, ద్విజులకు/,
  'HTML comment marker': /^\/\//,
  'nav marker': />>\s*$|<<\s*$/,
  'comment login prompt': /వ్యాఖ్యానించడానికి/,
  'UI prompt': /ఈ శ్లోకాల అర్థం పెట్టండి/,
  'reader comment': /ధన్యవాదములు|బాగుంది అయ్యా|నమస్తే అండి/,
  'promo line': /ఇప్పుడు ఆపదుద్ధారక/,
  'print-book promo': /^శ్రీ .*స్తోత్రనిధి$/,
};

// Rules that only apply to SCRAPED sources. "గమనిక" means "note:" and is a
// perfectly legitimate word in a hand-written ritual instruction
// ("గమనిక: ముందుగా పూర్వాంగం చేయవలెను." = "this must be done first"), but on
// the scraped pages it only ever introduces a print advert. Applying it to
// hand-authored content would flag, and eventually delete, real scripture.
const SCRAPED_ONLY = {
  'book advert': /గమనిక/,
  'Stotra Nidhi advert': /స్తోత్రనిధి$/,
  'more-links nav': /మరిన్ని |చూడండి/,
};
// Fetches of an external site legitimately carry a `src` provenance URL.
const isProvenance = (s, it) => typeof it.src === 'string' && s.trim() === it.src.trim();

console.log('=== 1. scraped site furniture in scripture text ===');
{
  let hits = 0;
  let checked = 0;

  const SCRAPED_RULES = Object.assign({}, NOISE, SCRAPED_ONLY);

  // stotras.json (the scraped Stotra Nidhi library)
  const ST = JSON.parse(fs.readFileSync(path.join(ROOT, 'stotras.json'), 'utf8')).items;
  ST.forEach((s) => {
    (s.paras || []).forEach((p, i) => {
      checked++;
      for (const [label, re] of Object.entries(SCRAPED_RULES)) {
        if (re.test(p) && !isProvenance(p, s)) {
          console.log(`  !! ${s.slug} para[${i}] [${label}]: ${JSON.stringify(p.slice(0, 72))}`);
          hits++;
        }
      }
    });
  });

  // The scraped Durga Saptashati book.
  {
    const D = require(path.join(ROOT, 'content', 'durga-saptashati-content.js'));
    (D.books[0].chapters || []).forEach((c) => (c.paras || []).forEach((p) => {
      checked++;
      for (const [label, re] of Object.entries(SCRAPED_RULES)) {
        if (re.test(p)) { console.log(`  !! durga-saptashati [${label}]: ${JSON.stringify(p.slice(0, 72))}`); hits++; }
      }
    }));
  }

  // The scraped sahasranamam books.
  ['vishnu', 'lalitha', 'sita'].forEach((n) => {
    let m;
    try { m = require(path.join(ROOT, 'content', n + '-sahasranamam-content.js')); } catch (e) { return; }
    (m.books[0].chapters || []).forEach((c) => (c.paras || []).forEach((p) => {
      checked++;
      for (const [label, re] of Object.entries(SCRAPED_RULES)) {
        if (re.test(p)) { console.log(`  !! ${n}-sahasranamam [${label}]: ${JSON.stringify(p.slice(0, 72))}`); hits++; }
      }
    }));
  });

  // Hand-authored per-deity content: universal rules only.
  const dir = path.join(ROOT, 'content');
  fs.readdirSync(dir).filter((f) => f.endsWith('.js') && !/sahasranamam|durga-saptashati/.test(f)).forEach((f) => {
    let mod;
    try { mod = require(path.join(dir, f)); } catch (e) { return; }
    ['stotras', 'poojas', 'mantras', 'homa', 'prasadam'].forEach((k) => {
      (mod[k] || []).forEach((it) => {
        if (!it) return;
        const texts = [];
        if (Array.isArray(it.paras)) texts.push(...it.paras);
        if (Array.isArray(it.verses)) texts.push(...it.verses);
        if (Array.isArray(it.steps)) texts.push(...it.steps.map((x) => x && x.text));
        if (it.mantra) texts.push(it.mantra);
        (it.chapters || []).forEach((c) => texts.push(...(c.paras || [])));
        texts.forEach((p) => {
          if (typeof p !== 'string') return;
          checked++;
          for (const [label, re] of Object.entries(NOISE)) {
            if (re.test(p)) {
              console.log(`  !! ${f} ${it.slug || ''} [${label}]: ${JSON.stringify(p.slice(0, 72))}`);
              hits++;
            }
          }
        });
      });
    });
  });

  if (!hits) console.log('  clean: ' + checked + ' scripture lines scanned, no furniture found');
  else { problems += hits; console.log('  -> ' + hits + ' contaminated lines'); }
}

console.log('');
console.log('=== 2. deities with no content of any kind ===');
{
  const D = require(path.join(ROOT, 'data.js'));
  const files = fs.readdirSync(path.join(ROOT, 'content'))
    .filter((f) => /-content\.js$/.test(f))
    .map((f) => f.replace(/-content\.js$/, ''));
  const empty = [];
  D.deities.forEach((d) => {
    const wants = d.content && Object.values(d.content).some(Boolean);
    const has = files.includes(d.slug);
    if (wants && !has) empty.push(d.slug + ' (declares content, no content/' + d.slug + '-content.js)');
  });
  if (!empty.length) console.log('  clean: every deity that declares content has a content file');
  else empty.forEach((e) => note('deity without content file: ' + e));
}

console.log('');
console.log('=== 3. deities with no image ===');
{
  const D = require(path.join(ROOT, 'data.js'));
  const files = fs.readdirSync(path.join(ROOT, 'assets', 'deities'));
  const exts = ['.jpg', '.png', '.svg', '.webp'];
  const missing = D.deities.filter((d) => !exts.some((e) => files.includes(d.slug + e)));
  if (!missing.length) console.log('  clean: all ' + D.deities.length + ' deities have artwork');
  else console.log('  ' + missing.length + ' deities rely on the neutral placeholder: ' + missing.map((d) => d.slug).join(', '));
}

console.log('');
console.log('=== 4. temples with no image ===');
{
  const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'temples.json'), 'utf8')).items;
  const missing = T.filter((t) => {
    for (const suffix of ['-temple', '-deity', '-sanctum']) {
      for (const e of ['.jpg', '.png', '.webp']) {
        if (fs.existsSync(path.join(ROOT, 'assets', 'temples', t.category, t.id + suffix + e))) return false;
      }
    }
    return true;
  });
  if (!missing.length) console.log('  clean: all ' + T.length + ' temples have artwork');
  else console.log('  ' + missing.length + ' temples without artwork: ' + missing.map((t) => t.id).join(', '));
}

console.log('');
console.log('=== 5. duplicate slugs across all content files ===');
{
  const dir = path.join(ROOT, 'content');
  const seen = new Map();
  let dupes = 0;
  fs.readdirSync(dir).filter((f) => f.endsWith('.js')).forEach((f) => {
    let mod;
    try { mod = require(path.join(dir, f)); } catch (e) { return; }
    ['stotras', 'poojas', 'mantras', 'homa', 'prasadam', 'books'].forEach((k) => {
      (mod[k] || []).forEach((it) => {
        if (!it || !it.slug) return;
        const key = k + ':' + it.slug;
        if (seen.has(key)) { note('duplicate ' + key + ' in ' + f + ' and ' + seen.get(key)); dupes++; }
        else seen.set(key, f);
      });
    });
  });
  if (!dupes) console.log('  clean: ' + seen.size + ' content items, all slugs unique');
}

console.log('');
console.log('=== 6. content items missing required text ===');
{
  const dir = path.join(ROOT, 'content');
  let n = 0;
  fs.readdirSync(dir).filter((f) => f.endsWith('.js')).forEach((f) => {
    let mod;
    try { mod = require(path.join(dir, f)); } catch (e) { return; }
    ['stotras', 'poojas', 'mantras', 'homa'].forEach((k) => {
      (mod[k] || []).forEach((it) => {
        if (!it || !it.slug) return;
        const bad = [];
        if (!it.te) bad.push('te');
        if (!it.en) bad.push('en');
        if (k === 'stotras' && !(it.verses || []).length) bad.push('verses');
        if (k === 'poojas' && !(it.steps || []).length) bad.push('steps');
        if (k === 'mantras' && !it.mantra) bad.push('mantra');
        if (bad.length) { note(f + ' ' + it.slug + ' missing ' + bad.join(',')); n++; }
      });
    });
  });
  if (!n) console.log('  clean: every stotra/pooja/mantra/homa has text');
}

console.log('');
console.log('=== 7. books with empty or missing chapters ===');
{
  const D = require(path.join(ROOT, 'data.js'));
  let n = 0;
  D.books.forEach((b) => {
    if (b.comingSoon) return;
    if (!(b.chapters || []).length) { note('book has no chapters: ' + b.slug); n++; return; }
    b.chapters.forEach((c) => {
      if (!(c.paras || []).filter(Boolean).length) { note('empty chapter in ' + b.slug + ': ' + c.title); n++; }
      if (!c.title) { note('chapter without title in ' + b.slug); n++; }
    });
  });
  if (!n) console.log('  clean: ' + D.books.length + ' books all have titled chapters with text');
}

console.log('');
console.log('=== 8. generated pages with an empty content panel ===');
{
  let n = 0;
  ['deity', 'stotras', 'mantras', 'poojas', 'homa', 'prasadam'].forEach((dir) => {
    const full = path.join(ROOT, dir);
    if (!fs.existsSync(full)) return;
    fs.readdirSync(full).filter((f) => f.endsWith('.html')).forEach((f) => {
      const html = fs.readFileSync(path.join(full, f), 'utf8');
      if (/class="comingsoon-note"/.test(html)) return;
      if (/reading-p"><\/p>|reading-p"><\/div>/.test(html)) { note(dir + '/' + f + ' has an empty paragraph'); n++; }
    });
  });
  if (!n) console.log('  clean: no empty paragraphs in generated pages');
}

console.log('');
console.log('=== 9. search index coverage ===');
{
  const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'search-index.json'), 'utf8')).items;
  const D = require(path.join(ROOT, 'data.js'));
  const indexed = new Set(idx.filter((i) => i.type === 'book').map((i) => i.url));
  const missing = D.books.filter((b) => !indexed.has('/books/' + b.slug + '.html'));
  console.log('  index entries: ' + idx.length + ' | books in data.js: ' + D.books.length);
  if (!missing.length) console.log('  clean: every book is in the search index');
  else missing.forEach((b) => note('book missing from search index: ' + b.slug));
}

console.log('');
console.log('=== 10. encoding damage across all tracked text ===');
{
  const { execSync } = require('child_process');
  const files = execSync('git ls-files', { cwd: ROOT }).toString().trim().split('\n')
    .filter((f) => /\.(js|json|html|xml|md|css|txt)$/.test(f));
  let n = 0;
  files.forEach((f) => {
    const full = path.join(ROOT, f);
    if (!fs.existsSync(full)) return;
    const txt = fs.readFileSync(full, 'utf8');
    const fffd = (txt.match(/\uFFFD/g) || []).length;
    if (fffd) { note(f + ' contains ' + fffd + ' U+FFFD replacement characters'); n += fffd; }
  });
  if (!n) console.log('  clean: no U+FFFD in any of the ' + files.length + ' tracked text files');
}

console.log('');
console.log(problems === 0
  ? '=== AUDIT CLEAN: no problems found ==='
  : '=== ' + problems + ' problem(s) found ===');