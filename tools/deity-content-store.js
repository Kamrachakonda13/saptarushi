// tools/deity-content-store.js
// Read and write the per-deity content files that hold every stotra, pooja,
// mantra, prasadam and homa on the site.
//
// These files are JavaScript, not JSON:
//
//   const ShivaContent = { deity: 'shiva', stotras: [ ... ] };
//   if (typeof module !== 'undefined' && module.exports) module.exports = ShivaContent;
//
// They had no admin surface at all, so the 279 items in them could only be
// changed by hand-editing the source. Rather than patch the text with regexes,
// this reads a file through require(), lets the admin work with plain objects,
// and writes the whole file back from a canonical template. Rewriting normalises
// formatting, so only files that are actually edited change on disk.
//
// Usage:
//   const store = require('./tools/deity-content-store');
//   const data = store.read('shiva');
//   store.write('shiva', data);

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');

// Item kinds the admin may edit. Deliberately excludes 'books', which are
// standalone titles registered by build.js rather than list items.
const KINDS = ['stotras', 'poojas', 'mantras', 'prasadam', 'homa'];

// Which field holds the body of each kind, so the editor can show one textarea.
const BODY_FIELD = {
  stotras: 'verses',
  poojas: 'steps',
  mantras: 'mantra',
  prasadam: 'items',
  homa: 'note',
};

const VAR_NAME = {
  shiva: 'ShivaContent',
  ganesha: 'GaneshaContent',
  durga: 'DurgaContent',
  vishnu: 'VishnuContent',
  lakshmi: 'LakshmiContent',
  saraswati: 'SaraswatiContent',
  krishna: 'KrishnaContent',
  rama: 'RamaContent',
  hanuman: 'HanumanContent',
  ayyappa: 'AyyappaContent',
  subrahmanya: 'SubrahmanyaContent',
  saibaba: 'SaibabaContent',
};

function fileFor(slug) { return path.join(CONTENT_DIR, slug + '-content.js'); }

function varNameFor(slug) {
  if (VAR_NAME[slug]) return VAR_NAME[slug];
  return slug.split(/[^a-z0-9]+/i).filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1)).join('') + 'Content';
}

// Serialise a JS value as indented JS source. Strings are emitted as JSON
// strings, which is valid JavaScript and keeps Telugu/Devanagari intact.
function serialise(value, indent) {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    return '[\n' + value.map(v => padIn + serialise(v, indent + 1)).join(',\n') + '\n' + pad + ']';
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (!keys.length) return '{}';
    return '{\n' + keys.map(k => padIn + JSON.stringify(k) + ': ' + serialise(value[k], indent + 1)).join(',\n') + '\n' + pad + '}';
  }
  if (typeof value === 'string') return JSON.stringify(value);
  return String(value);
}

function read(slug) {
  const file = fileFor(slug);
  if (!fs.existsSync(file)) return null;
  // require() caches, so a fresh path is needed after any write.
  delete require.cache[require.resolve(file)];
  try {
    return require(file);
  } catch (e) {
    return { __error: 'Could not parse ' + path.basename(file) + ': ' + e.message };
  }
}

function write(slug, data) {
  const file = fileFor(slug);
  const name = varNameFor(slug);
  const label = data.label || slug;
  const out = [];
  out.push('// content/' + slug + '-content.js');
  out.push('// ' + label + ' content — edited via the admin portal.');
  out.push('// stotras | poojas | mantras | prasadam | homa');
  out.push('');
  out.push('const ' + name + ' = ' + serialise(data, 0) + ';');
  out.push('');
  out.push("if (typeof module !== 'undefined' && module.exports) module.exports = " + name + ';');
  out.push("else if (typeof window !== 'undefined') window." + name + ' = ' + name + ';');
  out.push('');
  fs.writeFileSync(file, out.join('\n'), 'utf8');
  return file;
}

function slugify(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

// Pick a usable slug for an item. Telugu, Devanagari and Kannada titles contain
// no latin characters, so slugify() strips them all and returns '' -- which is
// how a stotra titled "\u092a\u094d\u0930\u094b\u092c\u093e \u0b36\u0a24\u0b95\u0b02" was rejected outright. Fall back through
// the other titles, then to a short stable id derived from the text so the item
// is always addressable.
function ensureSlug(preferred, ...fallbacks) {
  let s = slugify(preferred);
  if (s) return s;
  for (const f of fallbacks) {
    s = slugify(f);
    if (s) return s;
  }
  const src = String(fallbacks[0] || 'item');
  let h = 0;
  for (let i = 0; i < src.length; i++) h = (h * 31 + src.charCodeAt(i)) >>> 0;
  return 'item-' + h.toString(36);
}

// Summary for the picker: what each deity currently holds.
function index() {
  const out = [];
  const files = fs.existsSync(CONTENT_DIR)
    ? fs.readdirSync(CONTENT_DIR).filter(f => /-content\.js$/.test(f)) : [];
  for (const f of files) {
    const slug = f.replace(/-content\.js$/, '');
    const data = read(slug);
    if (!data || data.__error) { out.push({ slug, error: (data && data.__error) || 'unreadable' }); continue; }
    const counts = {};
    KINDS.forEach(k => { counts[k] = Array.isArray(data[k]) ? data[k].length : 0; });
    out.push({ slug, label: data.label || slug, te: data.te || '', counts });
  }
  return out;
}

module.exports = { KINDS, BODY_FIELD, read, write, index, slugify, ensureSlug, fileFor, varNameFor };
