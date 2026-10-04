// build-search-index.js
// Generates search-index.json by walking content/ and data.js.
// Run: node build-search-index.js (or require it in build.js)

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, 'content');

const D = require('./data.js');
const index = [];
let id = 0;
const add = (e) => index.push({ id: ++id, ...e });

// 1. Content files
const deityBySlug = {};
(D.deities || []).forEach(d => { deityBySlug[d.slug] = d; });

if (fs.existsSync(CONTENT_DIR)) {
  for (const f of fs.readdirSync(CONTENT_DIR).filter(x => x.endsWith('-content.js'))) {
    const slug = f.replace(/-content\.js$/, '');
    let C;
    try {
      delete require.cache[require.resolve(path.join(CONTENT_DIR, f))];
      C = require(path.join(CONTENT_DIR, f));
    } catch (_) { continue; }

    const d = deityBySlug[slug] || {};
    const deityLabel = d.label || C.label || slug;
    const deityTe = d.te || C.te || '';

    ['stotras', 'poojas', 'mantras', 'homa'].forEach(cat => {
      (C[cat] || []).forEach(item => {
        if (!item || !item.slug) return;
        const snippet = cat === 'mantras'
          ? (item.mantra || '') + ' — ' + (item.meaning || '')
          : cat === 'poojas'
            ? (item.steps || []).slice(0, 2).map(s => s.text).join(' ')
            : cat === 'homa'
              ? (item.note || '')
              : (item.verses || []).slice(0, 3).join(' ');
        add({
          // Explicit map: cat.slice(0, -1) turned 'homa' into 'hom'.
          // Singular index types: stotra, pooja, mantra, homa.
          type: { stotras: 'stotra', poojas: 'pooja', mantras: 'mantra', homa: 'homa' }[cat] || cat,
          deity: slug,
          deityLabel,
          title: item.en || item.te || item.slug,
          titleTe: item.te || '',
          subtitle: item.type || '',
          url: `/${cat}/${item.slug}.html`,
          snippet: snippet.slice(0, 200),
          keywords: [item.slug, item.en, item.te, item.type, deityLabel, deityTe].filter(Boolean).join(' ')
        });
      });
    });

    (C.prasadam || []).forEach(p => {
      (p.items || []).forEach(it => {
        add({
          type: 'prasadam',
          deity: slug,
          deityLabel,
          title: `${deityLabel} Prasadam — ${it.dish || ''}`,
          titleTe: it.dish || '',
          subtitle: it.quantity || '',
          url: `/prasadam/${p.slug || slug}.html`,
          snippet: it.recipe || '',
          keywords: [it.dish, it.deity, deityLabel, 'prasadam'].filter(Boolean).join(' ')
        });
      });
    });
  }
}

// 2. Books
(D.books || []).forEach(b => {
  if (!b || !b.slug) return;
  add({
    type: 'book',
    deity: b.deity || '',
    deityLabel: (deityBySlug[b.deity] || {}).label || '',
    title: b.en || b.te || b.slug,
    titleTe: b.te || '',
    subtitle: b.meta || 'Book',
    url: `/books/${b.slug}.html`,
    snippet: (b.chapters || []).slice(0, 1).flatMap(c => c.paras || []).join(' ').slice(0, 200),
    keywords: [b.slug, b.en, b.te, b.meta].filter(Boolean).join(' ')
  });
});

// 3. Deities
(D.deities || []).forEach(d => {
  add({
    type: 'deity',
    deity: d.slug,
    deityLabel: d.label,
    title: d.label,
    titleTe: d.te || '',
    subtitle: 'Deity',
    url: `/deity/${d.slug}.html`,
    snippet: d.desc || '',
    keywords: [d.slug, d.label, d.te, d.desc].filter(Boolean).join(' ')
  });
});

// 4. Temples
try {
  const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'temples.json'), 'utf8'));
  (T.items || []).forEach(t => {
    add({
      type: 'temple',
      deity: '',
      deityLabel: t.deity || '',
      title: t.name,
      titleTe: '',
      subtitle: t.location || '',
      url: `/temples/${t.id}.html`,
      snippet: (t.story || '').slice(0, 200),
      keywords: [t.name, t.temple, t.deity, t.city, t.state, t.location].filter(Boolean).join(' ')
    });
  });
} catch (_) {}

fs.writeFileSync(path.join(ROOT, 'search-index.json'), JSON.stringify({
  version: 1,
  generated: new Date().toISOString(),
  count: index.length,
  items: index
}));
console.log(`✓ search-index.json — ${index.length} entries`);