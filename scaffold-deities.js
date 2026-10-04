// scaffold-deities.js
// Generates empty content/<deity>-content.js scaffolds for all deities.
// Run: node scaffold-deities.js
// Safe to re-run — it will not overwrite existing files.

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, 'content');
if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });

const DEITIES = [
  { slug: 'brahma',        label: 'Brahma',          te: 'శ్రీ బ్రహ్మ' },
  { slug: 'vishnu',        label: 'Vishnu',          te: 'శ్రీ విష్ణువు' },
  { slug: 'shiva',         label: 'Shiva',           te: 'శ్రీ శివుడు' },
  { slug: 'venkateswara',  label: 'Venkateswara',    te: 'శ్రీ వేంకటేశ్వర స్వామి' },
  { slug: 'rama',          label: 'Rama',            te: 'శ్రీ రాముడు' },
  { slug: 'krishna',       label: 'Krishna',         te: 'శ్రీ కృష్ణుడు' },
  { slug: 'narasimha',     label: 'Narasimha',       te: 'శ్రీ నృసింహుడు' },
  { slug: 'durga',         label: 'Durga / Devi',    te: 'శ్రీ దుర్గా దేవి' },
  { slug: 'lakshmi',       label: 'Lakshmi',         te: 'శ్రీ లక్ష్మీ దేవి' },
  { slug: 'saraswati',     label: 'Saraswati',       te: 'శ్రీ సరస్వతీ దేవి' },
  { slug: 'lalitha',       label: 'Lalitha',         te: 'శ్రీ లలితా దేవి' },
  { slug: 'kali',          label: 'Kali',            te: 'శ్రీ కాళీ దేవి' },
  { slug: 'kamakshi',      label: 'Kamakshi',        te: 'శ్రీ కామాక్షీ దేవి' },
  { slug: 'meenakshi',     label: 'Meenakshi',       te: 'శ్రీ మీనాక్షీ దేవి' },
  { slug: 'visalakshi',    label: 'Visalakshi',      te: 'శ్రీ విశాలాక్షీ దేవి' },
  { slug: 'padmavathi',    label: 'Padmavathi',      te: 'శ్రీ పద్మావతీ దేవి' },
  { slug: 'parvathi',      label: 'Parvathi',        te: 'శ్రీ పార్వతీ దేవి' },
  { slug: 'radha',         label: 'Radha',           te: 'శ్రీ రాధా దేవి' },
  { slug: 'sita',          label: 'Sita',            te: 'శ్రీ సీతా దేవి' },
  { slug: 'and',           label: 'Andal / Goda',    te: 'శ్రీ ఆండాళ్ / గోదా దేవి' },
  { slug: 'chamundi',      label: 'Chamundi',        te: 'శ్రీ చాముండేశ్వరీ దేవి' },
  { slug: 'prathyangira',  label: 'Prathyangira',    te: 'శ్రీ ప్రత్యంగిరా దేవి' },
  { slug: 'rajarajeshwari', label: 'Rajarajeshwari', te: 'శ్రీ రాజరాజేశ్వరీ దేవి' },
  { slug: 'ganesha',       label: 'Ganesha',         te: 'శ్రీ వినాయకుడు' },
  { slug: 'hanuman',       label: 'Hanuman',         te: 'శ్రీ ఆంజనేయ స్వామి' },
  { slug: 'subrahmanya',   label: 'Subrahmanya',     te: 'శ్రీ సుబ్రహ్మణ్య స్వామి' },
  { slug: 'ayyappa',       label: 'Ayyappa',         te: 'శ్రీ అయ్యప్ప స్వామి' },
  { slug: 'saibaba',       label: 'Saibaba',         te: 'శ్రీ సాయిబాబా' },
  { slug: 'dattatreya',    label: 'Dattatreya',      te: 'శ్రీ దత్తాత్రేయుడు' },
  { slug: 'navagraha',     label: 'Navagraha',       te: 'నవగ్రహాలు' },
  { slug: 'surya',         label: 'Surya',           te: 'శ్రీ సూర్య భగవానుడు' },
  { slug: 'chandra',       label: 'Chandra',         te: 'శ్రీ చంద్రుడు' },
  { slug: 'kubera',        label: 'Kubera',          te: 'శ్రీ కుబేరుడు' },
  { slug: 'bhairava',      label: 'Bhairava',        te: 'శ్రీ కాలభైరవుడు' },
  { slug: 'ganga',         label: 'Ganga',           te: 'శ్రీ గంగా దేవి' },
  { slug: 'tulasi',        label: 'Tulasi',          te: 'శ్రీ తులసీ దేవి' },
  { slug: 'gayatri',       label: 'Gayatri',         te: 'శ్రీ గాయత్రీ దేవి' },
  { slug: 'agni',          label: 'Agni',            te: 'శ్రీ అగ్ని దేవుడు' },
  { slug: 'varuna',        label: 'Varuna',          te: 'శ్రీ వరుణుడు' },
  { slug: 'indra',         label: 'Indra',           te: 'శ్రీ ఇంద్రుడు' },
];

function scaffold(d) {
  const className = d.label.replace(/[^A-Za-z]/g, '') + 'Content';
  return `// content/${d.slug}-content.js
// ${d.label} content — Telugu only.
// Fill in the arrays below with authoritative Telugu text.
// Grouped as: stotras | poojas | mantras | homa

const ${className} = {
  deity: '${d.slug}',
  label: '${d.label}',
  te: '${d.te}',

  stotras: [
    // {
    //   slug: 'example-stotram',
    //   te: 'ఉదాహరణ స్తోత్రం',
    //   en: 'Example Stotram',
    //   type: 'Stotra',
    //   verses: [
    //     'శ్లోకం ౧ ...',
    //     'శ్లోకం ౨ ...'
    //   ]
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
    //   type: 'Bija Mantra',
    //   mantra: 'ఓం ...',
    //   meaning: '...',
    //   usage: '...'
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
    //   materials: ['నెయ్యి (Ghee)', '...']
    // }
  ]
};

if (typeof module !== 'undefined' && module.exports) module.exports = ${className};
else if (typeof window !== 'undefined') window.${className} = ${className};
`;
}

let created = 0, skipped = 0;
for (const d of DEITIES) {
  const file = path.join(CONTENT_DIR, d.slug + '-content.js');
  if (fs.existsSync(file)) { skipped++; continue; }
  fs.writeFileSync(file, scaffold(d));
  created++;
}
console.log(`✓ Created ${created} scaffold files, skipped ${skipped} existing.`);
console.log('Now fill each file with Telugu content from Stotra Nidhi, HinduNidhi, or BhaktiNidhi.');
