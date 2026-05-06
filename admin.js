(function () {
'use strict';

// ─── Constants ────────────────────────────────────────────────────────────────
const PW   = 'Akshyaesingh@0502';
const TEAL = '#4a9db5';
const DARK = '#2a2e24';
const BG   = '#f5f5f0';
const SF   = "'Inter', -apple-system, sans-serif";
const SE   = "'Lora', Georgia, serif";

// ─── Page detection ───────────────────────────────────────────────────────────
function pg() {
  const f = location.pathname.split('/').pop().replace('.html', '') || 'index';
  if (f === 'post')      return 'post';
  if (f === 'blog')      return 'blog';
  if (f === 'journey')   return 'journey';
  if (f === 'interests') return 'interests';
  if (f === 'index' || f === '') return 'home';
  return 'generic';
}

// ─── Storage ──────────────────────────────────────────────────────────────────
const LS = {
  get(k, d)  { try { const v = localStorage.getItem(k); return v != null ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v)  { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) { alert('Storage full — try removing images.'); } },
  del(k)     { localStorage.removeItem(k); },
};

// ─── Blog data ────────────────────────────────────────────────────────────────
const DEFAULT_POSTS = [
  { id:'p1', title:'What does it mean for an AI system to be honest?',   date:'May 2026', content:'<p>Your post content here.</p>' },
  { id:'p2', title:'On reading alignment research as an outsider',        date:'Mar 2026', content:'<p>Your post content here.</p>' },
  { id:'p3', title:'The legibility problem in AI safety',                 date:'Jan 2026', content:'<p>Your post content here.</p>' },
  { id:'p4', title:'Why I stopped trying to define AGI',                  date:'Nov 2025', content:'<p>Your post content here.</p>' },
  { id:'p5', title:'Notes on scalable oversight',                         date:'Sep 2025', content:'<p>Your post content here.</p>' },
];
const Blog = {
  posts()        { return LS.get('blog_posts', DEFAULT_POSTS); },
  post(id)       { return this.posts().find(p => p.id === id); },
  platforms()    { return LS.get('blog_platforms', []); },
  save(p) {
    let ps = this.posts(); const i = ps.findIndex(x => x.id === p.id);
    if (i >= 0) ps[i] = p; else ps.unshift(p);
    LS.set('blog_posts', ps);
  },
  del(id)        { LS.set('blog_posts', this.posts().filter(p => p.id !== id)); },
  savePlatforms(a){ LS.set('blog_platforms', a); },
};

// ─── Journey data ─────────────────────────────────────────────────────────────
const Journey = {
  items()       { return LS.get('journey_items', []); },
  save(items)   { LS.set('journey_items', items); },
  add(item)     { const a = this.items(); a.push(item); this.save(a); },
  update(item)  { const a = this.items(); const i = a.findIndex(x => x.id === item.id); if (i>=0) a[i]=item; this.save(a); },
  del(id)       { this.save(this.items().filter(x => x.id !== id)); },
};

// ─── Quick links (homepage) ───────────────────────────────────────────────────
const QuickLinks = {
  get()       { return LS.get('quick_links', []); },
  save(items) { LS.set('quick_links', items); },
  add(item)   { const a = this.get(); a.push(item); this.save(a); },
  del(id)     { this.save(this.get().filter(x => x.id !== id)); },
};

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const p = pg();
  // Load generic saved content for static pages
  if (p !== 'blog' && p !== 'post' && p !== 'journey') loadGenericContent();
  // Dynamic pages
  if (p === 'blog')    renderBlog();
  if (p === 'post')    renderPost();
  if (p === 'journey') renderJourney();
  if (p === 'home')    renderQuickLinks();
  // Admin
  injectDot();
  if (sessionStorage.getItem('admin') === '1') enableEdit();
});

// ─── Generic content save/load ───────────────────────────────────────────────
function loadGenericContent() {
  const saved = LS.get('sc_' + location.pathname, null);
  if (!saved) return;
  const el = document.getElementById('editable-content');
  if (el) el.innerHTML = saved;
}
function saveGenericContent() {
  const el = document.getElementById('editable-content');
  if (!el) return;
  const clone = el.cloneNode(true);
  clone.querySelectorAll('.admin-ctrl').forEach(n => n.remove());
  clone.querySelectorAll('[contenteditable]').forEach(n => {
    n.removeAttribute('contenteditable'); n.style.background = ''; n.style.boxShadow = '';
  });
  LS.set('sc_' + location.pathname, clone.innerHTML);
}

// ─── Admin dot ────────────────────────────────────────────────────────────────
function injectDot() {
  const dot = document.createElement('button');
  dot.id = 'admin-dot'; dot.title = 'Admin';
  css(dot, {
    position:'fixed', bottom:'22px', right:'22px',
    width:'9px', height:'9px', borderRadius:'50%',
    background: sessionStorage.getItem('admin') === '1' ? TEAL : '#c8c3bb',
    border:'none', cursor:'pointer', zIndex:'9999', padding:'0',
    transition:'background 0.2s, transform 0.2s',
  });
  dot.addEventListener('mouseenter', () => css(dot, {background:TEAL, transform:'scale(1.4)'}));
  dot.addEventListener('mouseleave', () => {
    css(dot, {transform:'scale(1)'});
    if (sessionStorage.getItem('admin') !== '1') css(dot, {background:'#c8c3bb'});
  });
  dot.addEventListener('click', () => {
    if (sessionStorage.getItem('admin') === '1') toggleToolbar();
    else showPwModal();
  });
  document.body.appendChild(dot);
}

// ─── Password modal ───────────────────────────────────────────────────────────
function showPwModal() {
  const ov = mkEl('div', {position:'fixed',inset:'0',background:'rgba(42,46,36,0.18)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:'10000',backdropFilter:'blur(3px)'});
  const box = mkEl('div', {background:BG,padding:'40px',width:'300px',boxShadow:'0 12px 48px rgba(42,46,36,0.14)'});
  box.innerHTML = `
    <div style="font-family:${SF};font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#a8a59e;margin-bottom:24px;">Admin</div>
    <input id="apw" type="password" placeholder="Password" style="width:100%;padding:10px 0;border:none;border-bottom:1.5px solid #e0ddd6;background:transparent;font-family:${SE};font-size:1rem;color:${DARK};outline:none;"/>
    <div id="aperr" style="font-family:${SF};font-size:11px;color:#b94040;margin-top:8px;min-height:16px;"></div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:24px;">
      <button id="apcancel" style="font-family:${SF};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;background:none;border:none;color:#a8a59e;cursor:pointer;">Cancel</button>
      <button id="apgo" style="font-family:${SF};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;background:${DARK};color:${BG};border:none;padding:8px 20px;cursor:pointer;">Enter</button>
    </div>`;
  ov.appendChild(box); document.body.appendChild(ov);
  const inp = box.querySelector('#apw'), err = box.querySelector('#aperr');
  setTimeout(() => inp.focus(), 40);
  box.querySelector('#apcancel').onclick = () => ov.remove();
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  const tryLogin = () => {
    if (inp.value === PW) {
      ov.remove(); sessionStorage.setItem('admin','1');
      css(document.getElementById('admin-dot'), {background:TEAL});
      enableEdit();
    } else { err.textContent = 'Incorrect password.'; inp.value = ''; inp.focus(); }
  };
  box.querySelector('#apgo').onclick = tryLogin;
  inp.addEventListener('keydown', e => { if (e.key==='Enter') tryLogin(); });
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────
function toggleToolbar() {
  const tb = document.getElementById('admin-tb');
  if (tb) tb.style.display = tb.style.display === 'none' ? 'flex' : 'none';
}

function injectToolbar() {
  if (document.getElementById('admin-tb')) return;
  const p = pg();
  const dynamic = p === 'blog' || p === 'post';

  const tb = mkEl('div', {position:'fixed',bottom:'0',left:'0',right:'0',background:DARK,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',height:'46px',zIndex:'9998',boxShadow:'0 -2px 16px rgba(42,46,36,0.18)',flexWrap:'wrap'});
  tb.id = 'admin-tb';

  const left = mkEl('div', {display:'flex',gap:'10px',alignItems:'center'});
  const label = document.createElement('span');
  label.textContent = 'EDIT MODE';
  css(label, {fontFamily:SF,fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.14em',color:'#6e7268'});
  left.appendChild(label);

  // Link button — works on any page with a selection
  const linkBtn = mkTextBtn('Link selected text', 'rgba(255,255,255,0.08)', '#d0cdc8');
  linkBtn.title = 'Select text first, then click to add a link';
  linkBtn.onclick = () => {
    const url = prompt('Enter URL:');
    if (url) document.execCommand('createLink', false, url);
  };
  left.appendChild(linkBtn);

  const right = mkEl('div', {display:'flex',gap:'10px',alignItems:'center'});
  if (!dynamic) {
    const saveBtn = mkTextBtn('Save', TEAL, '#fff');
    saveBtn.id = 'atb-save';
    saveBtn.onclick = () => {
      saveGenericContent();
      // also save quick links state (rendered from JS so not in editable-content)
      const orig = saveBtn.textContent;
      saveBtn.textContent = 'Saved ✓'; saveBtn.style.background = '#3a8a5a';
      setTimeout(() => { saveBtn.textContent = orig; saveBtn.style.background = TEAL; }, 1500);
    };
    const resetBtn = mkTextBtn('Reset', 'transparent', '#a8a59e');
    css(resetBtn, {border:'1px solid #444'});
    resetBtn.onclick = () => {
      if (confirm('Reset this page to default?')) { LS.del('sc_'+location.pathname); location.reload(); }
    };
    right.appendChild(saveBtn);
    right.appendChild(resetBtn);
  } else {
    const note = document.createElement('span');
    note.textContent = 'CHANGES AUTO-SAVED';
    css(note, {fontFamily:SF,fontSize:'10px',letterSpacing:'0.1em',color:'#6e7268'});
    right.appendChild(note);
  }
  const exitBtn = mkTextBtn('Exit', 'transparent', '#6e7268');
  exitBtn.style.border = 'none';
  exitBtn.onclick = () => {
    sessionStorage.removeItem('admin');
    tb.remove();
    document.body.style.paddingBottom = '';
    disableEdit();
    const dot = document.getElementById('admin-dot');
    if (dot) css(dot, {background:'#c8c3bb'});
  };
  right.appendChild(exitBtn);
  tb.appendChild(left); tb.appendChild(right);
  document.body.appendChild(tb);
  document.body.style.paddingBottom = '46px';
}

// ─── Edit mode ────────────────────────────────────────────────────────────────
function enableEdit() {
  injectToolbar();
  const p = pg();
  if      (p === 'blog')     enableBlogAdmin();
  else if (p === 'post')     enablePostAdmin();
  else if (p === 'journey')  enableJourneyAdmin();
  else if (p === 'interests') enableInterestsAdmin();
  else if (p === 'home')     { makeEditable(); enableHomeAdmin(); }
  else { makeEditable(); addListControls(); }
}

function disableEdit() {
  document.querySelectorAll('[contenteditable]').forEach(n => {
    n.removeAttribute('contenteditable'); n.style.background = ''; n.style.boxShadow = '';
  });
  document.querySelectorAll('.admin-ctrl').forEach(n => n.remove());
  delete window.__editPost; delete window.__delPost;
  delete window.__editJourney; delete window.__delJourney;
}

function makeEditable() {
  const content = document.getElementById('editable-content');
  if (!content) return;
  const sel = [
    '.site-name','.site-tagline','.intro p',
    'h1','.page-subtitle',
    '.work-title a','.work-desc','.tag',
    '.book-title','.book-author','.book-take',
    '.quote-text','.quote-source',
    '.idea-title','.idea-body',
    '.prose p','.prose h2',
  ].join(',');
  content.querySelectorAll(sel).forEach(enableEl);
}

function addListControls() {
  const content = document.getElementById('editable-content');
  if (!content) return;
  [
    {sel:'.work-list', type:'work'},
    {sel:'.book-list', type:'book'},
    {sel:'.quote-list',type:'quote'},
    {sel:'.idea-list', type:'idea'},
  ].forEach(({sel, type}) => {
    content.querySelectorAll(sel).forEach(list => {
      list.querySelectorAll('li').forEach(li => addDelBtn(li));
      list.after(dottedBtn(`+ Add item`, () => {
        const li = newListItem(type);
        list.appendChild(li);
        addDelBtn(li);
        li.querySelectorAll('div,a,span').forEach(enableEl);
        li.querySelector('div,a')?.focus();
      }));
    });
  });
}

// ─── Blog: render ─────────────────────────────────────────────────────────────
function renderBlog() {
  renderPlatforms();
  renderPostList();
}

function renderPlatforms() {
  const c = document.getElementById('platform-links');
  if (!c) return;
  const platforms = Blog.platforms();
  if (!platforms.length) { c.innerHTML = ''; return; }
  c.innerHTML = `
    <span class="platform-label">Read on</span>
    ${platforms.map(p => `<a href="${esc(p.url)}" class="platform-link" target="_blank" rel="noopener">${esc(p.name)}</a>`).join('')}`;
}

function renderPostList() {
  const list = document.getElementById('post-list');
  if (!list) return;
  const posts = Blog.posts();
  list.innerHTML = posts.length
    ? posts.map(p => `<li data-id="${p.id}"><a href="post.html?id=${p.id}">${esc(p.title)}</a><span class="post-date">${esc(p.date)}</span></li>`).join('')
    : `<li style="color:#a8a59e;font-family:${SF};font-size:13px;padding:16px 0;border-bottom:1px solid #e8e5de;">No posts yet.</li>`;
}

// ─── Blog: admin ──────────────────────────────────────────────────────────────
function enableBlogAdmin() {
  document.querySelectorAll('h1,.page-subtitle').forEach(enableEl);

  // Platform links admin
  const pc = document.getElementById('platform-links');
  if (pc) {
    pc.after(dottedBtn('+ Add Platform Link', () => {
      const name = prompt('Platform name (e.g. Substack):'); if (!name) return;
      const url = prompt('URL:'); if (!url) return;
      Blog.savePlatforms([...Blog.platforms(), {id:'pl'+Date.now(),name,url}]);
      renderPlatforms(); enableBlogAdmin();
    }));
    // Remove buttons on existing platform links
    pc.querySelectorAll('.platform-link').forEach(a => {
      const btn = document.createElement('button');
      btn.textContent = '×'; btn.className = 'admin-ctrl';
      css(btn, {background:'none',border:'none',color:'#b94040',cursor:'pointer',fontSize:'14px',verticalAlign:'middle',marginLeft:'2px',padding:'0 2px'});
      btn.onclick = () => {
        Blog.savePlatforms(Blog.platforms().filter(p => p.url !== a.href));
        renderPlatforms(); enableBlogAdmin();
      };
      a.after(btn);
    });
  }

  // Post list: add + edit/delete controls
  const list = document.getElementById('post-list');
  if (list) {
    list.after(dottedBtn('+ New Post', () => openPostEditor(null)));
    list.querySelectorAll('li[data-id]').forEach(li => {
      li.style.position = 'relative';
      const id = li.dataset.id;
      const ctrl = mkEl('div', {position:'absolute',top:'50%',right:'-72px',transform:'translateY(-50%)',display:'flex',gap:'4px'});
      ctrl.className = 'admin-ctrl';
      [['Edit', '#7a7870', '#e0ddd6', () => openPostEditor(id)],
       ['Del',  '#b94040', '#e8c0c0', () => { if(confirm('Delete?')) { Blog.del(id); renderBlog(); enableBlogAdmin(); } }]
      ].forEach(([label, color, border, fn]) => {
        const b = document.createElement('button');
        b.textContent = label;
        css(b, {background:'none',border:`1px solid ${border}`,color,fontFamily:SF,fontSize:'10px',padding:'3px 8px',cursor:'pointer',letterSpacing:'0.06em',textTransform:'uppercase'});
        b.onclick = fn;
        ctrl.appendChild(b);
      });
      li.appendChild(ctrl);
    });
  }
}

// ─── Post: render ─────────────────────────────────────────────────────────────
function renderPost() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { location.href = 'blog.html'; return; }
  const post = Blog.post(id);
  if (!post) {
    const a = document.getElementById('post-article');
    if (a) a.innerHTML = `<p style="color:#a8a59e;font-family:${SF};">Post not found. <a href="blog.html">Back to blog</a></p>`;
    return;
  }
  document.title = `${post.title} — Akshyae Singh`;
  const t = document.getElementById('post-title'), d = document.getElementById('post-date'), b = document.getElementById('post-body');
  if (t) t.textContent = post.title;
  if (d) d.textContent = post.date;
  if (b) b.innerHTML = post.content;
}

function enablePostAdmin() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return;
  const header = document.getElementById('post-header');
  if (header) header.after(dottedBtn('Edit Post', () => openPostEditor(id)));
}

// ─── Post editor (shared by blog + journey) ───────────────────────────────────
function openPostEditor(id, opts = {}) {
  const isJourney = opts.journey;
  const post = isJourney
    ? (id ? Journey.items().find(x=>x.id===id) : {id:'j'+Date.now(),year:'',label:'',content:'<p></p>'})
    : (id ? Blog.post(id) : {id:'p'+Date.now(),title:'',date:new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'}),content:'<p></p>'});
  if (!post) return;

  const ov = mkEl('div', {position:'fixed',inset:'0',background:BG,zIndex:'10001',display:'flex',flexDirection:'column'});

  // ── Toolbar bar ──
  const bar = mkEl('div', {background:DARK,display:'flex',alignItems:'center',flexWrap:'wrap',gap:'6px',padding:'8px 16px',flexShrink:'0'});

  // Format buttons
  const fmts = [
    {label:'B',    cmd:'bold'},
    {label:'I',    cmd:'italic'},
    {label:'H2',   fn:()=>{ editor.focus(); document.execCommand('formatBlock',false,'h2'); }},
    {label:'"',    fn:()=>{ editor.focus(); document.execCommand('formatBlock',false,'blockquote'); }},
    {label:'UL',   cmd:'insertUnorderedList'},
    {label:'OL',   cmd:'insertOrderedList'},
    {label:'Link', fn:()=>{ const u=prompt('URL:'); if(u){ editor.focus(); document.execCommand('createLink',false,u); } }},
    {label:'Image',fn:insertImage},
    {label:'HR',   fn:()=>{ editor.focus(); document.execCommand('insertHTML',false,'<hr style="border:none;border-top:1px solid #e0ddd6;margin:28px 0;">'); }},
  ];
  fmts.forEach(({label,cmd,fn})=>{
    const b = document.createElement('button');
    b.textContent = label;
    css(b,{background:'rgba(255,255,255,0.1)',border:'none',color:'#f5f5f0',padding:'5px 10px',cursor:'pointer',fontFamily:SF,fontSize:'12px',borderRadius:'2px',fontWeight:label==='B'?'700':'400',fontStyle:label==='I'?'italic':'normal'});
    b.addEventListener('mouseenter',()=>b.style.background='rgba(255,255,255,0.22)');
    b.addEventListener('mouseleave',()=>b.style.background='rgba(255,255,255,0.1)');
    b.onclick = cmd ? ()=>{ editor.focus(); document.execCommand(cmd,false,null); } : fn;
    bar.appendChild(b);
  });

  bar.appendChild(mkEl('div',{flex:'1'}));

  // Meta inputs
  const metaStyle = {background:'rgba(255,255,255,0.1)',border:'none',color:'#f5f5f0',padding:'6px 10px',fontFamily:SF,fontSize:'12px',outline:'none',borderRadius:'2px'};
  let titleInp, dateInp, yearInp, labelInp;

  if (isJourney) {
    yearInp = document.createElement('input');
    yearInp.placeholder='Year (e.g. 2022)'; yearInp.value=post.year||'';
    css(yearInp,{...metaStyle,width:'120px'});
    labelInp = document.createElement('input');
    labelInp.placeholder='Sidebar label (short)'; labelInp.value=post.label||'';
    css(labelInp,{...metaStyle,width:'180px'});
    bar.appendChild(yearInp); bar.appendChild(labelInp);
  } else {
    titleInp = document.createElement('input');
    titleInp.placeholder='Post title'; titleInp.value=post.title||'';
    css(titleInp,{...metaStyle,width:'220px'});
    dateInp = document.createElement('input');
    dateInp.placeholder='Month Year'; dateInp.value=post.date||'';
    css(dateInp,{...metaStyle,width:'110px'});
    bar.appendChild(titleInp); bar.appendChild(dateInp);
  }

  const saveBtn   = mkTextBtn('Save', TEAL, '#fff');
  const cancelBtn = mkTextBtn('Cancel', 'transparent', '#a8a59e');
  cancelBtn.style.border = 'none';
  bar.appendChild(saveBtn); bar.appendChild(cancelBtn);

  // ── Editor area ──
  const wrap = mkEl('div',{flex:'1',overflowY:'auto',padding:'0 24px 80px'});
  const editor = mkEl('div',{maxWidth:'660px',margin:'0 auto',padding:'56px 0',fontFamily:SE,fontSize:'1rem',lineHeight:'1.8',outline:'none',minHeight:'200px',color:DARK});
  editor.contentEditable = 'true';
  editor.innerHTML = post.content || '<p><br></p>';

  // Style pasted content
  editor.addEventListener('paste', e => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, html || text.replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>'));
  });

  // Link click guard in editor
  editor.addEventListener('click', e => { if (e.target.tagName === 'A') e.preventDefault(); });

  wrap.appendChild(editor);
  ov.appendChild(bar); ov.appendChild(wrap);
  document.body.appendChild(ov);
  setTimeout(() => editor.focus(), 50);

  function insertImage() {
    const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*';
    inp.onchange = e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        editor.focus();
        document.execCommand('insertHTML',false,`<img src="${reader.result}" style="max-width:100%;height:auto;margin:20px 0;display:block;">`);
      };
      reader.readAsDataURL(file);
    };
    inp.click();
  }

  saveBtn.onclick = () => {
    if (isJourney) {
      const updated = {...post, year:yearInp.value, label:labelInp.value, content:editor.innerHTML};
      if (id) Journey.update(updated); else Journey.add(updated);
      ov.remove(); renderJourney();
      if (sessionStorage.getItem('admin')==='1') enableJourneyAdmin();
    } else {
      Blog.save({...post, title:titleInp.value, date:dateInp.value, content:editor.innerHTML});
      ov.remove();
      if (pg()==='blog') { renderBlog(); if (sessionStorage.getItem('admin')==='1') enableBlogAdmin(); }
      if (pg()==='post') renderPost();
    }
  };
  cancelBtn.onclick = () => ov.remove();
}

// ─── Journey: render ──────────────────────────────────────────────────────────
function renderJourney() {
  const sidebar  = document.getElementById('journey-sidebar');
  const sections = document.getElementById('journey-sections');
  const items    = Journey.items();

  if (sidebar) {
    sidebar.innerHTML = items.length
      ? items.map(item=>`
          <div class="timeline-item" data-id="${item.id}" onclick="document.getElementById('section-${item.id}')?.scrollIntoView({behavior:'smooth'})">
            <span class="timeline-year">${esc(item.year)}</span>
            <span class="timeline-label">${esc(item.label)}</span>
          </div>`).join('')
      : `<p class="timeline-empty">No timeline items yet.<br>Add them in admin mode.</p>`;
  }

  if (sections) {
    sections.innerHTML = items.length
      ? items.map(item=>`
          <div class="journey-section" id="section-${item.id}">
            <div class="journey-section-year">${esc(item.year)}</div>
            <div class="journey-section-body">${item.content||'<p></p>'}</div>
          </div>`).join('')
      : '';
  }

  if (sidebar && sections && items.length) setupScrollSpy();
}

function setupScrollSpy() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      document.querySelectorAll('.timeline-item').forEach(t=>t.classList.remove('active'));
      const dot = document.querySelector(`.timeline-item[data-id="${e.target.id.replace('section-','')}"]`);
      if (dot) dot.classList.add('active');
    });
  }, {threshold:0.35, rootMargin:'-80px 0px -40% 0px'});
  document.querySelectorAll('.journey-section').forEach(el=>obs.observe(el));
}

// ─── Journey: admin ───────────────────────────────────────────────────────────
function enableJourneyAdmin() {
  document.querySelectorAll('.journey-intro p, h1, .page-subtitle').forEach(enableEl);

  const sections = document.getElementById('journey-sections');
  if (sections) {
    sections.after(dottedBtn('+ Add Timeline Item', () => openPostEditor(null, {journey:true})));
    Journey.items().forEach(item => {
      const sec = document.getElementById(`section-${item.id}`);
      if (!sec) return;
      sec.style.position = 'relative';
      const ctrl = mkEl('div',{display:'flex',gap:'6px',marginBottom:'10px'});
      ctrl.className = 'admin-ctrl';
      [['Edit','#7a7870','#e0ddd6',()=>openPostEditor(item.id,{journey:true})],
       ['Delete','#b94040','#e8c0c0',()=>{ if(confirm('Delete?')){ Journey.del(item.id); renderJourney(); enableJourneyAdmin(); } }]
      ].forEach(([label,color,border,fn])=>{
        const b=document.createElement('button'); b.textContent=label;
        css(b,{background:'none',border:`1px solid ${border}`,color,fontFamily:SF,fontSize:'10px',padding:'3px 8px',cursor:'pointer',letterSpacing:'0.06em',textTransform:'uppercase'});
        b.onclick=fn; ctrl.appendChild(b);
      });
      sec.prepend(ctrl);
    });

    // Also allow editing sidebar timeline labels
    document.querySelectorAll('.timeline-item .timeline-label, .timeline-item .timeline-year').forEach(enableEl);
  }
}

// ─── Interests: admin ─────────────────────────────────────────────────────────
function enableInterestsAdmin() {
  makeEditable();
  const prose = document.querySelector('#editable-content .prose');
  if (!prose) return;
  prose.querySelectorAll('h2, p').forEach(enableEl);

  // Delete buttons on existing sections
  prose.querySelectorAll('h2').forEach(h2 => {
    const del = document.createElement('button'); del.textContent='×'; del.className='admin-ctrl';
    css(del,{float:'right',background:'none',border:'none',color:'#b94040',cursor:'pointer',fontSize:'16px',marginLeft:'8px',lineHeight:'1'});
    const next = h2.nextElementSibling;
    del.onclick = () => { if (next?.tagName==='P') next.remove(); h2.remove(); del.remove(); saveGenericContent(); };
    h2.prepend(del);
  });

  // Add section
  prose.after(dottedBtn('+ Add Section', () => {
    const h2 = document.createElement('h2'); h2.contentEditable='true'; h2.textContent='New Section';
    const p  = document.createElement('p');  p.contentEditable='true';  p.textContent='Write something here.';
    const del = document.createElement('button'); del.textContent='×'; del.className='admin-ctrl';
    css(del,{float:'right',background:'none',border:'none',color:'#b94040',cursor:'pointer',fontSize:'16px',marginLeft:'8px',lineHeight:'1'});
    del.onclick = () => { h2.remove(); p.remove(); del.remove(); };
    h2.prepend(del);
    prose.appendChild(h2); prose.appendChild(p);
    h2.focus();
  }));
}

// ─── Homepage quick links ─────────────────────────────────────────────────────
function renderQuickLinks() {
  const c = document.getElementById('quick-links');
  if (!c) return;
  const items = QuickLinks.get();
  c.innerHTML = items.length
    ? items.map(item=>`
        <a href="${esc(item.url)}" class="quick-link" target="_blank" rel="noopener" data-id="${item.id}">
          ${esc(item.text)}
          <span class="ql-tip">${esc(item.desc)}</span>
        </a>`).join('')
    : '';
}

function enableHomeAdmin() {
  addListControls();
  const c = document.getElementById('quick-links');
  if (!c) return;

  c.after(dottedBtn('+ Add Link', () => {
    const text = prompt('Link label (e.g. Twitter):'); if (!text) return;
    const url  = prompt('URL:'); if (!url) return;
    const desc = prompt('Hover description (shown on hover):') || '';
    QuickLinks.add({id:'ql'+Date.now(), text, url, desc});
    renderQuickLinks();
    enableHomeAdmin();
  }));

  c.querySelectorAll('.quick-link').forEach(a => {
    const id = a.dataset.id;
    const del = document.createElement('button'); del.textContent='×'; del.className='admin-ctrl';
    css(del,{position:'absolute',top:'-6px',right:'-6px',background:'#b94040',color:'#fff',border:'none',borderRadius:'50%',width:'16px',height:'16px',cursor:'pointer',fontSize:'10px',lineHeight:'16px',padding:'0',display:'flex',alignItems:'center',justifyContent:'center'});
    del.onclick = e => { e.preventDefault(); QuickLinks.del(id); renderQuickLinks(); enableHomeAdmin(); };
    a.style.position='relative';
    a.appendChild(del);
  });
}

// ─── List item templates ──────────────────────────────────────────────────────
function newListItem(type) {
  const li = document.createElement('li');
  const t = {
    work:  `<div class="work-title"><a href="#" contenteditable="true">Project title</a></div><div class="work-desc" contenteditable="true">What you built and why.</div><div class="work-tags"><span class="tag" contenteditable="true">Tag</span></div>`,
    book:  `<div class="book-title" contenteditable="true">Title</div><div class="book-author" contenteditable="true">Author</div><div class="book-take" contenteditable="true">What stuck.</div>`,
    quote: `<div class="quote-text" contenteditable="true">"Quote."</div><div class="quote-source" contenteditable="true">Source</div>`,
    idea:  `<div class="idea-title" contenteditable="true">Idea title</div><div class="idea-body" contenteditable="true">Expand on this idea.</div>`,
  };
  li.innerHTML = t[type] || '';
  return li;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function enableEl(el) { el.contentEditable='true'; el.style.outline='none'; }

function addDelBtn(li) {
  const btn = document.createElement('button'); btn.className='admin-ctrl'; btn.textContent='×';
  css(btn,{position:'absolute',top:'18px',right:'-24px',background:'none',border:'none',color:'#b94040',cursor:'pointer',fontSize:'17px',lineHeight:'1',padding:'2px 4px',opacity:'0',transition:'opacity 0.15s'});
  btn.onclick = () => li.remove();
  li.style.position='relative';
  li.addEventListener('mouseenter',()=>btn.style.opacity='1');
  li.addEventListener('mouseleave',()=>btn.style.opacity='0');
  li.appendChild(btn);
}

function dottedBtn(text, onClick) {
  const btn = document.createElement('button'); btn.className='admin-ctrl'; btn.textContent=text;
  css(btn,{display:'block',marginTop:'14px',background:'none',border:`1px dashed ${TEAL}`,color:TEAL,padding:'6px 14px',cursor:'pointer',fontFamily:SF,fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase'});
  btn.onclick = onClick; return btn;
}

function mkTextBtn(text, bg, color) {
  const b = document.createElement('button'); b.textContent=text;
  css(b,{background:bg,color,border:'none',padding:'7px 14px',cursor:'pointer',fontFamily:SF,fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase',borderRadius:'2px'});
  return b;
}

function mkEl(tag, styles) { const el=document.createElement(tag); Object.assign(el.style,styles); return el; }
function css(el, styles)   { Object.assign(el.style, styles); }
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

})();
