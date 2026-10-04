// check-content.js
// Diagnoses content completeness. Run: node check-content.js
const fs = require('fs');
const path = require('path');

function load(file) {
  try { return require('./content/' + file); }
  catch (e) { return null; }
}

const EXPECTED = {
  'ganesha-ashtottara-shatanamavali': { type: 'verses', min: 108, label: 'Ashtottara (108 names)' },
  'shiva-ashtottara-shatanamavali':   { type: 'verses', min: 108, label: 'Ashtottara (108 names)' },
  'ganesha-pancharatnam':             { type: 'verses', min: 5,   label: 'Pancharatnam (5 stanzas)' },
  'lingashtakam':                     { type: 'verses', min: 8,   label: 'Ashtakam (8 stanzas)' },
  'rudrashtakam':                     { type: 'verses', min: 8,   label: 'Ashtakam (8 stanzas)' },
  'bilvashtakam':                     { type: 'verses', min: 8,   label: 'Ashtakam (8 stanzas)' },
  'shiva-panchakshari-stotram':       { type: 'verses', min: 5,   label: 'Panchakshari (5 + phala)' },
  'ganesha-mangalashtakam':           { type: 'verses', min: 8,   label: 'Ashtakam (8 stanzas)' },
  'sankata-nashana-ganesha-stotram':  { type: 'verses', min: 5,   label: 'Stotra (5 stanzas)' },
  'shiva-tandava-stotram':            { type: 'verses', min: 8,   label: 'Tandava (8+ stanzas)' },
  'ganesha-dhyana-shlokas':           { type: 'verses', min: 4,   label: 'Dhyana Shlokas' },
  'ganesha-suktam':                   { type: 'verses', min: 2,   label: 'Suktam' },
  'ganapathi-prarthana-ghanapatham':  { type: 'verses', min: 20,  label: 'Prarthana' },
  'vakratunda-mahakaya':              { type: 'verses', min: 2,   label: 'Shloka (2 lines)' },
  'shiva-chalisa':                    { type: 'verses', min: 40,  label: 'Chalisa (40 chaupais)' },
  'shiva-aarti':                      { type: 'verses', min: 3,   label: 'Aarti (3 stanzas)' },
  'shiva-mahimna-stotram':            { type: 'verses', min: 4,   label: 'Mahimna (initial verses)' }
};

const files = ['ganesha-content.js', 'shiva-content.js', 'vishnu-content.js', 'hanuman-content.js', 'venkateswara-content.js', 'rama-content.js', 'krishna-content.js', 'hanuman-content.js', 'navadurga-content.js', 'durga-content.js', 'lakshmi-content.js', 'saraswati-content.js', 'subrahmanya-content.js', 'dattatreya-content.js', 'surya-content.js', 'chandra-content.js', 'kubera-content.js', 'bhairava-content.js', 'narasimha-content.js', 'ganga-content.js', 'tulasi-content.js', 'gayatri-content.js', 'navagraha-content.js'];
let issues = 0;
let total = 0;

for (const f of files) {
  const C = load(f);
  if (!C) { console.log('✗ Could not load ' + f); continue; }
  console.log('\n=== ' + f + ' ===');

  const sections = ['stotras', 'poojas', 'mantras', 'homa'];
  for (const sec of sections) {
    const arr = C[sec] || [];
    for (const item of arr) {
      total++;
      const slug = item.slug;
      const exp = EXPECTED[slug];
      let count = 0;
      let unit = '';
      if (sec === 'stotras') {
        count = (item.verses || []).filter(v => v && v.trim()).length;
        unit = 'lines';
      } else if (sec === 'poojas') {
        count = (item.steps || []).length;
        unit = 'steps';
      } else if (sec === 'mantras') {
        count = item.mantra ? 1 : 0;
        unit = 'mantra';
      } else if (sec === 'homa') {
        count = (item.keyMantras || []).length + (item.materials || []).length;
        unit = 'entries';
      }
      const flag = exp && exp.min && count < exp.min ? ' ⚠ SHORT' : ' ✓';
      if (exp && exp.min && count < exp.min) issues++;
      console.log(
        `${flag}  ${sec}/${slug.padEnd(42)} ${String(count).padStart(4)} ${unit}` +
        (exp ? ` (expected ≥ ${exp.min} — ${exp.label})` : '')
      );
    }
  }
}

console.log('\n—');
console.log(`Total items: ${total}, short items: ${issues}`);
if (issues) {
  console.log('\nFix the ⚠ items by replacing their data in content/*.js from an authoritative source.');
} else {
  console.log('All items pass the minimum-count check.');
}
