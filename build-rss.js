// build-rss.js
// Generates feed.xml from search-index.json.
const fs = require('fs');
const path = require('path');

require('./lib/env').loadEnv();

const ROOT = __dirname;
// Public origin for <link>/<guid>. Set SITE_URL in .env (or the environment)
// to the real deployment origin; the placeholder must be replaced before launch.
const SITE_URL = String(process.env.SITE_URL || 'https://saptarushi.example').replace(/\/+$/, '');
const SITE_TITLE = 'Saptarushi — తెలుగు భక్తి';
const SITE_DESC = 'Daily Telugu devotional content: stotras, mantras, poojas, prasadam and books.';

// XML-escape. The & replacement must run first so it does not double-escape
// the ampersands introduced by the later replacements.
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');
const now = new Date().toUTCString();

let items = [];
try {
  items = JSON.parse(fs.readFileSync(path.join(ROOT, 'search-index.json'), 'utf8')).items || [];
} catch (_) {}

const feedItems = items.slice(0, 100).map(it => `
    <item>
      <title>${esc(it.title)}${it.titleTe ? ' — ' + esc(it.titleTe) : ''}</title>
      <link>${SITE_URL}${esc(it.url)}</link>
      <guid isPermaLink="true">${SITE_URL}${esc(it.url)}</guid>
      <category>${esc(it.type)}</category>
      <description>${esc(it.snippet || it.subtitle || '')}</description>
      <pubDate>${now}</pubDate>
    </item>`).join('');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${esc(SITE_DESC)}</description>
    <language>te</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${feedItems}
  </channel>
</rss>
`;

fs.writeFileSync(path.join(ROOT, 'feed.xml'), xml);
console.log(`✓ feed.xml — ${items.slice(0, 100).length} items`);