// fix-sita.js
const fs = require('fs');
let content = fs.readFileSync('content/sita-sahasranamam.js', 'utf8');

// Fix the corrupted line with Japanese chars
content = content.replace(
  "మహాత్రిపురసుందర్యాదిరూపల福岡 ||",
  'మహాత్రిపురసుందర్యాదిరూపల ||'
);

// Also fix any other corrupted patterns
content = content.replace(/福岡/g, '');
content = content.replace(/lopon/g, '||');

fs.writeFileSync('content/sita-sahasranamam.js', content);
console.log('Fixed sita-sahasranamam.js');