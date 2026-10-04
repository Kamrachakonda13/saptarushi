// fetch-devi-content.js
// Downloads Durga Saptashati (13 chapters) into content/durga-saptashati-content.js.
// Run: node fetch-devi-content.js

const fs = require('fs');
const path = require('path');
const https = require('https');

const CONTENT_DIR = path.join(__dirname, 'content');
if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });

function fetchUrl(url, depth = 0) {
  return new Promise((resolve, reject) => {
    if (depth > 5) return reject(new Error('too many redirects'));
    https.get(url, { headers: { 'User-Agent': 'Saptarushi-Content-Fetcher/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return fetchUrl(new URL(res.headers.location, url).href, depth + 1).then(resolve, reject);
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      // Collect raw Buffers and decode ONCE at the end. Concatenating chunks as
      // strings (`data += c`) decodes each chunk independently, which destroys
      // any multi-byte Telugu character split across a chunk boundary and
      // silently yields U+FFFD.
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        let charset = (String(res.headers['content-type'] || '').match(/charset=([\w-]+)/i) || [])[1];
        if (!charset) {
          // Sniff a <meta charset> from the first 2KB, then default to UTF-8.
          const head = buf.slice(0, 2048).toString('latin1');
          charset = (head.match(/<meta[^>]+charset=["']?([\w-]+)/i) || [])[1] || 'utf-8';
        }
        try {
          resolve(buf.toString(charset.toLowerCase() === 'utf8' ? 'utf8' : charset));
        } catch (_) {
          resolve(buf.toString('utf8'));
        }
      });
    }).on('error', reject);
  });
}

// Site furniture (adverts, breadcrumbs, disclaimers, comment prompts) is
// stripped at extraction time. This was the original defect: the cleaner ran
// against a breadcrumb regex using \w, which is ASCII-only and never matched
// the Telugu trails the site emits, so 188 lines of furniture reached the site.
const { cleanScrapedLines } = require('./lib/scripture-clean');

function extractTelugu(html) {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '');
  text = text.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
  const teluguRe = /[ఀ-౿]/;
  return cleanScrapedLines(text.split('\n').map(l => l.trim()).filter(l => l && teluguRe.test(l)));
}

const SAPTASHATI_CHAPTERS = [
  { num: 1,  slug: 'madhukaitabha-vadha',          url: 'https://stotranidhi.com/durga-saptasati-chapter-1-madhukaitabha-vadha-in-telugu/' },
  { num: 2,  slug: 'mahishasura-sainya-vadha',     url: 'https://stotranidhi.com/durga-saptasati-chapter-2-mahishasura-sainya-vadha-in-telugu/' },
  // greatindian.net now 301-redirects chapter 3 to an English-only page with no
  // Telugu at all, so this chapter is read from stotranidhi.com instead.
  { num: 3,  slug: 'mahishasura-vadha',            url: 'https://stotranidhi.com/durga-saptasati-chapter-3-mahishasura-vadha-in-telugu/' },
  { num: 4,  slug: 'sakradi-stuti',                url: 'https://stotranidhi.com/durga-saptasati-chapter-4-sakradi-stuti-in-telugu/' },
  { num: 5,  slug: 'devi-duta-samvadam',           url: 'https://stotranidhi.com/durga-saptasati-chapter-5-devi-duta-samvadam-in-telugu/' },
  { num: 6,  slug: 'dhumralochana-vadha',          url: 'https://stotranidhi.com/durga-saptasati-chapter-6-dhumralochana-vadha-in-telugu/' },
  { num: 7,  slug: 'chanda-munda-vadha',           url: 'https://stotranidhi.com/durga-saptasati-chapter-7-chanda-munda-vadha-in-telugu/' },
  { num: 8,  slug: 'raktabeeja-vadha',             url: 'https://stotranidhi.com/durga-saptasati-chapter-8-raktabeeja-vadha-in-telugu/' },
  { num: 9,  slug: 'nishumbha-vadha',              url: 'https://stotranidhi.com/durga-saptasati-chapter-9-nishumbha-vadha-in-telugu/' },
  { num: 10, slug: 'shumbha-vadha',                url: 'https://stotranidhi.com/durga-saptasati-chapter-10-shumbha-vadha-in-telugu/' },
  { num: 11, slug: 'narayani-stuthi',              url: 'https://stotranidhi.com/durga-saptasati-chapter-11-narayani-stuthi-in-telugu/' },
  { num: 12, slug: 'bhagavati-vakyam',             url: 'https://stotranidhi.com/durga-saptasati-chapter-12-bhagavati-vakyam-in-telugu/' },
  { num: 13, slug: 'suratha-vaisya-vara-pradanam', url: 'https://stotranidhi.com/durga-saptasati-chapter-13-suratha-vaisya-vara-pradanam-in-telugu/' }
];

async function fetchSaptashati() {
  console.log('\n=== Durga Saptashati ===');
  const chapters = [];
  for (const ch of SAPTASHATI_CHAPTERS) {
    try {
      const html = await fetchUrl(ch.url);
      const verses = extractTelugu(html);
      if (verses.length < 5) {
        console.log(`  X Chapter ${ch.num}: only ${verses.length} lines — manual entry needed`);
        continue;
      }
      chapters.push({
        title: `అధ్యాయం ${ch.num} — ${ch.slug.replace(/-/g, ' ')}`,
        paras: verses
      });
      console.log(`  OK Chapter ${ch.num}: ${verses.length} lines`);
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.log(`  X Chapter ${ch.num}: ${e.message}`);
    }
  }

  const content = `// content/durga-saptashati-content.js
// Durga Saptashati (Devi Mahatmyam) — 13 chapters, Telugu.
// Auto-generated by fetch-devi-content.js on ${new Date().toISOString()}

const DurgaSaptashatiContent = {
  deity: 'durga',
  label: 'Durga / Devi',
  te: 'శ్రీ దుర్గా దేవి',
  stotras: [],
  poojas: [],
  mantras: [],
  homa: [],
  books: [
    {
      slug: 'durga-saptashati',
      te: 'శ్రీ దుర్గా సప్తశతీ',
      en: 'Durga Saptashati (Devi Mahatmyam)',
      meta: '13 chapters · 700 verses',
      chapters: ${JSON.stringify(chapters, null, 2)}
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) module.exports = DurgaSaptashatiContent;
else if (typeof window !== 'undefined') window.DurgaSaptashatiContent = DurgaSaptashatiContent;
`;

  fs.writeFileSync(path.join(CONTENT_DIR, 'durga-saptashati-content.js'), content);
  console.log(`\nWrote content/durga-saptashati-content.js with ${chapters.length} chapters.`);
}

fetchSaptashati().catch(e => { console.error(e); process.exit(1); });
