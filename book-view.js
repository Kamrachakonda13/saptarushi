/* ============================================================================
   Saptarushi · Book Reader
   ----------------------------------------------------------------------------
   Loaded on every book page. Enhances the reader with:
     – English / తెలుగు / संस्कृतम् tabs (from admin content)
     – clean, re-flowable text rendering (PDF text comes in as text, never as a
       scanned image)
     – narration audio player with repeat button
     – inline text editing with rich text controls (bold, italic, underline,
       font size, language switching, transliteration)
   Falls back silently to the static chapter markup when no admin content
   exists for the page.
   ============================================================================ */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.from((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      if (c === '&') return String.fromCharCode(38) + 'amp;';
      if (c === '<') return String.fromCharCode(38) + 'lt;';
      if (c === '>') return String.fromCharCode(38) + 'gt;';
      if (c === '"') return String.fromCharCode(38) + 'quot;';
      return String.fromCharCode(38) + '#39;';
    });
  };

  function slugFromPage() {
    var m = location.pathname.match(/([^/]+)\.html$/);
    var base = m ? m[1] : '';
    return base.replace(/\.html$/, '');
  }

  var baseDir = location.pathname.indexOf('/books/') >= 0 ? '../' : './';

  function detectLang(text) {
    if (!text) return 'en';
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
    if (/[\u0900-\u097F]/.test(text)) return 'sa';
    return 'en';
  }

  function fontClass(lang) { return lang === 'sa' ? 'font-sa' : lang === 'te' ? 'font-te' : 'font-en'; }

  // Swap only the font-* class. Assigning className wholesale would drop
  // 'book-editable-box', which carries the reader card styling.
  var FONT_CLASSES = ['font-en', 'font-te', 'font-sa'];
  function setFontClass(el, lang) {
    FONT_CLASSES.forEach(function (c) { el.classList.remove(c); });
    el.classList.add(fontClass(lang));
  }

  function addCoverNote(book, layout, onSave, onCancel) {
    var aside = $('.book-aside', layout);
    var figure = $('.book-cover-fig', aside);
    if (!aside || !figure || (!book.coverText && !(window.TextEditor && TextEditor.isAdmin()))) return null;
    var note = document.createElement('div');
    note.className = 'book-cover-note';
    note.textContent = book.coverText || '';
    figure.insertAdjacentElement('afterend', note);
    if (window.TextEditor) TextEditor.makeEditable(note, { onSave: onSave, onCancel: onCancel });
    return note;
  }

  /* ---------- narration audio row ---------- */
  function buildPlayer(url, name) {
    var wrap = document.createElement('div');
    wrap.className = 'mp-row';
    wrap.dataset.url = url;
    wrap.innerHTML =
      '<span class="mp-row-art"><button class="mp-play" type="button" aria-label="Play">▶</button></span>' +
      '<span class="mp-row-info"><span class="mp-row-title">' + esc(name || 'Narration audio') + '</span><span class="mp-row-meta">Listen while you read</span></span>' +
      '<span class="mp-dur">—</span>' +
      '<button class="mp-repeat" type="button" title="Repeat" aria-label="Repeat">🔁</button>';
    var play = $('.mp-play', wrap);
    var rep = $('.mp-repeat', wrap);
    var dur = $('.mp-dur', wrap);
    play.addEventListener('click', function () { MediaPlayer.play(wrap, { repeat: wrap.dataset.repeat === '1' }); });
    rep.addEventListener('click', function () {
      var on = wrap.dataset.repeat === '1';
      wrap.dataset.repeat = on ? '' : '1';
      rep.classList.toggle('on', !on);
    });
    var a = new Audio();
    a.preload = 'metadata';
    a.onloadedmetadata = function () { dur.textContent = MediaPlayer.fmtDuration(a.duration); };
    a.src = url;
    return wrap;
  }

  /* ---------- render admin book content ---------- */
  function renderBook(book) {
    var layout = $('.book-layout');
    if (!layout) return false;

    // Reader container
    var existing = $('#saptarishiReader');
    if (existing) existing.remove();
    var reader = document.createElement('div');
    reader.id = 'saptarishiReader';
    reader.className = 'book-reader-container';
    reader.style.cssText = 'margin-top:1.5rem;border-top:1px solid var(--line-12);padding-top:1.5rem';

    var titleEl = $('#saptarishiReaderTitle');
    if (!titleEl) {
      titleEl = document.createElement('h2');
      titleEl.id = 'saptarishiReaderTitle';
      titleEl.className = 'book-h1';
      layout.prepend(titleEl);
    }
    titleEl.innerHTML = esc(book.title || book.en || '');
    var coverNote = addCoverNote(book, layout, saveBookEdits, function () {
      coverNote.textContent = book.coverText || '';
    });

    // language tabs
    var tabs = document.createElement('div');
    tabs.className = 'lang-switch';
    tabs.style.marginTop = '1rem';
    ['en', 'te', 'sa'].forEach(function (l) {
      var b = document.createElement('button');
      b.className = 'lang-btn' + (l === (book.lang || 'en') ? ' active' : '');
      b.dataset.lang = l;
      b.textContent = l === 'en' ? 'English' : l === 'te' ? 'తెలుగు' : 'संस्कृतम्';
      b.addEventListener('click', function () {
        $$('.lang-btn', tabs).forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        showLang(l);
      });
      tabs.appendChild(b);
    });

    // narration player
    var audioWrap = document.createElement('div');
    if (book.audioUrl) audioWrap.appendChild(buildPlayer(book.audioUrl, book.title));
    else { audioWrap.style.cssText = 'display:none'; }

    // text
    var textEl = document.createElement('div');
    textEl.className = 'sankalpam-text book-editable-box';
    textEl.style.cssText = 'max-width:unset;margin-top:1rem;white-space:pre-wrap;word-wrap:break-word';

    // Track current language for editing
    var currentLang = book.lang || 'en';
    var originalTexts = {
      en: book.textEn || book.text || '',
      te: book.textTe || (detectLang(book.text || '') === 'te' ? book.text : ''),
      sa: book.textSa || (detectLang(book.text || '') === 'sa' ? book.text : '')
    };
    if (!originalTexts.en && !originalTexts.te && !originalTexts.sa && book.text) originalTexts.en = book.text;

    function showLang(l) {
      currentLang = l;
      var txt = l === 'en' ? (originalTexts.en || book.text || '') : l === 'te' ? (originalTexts.te || book.text || '') : (originalTexts.sa || book.text || '');
      // choose text: prefer the per-language field; else use main text IF its script matches
      if (!txt && l !== 'en') {
        var mainLang = detectLang(book.text || '');
        txt = (mainLang === l) ? (book.text || '') : (book.textEn || book.text || '');
      }
      textEl.textContent = txt || (l === 'en' ? 'No English text yet. Add it from the admin Books page.' : (l === 'te' ? 'తెలుగు పాఠం ఇంకా చేర్చలేదు — అడ్మిన్ పేజీ నుండి జోడించండి.' : 'संस्कृत पाठ अभी तक नहीं जोड़ा गया।'));
      setFontClass(textEl, l === 'en' ? detectLang(textEl.textContent) : l);
    }

    reader.appendChild(tabs);
    reader.appendChild(audioWrap);
    reader.appendChild(textEl);
    layout.appendChild(reader);
    showLang(book.lang || 'en');

    // ---------- inline text editing ----------
    if (window.TextEditor) {
      var editor = TextEditor.makeEditable(textEl, {
        lang: currentLang,
        forceShow: false,
        onLang: function (l) {
          // Save current text to originalTexts before switching
          originalTexts[currentLang] = textEl.textContent;
          showLang(l);
        },
        onTransliterate: function (target) {
          var txt = textEl.textContent;
          if (target === 'te' && window.LangLib) {
            textEl.textContent = LangLib.toTelugu(txt);
            originalTexts[currentLang] = textEl.textContent;
            setFontClass(textEl, 'te');
          } else if (target === 'sa' && window.LangLib) {
            textEl.textContent = LangLib.toDevanagari(txt);
            originalTexts[currentLang] = textEl.textContent;
            setFontClass(textEl, 'sa');
          }
        },
        onSave: function () {
          originalTexts[currentLang] = textEl.textContent;
          saveBookEdits();
        },
        onCancel: function () {
          // Restore original text for current language
          textEl.textContent = originalTexts[currentLang] || '';
          setFontClass(textEl, currentLang === 'en' ? detectLang(textEl.textContent) : currentLang);
        }
      });

      // Also make the title editable
      if (window.TextEditor) {
        TextEditor.makeEditable(titleEl, {
          lang: 'en',
          forceShow: false,
          onSave: function () {
            saveBookEdits();
          },
          onCancel: function () {
            titleEl.innerHTML = esc(book.title || book.en || '');
          }
        });
      }
    }

    function saveBookEdits() {
      var token = localStorage.getItem('saptarushi-admin-token') || '';
      if (!token) {
        alert('Please log in as Admin first to save edits. Open the Admin portal and sign in.');
        return;
      }
      var payload = Object.assign({}, book, {
        title: titleEl.textContent.trim() || book.title,
        textEn: originalTexts.en || '',
        textTe: originalTexts.te || '',
        textSa: originalTexts.sa || '',
        text: originalTexts[currentLang] || originalTexts.en || originalTexts.te || originalTexts.sa || book.text || '',
        coverText: coverNote ? coverNote.textContent.trim() : book.coverText || '',
        lang: currentLang,
        updated: new Date().toISOString()
      });
      fetch(baseDir + 'api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify({ data: JSON.stringify(payload) })
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.ok) {
            var toast = document.createElement('div');
            toast.className = 'toast show';
            toast.textContent = '✓ Book saved';
            document.body.appendChild(toast);
            setTimeout(function () { toast.classList.remove('show'); setTimeout(function () { toast.remove(); }, 400); }, 2500);
          } else {
            alert('Save failed: ' + (d.error || 'Unknown error'));
          }
        })
        .catch(function (e) { alert('Save error: ' + e.message); });
    }

    return true;
  }

  function staticBookData(chapters) {
    return {
      chapters: chapters.map(function (chapter) {
        return {
          title: $('.reading-h', chapter) ? $('.reading-h', chapter).textContent : '',
          paragraphs: $$('.reading-p', chapter).map(function (p) { return p.textContent; })
        };
      })
    };
  }

  function applyStaticBookData(book, chapters) {
    if (!book || !Array.isArray(book.chapters)) return;
    book.chapters.forEach(function (saved, i) {
      var chapter = chapters[i];
      if (!chapter) return;
      var heading = $('.reading-h', chapter);
      if (heading && saved.title) heading.textContent = saved.title;
      var paragraphs = $$('.reading-p', chapter);
      (saved.paragraphs || []).forEach(function (text, j) {
        if (paragraphs[j]) paragraphs[j].textContent = text;
      });
    });
  }

  function enhanceStaticBook(savedBook) {
    var layout = $('.book-layout');
    if (!layout) return;
    // The generator emits .chapter-block for each chapter section.
    var chapters = $$('.chapter-block', layout);
    if (!chapters.length) return;

    // Applying admin-saved text works for everyone, so do it before the
    // TextEditor check — editing itself is admin-only.
    applyStaticBookData(savedBook, chapters);
    if (!window.TextEditor) return;

    var original = staticBookData(chapters);
    var titleEl = $('.book-aside .book-h1', layout);
    if (titleEl && savedBook && savedBook.title) titleEl.textContent = savedBook.title;
    var originalTitle = titleEl ? titleEl.textContent : '';
    var coverNote = addCoverNote(savedBook || {}, layout, save, function () {
      coverNote.textContent = savedBook && savedBook.coverText || '';
    });
    var originalCoverText = coverNote ? coverNote.textContent : '';
    var slug = slugFromPage();

    function save() {
      var token = localStorage.getItem('saptarushi-admin-token') || '';
      if (!token) {
        alert('Please log in as Admin first to save edits. Go to the Admin portal.');
        return;
      }
      var current = staticBookData(chapters);
      var payload = {
        slug: slug,
        title: titleEl ? titleEl.textContent.trim() : slug,
        chapters: current.chapters,
        coverText: coverNote ? coverNote.textContent.trim() : '',
        updated: new Date().toISOString()
      };
      fetch(baseDir + 'api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify({ data: JSON.stringify(payload) })
      }).then(function (r) { return r.json(); }).then(function (result) {
        if (!result.ok) throw new Error(result.error || 'Could not save book');
        original = current;
        var toast = document.createElement('div');
        toast.className = 'toast show';
        toast.textContent = 'Book saved';
        document.body.appendChild(toast);
        setTimeout(function () { toast.remove(); }, 2600);
      }).catch(function (error) { alert('Save error: ' + error.message); });
    }

    function restore() {
      applyStaticBookData(original, chapters);
      if (titleEl) titleEl.textContent = originalTitle;
      if (coverNote) coverNote.textContent = originalCoverText;
    }

    if (titleEl) TextEditor.makeEditable(titleEl, { onSave: save, onCancel: restore });
    chapters.forEach(function (chapter) {
      chapter.classList.add('book-editable-box');
      TextEditor.makeEditable(chapter, { onSave: save, onCancel: restore });
    });
  }

  function init() {
    var slug = slugFromPage();
    if (!slug) return;
    fetch(baseDir + 'api/book/' + slug)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (book) {
        if (book && book.text) renderBook(book);
        else enhanceStaticBook(book);
      })
      .catch(function () { enhanceStaticBook(null); });
  }

  if (window.MediaPlayer) init();
  else {
    var tries = 0;
    var t = setInterval(function () {
      tries++;
      if (window.MediaPlayer || tries > 30) { clearInterval(t); if (window.MediaPlayer) init(); }
    }, 120);
  }
})();