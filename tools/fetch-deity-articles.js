// tools/fetch-deity-articles.js
// Second iteration: pull specific Commons files identified from Wikipedia lead
// images and Commons category listings (see probe-deity-articles.js), download
// thumbnails for review, and record full attribution.
//
// Phase 1 searched Commons by text query only, which missed a lot. Article lead
// images and category membership surface temple photographs that no caption
// search finds, because the caption never names the deity.
//
// Usage:
//   node tools/fetch-deity-articles.js            # download thumbs + manifest
//   node tools/fetch-deity-articles.js kamakshi

const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT_ROOT = '/tmp/deity-art2';
const OUT_JSON = '/tmp/deity-art2.json';
const THUMB_W = 460;
const UA = 'SaptarushiDevotional/1.0 (image research; contact via repo)';
const ACCEPT = /^(cc0|cc by|cc by-sa|pd|public domain|no restrictions)/i;

const sleep = ms => new Promise(r => setTimeout(r, ms));
let lastAt = 0;
async function get(url) {
  const wait = 500 - (Date.now() - lastAt);
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
        }).on('error', rej).setTimeout(45000, function () { this.destroy(new Error('timeout')); });
      });
      return buf;
    } catch (e) {
      if (a >= 4) throw e;
      await sleep(3000 * (a + 1));
    }
  }
}

const stripHtml = s => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

// Files found by probing articles and categories. Order is the order to try.
const WANTED = {
  kamakshi: [
    'File:Idol-of-bangaru-kamakshi.jpg',
    'File:Kamakshi Ambal in Garbhalayam.jpg',
    'File:Inside the Kamakshi Temple in Kanchipuram.jpg',
    'File:Kamakshi Amman Temple Golden Gopurams.jpg',
  ],
  parvathi: [
    'File:WLA lacma Hindu Goddess Parvati Orissa.jpg',
    'File:Ardhanari.jpg',
    'File:God marriage AS.jpg',
  ],
  andal: [
    'File:SRI ANDAAL.jpg',
    'File:Sri Andal.jpg',
    'File:The Saint Andal LACMA M.86.94.2.jpg',
    'File:Lord Krishna with his head on the lap of the Alvar saint, Andal.JPG',
  ],
  vayu: [
    'File:Vayu Deva.jpg',
    'File:Vayu, the god of wind Statue at Gokarneshwor Mahadev Temple Premises, Gokarna, Nepal.jpg',
  ],
  dattatreya: [
    'File:Dattatreya.jpg',
    'File:Dattatreya at Saptashrungi (cropped).JPG',
    'File:Gurudev datta murti.jpg',
  ],
  gayatri: [
    'File:Gayatri1.jpg',
    'File:ಶ್ರೀ ಗಾಯತ್ರಿ ದೇವಿ.jpg',
  ],
  'ekadasha-rudras': [
    'File:Udaigiri cave 5 Rudras.jpg',
    'File:Part of Vyomamandala Showing Rudras - Circa 5th Century CE - Katra Keshav Devi.jpg',
  ],
  'dwadasha-adityas': [
    'File:Surya with Adityas.jpg',
    'File:Udaigiri cave 5 Adityas.jpg',
  ],
  yama: [
    'File:Yamraj.jpg',
    'File:Statue of Yamraj,a god of death, at Gokarnashwar Mahadev Temple Premises, Gorkha, Nepal.jpg',
  ],
  rajarajeshwari: [
    'File:Rajrajeshwori Durga Temple Pashupati Kathmandu Nepal Rajesh Dhungana.jpg',
    'File:Rajrajeshwori Durga Temple Pashupati Kathmandu Nepal Rajesh Dhungana 1.jpg',
  ],
  soma: [
    'File:Chandra, The Moon God; Folio from a Book of Dreams LACMA M.83.219.2 (2 of 3).jpg',
  ],
  visalakshi: [
    'File:காசி விசாலாட்சி கோயில்.jpg',
    'File:Visalakshi nagar from Kailasagiri train.jpg',
    'File:Kurunthamalai Murugan Temple Visalakshi Amman.jpg',
  ],
  'ashta-lakshmi': [
    'File:Ashtalakshmi Kovil - Temple of Eight Lakshmis, Chennai, Tamil Nadu, India.jpg',
    'File:Ashta Lakshmi Temple at Kommadi 01.JPG',
    'File:Ashta Lakshmi Temple at Kommadi 02.JPG',
    'File:Ashta- Lakshmi.jpg',
    'File:Ashtalakshmi temple plate.jpg',
    'File:Ashtalaxmi temple plate.jpg',
  ],
};

(async () => {
  const only = process.argv[2];
  const manifest = fs.existsSync(OUT_JSON) ? JSON.parse(fs.readFileSync(OUT_JSON, 'utf8')) : {};
  fs.mkdirSync(OUT_ROOT, { recursive: true });

  for (const [slug, titles] of Object.entries(WANTED)) {
    if (only && slug !== only) continue;
    const dir = path.join(OUT_ROOT, slug);
    fs.mkdirSync(dir, { recursive: true });
    const found = [];
    for (const title of titles) {
      const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo'
        + '&iiprop=url|extmetadata|mime&iiurlwidth=' + THUMB_W + '&titles=' + encodeURIComponent(title);
      let meta = null;
      try {
        const raw = (await get(url)).toString('utf8');
        const d = JSON.parse(raw);
        const pages = Object.values(((d || {}).query || {}).pages || {});
        if (!pages.length || pages[0].missing !== undefined) {
          console.log('  ' + slug.padEnd(19) + 'absent   ' + title.slice(5, 62)); continue;
        }
        const ii = (pages[0].imageinfo || [])[0];
        if (!ii || !/^image\/(jpeg|png)$/.test(ii.mime || '')) {
          console.log('  ' + slug.padEnd(19) + 'not-image ' + title.slice(5, 62)); continue;
        }
        const em = ii.extmetadata || {};
        const lic = stripHtml(em.LicenseShortName && em.LicenseShortName.value);
        if (!lic || !ACCEPT.test(lic) || /gfdl/i.test(lic)) {
          console.log('  ' + slug.padEnd(19) + 'license   ' + lic + ' -- ' + title.slice(5, 50)); continue;
        }
        meta = {
          title, lic, licUrl: stripHtml(em.LicenseUrl && em.LicenseUrl.value),
          author: stripHtml(em.Artist && em.Artist.value) || 'Unknown',
          desc: ii.descriptionurl, thumb: ii.thumburl,
        };
      } catch (e) { console.log('  ' + slug.padEnd(19) + 'ERR ' + e.message + ' -- ' + title.slice(5, 45)); continue; }
      try {
        const f = path.join(dir, found.length + '.jpg');
        fs.writeFileSync(f, await get(meta.thumb));
        meta.file = f;
        found.push(meta);
        console.log('  ' + slug.padEnd(19) + 'ok       ' + meta.lic.padEnd(14) + title.slice(5, 58));
      } catch (e) { console.log('  ' + slug.padEnd(19) + 'dl-fail  ' + e.message); }
      await sleep(300);
    }
    manifest[slug] = found;
  }
  fs.writeFileSync(OUT_JSON, JSON.stringify(manifest, null, 1));
  console.log('\nmanifest -> ' + OUT_JSON);
})();