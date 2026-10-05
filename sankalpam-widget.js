// sankalpam-widget.js
// Saṅkalpam location selector for the home page.
//
// The visitor picks a CITY from a single grouped list. Choosing a city also
// fixes its region, and the region's geographic clause is composed into the
// saṅkalpam, so there is no separate free-text location field to fill in and
// no way for the two to disagree.

(function () {
  'use strict';

  const REGIONS = window.SANKALPAM_REGIONS || [];
  const STORAGE_KEY = 'saptarushi-sankalpam-city';

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /** Compose the geographic portion of the saṅkalpam. */
  function composeSankalpam(region, city) {
    if (!region) return '';
    const placeLine = city ? `${city} నగరే/గ్రామే వసతి గృహే, ` : '';
    return `${region.clause}, ${placeLine}అస్మిన్ వర్తమానే వ్యావహారిక చాంద్రమానేన, `
      + 'శ్రీ ప్రభవాది షష్ణి సంవత్సరాణాం మధ్యే... ఇతి సంకల్పః';
  }

  function render() {
    const root = document.getElementById('sankalpamWidget');
    if (!root) return;

    // Group by continent, then list each region as an optgroup of cities.
    // An option's value is "regionId::city" so one lookup resolves both.
    const byGroup = new Map();
    REGIONS.forEach(r => {
      if (!byGroup.has(r.group)) byGroup.set(r.group, []);
      byGroup.get(r.group).push(r);
    });

    const saved = localStorage.getItem(STORAGE_KEY) || '';
    const cityCount = REGIONS.reduce((n, r) => n + r.cities.length, 0);

    const options = [...byGroup.entries()].map(([group, regions]) => {
      const opts = regions.map(r => r.cities.map(city => {
        const value = r.id + '::' + city;
        return `            <option value="${escapeHtml(value)}"${value === saved ? ' selected' : ''}>`
          + `${escapeHtml(city)} — ${escapeHtml(r.label)}</option>`;
      }).join('\n')).join('\n');
      return `        <optgroup label="${escapeHtml(group)}">\n${opts}\n        </optgroup>`;
    }).join('\n');

    root.innerHTML = `
      <div class="sankalpam-picker">
        <label class="sankalpam-picker-label" for="sankalpamCity">
          <span class="sankalpam-picker-kicker">మీ నగరం</span>
          <span class="sankalpam-picker-hint">Your city · picks the region for you</span>
        </label>
        <div class="sankalpam-picker-control">
          <select id="sankalpamCity" class="sankalpam-picker-select">
            <option value="">— ఎంచుకోండి —</option>
${options}
          </select>
          <svg class="sankalpam-picker-chevron" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="sankalpam-picker-count">${cityCount} cities across ${REGIONS.length} regions</p>
      </div>
      <div id="sankalpamOutput" class="sankalpam-widget-output" lang="te"></div>
    `;

    const select = document.getElementById('sankalpamCity');
    const output = document.getElementById('sankalpamOutput');

    function update() {
      const raw = select.value;
      if (raw) localStorage.setItem(STORAGE_KEY, raw);
      else localStorage.removeItem(STORAGE_KEY);

      const sep = raw.indexOf('::');
      const regionId = sep >= 0 ? raw.slice(0, sep) : '';
      const city = sep >= 0 ? raw.slice(sep + 2) : '';
      const region = REGIONS.find(r => r.id === regionId);

      if (!region || !city) {
        output.innerHTML = '<p class="sankalpam-widget-hint">మీ నగరాన్ని ఎంచుకోండి — '
          + 'సంకల్పంలోని భౌగోళిక పాఠం అప్పటికకు ఇక్కడ కనిపిస్తుంది.</p>';
        return;
      }

      const text = composeSankalpam(region, city);
      output.innerHTML = `
        <p class="sankalpam-widget-place" lang="te">${escapeHtml(city)}</p>
        <p class="sankalpam-widget-text" lang="te">${escapeHtml(text)}</p>
        <p class="sankalpam-widget-meta">${escapeHtml(region.label)} · ${escapeHtml(region.group)}</p>
      `;
    }

    select.addEventListener('change', update);
    update();
  }

  window.SankalpamWidget = { render };
  document.addEventListener('DOMContentLoaded', render);
})();