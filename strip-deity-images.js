// strip-deity-images.js
// Removes the deityImage field from temples.json entries that reference missing files.
// Run: node strip-deity-images.js           (dry run)
//      node strip-deity-images.js --apply

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'temples.json');
const BACKUP = path.join(__dirname, '.temples.json.bak');
const APPLY = process.argv.includes('--apply');

const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const items = raw.items || [];
let stripped = 0;

items.forEach(t => {
  if (!t.deityImage) return;
  const url = t.deityImage.url || t.deityImage;
  if (!url) { delete t.deityImage; stripped++; return; }
  const cleanPath = url.replace(/^\//, '');
  if (!fs.existsSync(path.join(__dirname, cleanPath))) {
    console.log(`· ${t.id.padEnd(40)} missing: ${url}`);
    delete t.deityImage;
    stripped++;
  }
});

console.log(`\n${stripped} of ${items.length} entries stripped of deityImage`);

if (!stripped) { console.log('✓ Nothing to strip.'); process.exit(0); }
if (!APPLY) { console.log('\nDry run only. Re-run with --apply to write.'); process.exit(0); }

fs.copyFileSync(FILE, BACKUP);
fs.writeFileSync(FILE, JSON.stringify(raw, null, 2));
console.log(`\n✓ Wrote ${FILE}. Backup: ${BACKUP}`);