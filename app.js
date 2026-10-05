// Deepam — runtime: text size, tabs, filters, player, "Ask Deepam" chat
(function () {
  'use strict';

  const D = DeepamData;
  if (window.__SN__) {
    D.audio = D.audio.concat(window.__SN__.audio);
    D.books = D.books.concat(window.__SN__.books);
  }
  const currentScript = document.currentScript;
  const base = currentScript && currentScript.getAttribute('data-base') || '';

  /* ---------- merge admin-managed content from the server ---------- */
  fetch(base + 'api/content')
    .then(r => r.ok ? r.json() : null)
    .then(store => {
      if (store && store.audio && store.audio.length) {
        const slugs = new Set(D.audio.map(a => a.slug));
        store.audio.forEach(a => { if (!slugs.has(a.slug)) { D.audio.push(a); if (a.deity && !D.deities.find(d => d.slug === a.deity)) D.deities.push({ slug: a.deity, label: a.deity, te: a.te, desc: '', symbol: '✦' }); } });
        attachTrackCards();
      }
      if (store && store.books && store.books.length) {
        const slugs = new Set(D.books.map(b => b.slug));
        store.books.forEach(b => { if (!slugs.has(b.slug)) D.books.push(b); });
      }
      renderAdminHomeAudio(store);
    })
    .catch(() => { /* serverless mode is fine */ });

/* ---------- asset base for relative pages ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s).replace(/[^\p{L}\p{N}]+/gu, ' ').toLowerCase().trim();

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- admin session ----------
     Admin-only UI is hidden unless the session token is actually valid, not
     merely present. Sessions live in an in-memory Map on the server, so a
     restart invalidates every token while the browser still holds it in
     localStorage. Checking presence alone left the editor visible to anyone
     whose browser had once been signed in, and every save then failed.
     A rejected token is cleared so the UI disappears immediately. */
  const TOKEN_KEY = 'saptarushi-admin-token';
  const USER_KEY = 'saptarushi-admin-user';
  let adminSession = null;   // null = not yet checked

  function isAdminSession() {
    if (adminSession !== null) return Promise.resolve(adminSession);
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { adminSession = false; return Promise.resolve(false); }
    return fetch(base + 'api/session', { headers: { 'X-Admin-Token': token } })
      .then(r => {
        if (!r.ok) throw new Error('unauthorised');
        return r.json();
      })
      .then(d => {
        adminSession = !!(d && d.ok);
        if (adminSession && d.user) localStorage.setItem(USER_KEY, d.user);
        return adminSession;
      })
      .catch(() => {
        // Stale or rejected: drop it so the admin UI disappears.
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        adminSession = false;
        return false;
      });
  }

  const deityBySlug = (slug) => D.deities.find(d => d.slug === slug);
  const audioOfDeity = (slug) => D.audio.filter(a => a.deity === slug);
  const booksOfDeity = (slug) => D.books.filter(b => b.deity === slug);

  /* ---------- Text size ---------- */
  const textBtns = $$('.textsize-btn');
  const sizes = ['base', 'large', 'xlarge'];
  const savedSize = localStorage.getItem('deepam-textsize') || 'base';
  document.documentElement.setAttribute('data-text-size', savedSize);
  textBtns.forEach((btn, i) => {
    if (sizes[i] === savedSize) btn.classList.add('active');
    btn.addEventListener('click', () => {
      document.documentElement.setAttribute('data-text-size', sizes[i]);
      localStorage.setItem('deepam-textsize', sizes[i]);
      textBtns.forEach((b, j) => b.classList.toggle('active', j === i));
    });
  });

  /* ---------- Mobile nav ---------- */
  const menuTrigger = $('.menu-trigger');
  const mobileNav = $('.mobile-nav');
  if (menuTrigger && mobileNav) {
    menuTrigger.addEventListener('click', () => mobileNav.classList.toggle('open'));
    $$('a', mobileNav).forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));
  }

  /* ---------- Player ---------- */
  const player = $('#player');
  let audio = null;
  let currentTrack = null;

  function stopPlayer() {
    if (audio) { audio.pause(); audio.currentTime = 0; audio = null; }
    currentTrack = null;
    if (player) player.classList.remove('show');
  }
  function stopAudioOnly() { if (audio) { audio.pause(); audio = null; } }

  function renderPlayer(track) {
    if (!player) return;
    currentTrack = track;
    $('#mpTe').textContent = track.te;
    $('#mpEn').textContent = track.en + ' · ' + track.tag;
    $('#mpToggle').textContent = '⏸';
    player.classList.add('show');
  }

  function playLocal(track) {
    stopAudioOnly();
    audio = new Audio(track.localPath);
    renderPlayer(track);
    audio.play().catch(() => { toast('Could not play «' + esc(track.en) + '» here.'); stopPlayer(); });
    audio.addEventListener('ended', () => { stopPlayer(); toast(track.te + ' finished.'); });
  }

  function togglePlay() {
    if (!audio || !currentTrack) return;
    if (audio.paused) { audio.play(); $('#mpToggle').textContent = '⏸'; }
    else { audio.pause(); $('#mpToggle').textContent = '▶'; }
  }
  if (player) {
    $('#mpToggle').addEventListener('click', togglePlay);
    $('#mpStop').addEventListener('click', stopPlayer);
  }

  /* ---------- Toast ---------- */
  let toastEl = $('#toast');
  let toastTimer;
  function toast(msg, ms = 3200) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.id = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
  }

  /* ---------- Internet links ---------- */
  const yt = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
  const web = (q) => 'https://www.google.com/search?q=' + encodeURIComponent(q);

  /* ---------- Tiles: play or route to internet ---------- */
  function attachTrackCards() {
    $$('.track-card').forEach(card => {
      if (card.__bound) return;
      card.__bound = true;
      const track = D.audio.find(a => a.slug === card.dataset.slug);
      if (!track || track.comingSoon) return;
      card.addEventListener('click', () => {
        // Validated session, not token presence: adminSession is resolved once
        // at start-up and cleared if the server rejects the token.
        if (adminSession === true) {
          const detail = new URL((base || '') + 'audio/' + encodeURIComponent(track.slug) + '.html', location.href);
          detail.searchParams.set('name', track.name || track.en || track.slug);
          detail.searchParams.set('en', track.en || '');
          detail.searchParams.set('te', track.te || '');
          detail.searchParams.set('deity', track.deity || 'library');
          detail.searchParams.set('url', track.url || track.localPath || '');
          location.href = detail.href;
          return;
        }
        if (track.url && !track.localPath) { playLocal({ te: track.te, en: track.en, tag: track.tag, localPath: track.url }); return; }
        if (track.localPath) playLocal(track);
        else {
          // Only http(s) URLs are ever emitted; a track.src of
          // "javascript:..." would otherwise execute for every visitor.
          const raw = track.src ? String(track.src) : '';
          const safe = /^https?:\/\//i.test(raw) ? raw : yt(track.te + ' ' + track.en);
          const label = raw ? 'Listen on Stotra Nidhi \u2197' : 'Open the internet \u2197';
          toast('Not stored here — listen online: <a href="' + esc(safe) + '" target="_blank" rel="noopener">' + label + '</a>', 5600);
          openChat();
          bot('I don\u2019t have <b>' + esc(track.te) + '</b> saved as audio in the local library, so I can\u2019t play it in-page right now. The chant is published by <b>Stotra Nidhi</b> online — listen there: <a class="msg-link" href="' + esc(safe) + '" target="_blank" rel="noopener">' + label + '</a>');
        }
      });
    });
  }
  attachTrackCards();

  /* ---------- Audio page filter ---------- */
  // Only the audio page has #audioGrid; other pages (e.g. temples.html) also
  // carry a .filter-row, so gate on the grid or $$() dereferences null.
  const filterRow = $('.filter-row');
  const audioGrid = $('#audioGrid');
  if (filterRow && audioGrid) {
    const items = Array.from($$('.track-card', audioGrid));
    $$('.filter-chip[data-filter]', filterRow).forEach(chip => {
      chip.addEventListener('click', () => {
        $$('.filter-chip', filterRow).forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const f = chip.dataset.filter;
        items.forEach(card => {
          const track = D.audio.find(a => a.slug === card.dataset.slug);
          card.style.display = (!track || f === 'all' || track.deity === f) ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Deity page tabs ---------- */
  const tabs = $('.tabs');
  if (tabs) {
    const panelAudio = $('#panelAudio');
    const panelBooks = $('#panelBooks');
    const extraPanels = {
      stotras: $('#panelStotras'),
      poojas: $('#panelPoojas'),
      mantras: $('#panelMantras'),
      homa: $('#panelHoma'),
      prasadam: $('#panelPrasadam')
    };
    $$('.tab', tabs).forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.tab', tabs).forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const which = tab.dataset.tab;
        if (panelAudio) panelAudio.style.display = which === 'audio' ? '' : 'none';
        if (panelBooks) panelBooks.style.display = which === 'books' ? '' : 'none';
        Object.keys(extraPanels).forEach(k => {
          if (extraPanels[k]) extraPanels[k].style.display = (k === which) ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Ask Deepam chat ---------- */
  const askbtn = $('#askBtn');
  const panel = $('#chatPanel');
  const msgs = $('#chatMsgs');
  const form = $('#chatForm');
  const input = $('#chatInput');
  const sugg = $('#chatSugg');
  let greeted = false;

  function say(html, who) {
    if (!msgs) return;
    const row = document.createElement('div');
    row.className = 'msg ' + who;
    const b = document.createElement('div');
    b.className = 'msg-bubble';
    b.innerHTML = html;
    row.appendChild(b);
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }
  const bot = (h) => say(h, 'bot');
  const userSay = (h) => say(h, 'user');

  function openChat() {
    if (panel) panel.classList.add('open');
    if (askbtn) askbtn.innerHTML = '<span class="ask-icon">✕</span>Close';
    if (!greeted) {
      greeted = true;
      bot('నమస్తే ✦ I\u2019m <b>Rushi</b>. Ask me to <b>play</b> a bhajan or chant, open a <b>deity</b> or <b>book</b>, or point you to content on the internet. Try: <i>“Play సాయి ఆరతి”</i> or <i>“Books for Shiva”</i>');
      renderSuggestions();
    }
    if (input) input.focus();
  }

  function closeChat() {
    if (panel) panel.classList.remove('open');
    if (askbtn) askbtn.innerHTML = '<span class="ask-icon">✦</span>Ask Rushi';
  }

  if (askbtn) askbtn.addEventListener('click', () => {
    if (panel && panel.classList.contains('open')) closeChat(); else openChat();
  });
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    userSay(esc(text));
    input.value = '';
    handle(text);
  });

  function renderSuggestions() {
    if (!sugg) return;
    sugg.innerHTML = '';
    ['Play శ్రీ వేంకటేశ సుప్రభాతం', 'Play Sai aarti', 'Books for Shiva', 'Open Hanuman', 'help'].forEach(s => {
      const chip = document.createElement('button');
      chip.className = 'sugg-chip';
      chip.textContent = s;
      chip.addEventListener('click', () => { userSay(esc(s)); handle(s); });
      sugg.appendChild(chip);
    });
  }

  // Space-insensitive form, so natural spellings match stored labels:
  // "Sai Baba" -> "saibaba" matches the deity labelled "Saibaba".
  const compact = (s) => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

  function deityMatches(d, q) {
    if (q.includes(norm(d.label)) || q.includes(norm(d.te))) return true;
    const cq = compact(q);
    // Require a decent length so short queries don't match by accident.
    return cq.length >= 4 && (compact(d.label).includes(cq) || cq.includes(compact(d.label)));
  }

  function findDeity(q) {
    return D.deities.find(d => deityMatches(d, q));
  }
  function findTrack(q) {
    return D.audio.find(a => q.includes(norm(a.te)) || q.includes(norm(a.en))) ||
      D.audio.find(a => q.includes(norm(a.tag)) && q.includes(norm(deityBySlug(a.deity).label)));
  }
  function findBook(q) {
    const byName = D.books.find(b => q.includes(norm(b.en)) || q.includes(norm(b.te)));
    if (byName) return byName;
    const deity = D.deities.find(d => deityMatches(d, q));
    if (deity) return booksOfDeity(deity.slug)[0];
    return null;
  }

  function handle(text) {
    const q = norm(text);
    if (!q) return;

    if (/^(hi|hey|hello|నమస్తే|namaste)\b/.test(q) || q === 'hello')
      return bot('నమస్తే ✦ Try: <i>“Play సాయి ఆరతి”</i>, <i>“Open Hanuman”</i>, or <i>“Books for Shiva”</i>.');
    if (/help|what can you/.test(q))
      return bot('I can <b>play</b> recordings stored locally, <b>open</b> deity pages and books, or point you to the internet when a resource isn\u2019t available here yet. Just ask.');
    if (/who are you|what are you/.test(q))
      return bot('I\u2019m <b>Rushi</b> ✦ — a small AI companion for this Telugu bhakti library, your guide to listening and reading here.');

    if (/play|listen|stream|bhajan|chant|aarti|song|song\b|audio/.test(q) || findTrack(q)) {
      const track = findTrack(q);
      if (track) {
        if (track.comingSoon)
          return bot('<b>' + esc(track.te) + '</b> is <b>coming soon</b> to Saptarushi ✦. You can find it on the internet meanwhile: <a class="msg-link" href="' + yt(track.te + ' ' + track.en) + '" target="_blank" rel="noopener">Open on the internet \u2197</a>');
        if (track.localPath) { playLocal(track); return bot('▶ Playing <b>' + esc(track.te) + '</b> right here in-page.'); }
        return bot('I don\u2019t have <b>' + esc(track.te) + '</b> stored locally, so I can\u2019t play it in-page yet. It is available online: <a class="msg-link" href="' + yt(track.te + ' ' + track.en) + '" target="_blank" rel="noopener">Open it on the internet \u2197</a><br><small>Add an mp3 to <code>localPath</code> in data.js and it\u2019ll play here.</small>');
      }
      return bot('I couldn\u2019t find that recording. Try one of these on the internet: <a class="msg-link" href="' + yt(text) + '" target="_blank" rel="noopener">Search YouTube \u2197</a>');
    }

    // findBook() also resolves a bare deity name to that deity's first book,
    // so a match does NOT mean the user asked for a book. Decide by whether
    // the book branch was actually taken, not by whether `book` exists.
    const book = findBook(q);
    if (/book|read|chapter|books/.test(q) && book) {
      if (book.comingSoon)
        return bot('<b>' + esc(book.en) + '</b> is coming soon. Read more on the internet: <a class="msg-link" href="' + web(book.te) + '" target="_blank" rel="noopener">Search \u2197</a>');
      return bot('Opening <b>' + esc(book.en) + '</b> («' + esc(book.te) + '») — <a class="msg-link" href="' + base + 'books/' + encodeURIComponent(book.slug) + '.html">Read it here \u2197</a>');
    }

    const deity = findDeity(q);
    if (deity) {
      const aud = audioOfDeity(deity.slug);
      bot('Opening <b>' + esc(deity.label) + '</b> — ' + esc(deity.te) + '.<br><a class="msg-link" href="' + base + 'deity/' + encodeURIComponent(deity.slug) + '.html">Go to the page \u2197</a>');
      if (aud.length) {
        const quick = aud.filter(a => !a.comingSoon).slice(0, 3);
        if (quick.length) bot('Play here: ' + quick.map(a => '<button class="sugg-chip play-quick" data-q="' + esc(a.te) + '">▶ ' + esc(a.te) + '</button>').join(' '));
      }
      return;
    }

    bot('I couldn\u2019t find that in the library. Let me look it up: <a class="msg-link" href="' + web(text) + '" target="_blank" rel="noopener">Search the web \u2197</a>. Or try <i>“Play Sai aarti”</i>.');
  }

  if (msgs) msgs.addEventListener('click', (e) => {
    const chip = e.target.closest('.play-quick');
    if (chip) handle('play ' + chip.dataset.q);
  });

  /* ---------- admin page text editor ---------- */
  function initSiteEditor() {
    // Admin-only. Validated against the server rather than merely checking that
    // a token exists in localStorage, so the editor never appears to a visitor
    // whose browser holds a stale token.
    const pageKey = location.pathname.replace(/\/+$/, '') || '/';
    const editableSelector = [
      'main h1', 'main h2', 'main h3', 'main p', 'main label',
      'main .section-count', 'main .see-all', 'main .hero-eyebrow',
      'main .hero-title', 'main .hero-desc', 'main .book-te', 'main .book-en',
      'main .book-meta', 'main .book-meta-line', 'main .reading-h', 'main .reading-p',
      'main .temple-badge', 'main .temple-name', 'main .temple-deity', 'main .temple-loc'
    ].join(',');
    let targets = [];
    let savedValues = [];
    let pageStore = {};

    function collectTargets() {
      targets = Array.from(document.querySelectorAll(editableSelector)).filter(function (element) {
        return element.textContent.trim() && !element.closest('.fab-zone, .player-bar, button, a');
      });
    }

    function setEditable(on) {
      targets.forEach(function (element) {
        element.contentEditable = on ? 'true' : 'false';
        element.classList.toggle('site-editing', on);
      });
    }

    const panel = document.createElement('div');
    panel.className = 'site-editor-panel';
    // Audio upload is intentionally absent: audio is out of scope for now.
    panel.innerHTML = '<button type="button" class="site-editor-toggle">Edit page text</button>' +
      '<label class="site-editor-pdf">Upload PDF<input type="file" accept="application/pdf" class="site-editor-pdf-input"/></label>' +
      '<span class="site-editor-status" aria-live="polite"></span>' +
      '<textarea class="site-editor-pdf-output" aria-label="Parsed PDF text" placeholder="Parsed PDF text will appear here"></textarea>' +
      '<div class="site-editor-audio-library" aria-label="Page audio library"></div>';
    const editorHost = document.querySelector('.audio-detail-management') || document.body;
    editorHost.appendChild(panel);
    const toggle = panel.querySelector('.site-editor-toggle');
    const status = panel.querySelector('.site-editor-status');
    const pdfInput = panel.querySelector('.site-editor-pdf-input');
    const pdfOutput = panel.querySelector('.site-editor-pdf-output');
    const audioLibrary = panel.querySelector('.site-editor-audio-library');
    let editing = false;

    function pageAudioFolder() {
      return 'page-' + (pageKey.split('/').filter(Boolean).pop() || 'home').replace(/[^a-z0-9_-]+/gi, '-');
    }

    function renderPageAudio(audioIndex) {
      if (!window.MediaPlayer || !audioLibrary) return;
      const tracks = (audioIndex || []).filter(function (track) { return track.folder === pageAudioFolder(); });
      const inheritedPlayer = document.querySelector('.audio-detail-player');
      if (inheritedPlayer) inheritedPlayer.style.display = tracks.length ? 'none' : '';
      audioLibrary.innerHTML = tracks.length ? '<h3>Page audio</h3>' : '';
      if (tracks.length) MediaPlayer.renderFolders(audioLibrary, tracks);
    }

    fetch(base + 'api/media').then(function (response) { return response.ok ? response.json() : null; }).then(function (media) {
      renderPageAudio(media && media.audio);
    }).catch(function () {});

    pdfInput.addEventListener('change', function () {
      const file = pdfInput.files && pdfInput.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('pdf', file, file.name);
      status.textContent = 'Parsing PDF…';
      fetch(base + 'api/extract-pdf', {
        method: 'POST',
        headers: { 'X-Admin-Token': localStorage.getItem('saptarushi-admin-token') },
        body: formData
      }).then(function (response) { return response.json(); }).then(function (result) {
        if (!result.ok) throw new Error(result.error || 'Could not parse PDF');
        pdfOutput.value = result.text || '';
        pdfOutput.classList.add('show');
        status.textContent = (result.wordCount || 0) + ' words parsed';
      }).catch(function (error) { status.textContent = error.message; });
    });

    // Audio upload handler intentionally omitted while audio is out of scope.

    function finishEdit() {
      editing = false;
      setEditable(false);
      toggle.textContent = 'Edit page text';
      panel.classList.remove('editing');
    }

    function savePage() {
      pageStore[pageKey] = { values: targets.map(function (element) { return element.textContent; }), updated: new Date().toISOString() };
      fetch(base + 'api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': localStorage.getItem('saptarushi-admin-token') },
        body: JSON.stringify({ data: JSON.stringify({ pages: pageStore }) })
      }).then(function (response) { return response.json(); }).then(function (result) {
        if (!result.ok) throw new Error(result.error || 'Could not save page');
        savedValues = pageStore[pageKey].values.slice();
        status.textContent = 'Saved';
        finishEdit();
        setTimeout(function () { status.textContent = ''; }, 2200);
      }).catch(function (error) { status.textContent = error.message; });
    }

    toggle.addEventListener('click', function () {
      if (editing) {
        savePage();
        return;
      }
      collectTargets();
      savedValues = targets.map(function (element) { return element.textContent; });
      editing = true;
      toggle.textContent = 'Save page text';
      panel.classList.add('editing');
      setEditable(true);
    });

    fetch(base + 'api/content').then(function (response) { return response.ok ? response.json() : null; }).then(function (store) {
      pageStore = store && store.pages || {};
      collectTargets();
      const values = pageStore[pageKey] && pageStore[pageKey].values;
      if (!Array.isArray(values)) return;
      targets.forEach(function (element, index) { if (typeof values[index] === 'string') element.textContent = values[index]; });
    }).catch(function () {});

    window.addEventListener('beforeunload', function () {
      if (!editing) return;
      targets.forEach(function (element, index) { element.textContent = savedValues[index] || element.textContent; });
    });
  }

  function initTempleLanguageExtras() {
    const teluguBlock = document.querySelector('.temple-lang[data-lang="te"]');
    const readingColumn = document.querySelector('.reading-column');
    if (!teluguBlock || !readingColumn) return;

    const englishExtras = [];
    Array.from(readingColumn.children).forEach((element) => {
      if (!element.matches('h2.reading-h')) return;
      const label = element.textContent.trim().toLowerCase();
      if (!label.includes('story') && !label.includes('significance')) return;
      const paragraph = element.nextElementSibling;
      if (!paragraph || !paragraph.matches('p.reading-p')) return;
      englishExtras.push({ type: label.includes('story') ? 'story' : 'significance', heading: element, paragraph });
    });

    const buttons = Array.from(document.querySelectorAll('.lang-switch .lang-btn'));
    let activeLanguage = localStorage.getItem('saptarushi-lang') === 'te' ? 'te' : 'en';
    // No extra Telugu block is created any more; build.js renders it server-side.
    const teluguExtras = null;
    function applyLanguage(language) {
      activeLanguage = language === 'te' ? 'te' : 'en';
      englishExtras.forEach((item) => {
        item.heading.style.display = activeLanguage === 'en' ? '' : 'none';
        item.paragraph.style.display = activeLanguage === 'en' ? '' : 'none';
      });
      if (teluguExtras) teluguExtras.style.display = activeLanguage === 'te' ? '' : 'none';
    }
    buttons.forEach((button) => button.addEventListener('click', () => applyLanguage(button.dataset.lang)));
    applyLanguage(activeLanguage);

    // build.js already renders sthalapuram/explanation/reverence into the
    // Telugu .temple-lang block under the real headings (స్థల పురాణం /
    // వివరణ / పూజింపబడటానికి కారణం). Appending them again here made Telugu
    // readers see every paragraph twice, under mismatched headings, and cost an
    // extra temples-content.json fetch on all 45 temple pages. Nothing to add.
  }

  function renderAdminHomeAudio(store) {
    const grid = document.querySelector('#homeAudioGrid');
    if (!grid || !store || !Array.isArray(store.audio)) return;
    const known = new Set(Array.from(grid.querySelectorAll('[data-slug]')).map((card) => card.dataset.slug));
    // track.deity holds a SLUG, so resolve by slug rather than by label. Each
    // candidate extension is tried in turn; anything with no artwork of its own
    // falls back to the neutral placeholder instead of borrowing another
    // deity's image, which would misattribute the deity.
    const IMG_EXTS = ['.jpg', '.png', '.svg', '.webp'];
    const deityImg = (slug) => (base + 'assets/deities/' + slug).replace(/[?#].*$/, '');
    const NEUTRAL = base + 'assets/temples/placeholder.svg';
    function attachDeityImage(img, slug) {
      let i = 0;
      img.onerror = function () {
        i++;
        if (i < IMG_EXTS.length) { img.src = deityImg(slug) + IMG_EXTS[i]; return; }
        img.onerror = null;
        img.src = NEUTRAL;
      };
      img.src = deityImg(slug) + IMG_EXTS[0];
    }
    store.audio.filter((track) => track && track.slug && !known.has(track.slug)).forEach((track) => {
      const deity = String(track.deity || '').toLowerCase();
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'track-card';
      card.dataset.slug = track.slug;
      card.innerHTML = '<div class="track-art"><img alt="" loading="lazy" data-deity-img="' + esc(deity) + '"/><span class="track-play-btn" aria-hidden="true">▶</span></div>' +
        '<div class="track-row"><p class="track-te truncate" lang="te">' + esc(track.te || track.name || track.slug) + '</p></div>' +
        '<p class="track-meta truncate">' + esc(track.en || track.name || 'From the library') + '</p>';
      grid.appendChild(card);
      const img = card.querySelector('[data-deity-img]');
      if (img && deity) attachDeityImage(img, deity);
    });
    attachTrackCards();
  }

  initTempleLanguageExtras();
  // The page-text editor is admin-only, so it is built only after the session
  // token has been confirmed valid by the server.
  isAdminSession().then(function (isAdmin) {
    if (isAdmin) initSiteEditor();
  });

  /* ---------- Book chapter switcher ----------
     The generator emits .chapter-btn as anchors to #ch-N over .chapter-block
     sections, so navigation is native. The previous handler queried
     '.chapter-body' (which exists in no page) and 'data-i' (never emitted),
     compared NaN === NaN, and would have hidden every chapter had the class
     ever matched. This only keeps the .active highlight in sync with scroll. */
  const chapterNav = $('.chapter-nav');
  if (chapterNav) {
    const btns = $$('.chapter-btn', chapterNav);
    const sections = btns
      .map(b => {
        const id = (b.getAttribute('href') || '').replace('#', '');
        return id ? document.getElementById(id) : null;
      })
      .filter(Boolean);
    if (btns.length && sections.length && 'IntersectionObserver' in window) {
      const setActive = (btn) => {
        btns.forEach(b => b.classList.toggle('active', b === btn));
      };
      const visible = new Map();
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => visible.set(e.target, e.isIntersecting ? e.intersectionRatio : 0));
        let best = null, bestRatio = 0;
        visible.forEach((ratio, el) => { if (ratio > bestRatio) { bestRatio = ratio; best = el; } });
        if (best) {
          const idx = sections.indexOf(best);
          if (idx >= 0) setActive(btns[idx]);
        }
      }, { rootMargin: '-15% 0px -70% 0px', threshold: [0, 0.15, 0.5, 1] });
      sections.forEach(el => io.observe(el));
      btns.forEach(b => b.addEventListener('click', () => setActive(b)));
      if (sections[0]) setActive(btns[0]);
    }
  }

  /* ---------- Chat close ---------- */
  const chatMin = $('#chatMin');
  if (chatMin) chatMin.addEventListener('click', closeChat);

  /* ---------- Expose ---------- */
  window.DeepamRuntime = { stopPlayer, toast, openChat };
})();