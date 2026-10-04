// clean-stotras-json.js
// Removes scraped web chrome from stotras.json. Keeps only Telugu verses.
// The rules live in lib/scripture-clean.js so every fetcher shares one list.
// Run: node clean-stotras-json.js           (dry run)
//      node clean-stotras-json.js --apply   (writes + backup)

const fs = require('fs');
const path = require('path');

const { isNoise, cleanParas } = require('./lib/scripture-clean');

const FILE = path.join(__dirname, 'stotras.json');
const BACKUP = path.join(__dirname, '.stotras.json.bak');
const APPLY = process.argv.includes('--apply');

const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const items = raw.items || [];
let totalBefore = 0, totalAfter = 0, changed = 0, shortItems = [];

console.log('\nScanning stotras.json...\n');
items.forEach(item => {
  if (!Array.isArray(item.paras)) return;
  totalBefore += item.paras.length;
  const cleaned = cleanParas(item.paras);
  totalAfter += cleaned.length;
  const removed = item.paras.length - cleaned.length;
  if (removed > 0) {
    console.log(`· ${String(item.slug).padEnd(42)} ${item.paras.length} → ${cleaned.length}  (-${removed})`);
    item.paras = cleaned;
    changed++;
  }
  if (cleaned.length < 3) shortItems.push({ slug: item.slug, count: cleaned.length });
});

console.log(`\n— Summary —`);
console.log(`Items total:     ${items.length}`);
console.log(`Items cleaned:   ${changed}`);
console.log(`Lines before:    ${totalBefore}`);
console.log(`Lines after:     ${totalAfter}`);
console.log(`Lines removed:   ${totalBefore - totalAfter}`);

if (shortItems.length) {
  console.log(`\n⚠ Items with < 3 verses after cleaning (verify manually):`);
  shortItems.forEach(s => console.log(`   ${s.slug}: ${s.count} lines`));
}

if (!changed) { console.log('\n✓ Nothing to clean.'); process.exit(0); }

if (!APPLY) { console.log('\nDry run only. Re-run with --apply to write.'); process.exit(0); }

fs.copyFileSync(FILE, BACKUP);
fs.writeFileSync(FILE, JSON.stringify(raw, null, 2));
console.log(`\n✓ Wrote ${FILE}`);
console.log(`  Backup: ${BACKUP}`);