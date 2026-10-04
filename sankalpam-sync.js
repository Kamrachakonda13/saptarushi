// sankalpam-sync.js
// Auto-sync Sankalpam region data between localStorage and server.
// Runs on page load. No UI.

(function () {
  'use strict';

  const STORAGE_KEY = 'saptarushi-sankalpam-region';
  const SYNC_URL = '/api/sankalpam/region';

  // Debounce
  let syncTimer = null;
  function scheduleSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncToServer, 500);
  }

  function syncToServer() {
    const regionId = localStorage.getItem(STORAGE_KEY);
    const place = localStorage.getItem(STORAGE_KEY + '-place') || '';
    if (!regionId) return;

    fetch(SYNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regionId, place })
    }).catch(_ => {}); // Silently fail — offline is fine
  }

  // Listen for changes from sankalpam-widget.js
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === STORAGE_KEY + '-place') {
      scheduleSync();
    }
  });

  // Initial sync on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scheduleSync());
  } else {
    scheduleSync();
  }
})();