// lib/scripture-clean.js — the single authority for what is scripture and what
// is website furniture.
//
// Scraped devotional pages carry adverts, breadcrumbs, print plugs, reader
// disclaimers, comment prompts and chapter navigation inline with the verses.
// Several of these were reaching the published site as if they were scripture,
// so every fetcher and cleaner shares the rules here rather than each keeping
// its own partial list.
//
// Usage:
//   const { isNoise, cleanParas } = require('./lib/scripture-clean');
//   const kept = cleanParas(scrapedLines);

const TELUGU = /[ఀ-౿]/;
const VERSE_END = /\|\|\s*[౦-౯0-9]+\s*\|\|/;   // "|| ౧ ||" or "|| 1 ||"

// English site furniture, from the generic WordPress layer.
const NOISE_PHRASES = [
  'Watch on Youtube', 'Watch on YouTube', 'Subscribe on YouTube',
  'Subscribe', 'Privacy Policy', 'Terms of Use', 'Terms and Conditions',
  'Share this', 'Related Posts', 'Related', 'You may also like',
  'Click here', 'Read more', 'Read More',
  'Report mistakes', 'Corrections',
  'Support this', 'Support Us', 'Donate',
  'Follow us', 'Follow on',
  'WhatsApp', 'Telegram', 'Facebook', 'Instagram', 'Twitter', 'Pinterest',
  'Buy Prabhata', 'Buy this book', 'Buy Now', 'Add to cart',
  'PhonePe', 'GooglePay', 'GPay', 'Paypal', 'PayPal',
  'Leave a Reply', 'Post Comment', 'Comments',
  'Categories', 'Tags:', 'Archive', 'Recent Posts',
  'Copyright', 'All rights reserved', '©', '®', '™',
  'Advertisements', 'Sponsored', 'Loading',
  'Previous:', 'Next:', 'Posted in', 'Posted on', 'Posted by',
  'Skip to content', 'Namaste !!', 'Like Loading',

  // Telugu furniture specific to these sources.
  'గమనిక',            // "[గమనిక: ...]" book advert
  'తదుపరి ప్రచురణ',        // "మా తదుపరి ప్రచురణ: ..." print advert
  'విప్రులకు',               // "విప్రులకు, ద్విజులకు విజ్ఞప్తి" disclaimer
  'వాట్సాప్',                     // channel plug
  'మరిన్ని ',                   // "మరిన్ని ... చూడండి." more-links nav
  'చూడండి',
  'నిత్య పారాయణ గ్రంథము',
  'ప్రచురణ',
  'స్టోత్రనిధి',
  'వ్యాఖ్యానించడానికి',         // "you must log in to comment"
  'ఈ శ్లోకాల అర్థం పెట్టండి',    // "set the meaning of these verses"
  'ధన్యవాదములు',
  'బాగుంది అయ్యా',
  'ఇప్పుడు ఆపదుద్ధారక',
];

// Whole-line furniture. Kept separate from phrases because these need to match
// the entire line, not appear anywhere inside real scripture.
const NOISE_EXACT = [
  /^\/\//,                              // "// శ్లోకాలు - తాత్పర్యం //"
  /^\(నిత్య పారాయణ గ్రంథము\)$/,
  /^["'(]?తెలుగు["'),]?$/,              // bare language name
  /^Read in /i,
  /^List of /i,
  /^Skip to content/i,
  /^Previous:/i,
  /^Next:/i,
  /^నమస్తే అండి/,                      // reader comment
  // A bare print-book title, e.g. "శ్రీ దుర్గా స్తోత్రనిధి". The source appends
  // one per chapter to promote the printed edition. Note the spelling differs
  // from the navbar's "స్టోత్రనిధి", so it needs its own rule.
  /^శ్రీ .*స్తోత్రనిధి$/,
  /^శ్రీ .*పారాయణ గ్రంథము$/,
  // Trailing ">>" is this site's chapter-navigation marker, e.g.
  // "ద్వితీయోఽధ్యాయః (మహిషాసురసైన్యవధ) >>" and "కాఁకడ ఆరతీ >>".
  />>\s*$/,
  /^<<\s*/,
];

/** True when a scraped line is website furniture rather than scripture. */
function isNoise(line) {
  const s = String(line || '').trim();
  if (!s) return false;
  if (NOISE_EXACT.some((re) => re.test(s))) return true;
  if (NOISE_PHRASES.some((p) => s.includes(p))) return true;

  // Breadcrumb trails. These used \w, which is ASCII-only and therefore never
  // matched a Telugu trail like "స్తోత్రనిధి → శ్రీ శివ స్తోత్రాలు → లింగాష్టకం".
  if (/^Home\s*[›»>→]/.test(s)) return true;
  if (/^[^\s›»>→]+\s*[›»>→]\s*\S/.test(s)) return true;

  // Fully bracketed editorial notes, e.g. "[గమనిక: ...]".
  if (/^\s*\[.*\]\s*$/.test(s)) return true;

  // Bare URLs and social handles.
  if (/^https?:\/\//i.test(s)) return true;
  if (/^\s*www\./i.test(s)) return true;
  if (/^\s*@\w+/.test(s)) return true;

  return false;
}

/** A verse line either carries a "|| N ||" marker or is substantial Telugu. */
function looksLikeVerse(line) {
  if (VERSE_END.test(line)) return true;
  return (line.match(/[ఀ-౿]/g) || []).length >= 8;
}

/**
 * Drop furniture, non-Telugu lines, Latin-heavy lines and consecutive
 * duplicates. Returns a new array; input is not modified.
 */
function cleanParas(arr) {
  const kept = [];
  for (const raw of arr || []) {
    const line = String(raw || '').trim();
    if (!line) continue;
    if (isNoise(line)) continue;
    if (!TELUGU.test(line)) continue;

    const latin = (line.match(/[A-Za-z]/g) || []).length;
    const telugu = (line.match(/[ఀ-౿]/g) || []).length;
    if (latin > telugu) continue;

    if (!looksLikeVerse(line)) continue;
    if (kept[kept.length - 1] === line) continue;   // collapse adjacent dupes

    kept.push(line);
  }
  return kept;
}

/** Filter scraped page lines down to scripture, in place-free fashion. */
function cleanScrapedLines(lines) {
  return cleanParas(lines);
}

module.exports = {
  isNoise, looksLikeVerse, cleanParas, cleanScrapedLines,
  NOISE_PHRASES, NOISE_EXACT,
};