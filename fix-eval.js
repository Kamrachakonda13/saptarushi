// fix-eval.js - replace eval with require in build.js
const fs = require('fs');

let content = fs.readFileSync('build.js', 'utf8');

// Replace the eval lines - using more flexible matching
content = content.replace(
  /const ROOT = __dirname;[\s\S]*?const DATA_FRAME = fs\.readFileSync\(path\.join\(ROOT, 'data\.js'\), 'utf8'\);[\s\S]*?const D = eval\(DATA_FRAME\.replace\('const DeepamData =', '\('\.replace\(/;\\s*\$/, '\)'\)\);[\s\S]*?const esc = \(s\) => String\(s\)\.replace\(/\[&<>"'\]/g, c => \([\s\S]*?\)\);/,
  "const ROOT = __dirname;\nconst D = require('./data.js');\n\nconst esc = (s) => String(s).replace(/[&<>\"']/g, c => ({ '&': '&', '<': '<', '>': '>', '\"': '\"', \"'\": ''' }[c]));\n"
);

fs.writeFileSync('build.js', content);
console.log('Done');