// clean-stotras-json.js
// Removes scraped web chrome from stotras.json. Keeps only Telugu verses.
// Run: node clean-stotras-json.js           (dry run)
//      node clean-stotras-json.js --apply   (writes + backup)

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'stotras.json');
const BACKUP = path.join(__dirname, '.stotras.json.bak');
const APPLY = process.argv.includes('--apply');

const TELUGU = /[\u0C00-\u0C7F]/;
const VERSE_END = /\|\|\s*[౦-౯0-9]+\s*\|\|/;   // || ౧ || or || 1 ||

const NOISE_PHRASES = [
  'Watch on Youtube', 'Watch on YouTube', 'Subscribe on YouTube',
  'Subscribe', 'Privacy Policy', 'Terms of Use', 'Terms and Conditions',
  'Share this', 'Related Posts', 'Related', 'You may also like',
  'Click here', 'Read more', 'Read More',
  'Report mistakes', 'Corrections',
  'Support this', 'Support Us', 'Donate',
  'Follow us', 'Follow on',
  'WhatsApp', 'Telegram', 'Facebook', 'Instagram', 'Twitter', 'Pinterest',
  'Buy Prabhata', 'Buy this book', 'Buy Now', 'Add to cart',
  'PhonePe', 'GooglePay', 'GPay', 'Paypal', 'PayPal',
  'Leave a Reply', 'Post Comment', 'Comments',
  'Categories', 'Tags:', 'Archive', 'Recent Posts',
  'Copyright', 'All rights reserved', '©', '®', '™',
  'Advertisements', 'Sponsored', 'Loading',
  'Previous:', 'Next:', 'Posted in', 'Posted on', 'Posted by',
];

function isNoise(line) {
  const s = line.trim();
  if (!s) return false;
  if (NOISE_PHRASES.some(p => s.includes(p))) return true;
  // Breadcrumbs
  if (/^Home\s*[›»>]/.test(s)) return true;
  if (/^[\w\s]+[›»>][\w\s]+[›»>]/.test(s)) return true;
  // Bracket notes like [గమనిక: ...]
  if (/^\s*\[.*\]\s*$/.test(s)) return true;
  // URLs
  if (/^https?:\/\//i.test(s)) return true;
  if (/^\s*www\./i.test(s)) return true;
  // Social handles
  if (/^\s*@\w+/.test(s)) return true;
  return false;
}

// Heuristic: is this actually a verse line?
// A verse line either has || N || at the end, or is long enough to be meaningful.
function looksLikeVerse(line) {
  if (VERSE_END.test(line)) return true;
  // Pure Telugu line, longer than 8 chars
  const teluguChars = (line.match(/[\u0C00-\u0C7F]/g) || []).length;
  return teluguChars >= 8;
}

function cleanParas(arr) {
  const kept = [];
  for (const raw of arr) {
    const line = String(raw || '').trim();
    if (!line) continue;
    if (isNoise(line)) continue;
    if (!TELUGU.test(line)) continue;
    // Drop lines that are mostly Latin
    const latin = (line.match(/[A-Za-z]/g) || []).length;
    const telugu = (line.match(/[\u0C00-\u0C7F]/g) || []).length;
    if (latin > telugu) continue;
    if (!looksLikeVerse(line)) continue;
    if (kept[kept.length - 1] === line) continue;   // collapse dupes
    kept.push(line);
  }
  return kept;
}

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