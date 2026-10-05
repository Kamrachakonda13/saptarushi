// tools/apply-deity-articles.js
// Second iteration: install the photographs found by probing Wikipedia article
// lead images and Commons categories (probe-deity-articles.js ->
// fetch-deity-articles.js), replacing the drawn symbols that were standing in
// for them.
//
// Picks are indices into the /tmp/deity-art2.json candidate rows and were made
// by eye, same as the first pass. Where the chosen photograph is not square it
// is centre-cropped, because a 500x66 panorama renders as an unreadable sliver
// in a 400x400 tile. Cropping is a modification and is declared on the credits
// page rather than hidden.
//
// Usage:
//   node tools/apply-deity-articles.js            # dry run
//   node tools/apply-deity-articles.js --write

const fs = require('fs');
const path = require('path');
const https = require('https');

const MANIFEST = '/tmp/deity-art2.json';
const OUT_DIR = path.join(__dirname, '..', 'assets', 'deities');
const CREDITS = path.join(OUT_DIR, 'CREDITS.json');
const WRITE = process.argv.includes('--write');
const WIDTH = 900;
const UA = 'SaptarishiDevotional/1.0 (image fetch; contact via repo)';

// slug -> { pick, crop?, note }
const PICKS = {
  kamakshi:    { pick: 0, note: 'Kamakshi in the arch of her shrine, with attendants and lamps' },
  parvathi:    { pick: 1, note: 'Parvathi seated on her lion holding the trident' },
  andal:       { pick: 2, note: 'bronze standing Andal, the Alvar saint of Srivilliputhur' },
  vayu:        { pick: 0, note: 'Vayu Deva on his mount with the banner and attendants' },
  dattatreya:  { pick: 1, note: 'Saptashrungi Dattatreya; the three faces and three crowns are all visible' },
  gayatri:     { pick: 1, note: 'Gayatri Devi seated on the lotus' },
  'ekadasha-rudras': { pick: 0, note: 'the Udaigiri panel of the eleven Rudras' },
  'dwadasha-adityas': { pick: 1, note: 'the Udaigiri panel of the twelve Adityas' },
  yama:        { pick: 0, note: 'Yama seated in the marble relief, staff in hand' },
  // The only photograph of the eight Lakshmis anywhere on Commons is a 500x66
  // panorama of all eight seated in a row, so it is centre-cropped to square.
  'ashta-lakshmi': { pick: 3, crop: 'square', note: 'the eight Lakshmis seated in a row; centre-cropped from a wide panorama' },
};

const sleep = ms => new Promise(r => setTimeout(r, ms));
let lastAt = 0;
async function get(url) {
  const wait = 600 - (Date.now() - lastAt);
  if (wait > 0) await sleep(wait);
  lastAt = Date.now();
  for (let a = 0; ; a++) {
    try {
      const buf = await new Promise((res, rej) => {
        https.get(url, { headers: { 'User-Agent': UA } }, r => {
          if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) { r.resume(); return rej(new Error('redir')); }
          if (r.statusCode === 429 || r.statusCode >= 500) { r.resume(); return rej(new Error('HTTP ' + r.statusCode)); }
          if (r.statusCode !== 200) { r.resume(); return rej(new Error('HTTP ' + r.statusCode)); }
          const c = []; r.on('data', d => c.push(d)); r.on('end', () => res(Buffer.concat(c)));
        }).on('error', rej).setTimeout(60000, function () { this.destroy(new Error('timeout')); });
      });
      return buf;
    } catch (e) {
      if (a >= 5) throw e;
      await sleep(4000 * (a + 1));
    }
  }
}

(async () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const credits = fs.existsSync(CREDITS) ? JSON.parse(fs.readFileSync(CREDITS, 'utf8')) : {};
  let ok = 0;

  for (const [slug, spec] of Object.entries(PICKS)) {
    const c = (manifest[slug] || [])[spec.pick];
    if (!c) { console.log('  FAIL  ' + slug.padEnd(19) + 'no candidate at index ' + spec.pick); continue; }

    const info = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo'
      + '&iiprop=url&iiurlwidth=' + WIDTH + '&titles=' + encodeURIComponent(c.title);
    let url = c.thumb;
    try {
      const d = JSON.parse((await get(info)).toString('utf8'));
      const pg = Object.values(((d || {}).query || {}).pages || {});
      if (pg.length && pg[0].imageinfo && pg[0].imageinfo[0])
        url = pg[0].imageinfo[0].thumburl || pg[0].imageinfo[0].url;
    } catch (e) { console.log('  info retry, using cached thumb: ' + slug); }

    const dest = path.join(OUT_DIR, slug + '.jpg');
    try {
      let buf;
      try {
        buf = await get(url);
      } catch (e) {
        // Commons throttles bursts hard. The review thumbnail was already
        // downloaded at 460px, which is ample for a tile that renders ~48px,
        // so fall back to it rather than dropping the deity back to a symbol.
        if (!c.file || !fs.existsSync(c.file)) throw e;
        buf = fs.readFileSync(c.file);
        console.log('  (throttled, using cached 460px thumbnail for ' + slug + ')');
      }
      if (spec.crop === 'square') buf = cropSquare(buf);
      if (WRITE) fs.writeFileSync(dest, buf);
      credits[slug] = {
        title: c.title, author: c.author, license: c.lic,
        licenseUrl: c.licUrl || c.desc, source: c.desc, note: spec.note,
      };
      console.log('  ' + (WRITE ? 'wrote ' : 'would ') + slug.padEnd(19)
        + String(Math.round(buf.length / 1024)).padStart(5) + ' KB  ' + c.lic);
      ok++;
    } catch (e) {
      console.log('  FAIL  ' + slug.padEnd(19) + e.message);
    }
  }

  console.log('\n' + ok + ' of ' + Object.keys(PICKS).length + ' photographs');
  if (WRITE) {
    fs.writeFileSync(CREDITS, JSON.stringify(credits, null, 2) + '\n');
    // The drawn symbol is now dead weight for anything that gained a photo.
    let removed = 0;
    for (const slug of Object.keys(PICKS)) {
      const svg = path.join(OUT_DIR, slug + '.svg');
      if (fs.existsSync(svg)) { fs.unlinkSync(svg); removed++; }
    }
    console.log('removed ' + removed + ' superseded symbol SVGs');
    console.log('credits -> ' + CREDITS);
  } else console.log('\nDry run. Re-run with --write.');
})();

// Centre-crop to a square so a panorama does not become a sliver in the rail.
function cropSquare(buf) {
  const { execFileSync } = require('child_process');
  const tmpIn = path.join(require('os').tmpdir(), 'crop-in-' + Date.now() + '.jpg');
  const tmpOut = path.join(require('os').tmpdir(), 'crop-out-' + Date.now() + '.jpg');
  fs.writeFileSync(tmpIn, buf);
  execFileSync('sips', ['-c', '900', '900', tmpIn, '--out', tmpOut], { stdio: 'ignore' });
  const out = fs.readFileSync(tmpOut);
  fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut);
  return out;
}