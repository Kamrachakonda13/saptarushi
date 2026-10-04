// search.js
// Client-side search using search-index.json.
// Works offline once the index is cached.

(function () {
  'use strict';

  // Resolve the index relative to this script, so pages in subdirectories
  // (books/, deity/, stotras/ ...) don't request books/search-index.json.
  const scriptEl = document.currentScript ||
    (function () {
      const all = document.getElementsByTagName('script');
      return all[all.length - 1];
    })();
  const INDEX_URL = (function () {
    const src = scriptEl && scriptEl.getAttribute('src');
    if (!src) return 'search-index.json';
    return src.replace(/[^/]*$/, '') + 'search-index.json';
  })();
  const MIN_QUERY_LEN = 2;
  const MAX_RESULTS = 20;

  let index = null;
  let pending = null;

  // Utility: escape HTML
  const escapeHtml = (s) => String(s || '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Load index (dedupes concurrent callers onto one in-flight request)
  function loadIndex() {
    if (index) return Promise.resolve(index);
    if (pending) return pending;
    pending = fetch(INDEX_URL)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        index = data.items || [];
        pending = null;
        return index;
      })
      .catch(() => {
        pending = null;
        return [];
      });
    return pending;
  }

  // Simple relevance scoring
  function score(item, query) {
    const q = query.toLowerCase();
    let score = 0;
    const title = String(item.title || '');
    const keywords = Array.isArray(item.keywords) ? item.keywords.join(' ') : String(item.keywords || '');
    const searchable = [title, item.titleTe, item.snippet, keywords].map(v => String(v || '')).join(' ').toLowerCase();
    const words = q.split(/\s+/).filter(w => w.length > 1);

    words.forEach(word => {
      if (searchable.includes(word)) score += 10;
      if (title.toLowerCase().startsWith(word)) score += 50;
      if (keywords.toLowerCase().includes(word)) score += 20;
    });
    return score;
  }

  // Search function
  function search(query) {
    const q = String(query || '').trim();
    if (q.length < MIN_QUERY_LEN) return Promise.resolve([]);
    return loadIndex().then(idx => {
      const items = Array.isArray(idx) ? idx : [];
      return items.map(item => ({ item, score: score(item, q) }))
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_RESULTS)
        .map(r => r.item);
    });
  }

  // Only allow same-document relative links; blocks javascript:/data: injection.
  function safeUrl(u) {
    const s = String(u || '');
    return /^\s*javascript:/i.test(s) || /^\s*data:/i.test(s) ? '#' : s;
  }

  // Render results
  function renderResults(results, container) {
    if (!results.length) {
      container.innerHTML = '<p class="search-no-results">ఫలితాలు లేవు</p>';
      return;
    }
    container.innerHTML = results.map(item => `
      <a class="search-result" href="${escapeHtml(safeUrl(item.url))}">
        <span class="search-result-type">${escapeHtml(item.type)}</span>
        <span class="search-result-title">${escapeHtml(item.title)}${item.titleTe ? ' — ' + escapeHtml(item.titleTe) : ''}</span>
        ${item.subtitle ? `<span class="search-result-subtitle">${escapeHtml(item.subtitle)}</span>` : ''}
      </a>
    `).join('');
  }

  // Init
  function init() {
    const input = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    if (!input || !resultsContainer) return;

    let debounceTimer = null;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const q = input.value.trim();
        if (q.length < 2) {
          resultsContainer.innerHTML = '';
          return;
        }
        search(q).then(results => renderResults(results, resultsContainer));
      }, 150);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#searchInput') && !e.target.closest('#searchResults')) {
        resultsContainer.innerHTML = '';
      }
    });
  }

  // Expose for other scripts
  window.Search = { loadIndex, search, init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();