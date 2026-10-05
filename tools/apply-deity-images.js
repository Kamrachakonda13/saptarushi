// tools/apply-deity-images.js
// Phase 2: turn the reviewed picks into files on disk.
//
// For each slug in tools/deity-image-picks.js:
//   pick -> re-download that candidate at full usable resolution into
//           assets/deities/<slug>.jpg
//   file -> fetch a Commons file by exact title
//   art  -> leave the placeholder alone; tools/deity-svg-art.js draws it
//
// Attribution is captured for every photograph and written to
// assets/deities/CREDITS.json, which build.js renders on the credits page.
// CC BY and CC BY-SA both require crediting the photographer, and BY-SA
// additionally requires that derivatives be shared under the same terms, so
// the license and its URL are stored verbatim rather than paraphrased.
//
// Usage: node tools/apply-deity-images.js            (report what it would do)
//        node tools/apply-deity-images.js --write

const fs = require('fs');
const path = require('path');
const https = require('https');

const PICKS = require('./deity-image-picks.js');
const CANDIDATES = '/tmp/deity-candidates.json';
const OUT_DIR = path.join(__dirname, '..', 'assets', 'deities');
const WRITE = process.argv.includes('--write');
const WIDTH = 900;

const UA = 'SaptarishiDevotional/1.0 (image fetch; contact via repo)';

const GAP_MS = 900;
let lastAt = 0;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function get(url, attempt = 0) {
  const wait = GAP_MS - (Date.now() - lastAt);
  if (wait > 0) return sleep(wait).then(() => get(url, attempt));
  lastAt = Date.now();
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': UA } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(get(res.headers.location, attempt));
      }
      if (res.statusCode === 429 || res.statusCode >= 500) {
        res.resume();
        if (attempt >= 4) return reject(new Error('HTTP ' + res.statusCode));
        return sleep(2500 * (attempt + 1)).then(() => resolve(get(url, attempt + 1)));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      const c = [];
      res.on('data', d => c.push(d));
      res.on('end', () => resolve(Buffer.concat(c)));
    }).on('error', err => {
      if (attempt >= 4) return reject(err);
      sleep(2500 * (attempt + 1)).then(() => resolve(get(url, attempt + 1)));
    }).setTimeout(60000, function () { this.destroy(new Error('timeout')); });
  });
}

async function imageInfo(title) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json'
    + '&titles=' + encodeURIComponent(title)
    + '&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=' + WIDTH;
  const d = JSON.parse((await get(url)).toString('utf8'));
  const pages = Object.values((d.query || {}).pages || {});
  if (!pages.length || pages[0].missing !== undefined) throw new Error('missing: ' + title);
  return (pages[0].imageinfo || [])[0] || {};
}

const stripHtml = s => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

function creditFor(title, ii) {
  const em = ii.extmetadata || {};
  return {
    title,
    author: stripHtml(em.Artist && em.Artist.value) || 'Unknown author',
    license: stripHtml(em.LicenseShortName && em.LicenseShortName.value) || 'see source',
    licenseUrl: stripHtml(em.LicenseUrl && em.LicenseUrl.value) || ii.descriptionurl,
    source: ii.descriptionurl,
  };
}

(async () => {
  const cands = fs.existsSync(CANDIDATES) ? JSON.parse(fs.readFileSync(CANDIDATES, 'utf8')) : {};
  const creditsPath = path.join(OUT_DIR, 'CREDITS.json');
  const credits = fs.existsSync(creditsPath) ? JSON.parse(fs.readFileSync(creditsPath, 'utf8')) : {};

  let ok = 0, skipped = 0;
  for (const [slug, spec] of Object.entries(PICKS)) {
    if (spec.art) { skipped++; continue; }

    const dest = path.join(OUT_DIR, slug + '.jpg');
    let title, ii;

    if (spec.file) {
      title = spec.file;
      try { ii = await imageInfo(title); }
      catch (e) { console.log('  FAIL  ' + slug.padEnd(20) + e.message); continue; }
    } else {
      const c = (cands[slug] || [])[spec.pick];
      if (!c) { console.log('  FAIL  ' + slug.padEnd(20) + 'no candidate at index ' + spec.pick); continue; }
      title = c.title;
      try { ii = await imageInfo(title); }
      catch (e) { console.log('  FAIL  ' + slug.padEnd(20) + e.message); continue; }
    }

    const src = ii.thumburl || ii.url;
    if (!src) { console.log('  FAIL  ' + slug.padEnd(20) + 'no url'); continue; }
    try {
      const buf = await get(src);
      if (WRITE) fs.writeFileSync(dest, buf);
      credits[slug] = Object.assign(creditFor(title, ii), { note: spec.note });
      console.log('  ' + (WRITE ? 'wrote ' : 'would ') + slug.padEnd(20)
        + String(Math.round(buf.length / 1024)).padStart(5) + ' KB  ' + credits[slug].license);
      ok++;
    } catch (e) {
      console.log('  FAIL  ' + slug.padEnd(20) + e.message);
    }
  }

  console.log('\n' + ok + ' photographs, ' + skipped + ' drawn symbols');
  if (WRITE) {
    fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 2) + '\n');
    console.log('credits -> ' + creditsPath);
  } else {
    console.log('\nDry run. Re-run with --write.');
  }
})();