(function () {
  const PASSWORD = 'Akshyaesingh@0502';
  const TEAL = '#4a9db5';
  const STORE = 'sc_';

  /* ─── boot ─────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    injectDot();
    if (sessionStorage.getItem('admin') === '1') enableEditMode();
  });

  /* ─── persist ───────────────────────────────────────────── */
  function storageKey() {
    return STORE + location.pathname;
  }

  function loadContent() {
    const saved = localStorage.getItem(storageKey());
    if (!saved) return;
    const el = document.getElementById('editable-content');
    if (el) el.innerHTML = saved;
  }

  function saveContent() {
    const el = document.getElementById('editable-content');
    if (!el) return;
    const clone = el.cloneNode(true);
    clone.querySelectorAll('.admin-ctrl').forEach(n => n.remove());
    clone.querySelectorAll('[contenteditable]').forEach(n => {
      n.removeAttribute('contenteditable');
      n.style.background = '';
      n.style.boxShadow = '';
    });
    clone.querySelectorAll('[data-admin-pos]').forEach(n => n.removeAttribute('style'));
    localStorage.setItem(storageKey(), clone.innerHTML);
  }

  /* ─── dot button ─────────────────────────────────────────── */
  function injectDot() {
    const dot = document.createElement('button');
    dot.id = 'admin-dot';
    dot.title = 'Admin';
    Object.assign(dot.style, {
      position: 'fixed',
      bottom: '22px',
      right: '22px',
      width: '9px',
      height: '9px',
      borderRadius: '50%',
      background: '#c8c3bb',
      border: 'none',
      cursor: 'pointer',
      zIndex: '9999',
      padding: '0',
      transition: 'background 0.2s, transform 0.2s',
    });

    if (sessionStorage.getItem('admin') === '1') dot.style.background = TEAL;

    dot.addEventListener('mouseenter', () => {
      dot.style.background = TEAL;
      dot.style.transform = 'scale(1.4)';
    });
    dot.addEventListener('mouseleave', () => {
      dot.style.transform = 'scale(1)';
      if (sessionStorage.getItem('admin') !== '1') dot.style.background = '#c8c3bb';
    });
    dot.addEventListener('click', () => {
      if (sessionStorage.getItem('admin') === '1') toggleToolbar();
      else showPasswordModal();
    });

    document.body.appendChild(dot);
  }

  /* ─── password modal ─────────────────────────────────────── */
  function showPasswordModal() {
    const overlay = el('div', {
      position: 'fixed', inset: '0',
      background: 'rgba(42,46,36,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: '10000',
      backdropFilter: 'blur(3px)',
    });

    const box = el('div', {
      background: '#f5f5f0',
      padding: '40px',
      width: '300px',
      boxShadow: '0 12px 48px rgba(42,46,36,0.14)',
    });

    box.innerHTML = `
      <div style="font-family:'Inter',sans-serif;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#a8a59e;margin-bottom:24px;">Admin Access</div>
      <input id="apw" type="password" placeholder="Password"
        style="width:100%;padding:10px 0;border:none;border-bottom:1.5px solid #e0ddd6;background:transparent;font-family:'Lora',Georgia,serif;font-size:1rem;color:#2a2e24;outline:none;margin-bottom:8px;"/>
      <div id="aperr" style="font-family:'Inter',sans-serif;font-size:11px;color:#b94040;margin-bottom:16px;min-height:16px;"></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px;">
        <button id="apcancel" style="font-family:'Inter',sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;background:none;border:none;color:#a8a59e;cursor:pointer;padding:8px 4px;">Cancel</button>
        <button id="apgo" style="font-family:'Inter',sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;background:#2a2e24;color:#f5f5f0;border:none;padding:8px 20px;cursor:pointer;">Enter</button>
      </div>`;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const input = box.querySelector('#apw');
    const err   = box.querySelector('#aperr');

    setTimeout(() => input.focus(), 40);

    box.querySelector('#apcancel').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    function tryLogin() {
      if (input.value === PASSWORD) {
        overlay.remove();
        sessionStorage.setItem('admin', '1');
        document.getElementById('admin-dot').style.background = TEAL;
        enableEditMode();
      } else {
        err.textContent = 'Incorrect password.';
        input.value = '';
        input.focus();
      }
    }

    box.querySelector('#apgo').onclick = tryLogin;
    input.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });
  }

  /* ─── toolbar ────────────────────────────────────────────── */
  function toggleToolbar() {
    const tb = document.getElementById('admin-toolbar');
    if (!tb) return;
    tb.style.display = tb.style.display === 'none' ? 'flex' : 'none';
  }

  function enableEditMode() {
    if (document.getElementById('admin-toolbar')) return;

    const toolbar = el('div', {
      position: 'fixed', bottom: '0', left: '0', right: '0',
      background: '#2a2e24', color: '#f5f5f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', height: '46px',
      zIndex: '9998',
      fontFamily: "'Inter', sans-serif",
      fontSize: '11px', letterSpacing: '0.06em',
      boxShadow: '0 -2px 16px rgba(42,46,36,0.18)',
    });
    toolbar.id = 'admin-toolbar';

    toolbar.innerHTML = `
      <span style="text-transform:uppercase;letter-spacing:0.14em;color:#6e7268;font-size:10px;">Edit Mode</span>
      <div style="display:flex;gap:14px;align-items:center;">
        <button id="atbsave" style="background:${TEAL};color:#fff;border:none;padding:6px 18px;cursor:pointer;font-family:'Inter',sans-serif;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;">Save</button>
        <button id="atbclear" style="background:none;border:1px solid #444;color:#a8a59e;padding:6px 12px;cursor:pointer;font-family:'Inter',sans-serif;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;">Reset Page</button>
        <button id="atbexit" style="background:none;border:none;color:#6e7268;cursor:pointer;font-family:'Inter',sans-serif;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;">Exit</button>
      </div>`;

    document.body.appendChild(toolbar);
    document.body.style.paddingBottom = '46px';

    toolbar.querySelector('#atbsave').onclick = () => {
      saveContent();
      const btn = toolbar.querySelector('#atbsave');
      const prev = btn.textContent;
      btn.textContent = 'Saved ✓';
      btn.style.background = '#3a8a5a';
      setTimeout(() => { btn.textContent = prev; btn.style.background = TEAL; }, 1600);
    };

    toolbar.querySelector('#atbclear').onclick = () => {
      if (confirm('Reset this page to default content?')) {
        localStorage.removeItem(storageKey());
        location.reload();
      }
    };

    toolbar.querySelector('#atbexit').onclick = () => {
      sessionStorage.removeItem('admin');
      toolbar.remove();
      document.body.style.paddingBottom = '';
      disableEditMode();
      const dot = document.getElementById('admin-dot');
      if (dot) dot.style.background = '#c8c3bb';
    };

    makeEditable();
  }

  /* ─── make editable ──────────────────────────────────────── */
  function makeEditable() {
    const content = document.getElementById('editable-content');
    if (!content) return;

    const sel = [
      '.site-name', '.site-tagline',
      '.intro p',
      'h1', '.page-subtitle',
      '.work-title a', '.work-desc', '.tag',
      '.post-list a', '.post-date',
      '.book-title', '.book-author', '.book-take',
      '.quote-text', '.quote-source',
      '.idea-title', '.idea-body',
      '.prose p',
    ].join(',');

    content.querySelectorAll(sel).forEach(enableEl);

    addListControls(content);
  }

  function enableEl(el) {
    el.contentEditable = 'true';
    el.style.outline = 'none';
  }

  function disableEditMode() {
    const content = document.getElementById('editable-content');
    if (!content) return;
    content.querySelectorAll('[contenteditable]').forEach(n => {
      n.removeAttribute('contenteditable');
      n.style.background = '';
      n.style.boxShadow = '';
    });
    content.querySelectorAll('.admin-ctrl').forEach(n => n.remove());
  }

  /* ─── list controls ──────────────────────────────────────── */
  function addListControls(content) {
    [
      { sel: '.work-list',  type: 'work'  },
      { sel: '.post-list',  type: 'post'  },
      { sel: '.book-list',  type: 'book'  },
      { sel: '.quote-list', type: 'quote' },
      { sel: '.idea-list',  type: 'idea'  },
    ].forEach(({ sel, type }) => {
      content.querySelectorAll(sel).forEach(list => {
        list.querySelectorAll('li').forEach(li => addDeleteBtn(li));
        list.after(addBtn(type, list));
      });
    });
  }

  function addDeleteBtn(li) {
    const btn = document.createElement('button');
    btn.className = 'admin-ctrl';
    btn.textContent = '×';
    btn.title = 'Remove';
    Object.assign(btn.style, {
      position: 'absolute', top: '18px', right: '-26px',
      background: 'none', border: 'none',
      color: '#b94040', cursor: 'pointer',
      fontSize: '17px', lineHeight: '1', padding: '2px 4px',
      opacity: '0', transition: 'opacity 0.15s',
      fontFamily: 'sans-serif',
    });
    btn.onclick = () => li.remove();
    li.style.position = 'relative';
    li.addEventListener('mouseenter', () => btn.style.opacity = '1');
    li.addEventListener('mouseleave', () => btn.style.opacity = '0');
    li.appendChild(btn);
  }

  function addBtn(type, list) {
    const btn = document.createElement('button');
    btn.className = 'admin-ctrl';
    btn.textContent = '+ Add item';
    Object.assign(btn.style, {
      display: 'block', marginTop: '14px',
      background: 'none',
      border: `1px dashed ${TEAL}`,
      color: TEAL,
      padding: '6px 14px',
      cursor: 'pointer',
      fontFamily: "'Inter', sans-serif",
      fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
    });
    btn.onclick = () => {
      const li = newItem(type);
      list.appendChild(li);
      addDeleteBtn(li);
      li.querySelectorAll('div, a, span').forEach(enableEl);
      const first = li.querySelector('div, a');
      if (first) first.focus();
    };
    return btn;
  }

  function newItem(type) {
    const li = document.createElement('li');
    const map = {
      work: `<div class="work-title"><a href="#" contenteditable="true">Project title</a></div>
             <div class="work-desc" contenteditable="true">What you built and why.</div>
             <div class="work-tags"><span class="tag" contenteditable="true">Tag</span></div>`,
      post: `<a href="#" contenteditable="true" style="flex:1;font-family:'Lora',Georgia,serif;font-size:1rem;font-style:italic;text-decoration:none;color:var(--text);">Post title</a>
             <span class="post-date" contenteditable="true">Month Year</span>`,
      book: `<div class="book-title" contenteditable="true">Title</div>
             <div class="book-author" contenteditable="true">Author</div>
             <div class="book-take" contenteditable="true">What stuck.</div>`,
      quote: `<div class="quote-text" contenteditable="true">"Quote text here."</div>
              <div class="quote-source" contenteditable="true">Source</div>`,
      idea: `<div class="idea-title" contenteditable="true">Idea title</div>
             <div class="idea-body" contenteditable="true">Expand on this idea.</div>`,
    };
    li.innerHTML = map[type] || '';
    return li;
  }

  /* ─── util ───────────────────────────────────────────────── */
  function el(tag, styles) {
    const node = document.createElement(tag);
    Object.assign(node.style, styles);
    return node;
  }
})();
