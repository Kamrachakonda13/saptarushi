// tools/generate-temple-art.js
//
// Creates a drawn temple illustration for any temple that has no photograph,
// in the same visual language as assets/temples/placeholder.svg (gopuram
// silhouette on a parchment ground).
//
// This is a stylised illustration, NOT a photograph of the temple, and is only
// used where no photo exists so a listing is never blank.
//
// Run:  node tools/generate-temple-art.js            (dry run)
//       node tools/generate-temple-art.js --apply

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TEMPLE_DIR = path.join(ROOT, 'assets', 'temples');
const APPLY = process.argv.includes('--apply');

const TEMPLES = JSON.parse(fs.readFileSync(path.join(ROOT, 'temples.json'), 'utf8')).items;
const EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

function svg(label) {
  // Label is written as text, so it is escaped for XML.
  const safe = String(label).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="900" height="600" role="img" aria-label="${safe} temple">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f2dfc4"/>
      <stop offset="1" stop-color="#e2c9a8"/>
    </linearGradient>
  </defs>
  <rect width="900" height="600" fill="url(#g)"/>
  <g fill="#8b4513" opacity="0.85">
    <path d="M300 470 L450 320 L600 470 Z"/>
    <rect x="330" y="470" width="240" height="70"/>
    <rect x="380" y="360" width="140" height="110"/>
    <path d="M450 330 v-40 M430 295 l20-30 20 30 Z M540 470 v-60 h40 v60 Z"/>
  </g>
  <circle cx="450" cy="120" r="26" fill="#8b4513" opacity="0.8"/>
  <text x="450" y="565" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="26" fill="#6e3815">${safe}</text>
</svg>
`;
}

let made = 0;
for (const t of TEMPLES) {
  const dir = path.join(TEMPLE_DIR, t.category);
  const hasPhoto = EXTS.some((e) =>
    ['temple', 'deity', 'sanctum'].some((k) => fs.existsSync(path.join(dir, t.id + '-' + k + e))));
  const hasSvg = fs.existsSync(path.join(dir, t.id + '-temple.svg'));
  if (hasPhoto || hasSvg) continue;

  if (!fs.existsSync(dir)) { console.log(`  skip ${t.id}: no directory ${t.category}`); continue; }
  const target = path.join(dir, t.id + '-temple.svg');
  if (APPLY) fs.writeFileSync(target, svg(t.name));
  console.log(`  ${APPLY ? 'wrote' : 'would write'} assets/temples/${t.category}/${t.id}-temple.svg  (${t.name})`);
  made++;
}

console.log(`\n  ${made} illustration(s) ${APPLY ? 'written' : 'to write'}`);
if (!made) console.log('  Nothing to do.');
else if (!APPLY) console.log('  Dry run. Re-run with --apply to write.');