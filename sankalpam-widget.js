// sankalpam-widget.js
// Sankalpam + Kalasha Puja widget, location-based.

(function () {
  'use strict';

  const REGIONS = window.SANKALPAM_REGIONS || [];
  const KALASHA = window.SANKALPAM_KALASHA || null;
  const STORAGE_KEY = 'saptarushi-sankalpam-region';

  // ---------- Compose the geographic sankalpam ----------
  function composeSankalpam(region, place) {
    if (!region) return '';
    const placeLine = place ? `${place} నగరే/గ్రామే వసతి గృహే, ` : '';
    return `${region.clause}, ${placeLine}అస్మిన్ వర్తమానే వ్యావహారిక చాంద్రమానేన, శ్రీ ప్రభవాది షష్ణి సంవత్సరాణాం మధ్యే... ఇతి సంకల్పః`;
  }

  // ---------- Compose the Kalasha Puja block ----------
  function composeKalasha() {
    if (!KALASHA) return '';
    return [
      KALASHA.heading,
      KALASHA.intro,
      KALASHA.verses.join('\n'),
      KALASHA.closing
    ].join('\n\n');
  }

  // ---------- Render ----------
  function render() {
    const root = document.getElementById('sankalpamWidget');
    if (!root) return;

    const groups = {};
    REGIONS.forEach(r => { (groups[r.group] || (groups[r.group] = [])).push(r); });

    const saved = localStorage.getItem(STORAGE_KEY) || '';
    const savedPlace = localStorage.getItem(STORAGE_KEY + '-place') || '';

    const options = Object.keys(groups).map(g =>
      `<optgroup label="${escapeHtml(g)}">
        ${groups[g].map(r =>
          `<option value="${escapeHtml(r.id)}"${r.id === saved ? ' selected' : ''}>${escapeHtml(r.label)}</option>`
        ).join('\n')}
      </optgroup>`
    ).join('\n');

    root.innerHTML = `
      <div class="sankalpam-widget">
        <label class="sankalpam-widget-field">
          <span class="sankalpam-widget-k">ప్రాంతం / Region</span>
          <select id="sankalpamRegion" class="sankalpam-widget-select">
            <option value="">— ఎంచుకోండి —</option>
            ${options}
          </select>
        </label>
        <label class="sankalpam-widget-field">
          <span class="sankalpam-widget-k">నగరం / గ్రామం</span>
          <input id="sankalpamPlace" class="sankalpam-widget-input"
                 placeholder="ఉదా: హైదరాబాద్, డల్లాస్, లండన్"
                 value="${escapeHtml(savedPlace)}"/>
        </label>
        <div id="sankalpamCityChips" class="sankalpam-widget-chips"></div>
      </div>
      <div id="sankalpamOutput" class="sankalpam-widget-output" lang="te"></div>
      <div id="sankalpamKalasha" class="sankalpam-widget-kalasha" lang="te"></div>
    `;

    const sel = document.getElementById('sankalpamRegion');
    const placeInput = document.getElementById('sankalpamPlace');
    const output = document.getElementById('sankalpamOutput');
    const kalasha = document.getElementById('sankalpamKalasha');
    const chips = document.getElementById('sankalpamCityChips');

    function update() {
      const regionId = sel.value;
      const place = placeInput.value.trim();
      const region = REGIONS.find(r => r.id === regionId);

      localStorage.setItem(STORAGE_KEY, regionId);
      localStorage.setItem(STORAGE_KEY + '-place', place);

      if (region && region.defaultCities && region.defaultCities.length) {
        chips.innerHTML = region.defaultCities.map(c =>
          `<button type="button" class="sankalpam-chip" data-city="${escapeHtml(c)}">${escapeHtml(c)}</button>`
        ).join('');
      } else {
        chips.innerHTML = '';
      }

      if (!region) {
        output.innerHTML = '<p class="sankalpam-widget-hint">పైన మీ ప్రాంతాన్ని ఎంచుకోండి — సంకల్పంలోని భౌగోళిక పాఠం ఇక్కడ కనిపిస్తుంది.</p>';
        kalasha.innerHTML = '';
        return;
      }

      const text = composeSankalpam(region, place);
      output.innerHTML = `
        <p class="sankalpam-widget-text" lang="te">${escapeHtml(text)}</p>
        <p class="sankalpam-widget-meta">${escapeHtml(region.label)}</p>
      `;

      kalasha.innerHTML = `
        <h3 class="sankalpam-widget-kalasha-heading" lang="te">${escapeHtml(KALASHA.heading)}</h3>
        <p class="sankalpam-widget-kalasha-intro" lang="te">${escapeHtml(KALASHA.intro)}</p>
        <p class="sankalpam-widget-kalasha-verse" lang="te">${KALASHA.verses.map(v => escapeHtml(v)).join('<br/>')}</p>
      `;
    }

    sel.addEventListener('change', update);
    placeInput.addEventListener('input', () => {
      clearTimeout(placeInput.__timer);
      placeInput.__timer = setTimeout(update, 250);
    });

    chips.addEventListener('click', (e) => {
      const btn = e.target.closest('.sankalpam-chip');
      if (!btn) return;
      placeInput.value = btn.dataset.city;
      update();
    });

    update();
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  window.SankalpamWidget = { render };
  document.addEventListener('DOMContentLoaded', render);
})();