// check-deity-state.js
const fs = require('fs');
const path = require('path');

const D = require('./data.js');
const CONTENT_DIR = path.join(__dirname, 'content');

console.log('Deity'.padEnd(24), 'flag', ' file', ' stotras', ' poojas', ' mantras', ' prasadam');
console.log('─'.repeat(80));

D.deities.forEach(d => {
  const file = path.join(CONTENT_DIR, d.slug + '-content.js');
  const exists = fs.existsSync(file);
  let counts = ['-', '-', '-', '-'];
  if (exists) {
    try {
      delete require.cache[require.resolve(file)];
      const C = require(file);
      counts = [
        (C.stotras || []).length,
        (C.poojas || []).length,
        (C.mantras || []).length,
        (C.prasadam || []).length,
      ];
    } catch (e) { counts = ['ERR', 'ERR', 'ERR', 'ERR']; }
  }
  const flag = (d.content && Object.values(d.content).some(v => v)) ? 'ON ' : 'off';
  console.log(
    d.slug.padEnd(24),
    flag,
    (exists ? 'yes' : 'NO ').padEnd(5),
    String(counts[0]).padStart(6),
    String(counts[1]).padStart(7),
    String(counts[2]).padStart(8),
    String(counts[3]).padStart(9)
  );
});