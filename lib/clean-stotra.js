// lib/clean-stotra.js
// Centralised stotra-text cleaning: normalises entities, drops
// source-page noise lines, and re-joins lines into a clean array.

const NOISE_EXACT = new Set([
  'తెలుగు',
  'కన్నడ',
  'தமிழ்',
  'देवनागरी',
  'English',
  'English (IAST)',
]);

const NOISE_PREFIXES = [
  'List of Stotras',
  'Read in ',
  'స్తోత్రనిధి →',
  'Posted in',
  'Did you see',
  'Subscribe on',
  'Support this Dharma',
  'Connect on Facebook',
  'Click here to buy',
  'Related',
  'Next:',
  'Previous:',
  'వెతికింది',
  'వర్గాలు',
  '[గమనిక:',
  'గమనిక:',
];

// Lines that are usually a source-page title header like "... - Stotra Nidhi"
const SOURCE_STAMPS = [' - Stotra Nidhi', ' - BhaktiNidhi', ' - HinduNidhi', 'Prapatti - ', ' - greatindian'];

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function isNoiseLine(line) {
  const t = line.trim();
  if (!t) return false;
  if (NOISE_EXACT.has(t)) return true;
  for (const p of NOISE_PREFIXES) {
    if (t.startsWith(p)) return true;
  }
  for (const stamp of SOURCE_STAMPS) {
    if (t.includes(stamp)) return true;
  }
  // A line like "Read in తెలుగు / ಕನ್ನಡ / தமிழ் / देवनागरी / English (IAST)"
  if (/^\s*Read in\b/i.test(t)) return true;
  // Lines that consist mostly of English UI text
  if (/^[A-Za-z0-9\s\-–—:().,'!]+$/.test(t) && !/[ఀ-౿]/.test(t) && t.length > 12 && !t.includes('||')) {
    // keep pure English commentary? Source headers only: require an ASCII word at start
    return true;
  }
  return false;
}

function cleanStotra(text) {
  const lines = String(text || '').split('\n');
  const out = [];
  let lastBlank = false;
  for (let raw of lines) {
    const line = decodeEntities(raw).trim();
    if (!line) {
      if (out.length && !lastBlank) { out.push(''); lastBlank = true; }
      continue;
    }
    if (isNoiseLine(line)) continue;
    // Strip lines that are just the language-toggle fragment "తెలుగు /" etc.
    if (/^(తెలుగు|కన్నడ|हिन्दी|English|தமிழ்|देवनागरी)\s*\/?\s*(తెలుగు|కన్నడ|हिन्दी|English|தமிழ்|देवनागरी)*\s*\/?\s*$/.test(line)) continue;
    out.push(line);
    lastBlank = false;
  }
  // trim leading/trailing blanks
  while (out.length && out[0] === '') out.shift();
  while (out.length && out[out.length - 1] === '') out.pop();
  return out;
}

module.exports = { cleanStotra, decodeEntities, isNoiseLine };
