// Audit the three sahasranamam modules for any non-scripture content.
const path = require('path');
const ROOT = path.join(__dirname, '..');

const bad = {
  'book advert (గమనిక)': /గమనిక/,
  'Click here to buy': /Click here to buy/i,
  'breadcrumb arrow': /→/,
  'nav marker >>': />>\s*$/,
  'nav marker <<': /<</,
  'language bar': /Read in/i,
  'List of Stotras': /List of Storas|List of Stotras/i,
  'Stotra Nidhi ref': /Stotra Nidhi/i,
  'bare Telugu lang name': /^["'(]?తెలుగు["'),]?$/,
  'social/share links': /Share this|Follow on|Like Loading|Connect on/i,
  'print advert': /తదుపరి ప్రచురణ|వాట్సాప్/,
  'disclaimer': /విప్రులకు/,
  'print book line': /స్తోత్రనిధి$/,
  'Related / Posted in': /^Related|^Posted in/i,
  'thoughts on': /thoughts on/i,
  'English 3+ letters': /[A-Za-z]{3,}/,
  'URL': /https?:\/\//,
  'adhikshloka marker': /\[\*\s*అధిక/,
  'dhyanam header line': /^ధ్యానమ్/,
  'purvapithika header line': /పూర్వపీఠిక/,
  'U+FFFD': /\uFFFD/,
  'Devanagari': /[ऀ-ॿ]/,
  'HTML entity': /&(amp|lt|gt|quot|nbsp|#\d+);/,
  'placeholder': /placeholder|TODO|FIXME/i,
};

let any = false;
for (const n of ['vishnu', 'lalitha', 'sita']) {
  const b = require(path.join(ROOT, 'content/' + n + '-sahasranamam-content.js')).books[0];
  const paras = b.chapters.flatMap((c) => c.paras);
  let found = 0;
  for (const [label, re] of Object.entries(bad)) {
    const m = paras.filter((p) => re.test(p));
    if (m.length) {
      found += m.length;
      any = true;
      console.log('  !! ' + n + ' [' + label + '] x' + m.length + '  e.g. ' + JSON.stringify(m[0].slice(0, 70)));
    }
  }
  if (!found) console.log('  CLEAN ' + n + ': ' + paras.length + ' paragraphs across ' + b.chapters.length + ' chapters, 0 noise markers');
}
console.log('');
console.log(any ? '  ^ issues found' : '  ALL THREE MODULES CLEAN - no ads, headers, footers, external links, mixed script or placeholders');