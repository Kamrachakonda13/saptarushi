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
  // Population-centre spelling variants
  'పుణే': 'పూనే', 'కోయంబత్తూర్': 'కోయంబత్తూరు', 'విజయవాడా': 'విజయవాడ',
  'రాజకోట్': 'రాజ్‌కోట్', 'టోరంటో': 'టొరంటో', 'ఆక్రా': 'అక్రా', 'దేల్లీ': 'ఢిల్లీ', 'దిల్లీ': 'ఢిల్లీ',
  'బెజర్స్': 'జెరూసలేమ్', 'పురీ': 'పూరి', 'షిల్లాంగ్': 'షిల్లాంగ్',
  // Pilgrimage-site spelling variants
  'మథురా': 'మథుర', 'రిశికేశ్': 'ఋషికేశ్', 'హరిద్వార': 'హరిద్వార్',
  'మహాకాళేశ్వర్': 'మహాకాలేశ్వర్', 'మహాకాళేశ్వర': 'మహాకాలేశ్వర్',
  'మహేశ్వర': 'మహాకాలేశ్వర్',
  'శ్రీ వేంకటేశ్వర': 'తిరుపతి', 'తిరుమలి': 'తిరుపతి', 'శ్రీకాళహస్తి': 'శ్రీకాళహస్తి',
  'శ్రీ కాళ్ళ': 'శ్రీకాళహస్తి', 'శ్రీరంగపూర్': 'శ్రీరంగం', 'శ్రీహరి': 'శ్రీరంగం',
  'శ్రీనివాస': 'శ్రీరంగం', 'బుద్ధ గయ': 'బోధ్ గయ', 'కోశీనాథ్': 'కోశీనాథ్',
  'ఇంద్ర': 'ఇంద్ర', 'దుర్గా': 'దుర్గా', 'రామేశ్వర': 'రామేశ్వరం', 'షిరడి': 'శిరుడి',
  'శిరుడీ': 'శిరుడి', 'కృష్ణ': 'కృష్ణద్వరం',
  'జైన్': 'పర్శ్వనాథ్', 'పాలితన': 'పర్శ్వనాథ్', 'మాణసముగ్ర': 'మణసముగ్ర',
  'అమృత': 'అమృతసంస్థానం', 'మన్న': 'మన్నీ', 'కుండల': 'కుండలకోట',
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
  'వారణాసి', 'సారనాథ్', 'రామనగర్', 'అయోధ్య', 'ప్రయాగరాజ్', 'మథురా', 'కేదార్', 'బద్రీనాథ్', 'హరిద్వార్', 'రిశికేశ్', 'అమృత్సర్', 'స్వరన్ మండిర్', 'భోర్', 'చక్షదమ్పేణి', 'పురీ', 'జగద్నాథపూరి', 'కోణార్క్', 'మహాకాలేశ్వర్', 'బోధ్ గయ', 'గయ', 'బుద్ధ గయ', 'రామేశ్వర', 'శ్రీరంగం', 'తిరుపతి', 'తిరుమలి', 'కారైకల్', 'మహాబలేశ్వర్', 'రామేశ్వరం', 'హరిద్వార', 'అక్షరవైయాత్రం', 'వేదాగిరి', 'శ్రీ వేంకటేశ్వర', 'షిరడి', 'గుర్రాలకమ్', 'అమరావతి', 'మహేశ్వర', 'ముంబై మీనాక్సవర్', 'కాలకూజ', 'కృష్ణ', 'ఘటేశ్వర', 'మహాకాళేశ్వర', 'ఎలురు', 'మళ్ళీపూరం', 'కృష్ణద్వరం', 'అమర్జయపురం', 'కోశీనాథ్', 'హైదరాబాద్', 'యాగండి', 'సామీపేట', 'ములుగు', 'అరవేలి', 'సిద్ధశ్రీ', 'పర్శ్వనాథ్', 'జైన్', 'పాలితన', 'ఓంకారేశ్వర్', 'మాణసముగ్ర', 'ఇంద్ర', 'శ్రీరంగపూర్', 'కుండల', 'శ్రీహరి', 'శిరుడి', 'శ్రీనివాస', 'దుర్గా', 'అహోభవత్', 'శ్రీ కాళ్ళ', 'కశీ', 'కాంకణ', 'మణిమత్తి', 'అమృత', 'సర్ణభవ', 'పంచవటి', 'హిమాచల', 'మన్న', 'శైలపుత్ర', 'విధ్య', 'అమర్కాండక్', 'నాగేశ్వర',
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

process.exitCode = (m1.length || dupes.length || empties.length) ? 1 : 0;