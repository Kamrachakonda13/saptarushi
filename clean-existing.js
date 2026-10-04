// clean-existing.js
// Safely cleans auto-scraped content files.
// - Loads each module as JS (not regex)
// - Applies cleanStotra() to each verses/paras array
// - Backs up the original
// - Skips hand-crafted files and already-clean files
// - Dry-run mode: DRY=1 node clean-existing.js

const fs = require('fs');
const path = require('path');
const { cleanStotra } = require('./lib/clean-stotra');

const CONTENT_DIR = path.join(__dirname, 'content');
const BACKUP_DIR = path.join(__dirname, '.content-backup');
const DRY = process.env.DRY === '1';

const HAND_CRAFTED = new Set([
  'ganesha-content.js','shiva-content.js','vishnu-content.js','venkateswara-content.js',
  'rama-content.js','krishna-content.js','hanuman-content.js','durga-content.js',
  'navadurga-content.js','navagraha-content.js','surya-content.js','chandra-content.js',
  'kubera-content.js','bhairava-content.js','narasimha-content.js','ganga-content.js',
  'tulasi-content.js','gayatri-content.js','saraswati-content.js','subrahmanya-content.js',
  'dattatreya-content.js','kamakshi-content.js','meenakshi-content.js','lakshmi-content.js',
]);

const NOISE_SIGNS = [
  'Click here to buy','Related','వెతికింది','వర్గాలు','Support this Dharma',
  'Connect on Facebook','Next:','Previous:','Posted in','Did you see any mistake',
  'Subscribe on YouTube','List of Stotras','Read in ','తెలుగు\nతెలుగు','&#8220;','&#8211;',
];

function fileHasNoise(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  return NOISE_SIGNS.some((s) => src.includes(s));
}

function walkVerses(obj, pathStr, hits) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => walkVerses(v, `${pathStr}[${i}]`, hits));
    return;
  }
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    if (key === 'verses' && Array.isArray(v)) hits.push({ parent: obj, key, path: pathStr, verses: v });
    else if (key === 'paras' && Array.isArray(v)) hits.push({ parent: obj, key, path: pathStr, verses: v });
    else walkVerses(v, `${pathStr}.${key}`, hits);
  }
}

function looksNoisy(verses) {
  const joined = verses.join(' ');
  return NOISE_SIGNS.some((s) => joined.includes(s));
}

function cleanFile(fileName) {
  if (HAND_CRAFTED.has(fileName)) { console.log(`  ⊘ skip (hand-crafted): ${fileName}`); return; }
  const filePath = path.join(CONTENT_DIR, fileName);
  if (!fileHasNoise(filePath)) { console.log(`  ✓ already clean: ${fileName}`); return; }

  delete require.cache[require.resolve(filePath)];
  const C = require(filePath);

  const hits = [];
  walkVerses(C, fileName.replace(/-content\.js$/, ''), hits);

  let changed = 0;
  for (const hit of hits) {
    if (!looksNoisy(hit.verses)) continue;
    const cleaned = cleanStotra(hit.verses.join('\n'));
    if (cleaned.length < 3) { console.log(`    ⚠  ${hit.path}: cleaning produced only ${cleaned.length} lines — keeping original`); continue; }
    if (cleaned.length < hit.verses.length * 0.3) { console.log(`    ⚠  ${hit.path}: cleaned length ${cleaned.length} vs original ${hit.verses.length} — suspicious, keeping original`); continue; }
    hit.parent[hit.key] = cleaned;
    changed++;
    console.log(`    ✓ ${hit.path}: ${hit.verses.length} → ${cleaned.length} lines`);
  }

  if (changed === 0) { console.log(`  ⊘ no verses were cleaned in ${fileName}`); return; }
  if (DRY) { console.log(`  [DRY] would write ${fileName} (${changed} arrays cleaned)`); return; }

  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.copyFileSync(filePath, path.join(BACKUP_DIR, fileName + '.' + Date.now()));

  const className = fileName
    .replace(/-content\.js$/, '')
    .replace(/(^|[-_])(\w)/g, (_, __, c) => c.toUpperCase()) + 'Content';

  const body = 'const ' + className + ' = ' + serialize(C, 0) + ';\n\n' +
    'if (typeof module !== \'undefined\' && module.exports) module.exports = ' + className + ';\n' +
    'else if (typeof window !== \'undefined\') window.' + className + ' = ' + className + ';\n';

  const header = '// content/' + fileName + '\n' +
                 '// Cleaned by clean-existing.js on ' + new Date().toISOString() + '\n\n';

  fs.writeFileSync(filePath, header + body);
  console.log(`  ✓ wrote ${fileName}`);
}

function serialize(value, depth) {
  const pad = '  '.repeat(depth);
  const padIn = '  '.repeat(depth + 1);
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    const items = value.map((v) => padIn + serialize(v, depth + 1)).join(',\n');
    return '[\n' + items + '\n' + pad + ']';
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (!keys.length) return '{}';
    const entries = keys.map((k) => padIn + JSON.stringify(k) + ': ' + serialize(value[k], depth + 1)).join(',\n');
    return '{\n' + entries + '\n' + pad + '}';
  }
  return 'null';
}

console.log('Scanning content/ ...\n');
for (const f of fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('-content.js'))) {
  console.log(`· ${f}`);
  try { cleanFile(f); } catch (e) { console.log(`  ✗ ${f}: ${e.message}`); }
}
console.log('\nDone.' + (DRY ? ' (dry run — nothing was written)' : ''));
