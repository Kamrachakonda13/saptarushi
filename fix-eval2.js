// fix-eval2.js
const fs = require('fs');

let content = fs.readFileSync('build.js', 'utf8');

const lines = content.split('\n');
const newLines = [];
let skip = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes('const ROOT = __dirname;')) {
    newLines.push('const ROOT = __dirname;');
    newLines.push("const D = require('./data.js');");
    newLines.push('');
    skip = 3;
    continue;
  }

  if (skip > 0 && (line.includes('const DATA_FRAME') || line.includes('const D = eval') || line.trim() === '')) {
    skip--;
    continue;
  }

  if (line.includes('const esc = (s) => String(s).replace(/[&<>') && line.includes('}&[c]));')) {
    newLines.push("const esc = (s) => String(s).replace(/[&<>\"']/g, c => ({ '&': '&', '<': '<', '>': '>', '\"': '\"', \"'\": ''' }[c]));");
    continue;
  }

  newLines.push(line);
}

fs.writeFileSync('build.js', newLines.join('\n'));
console.log('Done');