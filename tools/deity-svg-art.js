// tools/deity-svg-art.js
// Draws the deity tiles that have no usable photograph on Wikimedia Commons.
//
// For these thirteen the Commons search returned only temple architecture,
// festival crowds, or an unrelated deity. Shipping a wrong photograph on a
// devotional site is worse than shipping a symbol, so each gets a drawn
// attribute emblem instead: Yama's buffalo, Dattatreya's three faces, the
// twelve Adityas as twelve suns, and so on.
//
// These are not placeholders. Each is composed for the deity, shares the same
// frame and lighting as a photograph tile so the rail still looks even, and
// carries its own hue. Output lands in assets/deities/<slug>.svg and replaces
// the old emoji-on-gradient file.
//
// Usage: node tools/deity-svg-art.js            (write files)
//        node tools/deity-svg-art.js --check    (verify they exist, write nothing)

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'deities');
const CHECK = process.argv.includes('--check');

const frame = (slug, label, hue, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" role="img" aria-label="${label}">
<title>${label}</title>
<defs>
<radialGradient id="bg" cx="50%" cy="34%" r="78%">
<stop offset="0%" stop-color="hsl(${hue},58%,84%)"/>
<stop offset="58%" stop-color="hsl(${hue},50%,58%)"/>
<stop offset="100%" stop-color="hsl(${hue},46%,32%)"/>
</radialGradient>
<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#ffe9b0"/><stop offset="55%" stop-color="#e8b64c"/><stop offset="100%" stop-color="#b8811f"/>
</linearGradient>
<linearGradient id="pale" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#fffdf6"/><stop offset="100%" stop-color="#e6dcc4"/>
</linearGradient>
<filter id="soft" x="-25%" y="-25%" width="150%" height="150%">
<feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity=".33"/>
</filter>
</defs>
<rect width="400" height="400" fill="url(#bg)"/>
<g filter="url(#soft)">
${art}
</g>
</svg>
`;

// Shared pieces ------------------------------------------------------------
const TRIDENT = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="url(#gold)">
<rect x="-5" y="-34" width="10" height="96" rx="4"/>
<path d="M-46 -30 Q-46 -78 -22 -84 Q-22 -50 0 -50 Q22 -50 22 -84 Q46 -78 46 -30 Z"/>
<rect x="-30" y="-36" width="60" height="9" rx="4"/>
</g>`;

const DIYA = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
<ellipse cx="0" cy="14" rx="52" ry="13" fill="url(#gold)"/>
<path d="M-52 12 Q0 34 52 12 Q26 22 0 22 Q-26 22 -52 12Z" fill="#c8941f"/>
<path d="M0 -30 Q16 -6 9 6 Q0 14 -9 6 Q-16 -6 0 -30Z" fill="#ffdf7a"/>
<path d="M0 -18 Q8 -2 4 5 Q0 9 -4 5 Q-8 -2 0 -18Z" fill="#fff6d8"/>
</g>`;

const LOTUS = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="url(#pale)">
<path d="M0 0 Q-34 -26 -30 -52 Q0 -38 0 0Z"/>
<path d="M0 0 Q34 -26 30 -52 Q0 -38 0 0Z"/>
<path d="M0 0 Q-46 -6 -54 -28 Q-16 -22 0 0Z"/>
<path d="M0 0 Q46 -6 54 -28 Q16 -22 0 0Z"/>
<path d="M0 2 Q-20 -30 0 -62 Q20 -30 0 2Z"/>
</g>`;

const CROWN = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="url(#gold)">
<path d="M-34 18 Q-34 -18 0 -26 Q34 -18 34 18 Q0 30 -34 18Z"/>
<path d="M0 -26 L0 -54 L10 -34 L20 -50 L24 -28Z"/>
</g>`;

// Motifs ------------------------------------------------------------------
const ART = {
  crescent: `<g transform="translate(200 214)">
<circle cx="0" cy="-6" r="96" fill="none" stroke="url(#gold)" stroke-width="3" opacity=".5"/>
<path d="M34 -96 A104 104 0 1 0 34 96 A76 76 0 1 1 34 -96Z" fill="url(#pale)"/>
<path d="M34 -96 A104 104 0 1 0 34 96 A76 76 0 1 1 34 -96Z" fill="none" stroke="url(#gold)" stroke-width="4"/>
<g fill="url(#gold)">
<circle cx="-104" cy="-84" r="7"/><circle cx="-128" cy="18" r="5"/><circle cx="-78" cy="96" r="6"/>
<circle cx="112" cy="-58" r="5"/><circle cx="126" cy="52" r="4"/>
</g>
${DIYA(0, 118, 0.62)}
</g>`,

  buffalo: `<g transform="translate(200 200)">
<path d="M-40 -84 C-96 -120 -158 -84 -150 -18 C-146 -50 -120 -78 -84 -76 C-70 -75 -56 -78 -40 -84Z" fill="url(#gold)"/>
<path d="M40 -84 C96 -120 158 -84 150 -18 C146 -50 120 -78 84 -76 C70 -75 56 -78 40 -84Z" fill="url(#gold)"/>
<path d="M-150 -20 C-176 -6 -170 30 -148 34 C-152 12 -146 -6 -134 -14Z" fill="#2a1e14"/>
<path d="M150 -20 C176 -6 170 30 148 34 C152 12 146 -6 134 -14Z" fill="#2a1e14"/>
<path d="M-60 -66 Q0 -116 60 -66 Q78 -18 68 40 Q52 100 0 100 Q-52 100 -68 40 Q-78 -18 -60 -66Z" fill="#3a2c1e"/>
<path d="M-46 20 Q0 -2 46 20 Q44 92 0 92 Q-44 92 -46 20Z" fill="#221910"/>
<ellipse cx="-19" cy="46" rx="7" ry="5" fill="#0d0906"/><ellipse cx="19" cy="46" rx="7" ry="5" fill="#0d0906"/>
<g fill="#f7ead0">
<path d="M-56 -26 Q-40 -40 -24 -26 Q-40 -14 -56 -26Z"/>
<path d="M56 -26 Q40 -40 24 -26 Q40 -14 56 -26Z"/>
</g>
<circle cx="-40" cy="-26" r="6" fill="#140e09"/><circle cx="40" cy="-26" r="6" fill="#140e09"/>
<circle cx="0" cy="-86" r="11" fill="none" stroke="url(#gold)" stroke-width="6"/>
</g>`,

  wind: `<g transform="translate(200 200)">
<g fill="none" stroke="url(#pale)" stroke-linecap="round">
<path d="M-146 -54 Q-58 -54 -26 -18 Q-6 4 -34 16" stroke-width="17"/>
<path d="M-128 12 Q-34 12 -2 50 Q16 74 -18 84" stroke-width="15"/>
<path d="M-96 74 Q-14 74 12 106" stroke-width="12"/>
</g>
<g fill="none" stroke="url(#gold)" stroke-linecap="round" opacity=".9">
<path d="M-150 -96 Q-74 -96 -50 -68" stroke-width="8"/>
<path d="M96 -44 Q146 -44 162 -14" stroke-width="8"/>
<path d="M84 22 Q134 22 150 52" stroke-width="7"/>
<path d="M-150 118 Q-92 118 -60 96" stroke-width="6"/>
</g>
<g transform="translate(18 -14)">
<rect x="-6" y="-24" width="12" height="190" rx="6" fill="url(#gold)"/>
<path d="M8 -22 L124 -46 L124 42 L8 18Z" fill="url(#gold)"/>
<path d="M26 -14 L108 -32 L108 28 L26 10Z" fill="#c0392b"/>
<path d="M26 -14 L108 -32" stroke="#8e2b20" stroke-width="4" fill="none"/>
</g>
</g>`,

  threeface: `<g transform="translate(200 176)">
<g fill="url(#gold)">
<path d="M-104 -58 Q-104 -96 -72 -96 L-72 -112 L-92 -112 L-92 -128 L-52 -128 L-52 -146 L-20 -146 L-20 -160 L20 -160 L20 -146 L52 -146 L52 -128 L92 -128 L92 -112 L72 -112 L72 -96 Q104 -96 104 -58 Q104 -40 104 -34 L-104 -34 Q-104 -40 -104 -58Z" transform="translate(-152 40) scale(.62)"/>
</g>
<g fill="url(#gold)">
<path d="M-30 -104 Q-30 -136 0 -146 Q30 -136 30 -104 Q30 -88 30 -82 L-30 -82 Q-30 -88 -30 -104Z"/>
<path d="M0 -146 L0 -172 L11 -152 L22 -170 L26 -148Z"/>
</g>
<g transform="translate(-62 6) rotate(-15)">
<ellipse rx="34" ry="44" fill="#e6cb9e"/>
<path d="M-30 -26 Q0 -62 30 -26 L30 -14 Q0 -44 -30 -14Z" fill="url(#gold)"/>
<path d="M-4 -18 Q0 -4 4 -18" fill="none" stroke="#8a5a2a" stroke-width="3"/>
<g fill="#2a1d10"><ellipse cx="-13" cy="-8" rx="6" ry="4"/><ellipse cx="13" cy="-8" rx="6" ry="4"/></g>
<path d="M-10 18 Q0 25 10 18" fill="none" stroke="#8a5a2a" stroke-width="3"/>
</g>
<g transform="translate(62 6) rotate(15)">
<ellipse rx="34" ry="44" fill="#e6cb9e"/>
<path d="M-30 -26 Q0 -62 30 -26 L30 -14 Q0 -44 -30 -14Z" fill="url(#gold)"/>
<path d="M-4 -18 Q0 -4 4 -18" fill="none" stroke="#8a5a2a" stroke-width="3"/>
<g fill="#2a1d10"><ellipse cx="-13" cy="-8" rx="6" ry="4"/><ellipse cx="13" cy="-8" rx="6" ry="4"/></g>
<path d="M-10 18 Q0 25 10 18" fill="none" stroke="#8a5a2a" stroke-width="3"/>
</g>
<g>
<ellipse rx="46" ry="56" fill="#f4e2c2"/>
<path d="M-42 -34 Q0 -76 42 -34 L42 -18 Q0 -56 -42 -18Z" fill="url(#gold)"/>
<path d="M-5 -24 Q0 -6 5 -24" fill="none" stroke="#8a5a2a" stroke-width="3.5"/>
<g fill="#2a1d10"><ellipse cx="-17" cy="-10" rx="7" ry="4.6"/><ellipse cx="17" cy="-10" rx="7" ry="4.6"/></g>
<path d="M-13 24 Q0 32 13 24" fill="none" stroke="#8a5a2a" stroke-width="3.5"/>
</g>
<g fill="#3a2a1c">
<ellipse cx="-132" cy="112" rx="30" ry="15"/><circle cx="-152" cy="98" r="11"/>
<ellipse cx="132" cy="112" rx="30" ry="15"/><circle cx="152" cy="98" r="11"/>
</g>
</g>`,

  lotus: `<g transform="translate(200 214)">
<circle cx="0" cy="-30" r="104" fill="none" stroke="url(#gold)" stroke-width="4" opacity=".55"/>
<g opacity=".95">${LOTUS(-84, 60, 0.72)}</g>
<g opacity=".95">${LOTUS(84, 60, 0.72)}</g>
<g>${LOTUS(0, 44, 1.5)}</g>
${DIYA(0, 126, 0.72)}
</g>`,

  srivilliputhur: `<g transform="translate(200 208)">
<path d="M-104 118 L-104 -8 Q-104 -46 -74 -46 L-74 -66 L-92 -66 L-92 -84 L-52 -84 L-52 -104 L-26 -104 L-26 -122 L0 -138 L26 -122 L26 -104 L52 -104 L52 -84 L92 -84 L92 -66 L74 -66 L74 -46 Q104 -46 104 -8 L104 118Z" fill="url(#gold)"/>
<path d="M-34 118 L-34 44 Q-34 18 0 18 Q34 18 34 44 L34 118Z" fill="#4a2c16"/>
<path d="M-34 44 Q-34 18 0 18 Q34 18 34 44Z" fill="#6b3d1c"/>
<g fill="url(#gold)">
<circle cx="-66" cy="-58" r="9"/><circle cx="66" cy="-58" r="9"/>
<rect x="-84" y="24" width="168" height="8" rx="4"/>
</g>
<g fill="#f0d9a6"><path d="M-46 -16 L-40 8 L-52 8Z"/><path d="M46 -16 L40 8 L52 8Z"/></g>
</g>`,

  parvathi: `<g transform="translate(200 200)">
${TRIDENT(0, -96, 1.16)}
<g fill="none" stroke="url(#gold)" stroke-width="8" stroke-linecap="round">
<path d="M-136 18 Q-104 -14 -66 8"/>
<path d="M136 18 Q104 -14 66 8"/>
</g>
${LOTUS(-92, 108, 0.9)}
${LOTUS(92, 108, 0.9)}
${LOTUS(0, 96, 1.15)}
${DIYA(0, 156, 0.6)}
</g>`,

  rudra: `<g transform="translate(200 204)">
${TRIDENT(0, -56, 1.15)}
<g transform="translate(0 42)">
<path d="M-30 0 Q-30 -20 0 -20 Q30 -20 30 0 Q30 20 0 20 Q-30 20 -30 0Z" fill="url(#gold)"/>
<ellipse cx="0" cy="-22" rx="14" ry="8" fill="#8c2f16"/>
<path d="M0 -40 L0 -20" stroke="url(#gold)" stroke-width="4"/>
</g>
<g fill="none" stroke="url(#gold)" stroke-width="6" stroke-linecap="round" opacity=".9">
<path d="M-104 -18 Q-78 -50 -50 -24"/>
<path d="M104 -18 Q78 -50 50 -24"/>
</g>
<g fill="url(#gold)">
<circle cx="-96" cy="-88" r="9"/><circle cx="96" cy="-88" r="9"/>
<circle cx="-46" cy="-112" r="7"/><circle cx="46" cy="-112" r="7"/>
<circle cx="0" cy="-132" r="8"/>
</g>
</g>`,

  ashtalakshmi: `<g transform="translate(200 200)">
${[0,1,2,3,4,5,6,7].map(i => {
  const a = i * 45 - 90;
  return `<g transform="rotate(${a}) translate(0 -112) scale(.52)">${LOTUS(0, 0, 1)}</g>`;
}).join('\n')}
<circle cx="0" cy="0" r="46" fill="url(#gold)"/>
<g transform="translate(0 6) scale(.42)">${LOTUS(0, 0, 1)}</g>
<g>${LOTUS(0, 92, 0.8)}</g>
</g>`,

  vasus: `<g transform="translate(200 202)">
<g fill="url(#gold)">
${[0,1,2,3,4,5,6,7].map(i => {
  const a = i * 45 - 90, r = 108;
  const x = Math.round(Math.cos(a * Math.PI / 180) * r);
  const y = Math.round(Math.sin(a * Math.PI / 180) * r);
  return `<g transform="translate(${x} ${y})">
<path d="M-17 8 Q-17 -12 0 -14 Q17 -12 17 8 Q0 18 -17 8Z"/>
<path d="M-10 8 L-7 -6 Q0 -12 7 -6 L10 8Z" fill="#6b3d1c"/>
<path d="M0 -14 L0 -26 L7 -17Z" fill="#e8b64c"/>
</g>`;
}).join('\n')}
</g>
<circle cx="0" cy="0" r="46" fill="none" stroke="url(#pale)" stroke-width="5" opacity=".9"/>
<circle cx="0" cy="0" r="18" fill="url(#pale)"/>
</g>`,

  adityas: `<g transform="translate(200 200)">
<g>
${Array.from({ length: 12 }, (_, i) => {
  const a = (i * 30 - 90) * Math.PI / 180, r = 118;
  const x = Math.round(Math.cos(a) * r), y = Math.round(Math.sin(a) * r);
  return `<g transform="translate(${x} ${y})">
<circle r="24" fill="url(#gold)"/>
<g stroke="#a8641a" stroke-width="3" stroke-linecap="round">
<path d="M0 -33 L0 -43"/><path d="M0 33 L0 43"/>
<path d="M-33 0 L-43 0"/><path d="M33 0 L43 0"/>
<path d="M-23 -23 L-30 -30"/><path d="M23 -23 L30 -30"/>
<path d="M-23 23 L-30 30"/><path d="M23 23 L30 30"/>
</g>
</g>`;
}).join('\n')}
</g>
<circle r="44" fill="url(#gold)"/>
<circle r="30" fill="#ffd873"/>
<g stroke="#c98a20" stroke-width="3" fill="none">
<circle r="20"/><circle r="11"/>
</g>
</g>`,

  padma: `<g transform="translate(200 208)">
<g>${LOTUS(-74, 74, 1.05)}</g>
<g>${LOTUS(74, 74, 1.05)}</g>
<g>${LOTUS(0, 40, 1.6)}</g>
${DIYA(0, 132, 0.66)}
</g>`,

  gayatri: `<g transform="translate(200 196)">
<g stroke="url(#gold)" stroke-width="9" stroke-linecap="round">
${Array.from({ length: 24 }, (_, i) => {
  const a = i * 15 * Math.PI / 180;
  const c = Math.cos(a), s2 = Math.sin(a);
  const r0 = i % 2 ? 112 : 104;
  return `<path d="M${Math.round(c * r0)} ${Math.round(s2 * r0)} L${Math.round(c * 152)} ${Math.round(s2 * 152)}"/>`;
}).join('')}
</g>
<circle r="96" fill="url(#gold)"/>
<circle r="76" fill="#ffdd85"/>
<circle r="52" fill="#ffeeb4"/>
<g fill="#b8761d">
<path d="M0 -46 Q40 -22 32 8 Q22 52 -4 52 Q-34 52 -38 10 Q-36 -22 0 -46Z"/>
</g>
<g fill="none" stroke="#b8761d" stroke-width="9" stroke-linecap="round">
<path d="M-24 -14 Q-24 -32 -8 -32 Q8 -32 8 -14 Q8 4 -8 4 Q-24 4 -24 -14Z"/>
<path d="M-8 -22 Q-8 -6 -2 4"/>
</g>
<g transform="translate(0 128)">${DIYA(0, 0, 0.86)}</g>
</g>`,
};

const SPEC = [
  ['soma', 'Soma, the moon', 205, 'crescent'],
  ['yama', 'Yama', 8, 'buffalo'],
  ['vayu', 'Vayu, wind', 195, 'wind'],
  ['dattatreya', 'Dattatreya', 32, 'threeface'],
  ['kamakshi', 'Kamakshi', 320, 'lotus'],
  ['andal', 'Andal', 350, 'srivilliputhur'],
  ['parvathi', 'Parvathi', 300, 'parvathi'],
  ['ekadasha-rudras', 'Ekadasha Rudras', 240, 'rudra'],
  ['ashta-lakshmi', 'Ashta Lakshmi', 45, 'ashtalakshmi'],
  ['ashta-vasus', 'Ashta Vasus', 265, 'vasus'],
  ['dwadasha-adityas', 'Dwadasha Adityas', 36, 'adityas'],
  ['rajarajeshwari', 'Rajarajeshwari', 332, 'padma'],
  ['visalakshi', 'Visalakshi', 288, 'padma'],
  ['gayatri', 'Gayatri', 52, 'gayatri'],
];

let written = 0, missing = 0, skipped = 0;
for (const [slug, label, hue, artKey] of SPEC) {
  const dest = path.join(OUT, slug + '.svg');
  // A second pass over Wikipedia article leads and Commons categories found real
  // photographs for most of these, so they are no longer symbol-only. Never
  // resurrect an SVG where a photograph now exists; it would be a dead file
  // that silently shadows nothing and misleads whoever reads it next.
  if (fs.existsSync(path.join(OUT, slug + '.jpg')) || fs.existsSync(path.join(OUT, slug + '.png'))) {
    console.log('  skip  ' + slug.padEnd(20) + 'photograph now exists');
    skipped++;
    continue;
  }
  if (!ART[artKey]) { console.log('  no motif for ' + artKey); missing++; continue; }
  if (CHECK) {
    if (!fs.existsSync(dest)) { console.log('  MISSING ' + slug + '.svg'); missing++; }
    else written++;
    continue;
  }
  fs.writeFileSync(dest, frame(slug, label, hue, ART[artKey]));
  console.log('  drew ' + slug.padEnd(20) + hue + '  ' + artKey);
  written++;
}
console.log('\n' + written + ' drawn' + (skipped ? ', ' + skipped + ' skipped (photo exists)' : '') + (missing ? ', ' + missing + ' missing' : ''));
process.exitCode = missing ? 1 : 0;