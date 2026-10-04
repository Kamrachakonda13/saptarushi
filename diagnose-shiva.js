// diagnose-shiva.js
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'content', 'shiva-content.js');
const src = fs.readFileSync(file, 'utf8');
const lines = src.split('\n');

console.log('File has', lines.length, 'lines.\n');

// Show context around line 334
const target = 334;
const start = Math.max(0, target - 12);
const end = Math.min(lines.length, target + 12);

console.log(`Context around line ${target}:`);
console.log('─'.repeat(70));
for (let i = start; i < end; i++) {
  const marker = (i + 1 === target) ? ' >>> ' : '     ';
  console.log(`${marker}${String(i + 1).padStart(4)} | ${lines[i]}`);
}
console.log('─'.repeat(70));

// Try to require the file
console.log('\nAttempting to require...');
try {
  delete require.cache[require.resolve(file)];
  require(file);
  console.log('✓ File loaded without error.');
} catch (e) {
  console.log('✗ Error:', e.message);
  if (e.stack) {
    const m = e.stack.match(/shiva-content\.js:(\d+)/);
    if (m) console.log('  Reported at line:', m[1]);
  }
}

// Check for Devanagari
const devanagari = /[\u0900-\u097F]/g;
const offenders = [];
lines.forEach((line, i) => {
  if (devanagari.test(line)) offenders.push({ line: i + 1, text: line.trim() });
});
if (offenders.length) {
  console.log(`\n⚠ ${offenders.length} lines contain Devanagari (should be Telugu):`);
  offenders.slice(0, 20).forEach(o => console.log(`  line ${o.line}: ${o.text.slice(0, 80)}`));
}