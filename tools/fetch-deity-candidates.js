// tools/fetch-deity-candidates.js
// Phase 1 of getting real deity imagery: search Wikimedia Commons for each
// deity that still has a placeholder tile, keep only acceptably-licensed
// files, and download small thumbnails so they can be eyeballed before
// anything is committed.
//
// Usage:
//   node tools/fetch-deity-candidates.js            # search + download thumbs
//   node tools/fetch-deity-candidates.js vishnu     # just one slug
//
// Candidate thumbnails land in /tmp/deity-cand/<slug>/<n>.jpg and the
// harvested metadata in /tmp/deity-candidates.json for the pick phase.
//
// Why filter on license: everything shipped on this site is either our own or
// explicitly licensed. Commons files are mostly CC BY / CC BY-SA, both of which
// oblige us to credit the photographer, so the license string is captured here
// and later rendered on the credits page.

const fs = require('fs');
const path = require('path');
const https = require('https');
const SOURCES = require('./deity-image-sources.js');

const OUT_ROOT = '/tmp/deity-cand';
const OUT_JSON = '/tmp/deity-candidates.json';
const PER_TERM = 8;
const THUMB_W = 420;

// Accept freely-licensed or public-domain files only. GFDL on its own is
// excluded: it is a document licence with awkward attribution obligations and
// no clear grant for a web image, and Commons has CC equivalents for the same
// works.
const ACCEPT = /^(cc0|cc by|cc by-sa|pd|public domain|no restrictions)/i;
const REJECT = /gfdl/i;

// Commons throttles bursts hard: a first run returned empty candidate lists for
// a third of the deities purely because of 429s, which looks identical to
// "nothing on Commons matches". So every request is serialised with a small
// gap, and 429/503 is retried with backoff rather than swallowed.
const GAP_MS = 900;
let lastAt = 0;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get(url, binary, attempt = 0) {
  const wait = GAP_MS - (Date.now() - lastAt);
  if (wait > 0) await sleep(wait);
  lastAt = Date.now();
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'SaptarishiDevotional/1.0 (image research; contact via repo)' },
    }, async res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(get(res.headers.location, binary, attempt));
      }
      if (res.statusCode === 429 || res.statusCode >= 500) {
        res.resume();
        if (attempt >= 4) return reject(new Error('HTTP ' + res.statusCode));
        await sleep(2500 * (attempt + 1));
        return resolve(get(url, binary, attempt + 1));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(binary ? Buffer.concat(chunks) : Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', err => {
      if (attempt >= 4) return reject(err);
      sleep(2500 * (attempt + 1)).then(() => resolve(get(url, binary, attempt + 1)));
    });
    req.setTimeout(45000, () => req.destroy(new Error('timeout')));
  });
}

const stripHtml = s => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

async function search(term) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json'
    + '&generator=search&gsrnamespace=6&gsrlimit=' + PER_TERM
    + '&gsrsearch=' + encodeURIComponent(term)
    + '&prop=imageinfo&iiprop=url|extmetadata|mime|size&iiurlwidth=' + THUMB_W;
  let data;
  try { data = JSON.parse(await get(url, false)); } catch (e) { return []; }
  const pages = (data.query && data.query.pages) ? Object.values(data.query.pages) : [];
  const out = [];
  for (const p of pages) {
    const ii = (p.imageinfo || [])[0];
    if (!ii) continue;
    if (!/^image\/(jpeg|png)$/.test(ii.mime || '')) continue;   // svg is not a photo
    const em = ii.extmetadata || {};
    const lic = stripHtml(em.LicenseShortName && em.LicenseShortName.value);
    if (!lic || !ACCEPT.test(lic) || REJECT.test(lic)) continue;
    out.push({
      title: p.title,
      lic,
      licUrl: stripHtml(em.LicenseUrl && em.LicenseUrl.value),
      author: stripHtml(em.Artist && em.Artist.value) || 'Unknown',
      credit: stripHtml(em.Credit && em.Credit.value),
      descUrl: ii.descriptionurl,
      thumb: ii.thumburl,
      w: ii.thumbwidth, h: ii.thumbheight,
    });
  }
  return out;
}

(async () => {
  const only = process.argv[2];
  fs.mkdirSync(OUT_ROOT, { recursive: true });
  const manifest = fs.existsSync(OUT_JSON) ? JSON.parse(fs.readFileSync(OUT_JSON, 'utf8')) : {};
  const slugs = only ? [only] : Object.keys(SOURCES);

  for (const slug of slugs) {
    const src = SOURCES[slug];
    const dir = path.join(OUT_ROOT, slug);
    fs.mkdirSync(dir, { recursive: true });
    const seen = new Set();
    const found = [];
    for (const term of src.terms) {
      if (found.length >= 6) break;
      for (const c of await search(term)) {
        if (found.length >= 6) break;
        if (seen.has(c.title)) continue;
        seen.add(c.title);
        const n = found.length;
        const file = path.join(dir, n + '.jpg');
        try {
          fs.writeFileSync(file, await get(c.thumb, true));
          c.file = file;
          found.push(c);
        } catch (e) { /* skip unreadable thumb */ }
      }
    }
    manifest[slug] = found;
    console.log(slug.padEnd(20) + found.length + ' candidates');
  }
  fs.writeFileSync(OUT_JSON, JSON.stringify(manifest, null, 1));
  console.log('\nmanifest -> ' + OUT_JSON + '\nthumbs   -> ' + OUT_ROOT);
})();