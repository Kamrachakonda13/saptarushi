// tools/probe-deity-articles.js
// Second-iteration source for the deities that fell back to a drawn symbol.
//
// Phase 1 only searched Commons with text queries, and that turned out to miss
// a lot: Commons search is tuned for file captions, not for "show me pictures
// of this temple". Two better sources exist:
//
//   1. Wikipedia article lead images. A deity's or temple's article normally
//      leads with exactly the picture a reader expects.
//   2. Commons category membership. A temple has a category even when nothing
//      about it is text-searchable in a useful way.
//
// Probe both and print what exists, with licence, before anything is
// downloaded. Usage:
//   node tools/probe-deity-articles.js             # all
//   node tools/probe-deity-articles.js kamakshi    # one

const https = require('https');

const UA = 'SaptarushiDevotional/1.0 (image research; contact via repo)';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let lastAt = 0;
async function get(url) {
  const wait = 400 - (Date.now() - lastAt);
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
        }).on('error', rej).setTimeout(40000, function () { this.destroy(new Error('timeout')); });
      });
      if (String(buf).startsWith('redir')) continue;
      return buf.toString('utf8');
    } catch (e) {
      if (a >= 4) return null;
      await sleep(2000 * (a + 1));
    }
  }
}

const stripHtml = s => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const ACCEPT = /^(cc0|cc by|cc by-sa|pd|public domain|no restrictions)/i;

// Articles likely to lead with a usable photograph: the deity, and the temple
// that is their principal shrine.
const TARGETS = {
  kamakshi:         { pages: ['Kamakshi', 'Kamakshi Amman Temple'], cats: ['Kamakshi Amman Temple'] },
  visalakshi:       { pages: ['Visalakshi'], cats: ['Visalakshi'] },
  parvathi:         { pages: ['Parvati', 'Parvati Temple'], cats: [] },
  andal:            { pages: ['Andal', 'Srivilliputhur', 'Andal temple'], cats: ['Andal'] },
  'ashta-lakshmi':  { pages: ['Ashtalakshmi'], cats: ['Ashtalakshmi'] },
  rajarajeshwari:   { pages: ['Rajarajeshwari', 'Rajarajeshwari Temple'], cats: [] },
  yama:             { pages: ['Yama (Hinduism)'], cats: ['Yama in Hindu art'] },
  vayu:             { pages: ['Vayu', 'Vata (deity)'], cats: ['Vayu'] },
  dattatreya:       { pages: ['Dattatreya'], cats: ['Dattatreya'] },
  'ekadasha-rudras':{ pages: ['Rudras', 'Eleven Rudras'], cats: [] },
  'ashta-vasus':    { pages: ['Vasus', 'Vasus (Hinduism)'], cats: [] },
  'dwadasha-adityas': { pages: ['Adityas', 'Twelve Adityas'], cats: [] },
  gayatri:          { pages: ['Gayatri', 'Gayatri mantra'], cats: ['Gayatri'] },
  soma:             { pages: ['Soma (Hinduism)', 'Chandra (Hinduism)'], cats: [] },
};

async function articleImages(title) {
  const url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages|images'
    + '&piprop=original|name&imlimit=200&titles=' + encodeURIComponent(title);
  const raw = await get(url);
  if (!raw) return null;
  let d; try { d = JSON.parse(raw); } catch (e) { return null; }
  const pages = Object.values(((d || {}).query || {}).pages || {});
  if (!pages.length || pages[0].missing !== undefined) return null;
  const p = pages[0];
  return {
    title: p.title,
    original: p.original && p.original.source,
    files: (p.images || []).map(i => i.title).filter(t => /^File:.*\.(jpe?g|png)$/i.test(t)),
  };
}

async function fileMeta(titles) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo'
    + '&iiprop=url|extmetadata|mime&iiurlwidth=700&titles='
    + encodeURIComponent(titles.slice(0, 40).join('|'));
  const raw = await get(url);
  const out = [];
  if (!raw) return out;
  let d; try { d = JSON.parse(raw); } catch (e) { return out; }
  for (const p of Object.values(((d || {}).query || {}).pages || {})) {
    const ii = (p.imageinfo || [])[0];
    if (!ii) continue;
    const em = ii.extmetadata || {};
    const lic = stripHtml(em.LicenseShortName && em.LicenseShortName.value);
    out.push({ title: p.title, lic, mime: ii.mime, thumb: ii.thumburl, url: ii.url,
               desc: ii.descriptionurl,
               author: stripHtml(em.Artist && em.Artist.value),
               ok: ACCEPT.test(lic) && !/gfdl/i.test(lic) });
  }
  return out;
}

async function catMembers(cat) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&list=categorymembers'
    + '&cmtype=file&cmlimit=60&cmtitle=' + encodeURIComponent('Category:' + cat);
  const raw = await get(url);
  if (!raw) return [];
  let d; try { d = JSON.parse(raw); } catch (e) { return []; }
  return (((d || {}).query || {}).categorymembers || []).map(m => m.title);
}

(async () => {
  const only = process.argv[2];
  for (const [slug, cfg] of Object.entries(TARGETS)) {
    if (only && slug !== only) continue;
    console.log('\n=== ' + slug + ' ===');
    const seen = new Set();

    for (const pt of cfg.pages) {
      const a = await articleImages(pt);
      if (!a) { console.log('  article "' + pt + '": not found'); await sleep(300); continue; }
      const leads = [];
      if (a.original) leads.push(a.original);
      for (const f of a.files) if (f !== a.original) leads.push(f);
      if (!leads.length) { console.log('  article "' + pt + '" (' + a.title + '): no image'); await sleep(300); continue; }
      const metas = await fileMeta(leads);
      const good = metas.filter(m => m.ok);
      console.log('  article "' + pt + '" -> ' + metas.length + ' images, ' + good.length + ' usable');
      good.slice(0, 6).forEach(m => {
        if (seen.has(m.title)) return;
        seen.add(m.title);
        console.log('    ' + m.lic.padEnd(16) + m.title.slice(5, 78));
      });
      await sleep(400);
    }

    for (const c of cfg.cats) {
      const mem = await catMembers(c);
      if (!mem.length) { console.log('  category "' + c + '": empty or absent'); await sleep(300); continue; }
      const metas = await fileMeta(mem);
      const good = metas.filter(m => m.ok);
      console.log('  category "' + c + '" -> ' + mem.length + ' files, ' + good.length + ' usable');
      good.slice(0, 6).forEach(m => {
        if (seen.has(m.title)) return;
        seen.add(m.title);
        console.log('    ' + m.lic.padEnd(16) + m.title.slice(5, 78));
      });
      await sleep(400);
    }
  }
})();