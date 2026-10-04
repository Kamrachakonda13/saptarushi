// scan-corruption.js
// Scans content files for Latin characters embedded inside Telugu strings.
// Run: node scan-corruption.js

const fs = require('fs');
const path = require('path');
const CONTENT_DIR = path.join(__dirname, 'content');

const TELUGU = /[\u0C00-\u0C7F]/;
const LATIN = /[A-Za-z\u00C0-\u024F]/; // includes accented Latin like í, é

function scanString(s, file, key) {
  if (!s || typeof s !== 'string') return;
  if (!TELUGU.test(s)) return;           // no Telugu, skip
  // Any Latin letter inside a Telugu run is suspicious
  const issues = [];
  // Match sequences of Latin letters inside Telugu
  const re = /[\u0C00-\u0C7F]*([A-Za-z\u00C0-\u024F]+)[\u0C00-\u0C7F]*/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const fragment = m[1];
    // Allow single Latin letters that are common tags (like IDs)
    if (fragment.length >= 3) {
      issues.push({ fragment, position: m.index, end: m.index + fragment.length });
    }
  }
  if (issues.length) {
    console.log(`\n✗ ${file} · ${key}`);
    console.log(`  string (first 150 chars): ${s.slice(0, 150)}${s.length > 150 ? '…' : ''}`);
    issues.forEach(i => console.log(`  fragment: "${i.fragment}" at index ${i.position} (ends at ${i.end})`));
  }
}

function walk(obj, file, pathStr) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => walk(v, file, `${pathStr}[${i}]`));
    return;
  }
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === 'string') scanString(v, file, `${pathStr}.${k}`);
    else walk(v, file, `${pathStr}.${k}`);
  }
}

let total = 0;
for (const f of fs.readdirSync(CONTENT_DIR).filter(x => x.endsWith('-content.js') || x.endsWith('-regions.js'))) {
  const filePath = path.join(CONTENT_DIR, f);
  delete require.cache[require.resolve(filePath)];
  try {
    const C = require(filePath);
    walk(C, f, f.replace(/\.js$/, ''));
    total++;
  } catch (e) {
    console.log(`✗ ${f}: ${e.message}`);
  }
}

// Also scan the top-level sankalpam-regions.js
const regionsPath = path.join(__dirname, 'sankalpam-regions.js');
if (fs.existsSync(regionsPath)) {
  delete require.cache[require.resolve(regionsPath)];
  global.window = {};
  try {
    require(regionsPath);
    walk({ regions: global.window.SANKALPAM_REGIONS }, 'sankalpam-regions.js', 'regions');
    total++;
  } catch (e) { console.log(`✗ sankalpam-regions.js: ${e.message}`); }
}

console.log(`\nScanned ${total} files.`);