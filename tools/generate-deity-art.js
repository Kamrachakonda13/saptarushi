// tools/generate-deity-art.js
//
// Creates the gradient + symbol SVG used for deities that have no artwork of
// their own, matching the existing assets/deities/*.svg template exactly
// (radial gradient, centred glyph, 400x400).
//
// The glyph is the deity's own `symbol` from data.js — the same character the
// site already shows elsewhere — so nothing is invented and no deity is
// depicted with another deity's imagery.
//
// Only writes files that do not already exist, and never overwrites real
// artwork (.jpg/.png/.webp).
//
// Run:  node tools/generate-deity-art.js            (dry run)
//       node tools/generate-deity-art.js --apply

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DEITY_DIR = path.join(ROOT, 'assets', 'deities');
const APPLY = process.argv.includes('--apply');
const D = require(path.join(ROOT, 'data.js'));

const REAL_ART = ['.jpg', '.jpeg', '.png', '.webp'];

// Hues already used, so new files sit in the same family rather than clashing.
const USED_HUES = new Set();
fs.readdirSync(DEITY_DIR).filter((f) => f.endsWith('.svg')).forEach((f) => {
  const m = fs.readFileSync(path.join(DEITY_DIR, f), 'utf8').match(/hsl\((\d+)/);
  if (m) USED_HUES.add(parseInt(m[1], 10));
});

function nextHue() {
  // Walk the wheel for a hue nobody has taken yet.
  for (let h = 0; h < 360; h++) if (!USED_HUES.has(h)) return h;
  return 30;
}

function svg(hue, symbol, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" role="img" aria-label="${label}">
<defs><radialGradient id="g" cx="50%" cy="35%" r="75%">
<stop offset="0%" stop-color="hsl(${hue},55%,82%)"/><stop offset="100%" stop-color="hsl(${hue},45%,38%)"/>
</radialGradient></defs>
<rect width="400" height="400" fill="url(#g)"/>
<text x="200" y="235" font-family="Georgia,serif" font-size="170" fill="hsl(${hue},30%,22%)" text-anchor="middle">${symbol}</text>
</svg>
`;
}

const existing = new Set(fs.readdirSync(DEITY_DIR));
let made = 0, skipped = 0;

D.deities.forEach((d) => {
  const hasRealArt = REAL_ART.some((e) => existing.has(d.slug + e));
  if (hasRealArt) { skipped++; return; }               // real artwork: never touch
  if (existing.has(d.slug + '.svg')) { skipped++; return; } // already generated

  const hue = nextHue();
  USED_HUES.add(hue);
  const target = path.join(DEITY_DIR, d.slug + '.svg');
  if (APPLY) fs.writeFileSync(target, svg(hue, d.symbol, d.label));
  console.log(`  ${APPLY ? 'wrote' : 'would write'} assets/deities/${d.slug}.svg  hue=${hue} symbol=${JSON.stringify(d.symbol)} ${d.te}`);
  made++;
});

console.log(`\n  ${made} generated, ${skipped} skipped (real artwork or already present)`);
if (!made) { console.log('  Nothing to do.'); process.exit(0); }
if (!APPLY) console.log('  Dry run. Re-run with --apply to write.');
else console.log('  Done.');