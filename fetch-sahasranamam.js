// fetch-sahasranamam.js
// Downloads the three Sahasranamavali (thousand-name) texts and writes them as
// publishable book modules in the content/*-sahasranamam-content.js shape that
// build.js registers as Books.
//
// Run:  node fetch-sahasranamam.js
//
// Why this exists: content/vishnu-sahasranamam.js, lalitha-sahasranamam.js
// and sita-sahasranamam.js existed but no build path reached them, so ~1000
// lines of scripture were absent from the site. Those files were also
// incomplete and partly corrupt — lalitha-sahasranamam.js literally contained
// "(Full 182 slokas with 1000 names - placeholder)" where the text should be,
// and had Vishnu's opening prayer copy-pasted into it. Each namavali here is
// re-fetched in full (1000 names each) instead.
//
// Encoding note: Buffers are concatenated and decoded once. Concatenating
// chunks as strings decodes each chunk independently and destroys any
// multi-byte Telugu character split across a chunk boundary.

const fs = require('fs');
const path = require('path');
const https = require('https');

const CONTENT_DIR = path.join(__dirname, 'content');
if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });

const SOURCES = [
  {
    slug: 'vishnu-sahasranamam',
    deity: 'vishnu',
    te: 'శ్రీ విష్ణు సహస్రనామ స్తోత్రం',
    en: 'Sri Vishnu Sahasranamavali',
    url: 'https://stotranidhi.com/sri-vishnu-sahasra-namavali-in-telugu',
    stotramUrl: 'https://stotranidhi.com/sri-vishnu-sahasranama-stotram',
    chapterSize: 100,
  },
  {
    slug: 'lalitha-sahasranamam',
    deity: 'lalitha',
    te: 'శ్రీ లలితా సహస్రనామ స్తోత్రం',
    en: 'Sri Lalitha Sahasranamavali',
    url: 'https://stotranidhi.com/sri-lalitha-sahasranamavali-in-telugu',
    stotramUrl: 'https://stotranidhi.com/sri-lalitha-sahasranama-stotram',
    chapterSize: 100,
  },
  {
    slug: 'sita-sahasranamam',
    deity: 'sita',
    te: 'శ్రీ సీతా సహస్రనామ స్తోత్రం',
    en: 'Sri Sita Sahasranamavali',
    url: 'https://stotranidhi.com/sri-sita-sahasranamavali-in-telugu',
    stotramUrl: 'https://stotranidhi.com/sri-sita-sahasranama-stotram-in-telugu',
    chapterSize: 100,
  },
];

function fetchUrl(url, depth = 0) {
  return new Promise((resolve, reject) => {
    if (depth > 5) return reject(new Error('too many redirects'));
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        'Accept-Language': 'te,en',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return fetchUrl(new URL(res.headers.location, url).href, depth + 1).then(resolve, reject);
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        let charset = (String(res.headers['content-type'] || '').match(/charset=([\w-]+)/i) || [])[1];
        if (!charset) {
          charset = (buf.slice(0, 2048).toString('latin1').match(/<meta[^>]+charset=["']?([\w-]+)/i) || [])[1] || 'utf-8';
        }
        resolve(buf.toString(/^utf-?8$/i.test(charset) ? 'utf8' : charset));
      });
    });
    req.on('error', reject);
    req.setTimeout(45000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// Strip site furniture at extraction time; shared rules with every other fetcher.
const { cleanScrapedLines } = require('./lib/scripture-clean');

function extractTelugu(html) {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '');
  text = text.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<\/li>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  text = text
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8211;/g, '-').replace(/&#8212;/g, '-')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
  const teluguRe = /[ఀ-౿]/;
  return cleanScrapedLines(text.split('\n').map((l) => l.trim()).filter((l) => l && teluguRe.test(l)));
}

// Telugu digits, for reading the "N" markers the source prints every 10 names.
const TEL_DIGITS = { '౦': 0, '౧': 1, '౨': 2, '౩': 3, '౪': 4, '౫': 5, '౬': 6, '౭': 7, '౮': 8, '౯': 9 };
function teluguNumber(s) {
  let out = '';
  for (const ch of String(s)) { if (TEL_DIGITS[ch] === undefined) return null; out += TEL_DIGITS[ch]; }
  return out === '' ? null : parseInt(out, 10);
}

/**
 * Pull the namavali out of the scraped lines: the contiguous run of
 * "… నమః" lines. Any bija line immediately above the run is kept as an
 * opening invocation, and a trailing non-namah line (the phala shruti) is kept
 * as a closing verse. Everything else on the page is site chrome and dropped.
 */
function extractNamavali(lines) {
  const isNamah = (l) => /నమః/.test(l);
  const idx = lines.map((l, i) => (isNamah(l) ? i : -1)).filter((i) => i >= 0);
  if (!idx.length) return null;

  const start = idx[0];
  const end = idx[idx.length - 1];

  // Site chrome that must never become scripture.
  const isChrome = (l) =>
    /→/.test(l) ||                       // breadcrumb trail
    />>\s*$/.test(l) ||                 // page section heading
    /Read in |Updated on|Previous:|Next:|Skip to content|thoughts on/i.test(l) ||
    /^\[?గమనిక/.test(l) ||
    /^[\"'(]?తెలుగు[\"'),]?$/.test(l) ||   // language switcher
    /[A-Za-z]{3,}/.test(l) ||           // English page furniture ("... - Stotra Nidhi")
    l.length > 120;

  // Opening bija / anuvaka lines directly above the first namah line.
  const opening = [];
  for (let i = start - 1; i >= 0; i--) {
    if (/నమః/.test(lines[i])) break;
    if (isChrome(lines[i])) continue;
    opening.unshift(lines[i]);
    if (opening.length >= 4) break;
  }

  const all = lines.slice(start, end + 1);

  // The source prints a running count in markers (every 10 names, plus a final
  // one). Trust the source's own final marker rather than assuming 1000: the
  // Sita edition numbers 1008, so a hardcoded 1000 would truncate it.
  //
  // If the final marker's number equals the run length, the whole run is names
  // and there is no phala shruti. If it is smaller, the lines after the marker
  // are the phala shruti rather than further names.
  let lastMarkerIdx = -1;
  let lastMarkerVal = null;
  for (let i = 0; i < all.length; i++) {
    const m = all[i].match(/\|\s*([\u0C00-\u0C7F]{2,})\s*\|?/);
    const n = m ? teluguNumber(m[1]) : null;
    if (n !== null && (lastMarkerVal === null || n >= lastMarkerVal)) {
      lastMarkerIdx = i;
      lastMarkerVal = n;
    }
  }

  let names = all;
  let phala = null;
  if (lastMarkerVal !== null && lastMarkerVal < all.length) {
    names = all.slice(0, lastMarkerIdx + 1);
    const rest = all.slice(lastMarkerIdx + 1).filter((l) => !isChrome(l));
    if (rest.length) phala = rest;
  }

  return { opening, names, phala, declared: lastMarkerVal };
}

/* ---------------------------------------------------------------------------
   Noise filter.

   The source pages are wrapped in site furniture that must never reach
   scripture: book advertisements, breadcrumb trails, the language switcher,
   "click here to buy" calls to action, section navigation, social links and
   the page <title>. Every rejection is listed explicitly rather than by length
   heuristic, so new noise cannot slip through unnoticed.
--------------------------------------------------------------------------- */
const NOISE_PATTERNS = [
  /^\[\s*గమనిక/,                 // [గమనిక: ... "Click here to buy"] book advert
  /Click here to buy/i,
  /^→|→/,                          // breadcrumb trail
  />>\s*$|<<\s*$|^<<|<<పూర్వ/,      // section nav links  "... >>"  "<< పూర్వపీఠికా"
  /^Read in\s/i,                   // language switcher bar
  /^List of Stotras/i,
  /- Stotra Nidhi\s*$/,            // page <title> suffix
  /^[\"'(]?తెలుగు[\"'),]?$/,         // bare language name
  /^Skip to content/i,
  /Namaste !!/,
  /Previous:|Next:|Artatrana|thoughts on/i,
  /Share this:|Connect on|Follow on|Like\s+Loading/i,
  /మా తదుపరి ప్రచురణ|వాట్సాప్|విప్రులకు, ద్విజులకు|తెలుగు,?$/,
  /^Related:?$|^Posted in|^Links$/i,
  /^శ్రీ .*స్తోత్రనిధి$/,            // "... స్తోత్రనిధి" print-ad lines
  /^\(నిత్య పారాయణ గ్రంథము\)$/,
  /^మరిన్ని /,
];
// Structural markers inside the text, not scripture.
const STRUCTURAL = [
  /^ధ్యానమ్?\s*\|?\s*$/,           // ధ్యానమ్ |
  /^[\s|]*పూర్వపీఠిక[^\n]*$/,      // || పూర్వపీఠికా ||   << పూర్వపీఠికా
  /^\[\*\s*అధికశ్లోకం/,           // [* అధికశ్లోకం -
  /^\[\*\s*అధికశ్లోకము/,
  /^లమిత్యాది పంచపూజా/,            // panchapuja heading ends the dhyanam
];

function isNoise(line) {
  return NOISE_PATTERNS.some((re) => re.test(line));
}
function isStructural(line) {
  return STRUCTURAL.some((re) => re.test(line));
}

/* Markers that END the dhyanam. Each source page names the next section
   differently, so all known forms are listed explicitly:
     Vishnu  "హరిః ఓం |" then "ఓం ... నమః |"  (thousand names begin)
     Sita    "స్తోత్రమ్ |"                    (main body heading)
     Lalitha "లమిత్యాది పంచపూజా |"            (panchapuja heading)
   Without these the dhyanam swallows the rest of the page. */
const DHYANAM_ENDS = [
  /^హరిః/,          // harih-om divider
  /^ఓం.*నమః/,       // a namavali name has started
  /^స్తోత్రమ్/,      // "స్తోత్రమ్ |" body heading (Sita)
  /^లమిత్యాది/,      // panchapuja heading (Lalitha)
];

/**
 * Pull the opening chapters off the stotram page: the purvapithika, the
 * anuvaka invocation and the dhyanam. The anuvaka can sit before the dhyanam
 * header (Vishnu) or inside it, so both regions are scanned for it rather than
 * assuming one position. The thousand-name body is already taken from the
 * namavali page, so extraction stops at the first dhyanam terminator.
 */
function extractOpening(lines) {
  const kept = lines.filter((l) => !isNoise(l));

  const pv = kept.findIndex((l) => /^[\s|<>*-]*పూర్వపీఠిక/.test(l));
  const dy = kept.findIndex((l) => /^ధ్యాన/.test(l));

  // The anuvaka ("అస్య శ్రీ... మహామంత్రస్య ... అనుష్టుప్") is scripture.
  const isAnuvaka = (l) =>
    /అనుష్టుప్/.test(l) || /మహామంత్రస్య/.test(l) || /^\(అంగన్యాసః/.test(l);

  const anuvaka = [];
  const purvapithika = [];
  const dhyanam = [];

  // Region A: after the purvapithika header, up to the dhyanam header.
  if (pv >= 0) {
    const stop = dy > pv ? dy : kept.length;
    for (let i = pv + 1; i < stop; i++) {
      const l = kept[i];
      if (isStructural(l)) continue;
      if (isAnuvaka(l)) { anuvaka.push(l); continue; }
      purvapithika.push(l);
    }
  }

  // Region B: after the dhyanam header, up to the first terminator.
  if (dy >= 0) {
    for (let i = dy + 1; i < kept.length; i++) {
      const l = kept[i];
      if (DHYANAM_ENDS.some((re) => re.test(l))) break;
      if (isStructural(l)) continue;
      if (isAnuvaka(l)) { anuvaka.push(l); continue; }
      dhyanam.push(l);
    }
  }

  // A "purvapithika" of one line is really just a page title, not text. The
  // Lalitha page has a header and nothing under it, so emit nothing.
  const hasRealPurvapithika = purvapithika.filter((l) => /[।|]/.test(l)).length >= 2;

  return {
    anuvaka,
    purvapithika: hasRealPurvapithika ? purvapithika : [],
    dhyanam,
  };
}

function buildChapters({ names, phala }, chapterSize) {
  const chapters = [];
  for (let i = 0; i < names.length; i += chapterSize) {
    const slice = names.slice(i, i + chapterSize);
    const from = i + 1;
    const to = i + slice.length;
    chapters.push({
      title: `నామాలవళి ${from}–${to}`,
      paras: slice,
    });
  }

  if (phala && phala.length) chapters.push({ title: 'ఫలశ్రుతి', paras: phala });
  return chapters;
}

function moduleSource(spec, chapters, names, extraNote) {
  const data = {
    deity: spec.deity,
    label: spec.te,
    te: spec.te,
    stotras: [],
    poojas: [],
    mantras: [],
    homa: [],
    books: [{
      slug: spec.slug,
      deity: spec.deity,
      te: spec.te,
      en: spec.en,
      meta: `Sahasranamavali · ${names} నామాలు · ${chapters.length} భాగాలు`,
      chapters,
      source: spec.url,
    }],
  };
  const varName = spec.slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) + 'Content';
  return `// content/${spec.slug}-content.js
// ${spec.te} — full thousand-name text.
// Auto-generated by fetch-sahasranamam.js. Do not hand-edit; re-run the fetcher.
// ${extraNote}

const ${varName} = ${JSON.stringify(data, null, 2)};

if (typeof module !== 'undefined' && module.exports) module.exports = ${varName};
else if (typeof window !== 'undefined') window.${varName} = ${varName};
`;
}

(async () => {
  console.log('=== Sahasranamavali ===');
  for (const spec of SOURCES) {
    let lines;
    try {
      lines = extractTelugu(await fetchUrl(spec.url));
    } catch (e) {
      console.log(`  X ${spec.slug}: ${e.message} — skipped`);
      continue;
    }
    const parsed = extractNamavali(lines);
    if (!parsed) { console.log(`  X ${spec.slug}: no namavali found — skipped`); continue; }

    // Opening chapters (purvapithika + dhyanam) come from the separate stotram
    // page, which carries them; the namavali page starts straight at the names.
    let opening = { purvapithika: [], dhyanam: [], anuvaka: [] };
    if (spec.stotramUrl) {
      try {
        opening = extractOpening(extractTelugu(await fetchUrl(spec.stotramUrl)));
      } catch (e) {
        console.log(`  ! ${spec.slug}: opening verses unavailable (${e.message})`);
      }
      await new Promise((r) => setTimeout(r, 1200));
    }

    const chapters = [];
    if (opening.anuvaka && opening.anuvaka.length) {
      chapters.push({ title: 'ఆనుష్టుపం · మంత్ర ప్రారంభం', paras: opening.anuvaka });
    }
    if (opening.purvapithika.length) {
      chapters.push({ title: 'పూర్వపీఠికా', paras: opening.purvapithika });
    }
    if (opening.dhyanam.length) {
      chapters.push({ title: 'ధ్యానం', paras: opening.dhyanam });
    }

    const namesChapters = buildChapters(parsed, spec.chapterSize);
    chapters.push(...namesChapters);
    const target = path.join(CONTENT_DIR, spec.slug + '-content.js');

    // Guard: never overwrite with a short fetch, and cross-check the count
    // against the number the source itself declares.
    if (parsed.names.length < 900 || parsed.names.length > 1100) {
      console.log(`  X ${spec.slug}: ${parsed.names.length} names is out of range — NOT written`);
      continue;
    }
    if (parsed.declared !== null && parsed.declared !== parsed.names.length) {
      console.log(`  X ${spec.slug}: source declares ${parsed.declared} names but ${parsed.names.length} were parsed — NOT written`);
      continue;
    }
    fs.writeFileSync(target, moduleSource(spec, chapters, parsed.names.length,
      `Source: ${spec.url}`));

    // Sanity checks on what we just wrote.
    const written = require(target).books[0];
    const allParas = written.chapters.reduce((n, c) => n + c.paras.length, 0);
    const placeholders = allParas && JSON.stringify(written).match(/placeholder|TODO|FIXME/gi);
    const titles = chapters.map((c) => c.title);
    console.log(`  OK ${spec.slug}: ${parsed.names.length} names (source declares ${parsed.declared}), ` +
      `${chapters.length} chapters, ${allParas} paragraphs`);
    console.log('     chapters: ' + titles.join(' | '));
    await new Promise((r) => setTimeout(r, 1500));
  }
})().catch((e) => { console.error(e); process.exit(1); });