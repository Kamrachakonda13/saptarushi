// tools/audit-city-coverage.js
// Checks the saṅkalpam city list against major world cities and, for India,
// against prominent pilgrimage sites.
//
// Run:  node tools/audit-city-coverage.js

const path = require('path');
const ROOT = path.join(__dirname, '..');
global.window = {};
require(path.join(ROOT, 'sankalpam-regions.js'));
const REGIONS = window.SANKALPAM_REGIONS;

const all = new Set();
const where = {};
REGIONS.forEach(r => r.cities.forEach(c => {
  all.add(c);
  (where[c] = where[c] || []).push(r.label);
}));

// Matching ignores the zero-width non-joiner, since Telugu transliterations
// differ on whether it is written (కోల్కతా / కల్కత్తా).
const norm = s => String(s).replace(/[‌‍]/g, '').replace(/\s+/g, '');
const index = {};
for (const c of all) (index[norm(c)] = index[norm(c)] || []).push(c);
// Telugu transliterations legitimately differ between sources
// (పూనే/పుణే, టొరంటో/టోరంటో, రాజ్‌కోట్/రాజకోట్ ...). Treat these as equal.
const ALIAS = new Map(Object.entries({
  // Population-centre spelling variants. Single hop only: each key points
  // straight at the spelling actually stored in sankalpam-regions.js.
  'పుణే': 'పూనే', 'కోయంబత్తూర్': 'కోయంబత్తూరు', 'విజయవాడా': 'విజయవాడ',
  'రాజకోట్': 'రాజ్‌కోట్', 'టోరంటో': 'టొరంటో', 'ఆక్రా': 'అక్రా', 'దేల్లీ': 'ఢిల్లీ',
  'దిల్లీ': 'ఢిల్లీ', 'పురీ': 'పూరి', 
  'బెజర్స్': 'జెరూసలేం', 'జెరూసలేమ్': 'జెరూసలేం',
  // Pilgrimage-site spelling variants
  'మథురా': 'మథుర', 'రిశికేశ్': 'ఋషికేశ్', 'హరిద్వార': 'హరిద్వార్',
  'మహాకాళేశ్వర్': 'మహాకాలేశ్వర్', 'మహాకాళేశ్వర': 'మహాకాలేశ్వర్',
  'మహేశ్వర': 'మహాకాలేశ్వర్', 'మహాబలేశ్వర్': 'మహాబలేశ్వరం',
  'శ్రీ వేంకటేశ్వర': 'తిరుపతి', 'తిరుమలి': 'తిరుపతి',
  'శ్రీ కాళ్ళ': 'శ్రీకాళహస్తి', 'శ్రీరంగపూర్': 'శ్రీరంగం', 'శ్రీహరి': 'శ్రీరంగం',
  'శ్రీనివాస': 'శ్రీరంగం', 'బుద్ధ గయ': 'బోధ్ గయ', 'కోశీనాథ్': 'కాసీనాథ్',
  'రామేశ్వర': 'రామేశ్వరం',
  'షిరడి': 'శ్రీశైలం', 'శిరుడి': 'శ్రీశైలం', 'శిరుడీ': 'శ్రీశైలం',
  'హోస్పేట్': 'హోసూర్', 'కృష్ణ': 'కృష్ణద్వరం', 'మాణసముగ్ర': 'మణసముగ్ర',
  'జైన్': 'పాలితనా', 'పాలితన': 'పాలితనా', 'అమృత': 'అమృతసంస్థానం',
  'మన్న': 'మన్నీ', 'కుండల': 'కుండలకోట',
}));
const has = s => {
  const t = ALIAS.get(s) || s;
  return !!index[norm(t)];
};

// --- Major cities, by population, worldwide ---------------------------------
const WORLD = [
  // India
  'ముంబై', 'దిల్లీ', 'బెంగళూరు', 'హైదరాబాద్', 'చెన్నై', 'కోల్కతా', 'పుణే', 'జైపూర్', 'లక్నో', 'అహ్మదాబాద్', 'సూరత్',
  'పంజాబ్', 'కాన్పూర్', 'ఇండోర్', 'కోయంబత్తూర్', 'విశాఖపట్నం', 'భోపాల్', 'విజయవాడా', 'మైసూరు', 'నాగపూర్', 'ఫరీదాబాద్',
  'అయోధ్య', 'వారణాసి', 'కాన్పూర్', 'విశాఖపట్నం', 'ముంగేరు', 'సూరత్', 'రాజకోట్', 'విరోడ్', 'మైదూర్',
  // Rest of the world
  'టోక్యో', 'దేల్లీ', 'షాంగ్‌హై', 'మెక్సికో సిటీ', 'సాంపా పాలో', 'ముంబై', 'కైరో', 'మాస్కో', 'బెజర్స్', 'సింగపూర్',
  'సిడ్నీ', 'మెల్బోర్న్', 'జోహన్నెస్‌బర్గ్', 'టోరంటో', 'వాంకోవర్', 'మాంట్రియల్', 'పారిస్', 'బెర్లిన్', 'రోమ్', 'మాడ్రిడ్',
  'మిలాన్', 'న్యూయార్క్', 'లాస్ ఏంజెల్స్', 'షికాగో', 'ఫిలడెల్ఫియా', 'హ్యూస్టన్', 'ఫోనిక్స్', 'బోస్టన్', 'వాషింగ్టన్', 'సియాటిల్',
  'డెట్రాయిట్', 'మిన్నియాపోలిస్', 'డెన్వర్', 'బ్రిస్బేన్', 'పెర్త్', 'ఆమ్స్టర్‌డామ్', 'బ్రుస్సెల్స్', 'జ్యూరిక్', 'వియెన్నా', 'ప్రాగ్', 'వార్శా',
  'బుడాపెస్ట్', 'స్టాక్‌హోమ్', 'ఒస్లో', 'కోపెన్‌హెగన్', 'హెల్సింకి', 'మాస్కో', 'సెంట్ పీటర్స్‌బర్గ్', 'ఇస్తాంబుల్', 'టెహరాన్', 'దుబాయ్',
  'రియాధ్', 'బగ్‌దాద్', 'అమ్మాన్', 'బేరూత్', 'జకార్తా', 'బాంకాక్', 'హో చి మిన్ సిటీ', 'మనిలా', 'సెూల్', 'బీజింగ్', 'గువాంగ్‌జౌ',
  'షెన్‌జెన్', 'చెండు', 'లాగోస్', 'కాసాబ్లాంకా', 'అదిస్ అబాబా', 'నైరోబి', 'అల్‌జీయర్', 'ట్యూనిస్', 'లిమా', 'బోగోటా', 'సాంటియాగో',
  'కారాస్', 'డకార్', 'అబిజాన్', 'ఆక్రా',
];

// --- India: prominent pilgrimage and sacred sites --------------------------
const PILGRIMAGE = [
  'వారణాసి', 'సారనాథ్', 'రామనగర్', 'అయోధ్య', 'ప్రయాగరాజ్', 'మథురా', 'కేదార్', 'బద్రీనాథ్', 'హరిద్వార్', 'రిశికేశ్', 'అమృత్సర్', 'హర్‌మన్‌దిర్', 'భోర్', 'పురీ', 'జగద్నాథపూరి', 'కోణార్క్', 'మహాకాలేశ్వర్', 'బోధ్ గయ', 'గయ', 'బుద్ధ గయ', 'రామేశ్వర', 'శ్రీరంగం', 'తిరుపతి', 'తిరుమలి', 'కారైకల్', 'మహాబలేశ్వరం', 'రామేశ్వరం', 'హరిద్వార', 'అక్షరవైయాత్రం', 'వేదాగిరి', 'శ్రీ వేంకటేశ్వర', 'శ్రీశైలం', 'గుర్రాలకమ్', 'అమరావతి', 'మహేశ్వర', 'ముంబై మీనాక్సవర్', 'కాలిఘాట్', 'కృష్ణ', 'ఘటేశ్వర్', 'మహాకాళేశ్వర', 'ఎలురు', 'మళ్ళీపూరం', 'కృష్ణద్వరం', 'అమర్జయపురం', 'కాసీనాథ్', 'హైదరాబాద్', 'యాగండి', 'సామీపేట', 'ములుగు', 'అరవేలి', 'సిద్ధశ్రీ', 'పాలితనా', 'జైన్', 'పాలితన', 'ఓంకారేశ్వర్', 'మాణసముగ్ర', 'ఇంద్ర', 'శ్రీరంగపూర్', 'కుండల', 'శ్రీహరి', 'శిరుడి', 'శ్రీనివాస', 'దుర్గా', 'అహోభవత్', 'శ్రీ కాళ్ళ', 'కశీ', 'కాంకణ', 'మణిమత్తి', 'అమృత', 'సర్ణభవ', 'పంచవటి', 'హిమాచల', 'మన్న', 'శైలపుత్ర', 'అమర్కాండక్', 'నాగేశ్వర',
];

function report(title, list) {
  const missing = list.filter(c => !has(c));
  const found = list.length - missing.length;
  console.log(`\n=== ${title} (${list.length} checked) ===`);
  console.log(`  present: ${found}   missing: ${missing.length}`);
  if (missing.length) {
    // Group the misses so they are easy to act on.
    console.log('  ' + missing.join(', '));
  } else {
    console.log('  all present');
  }
  return missing;
}

console.log(`regions: ${REGIONS.length}   cities: ${all.size}`);
report('Major world cities', WORLD);
const m1 = report('India pilgrimage sites', PILGRIMAGE);

const dupes = Object.entries(where).filter(([, v]) => v.length > 1);
console.log(`\n=== Duplicates ===`);
console.log(dupes.length
  ? '  ' + dupes.map(([c, v]) => `${c} (${v.join(', ')})`).join('\n  ')
  : '  none');

const empties = REGIONS.filter(r => !r.cities.length);
console.log(`\n=== Empty regions ===`);
console.log(empties.length ? '  ' + empties.map(r => r.id).join(', ') : '  none');

// --- Script purity -------------------------------------------------------
// Names are Telugu plus Latin/space/ZWNJ. Anything else is a transliteration
// slip that slipped past a visual check, e.g. Hubballi typed in Kannada.
const SCRIPTS = [
  ['Bengali', 0x0980, 0x09ff], ['Devanagari', 0x0900, 0x097f],
  ['Gurmukhi', 0x0a00, 0x0a7f], ['Gujarati', 0x0a80, 0x0aff],
  ['Tamil', 0x0b80, 0x0bff], ['Kannada', 0x0c80, 0x0cff],
  ['Malayalam', 0x0d00, 0x0d7f], ['Sinhala', 0x0d80, 0x0dff],
  ['Thai', 0x0e00, 0x0e7f], ['Tibetan', 0x0f00, 0x0fff],
  ['Arabic', 0x0600, 0x06ff], ['Hebrew', 0x0590, 0x05ff],
  ['Cyrillic', 0x0400, 0x04ff], ['Armenian', 0x0530, 0x058f],
  ['Georgian', 0x10a0, 0x10ff], ['Ethiopic', 0x1200, 0x137f],
];
const OK_CP = c => (c >= 0x0c00 && c <= 0x0c7f)   // Telugu
  || (c >= 0x20 && c < 0x7f)                    // Latin, digits, punctuation
  || c === 0x200c || c === 0x200d;              // ZWNJ / ZWJ
const impure = [];
for (const r of REGIONS) for (const c of r.cities) {
  const scripts = SCRIPTS.filter(([, a, b]) =>
    [...c].some(ch => { const p = ch.codePointAt(0); return p >= a && p <= b; }))
    .map(([n]) => n);
  const stray = [...c].filter(ch => !OK_CP(ch.codePointAt(0)));
  if (scripts.length || stray.length) {
    impure.push(`${c} (${r.label})` +
      (scripts.length ? ` [${scripts.join(', ')}]` : '') +
      (stray.length ? ` [U+${[...new Set(stray)].map(o => o.codePointAt(0).toString(16).toUpperCase()).join(' U+')}]` : ''));
  }
}
console.log(`\n=== Script purity ===`);
console.log(impure.length ? '  ' + impure.join('\n  ') : '  all Telugu');

// --- Alias table sanity --------------------------------------------------
// Two mistakes have bitten this file already, both invisible in the checklist
// because the real city was still present under its correct name:
//   1. alias key -> key (never resolves to anything)
//   2. alias key that IS a stored city, remapped to a stale spelling
// Both silently drop an entry from the "present" count, so fail loudly.
const badAliases = [];
for (const [k, v] of ALIAS) {
  if (k === v) badAliases.push(`${k} -> ${v} (maps to itself)`);
  if (all.has(k) && !all.has(v)) badAliases.push(`${k} -> ${v} (${k} is a stored city but ${v} is not)`);
  if (!all.has(k) && !all.has(v)) badAliases.push(`${k} -> ${v} (neither spelling is stored)`);
}
console.log(`\n=== Alias table ===`);
console.log(badAliases.length ? '  ' + badAliases.join('\n  ') : '  ' + ALIAS.size + ' aliases, all resolve');

// --- Near-duplicate spellings -------------------------------------------
// Two places spelled two ways inside one region show up twice in the
// dropdown. Jaipur/Udaipur and Tashkent/Shymkent are genuinely different
// cities, so they are listed as known-safe.
const SAFE_NEAR = new Set([
  'జైపూర్~మైదూర్', 'తాష్‌కెంట్~షామ్‌కెంట్', 'బ్రస్సెల్స్~బ్రుస్సెల్స్',
]);
const near = (a, b) => {
  if (a === b || Math.abs(a.length - b.length) > 1) return false;
  const A = [...a], B = [...b];
  if (A.length !== B.length) return false;
  let diff = 0;
  for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) diff++;
  return diff > 0 && diff <= 2;
};
const nears = [];
for (const r of REGIONS) for (let i = 0; i < r.cities.length; i++)
  for (let j = i + 1; j < r.cities.length; j++) {
    const a = r.cities[i], b = r.cities[j];
    if (a !== b && near(a, b) && !SAFE_NEAR.has(`${a}~${b}`) && !SAFE_NEAR.has(`${b}~${a}`))
      nears.push(`${a} ~ ${b} (${r.label})`);
  }
console.log(`\n=== Near-duplicate spellings ===`);
console.log(nears.length ? '  ' + nears.join('\n  ') : '  none');

const bad = m1.length + dupes.length + empties.length + impure.length
  + badAliases.length + nears.length;
process.exitCode = bad ? 1 : 0;
