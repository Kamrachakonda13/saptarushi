// scaffold-missing.js
// Creates scaffold content files for missing deities.
// Safe to re-run — never overwrites existing files.
// Run: node scaffold-missing.js

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, 'content');
if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });

const MISSING = [
  { slug: 'nandi',           label: 'Nandi',            te: 'శ్రీ నন্দీశ్వరుడు' },
  { slug: 'annapurna',       label: 'Annapurna',        te: 'శ్రీ అన్నపూర్ణా దేవి' },
  { slug: 'ashta-lakshmi',   label: 'Ashta Lakshmi',    te: 'అష్టలక్ష్ములు' },
  { slug: 'matrikas',        label: 'Matrikas',         te: 'సప్తమాతృకలు' },
  { slug: 'shesha',          label: 'Shesha',           te: 'శ్రీ ఆదిశేషుడు' },
  { slug: 'soma',            label: 'Soma',             te: 'శ్రీ సోముడు' },
  { slug: 'ashta-vasus',     label: 'Ashta Vasus',      te: 'అష్టవసువులు' },
  { slug: 'ekadasha-rudras', label: 'Ekadasha Rudras',  te: 'ఏకాదశ రుద్రులు' },
  { slug: 'dwadasha-adityas',label: 'Dwadasha Adityas', te: 'ద్వాదశ ఆదిత్యులు' },
  { slug: 'dakshinamurthy',  label: 'Dakshinamurthy',   te: 'శ్రీ దక్షిణామూర్తి' },
];

function scaffold(d) {
  const className = d.label.replace(/[^A-Za-z]/g, '') + 'Content';
  return `// content/${d.slug}-content.js
// ${d.label} content — Telugu only.
// Scaffold created ${new Date().toISOString()}.
// Fill in with authoritative Telugu text from Stotra Nidhi, BhaktiNidhi, or HinduNidhi.

const ${className} = {
  deity: '${d.slug}',
  label: '${d.label}',
  te: '${d.te}',

  stotras: [
    // {
    //   slug: 'example-stotram',
    //   te: 'ఉదాహరణ స్తోత్రం',
    //   en: 'Example Stotram',
    //   type: 'Stotram',
    //   verses: ['శ్లోకం ౧ ...', 'శ్లోకం ౨ ...']
    // }
  ],

  poojas: [
    // {
    //   slug: 'example-pooja',
    //   te: 'ఉదాహరణ పూజ',
    //   en: 'Example Pooja',
    //   type: 'Pooja Vidhanam',
    //   steps: [
    //     { step: 1, text: 'మొదటి అడుగు...' },
    //     { step: 2, text: 'రెండవ అడుగు...' }
    //   ]
    // }
  ],

  mantras: [
    // {
    //   slug: 'example-mantra',
    //   te: 'ఉదాహరణ మంత్రం',
    //   en: 'Example Mantra',
    //   type: 'Mula Mantra',
    //   mantra: 'ఓం ...',
    //   meaning: '...',
    //   usage: '...'
    // }
  ],

  prasadam: [
    // {
    //   slug: 'example-prasadam',
    //   te: 'ఉదాహరణ ప్రసాదం',
    //   en: 'Example Prasadam',
    //   type: 'Prasadam',
    //   items: [
    //     {
    //       deity: '${d.te}',
    //       dish: 'పండ్లు',
    //       quantity: '16 చెంచాలు',
    //       recipe: '...'
    //     }
    //   ]
    // }
  ],

  homa: [
    // {
    //   slug: 'example-homam',
    //   te: 'ఉదాహరణ హోమం',
    //   en: 'Example Homam',
    //   type: 'Homa',
    //   note: '...',
    //   keyMantras: ['ఓం ...'],
    //   materials: ['లెեփం (Ghee)', '...']
    // }
  ]
};

if (typeof module !== 'undefined' && module.exports) module.exports = ${className};
else if (typeof window !== 'undefined') window.${className} = ${className};
`;
}

let created = 0, skipped = 0;
for (const d of MISSING) {
  const filePath = path.join(CONTENT_DIR, d.slug + '-content.js');
  if (fs.existsSync(filePath)) { skipped++; continue; }
  fs.writeFileSync(filePath, scaffold(d));
  created++;
}
console.log(`\n✓ Created ${created} scaffolds, skipped ${skipped} existing.`);
console.log('  Missing deities:');
MISSING.forEach(d => console.log(`    · ${d.slug.padEnd(20)} ${d.te}`));
console.log('\nNext: fill each file, then add to data.js, then run build.js.\n');