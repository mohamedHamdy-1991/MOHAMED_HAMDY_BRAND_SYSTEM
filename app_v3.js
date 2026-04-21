// HAMDY app controller v3 — themes, logo upload, planner multi-week, archive
(function(){
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  // ----- STATE -----
  const STATE = window.HAMDY_STATE = {
    theme: localStorage.getItem('hamdy_theme') || 'light',
    logoSrc: localStorage.getItem('hamdy_logo_src') || null,
    logoLetter: localStorage.getItem('hamdy_logo_letter') || 'H',
    accentId: localStorage.getItem('hamdy_accent') || 'AC1',
    usedAccents: JSON.parse(localStorage.getItem('hamdy_accent_used') || '[]'),
    weeks: JSON.parse(localStorage.getItem('hamdy_weeks') || '[]'),
    currentWeekId: localStorage.getItem('hamdy_current_week') || null,
    archive: JSON.parse(localStorage.getItem('hamdy_archive') || '[]')
  };

  function save(){
    localStorage.setItem('hamdy_theme', STATE.theme);
    if (STATE.logoSrc) localStorage.setItem('hamdy_logo_src', STATE.logoSrc);
    localStorage.setItem('hamdy_logo_letter', STATE.logoLetter);
    localStorage.setItem('hamdy_accent', STATE.accentId);
    localStorage.setItem('hamdy_accent_used', JSON.stringify(STATE.usedAccents));
    localStorage.setItem('hamdy_weeks', JSON.stringify(STATE.weeks));
    if (STATE.currentWeekId) localStorage.setItem('hamdy_current_week', STATE.currentWeekId);
    localStorage.setItem('hamdy_archive', JSON.stringify(STATE.archive));
  }

  // ----- TOAST -----
  const toastEl = $('#toast'); let toastT;
  const toast = m => { toastEl.textContent=m; toastEl.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>toastEl.classList.remove('show'),1800); };
  window.HAMDY_TOAST = toast;

  // ----- THEME -----
  function applyTheme(){
    document.documentElement.dataset.theme = STATE.theme;
    const ic = $('#theme-icon');
    if (STATE.theme==='dark') ic.innerHTML = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>';
    else ic.innerHTML = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
  }
  $('#theme-toggle').addEventListener('click', ()=>{
    STATE.theme = STATE.theme==='light'?'dark':'light';
    applyTheme(); save();
    toast(STATE.theme==='dark'?'Dark mode':'Light mode');
  });

  // ----- LOGO -----
  function renderLogo(){
    const logoEl = $('#brand-logo');
    if (STATE.logoSrc){
      logoEl.innerHTML = `<img src="${STATE.logoSrc}" alt="logo"/>`;
      logoEl.style.background='transparent';
    } else {
      logoEl.innerHTML = STATE.logoLetter;
      logoEl.style.background = getComputedStyle(document.documentElement).getPropertyValue('--brand');
    }
    // dashboard logo previews
    const l = $('#logo-light'), d = $('#logo-dark');
    if (l && d){
      const renderBox = (bg, fg) => {
        if (STATE.logoSrc) return `<img src="${STATE.logoSrc}" style="max-height:80px;max-width:180px"/>`;
        const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand');
        return `<div style="display:flex;align-items:center;gap:14px">
          <div style="width:56px;height:56px;border-radius:50%;background:${brand};color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-head);font-weight:800;font-size:28px">${STATE.logoLetter}</div>
          <div style="font-family:var(--font-head);font-weight:800;font-size:24px;letter-spacing:-0.02em;color:${fg}">Mohamed Hamdy</div>
        </div>`;
      };
      l.innerHTML = renderBox('light','#151515');
      d.innerHTML = renderBox('dark','#F6F3EE');
    }
  }
  $('#logo-upload').addEventListener('change', e => {
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ev => { STATE.logoSrc = ev.target.result; save(); renderLogo(); toast('Logo updated'); };
    r.readAsDataURL(f);
  });
  document.addEventListener('click', e => {
    if (e.target.id==='logo-edit-btn') $('#logo-upload').click();
    if (e.target.id==='logo-reset-btn'){ STATE.logoSrc=null; localStorage.removeItem('hamdy_logo_src'); save(); renderLogo(); toast('Reset'); }
  });

  // ----- TABS -----
  const editors = {};
  $$('.tab').forEach(t => {
    t.addEventListener('click', () => {
      $$('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const k = t.dataset.tab;
      $$('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === k));
      if (k==='carousel' && !editors.carousel) editors.carousel = new window.HAMDY_EDITOR.Editor($('#editor-carousel'), {mode:'carousel',canvasW:1080,canvasH:1080,autosaveKey:'hamdy_carousel'});
      if (k==='post' && !editors.post) editors.post = new window.HAMDY_EDITOR.Editor($('#editor-post'), {mode:'post',canvasW:1080,canvasH:1080,autosaveKey:'hamdy_post'});
      if (k==='story' && !editors.story) editors.story = new window.HAMDY_EDITOR.Editor($('#editor-story'), {mode:'story',canvasW:1080,canvasH:1920,autosaveKey:'hamdy_story'});
      if (editors[k]) requestAnimationFrame(()=>editors[k].fitZoom());
      if (k==='planner') renderPlanner();
      if (k==='archive') renderArchive();
      if (k==='templates') renderTemplates();
    });
  });
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go-tab]');
    if (g) $(`.tab[data-tab="${g.dataset.goTab}"]`).click();
  });

  // ----- EDITOR toolbar actions -----
  window.HAMDY_APP = window.HAMDY_APP || {};
  window.HAMDY_APP.editorExport = async function(act, ed){
    const kind = ed.mode;
    if (act==='png'){
      // current slide only
      await exportCurrentPNG(ed, kind);
    } else if (act==='all-png'){
      await exportPNG(ed, kind);
    } else if (act==='pdf'){
      window.print();
    } else if (act==='save'){
      const snap = ed.getSnapshot();
      STATE.archive.unshift({ id:'a'+Date.now(), when:new Date().toISOString(), kind, title: `${kind} · ${snap.slides.length} slides`, snapshot: snap });
      STATE.archive = STATE.archive.slice(0, 50);
      save(); toast('Saved to archive');
    } else if (act==='load'){
      const inp = document.createElement('input'); inp.type='file'; inp.accept='application/json';
      inp.onchange = e => {
        const f = e.target.files[0]; if(!f) return;
        const r = new FileReader();
        r.onload = ev => {
          try { const data = JSON.parse(ev.target.result); if (data.slides) { ed.loadSlides(data.slides); toast('Project loaded'); } }
          catch(err){ toast('Bad JSON'); }
        };
        r.readAsText(f);
      };
      inp.click();
    } else if (act==='copy-captions'){
      const caps = ed.getSnapshot().slides.map((s,i)=>{
        const t = s.elements.filter(e=>e.type==='text').map(e=>e.content).join(' | ');
        return `[${i+1}] ${t}`;
      }).join('\n');
      navigator.clipboard.writeText(caps).then(()=>toast('Captions copied')).catch(()=>toast('Copy failed'));
    }
  };

  async function exportCurrentPNG(ed, name){
    if (!window.html2canvas){ toast('Export lib not loaded'); return; }
    const snap = ed.getSnapshot();
    const canvas = ed.host.querySelector('#canvas');
    const origTransform = canvas.style.transform;
    canvas.style.transform = 'scale(1)';
    await new Promise(r=>setTimeout(r,80));
    const out = await window.html2canvas(canvas, {scale:1, useCORS:true, backgroundColor:null, width:snap.W, height:snap.H});
    canvas.style.transform = origTransform;
    const a = document.createElement('a');
    a.download = `hamdy_${name}_slide${ed.idx+1}.png`;
    a.href = out.toDataURL('image/png');
    a.click();
    toast('Exported slide '+(ed.idx+1));
  }

  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-ed-act]');
    if (!b) return;
    const ed = editors[b.dataset.ed];
    if (!ed) { toast('Open the editor first'); return; }
    if (b.dataset.edAct === 'save'){
      const snap = ed.getSnapshot();
      STATE.archive.unshift({ id:'a'+Date.now(), when:new Date().toISOString(), kind:b.dataset.ed, title: `${b.dataset.ed} · ${snap.slides.length} slides`, snapshot: snap });
      STATE.archive = STATE.archive.slice(0, 50);
      save(); toast('Saved to archive');
    } else if (b.dataset.edAct === 'export-png'){
      await exportPNG(ed, b.dataset.ed);
    }
  });

  async function exportPNG(ed, name){
    if (!window.html2canvas){ toast('Export lib not loaded'); return; }
    const snap = ed.getSnapshot();
    const origSlide = ed.idx;
    for (let i=0;i<snap.slides.length;i++){
      ed.idx = i; ed.render();
      const canvas = ed.host.querySelector('#canvas');
      const origTransform = canvas.style.transform;
      canvas.style.transform = 'scale(1)';
      await new Promise(r=>setTimeout(r,80));
      const out = await window.html2canvas(canvas, {scale:1, useCORS:true, backgroundColor:null, width:snap.W, height:snap.H});
      canvas.style.transform = origTransform;
      const a = document.createElement('a');
      a.download = `hamdy_${name}_${i+1}.png`;
      a.href = out.toDataURL('image/png');
      a.click();
    }
    ed.idx = origSlide; ed.render();
    toast('Exported '+snap.slides.length+' PNG(s)');
  }

  // ----- DASHBOARD -----
  const SW_BASE = [
    { name:'Rich Black', hex:'#070707', rgb:'7,7,7', mood:'Primary bg', bg:'#070707', fg:'#F6F3EE' },
    { name:'Dark Charcoal', hex:'#1C1C1C', rgb:'28,28,28', mood:'Overlay', bg:'#1C1C1C', fg:'#F6F3EE' },
    { name:'Off-White', hex:'#F6F3EE', rgb:'246,243,238', mood:'Light bg', bg:'#F6F3EE', fg:'#070707' },
    { name:'Cream', hex:'#F3EBD8', rgb:'243,235,216', mood:'Page bg', bg:'#F3EBD8', fg:'#070707' }
  ];
  function renderSwatches(){
    const all = [...SW_BASE, ...ACCENTS.map(a => ({...a, bg:a.hex, fg:['#F5B59A','#E2C9A8'].includes(a.hex)?'#070707':'#FFFFFF'}))];
    $('#swatch-grid').innerHTML = all.map(s=>`<div class="swatch" data-hex="${s.hex}" style="background:${s.bg};color:${s.fg}">
      <div><div class="name">${s.name}</div><div class="mood">${s.mood}</div></div>
      <div><div class="hex">${s.hex}</div><div class="rgb">RGB ${s.rgb}</div></div>
    </div>`).join('');
    $$('.swatch').forEach(sw=>sw.addEventListener('click',()=>{navigator.clipboard.writeText(sw.dataset.hex);toast('Copied '+sw.dataset.hex);}));
  }
  function renderVoice(){
    $('#voice-do').innerHTML = (window.HAMDY_DATA?.VOICE_DO || VOICE_DO || []).map(v=>`<li>${v}</li>`).join('');
    $('#voice-dont').innerHTML = (window.HAMDY_DATA?.VOICE_DONT || VOICE_DONT || []).map(v=>`<li>${v}</li>`).join('');
  }
  function renderType(){
    const rows = [
      { nm:'Space Grotesk · 800', meta:'Hero · 72px', s:'Overheating.', css:"font-family:'Space Grotesk';font-weight:800;font-size:48px;letter-spacing:-0.02em;line-height:1" },
      { nm:'Space Grotesk · 700', meta:'H1 · 44px', s:"The city won't cool down.", css:"font-family:'Space Grotesk';font-weight:700;font-size:36px;line-height:1.05" },
      { nm:'Roboto Condensed · 700', meta:'Kicker · ALL-CAPS', s:'URBAN HEAT ISLAND', css:"font-family:'Roboto Condensed';font-weight:700;font-size:18px;letter-spacing:0.15em;text-transform:uppercase" },
      { nm:'Inter · 400', meta:'Body · 16px', s:'Plain language. Tied to why this matters.', css:"font-family:'Inter';font-size:16px;line-height:1.5;color:var(--muted)" }
    ];
    $('#type-samples').innerHTML = rows.map(r=>`<div class="type-row"><div class="meta"><span class="nm">${r.nm}</span> ${r.meta}</div><div style="${r.css}">${r.s}</div></div>`).join('');
  }
  function renderPillars(){
    $('#pillar-table tbody').innerHTML = PILLARS.map(p=>`<tr><td class="pillar">${p.id}</td><td><strong>${p.name}</strong><div style="font-size:11px;color:var(--muted);margin-top:3px">${p.desc}</div></td><td style="color:var(--muted);font-size:12px">${p.platforms}</td><td><span class="tag yellow">${p.cadence}</span></td></tr>`).join('');
    $('#schedule-table tbody').innerHTML = SCHEDULE.map(r=>`<tr><td class="pillar">${r[0]}</td><td><strong>${r[1]}</strong></td><td style="color:var(--muted);font-size:12px">${r[2]}</td></tr>`).join('');
    $('#dim-table tbody').innerHTML = DIMENSIONS.map(r=>`<tr><td><strong>${r[0]}</strong></td><td><span class="tag dark">${r[1]}</span></td><td style="color:var(--muted);font-size:11px">${r[2]}</td></tr>`).join('');
  }

  // ----- ACCENTS -----
  function setAccent(a){
    STATE.accentId = a.id;
    document.documentElement.style.setProperty('--brand', a.hex);
    document.documentElement.style.setProperty('--brand-rgb', a.rgb);
    $('#acc-current').textContent = a.id;
    $('#acc-current-name').textContent = a.name;
    renderLogo();
    renderAccentGrid();
    save();
  }
  function renderAccentGrid(){
    const host = $('#accent-grid'); if (!host) return;
    host.innerHTML = ACCENTS.map(a => {
      const used = STATE.usedAccents.includes(a.id);
      const active = a.id === STATE.accentId;
      const tc = ['#F5B59A','#E2C9A8'].includes(a.hex)?'#070707':'#FFFFFF';
      return `<div class="accent-card ${active?'active':''}" data-id="${a.id}" style="background:${a.hex};color:${tc}">
        ${used?'<span class="used-chip">Used</span>':''}
        <div>
          <div class="kicker" style="color:${tc};opacity:.7;margin:0">${a.id}</div>
          <div style="font-family:var(--font-head);font-weight:800;font-size:22px;margin-top:4px">${a.name}</div>
          <div style="font-size:12px;opacity:.75;margin-top:4px;font-style:italic">${a.mood}</div>
        </div>
        <div>
          <div style="font-weight:600;font-size:13px">${a.hex}</div>
          <div style="font-size:11px;opacity:.7">RGB ${a.rgb}</div>
          <div style="display:flex;gap:5px;margin-top:10px;flex-wrap:wrap">
            <button class="btn-mini" style="background:${tc};color:${a.hex}" data-act="use">Use</button>
            <button class="btn-mini" style="background:transparent;border:1px solid ${tc};color:${tc}" data-act="copy">Copy</button>
            <button class="btn-mini" style="background:transparent;border:1px solid ${tc};color:${tc}" data-act="mark">${used?'Unmark':'Mark used'}</button>
          </div>
        </div>
      </div>`;
    }).join('');
    host.querySelectorAll('.accent-card').forEach(card=>{
      card.addEventListener('click', e => {
        const btn = e.target.closest('[data-act]');
        const a = ACCENTS.find(x=>x.id===card.dataset.id);
        if (btn){
          e.stopPropagation();
          if (btn.dataset.act==='use') setAccent(a);
          else if (btn.dataset.act==='copy'){ navigator.clipboard.writeText(a.hex); toast('Copied '+a.hex); }
          else if (btn.dataset.act==='mark'){
            if (STATE.usedAccents.includes(a.id)) STATE.usedAccents = STATE.usedAccents.filter(x=>x!==a.id);
            else STATE.usedAccents.push(a.id);
            save(); renderAccentGrid(); $('#acc-used-count').textContent=STATE.usedAccents.length;
          }
        } else setAccent(a);
      });
    });
    $('#acc-used-count').textContent = STATE.usedAccents.length;
  }
  $('#acc-clear-used').addEventListener('click', ()=>{ STATE.usedAccents=[]; save(); renderAccentGrid(); toast('Cleared'); });

  // ----- HASHTAGS -----
  function renderTags(){
    const rend = (host, arr) => { host.innerHTML = arr.map(t=>`<span class="hashtag" data-tag="${t}">${t}</span>`).join(''); host.querySelectorAll('.hashtag').forEach(el=>el.addEventListener('click',()=>{navigator.clipboard.writeText(el.dataset.tag);toast('Copied '+el.dataset.tag);})); };
    rend($('#tags-ig'), HASHTAGS_IG);
    rend($('#tags-li'), HASHTAGS_LI);
  }
  $('#copy-ig').addEventListener('click', ()=>{navigator.clipboard.writeText(HASHTAGS_IG.join(' '));toast('25 IG tags copied');});
  $('#copy-li').addEventListener('click', ()=>{navigator.clipboard.writeText(HASHTAGS_LI.join(' '));toast('12 LI tags copied');});
  $('#tag-search').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    $$('.hashtag').forEach(el => el.style.display = el.dataset.tag.toLowerCase().includes(q)?'':'none');
  });

  // ----- PLANNER (multi-week) -----
  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  function initWeeks(){
    if (STATE.weeks.length===0){
      const today = new Date();
      const monday = new Date(today); monday.setDate(today.getDate()-((today.getDay()+6)%7));
      const sunday = new Date(monday); sunday.setDate(monday.getDate()+6);
      const wk = newWeek('Week 1', monday.toISOString().slice(0,10), sunday.toISOString().slice(0,10));
      STATE.weeks.push(wk); STATE.currentWeekId = wk.id; save();
    }
    if (!STATE.currentWeekId || !STATE.weeks.find(w=>w.id===STATE.currentWeekId)) STATE.currentWeekId = STATE.weeks[0].id;
  }
  function newWeek(label, s, e){
    return { id:'w'+Date.now(), label:label||'New week', start:s||'', end:e||'', topic:'', days: Object.fromEntries(DAYS.map(d => [d, {notes:'', posts:[]}])) };
  }
  function currentWeek(){ return STATE.weeks.find(w=>w.id===STATE.currentWeekId); }

  function renderPlanner(){
    initWeeks();
    const host = $('#week-tabs');
    host.innerHTML = STATE.weeks.map(w => `<button class="week-tab ${w.id===STATE.currentWeekId?'active':''}" data-wid="${w.id}">${w.label || 'Week'}</button>`).join('');
    host.querySelectorAll('.week-tab').forEach(b => b.addEventListener('click', ()=>{
      STATE.currentWeekId = b.dataset.wid; save(); renderPlanner();
    }));
    const w = currentWeek();
    $('#week-label').value = w.label || '';
    $('#week-start').value = w.start || '';
    $('#week-end').value = w.end || '';
    $('#week-topic').value = w.topic || '';
    renderWeekGrid();
  }
  function renderWeekGrid(){
    const w = currentWeek();
    const host = $('#week-grid');
    host.innerHTML = DAYS.map((d,i) => {
      const day = w.days[d] || (w.days[d] = {notes:'',posts:[]});
      const dayDate = w.start ? dateAdd(w.start, i) : '';
      return `<div class="day-col" data-d="${d}">
        <div class="day-h">
          <span class="dn">${d}</span>
          <span class="dt">${dayDate}</span>
        </div>
        <div class="label">Notes</div>
        <textarea class="note" data-k="notes" placeholder="What's happening this day?">${day.notes||''}</textarea>
        <div class="label" style="margin-top:10px">Posts</div>
        <div class="posts">
          ${day.posts.map((p,pi)=>`<div class="post-slot" data-pi="${pi}">
            <button class="del" data-del="${pi}">×</button>
            <div class="label">Format</div>
            <select class="select" data-pk="format">${['Carousel','Single Post','Story','Reel','Video','Newsletter'].map(f=>`<option ${p.format===f?'selected':''}>${f}</option>`).join('')}</select>
            <div class="label">Topic</div>
            <select class="select" data-pk="topic">
              <option value="">— choose —</option>
              ${TOPICS.map(t=>`<option value="${t.id}" ${p.topic===t.id?'selected':''}>${t.id} · ${t.label.slice(0,48)}</option>`).join('')}
            </select>
            <div class="label">Accent</div>
            <div class="accent-dots">
              ${ACCENTS.map(a=>`<div class="sw ${p.accent===a.id?'selected':''}" data-acc="${a.id}" style="background:${a.hex}" title="${a.name}"></div>`).join('')}
            </div>
            <div class="label" style="margin-top:8px">Caption draft</div>
            <textarea class="note" data-pk="caption" placeholder="Hook, body, CTA…">${p.caption||''}</textarea>
          </div>`).join('')}
        </div>
        <button class="add-post-btn" data-add-post>+ Add post</button>
      </div>`;
    }).join('');

    host.querySelectorAll('.day-col').forEach(col => {
      const d = col.dataset.d;
      col.querySelector('[data-k="notes"]').addEventListener('input', e => { w.days[d].notes = e.target.value; save(); });
      col.querySelectorAll('.post-slot').forEach(slot => {
        const pi = +slot.dataset.pi;
        slot.querySelectorAll('[data-pk]').forEach(inp => {
          inp.addEventListener('input', ()=>{ w.days[d].posts[pi][inp.dataset.pk] = inp.value; save(); });
          inp.addEventListener('change', ()=>{ w.days[d].posts[pi][inp.dataset.pk] = inp.value; save(); });
        });
        slot.querySelectorAll('.accent-dots .sw').forEach(sw => {
          sw.addEventListener('click', ()=>{
            w.days[d].posts[pi].accent = sw.dataset.acc;
            save(); renderWeekGrid();
          });
        });
        slot.querySelector('[data-del]').addEventListener('click', ()=>{
          w.days[d].posts.splice(pi,1); save(); renderWeekGrid();
        });
      });
      col.querySelector('[data-add-post]').addEventListener('click', ()=>{
        w.days[d].posts.push({format:'Carousel',topic:'',accent:'AC1',caption:''});
        save(); renderWeekGrid();
      });
    });
  }
  function dateAdd(isoDate, n){
    if (!isoDate) return '';
    const d = new Date(isoDate); d.setDate(d.getDate()+n);
    return d.toLocaleDateString('en-GB', {day:'numeric',month:'short'});
  }

  ['week-label','week-topic','week-start','week-end'].forEach(id => {
    $('#'+id).addEventListener('input', ()=>{
      const w = currentWeek();
      w[id.replace('week-','')] = $('#'+id).value;
      save();
      if (id==='week-label') renderPlanner();
      if (id==='week-start' || id==='week-end') renderWeekGrid();
    });
  });

  $('#week-new').addEventListener('click', ()=>{
    const n = STATE.weeks.length+1;
    const w = newWeek('Week '+n, '', '');
    STATE.weeks.push(w); STATE.currentWeekId = w.id; save(); renderPlanner();
  });
  $('#week-delete').addEventListener('click', ()=>{
    if (STATE.weeks.length<=1){ toast('Keep at least one week'); return; }
    STATE.weeks = STATE.weeks.filter(w=>w.id!==STATE.currentWeekId);
    STATE.currentWeekId = STATE.weeks[0].id;
    save(); renderPlanner(); toast('Week deleted');
  });
  $('#planner-md').addEventListener('click', ()=>{
    const w = currentWeek();
    let md = `# ${w.label}\n${w.start||''} → ${w.end||''}\n\n**Topic:** ${w.topic||'—'}\n\n`;
    DAYS.forEach(d => {
      const day = w.days[d];
      if (!day.notes && !day.posts.length) return;
      md += `## ${d}\n`;
      if (day.notes) md += day.notes+'\n\n';
      day.posts.forEach((p,i)=>{
        const t = TOPICS.find(x=>x.id===p.topic);
        md += `- [ ] ${p.format}: ${t?t.label:'(topic?)'} · Accent ${p.accent||'?'}\n`;
        if (p.caption) md += `  Caption: ${p.caption}\n`;
      });
      md += '\n';
    });
    const blob = new Blob([md],{type:'text/markdown'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download = `${w.label.replace(/\s+/g,'_')}.md`; a.click();
  });
  $('#planner-json').addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(currentWeek(),null,2)],{type:'application/json'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download = currentWeek().label.replace(/\s+/g,'_')+'.json'; a.click();
  });
  $('#planner-archive').addEventListener('click', ()=>{
    STATE.archive.unshift({id:'a'+Date.now(),when:new Date().toISOString(),kind:'week',title:currentWeek().label,snapshot:JSON.parse(JSON.stringify(currentWeek()))});
    STATE.archive = STATE.archive.slice(0,50); save(); toast('Week archived');
  });

  // ----- ARCHIVE -----
  function renderArchive(){
    const host = $('#archive-list');
    if (!STATE.archive.length){ host.innerHTML = `<div class="card" style="text-align:center;color:var(--muted)">No items yet. Save a design or archive a week.</div>`; return; }
    host.innerHTML = STATE.archive.map(a => `<div class="archive-row" data-id="${a.id}">
      <div class="meta">
        <div class="title">${a.title}</div>
        <div class="date">${new Date(a.when).toLocaleString()}</div>
      </div>
      <div class="hstack" style="gap:6px">
        <span class="tag ${a.kind==='week'?'yellow':'dark'}">${a.kind}</span>
        <button class="btn" data-ar-act="restore">Restore</button>
        <button class="btn" data-ar-act="json">Export</button>
        <button class="btn" data-ar-act="delete" style="color:var(--warn)">Delete</button>
      </div>
    </div>`).join('');
    host.querySelectorAll('.archive-row').forEach(row => {
      row.querySelectorAll('[data-ar-act]').forEach(b => b.addEventListener('click', ()=>{
        const a = STATE.archive.find(x=>x.id===row.dataset.id);
        const act = b.dataset.arAct;
        if (act==='delete'){ STATE.archive = STATE.archive.filter(x=>x.id!==a.id); save(); renderArchive(); }
        else if (act==='json'){ const blob = new Blob([JSON.stringify(a,null,2)],{type:'application/json'}); const el=document.createElement('a'); el.href=URL.createObjectURL(blob); el.download=a.title.replace(/\s+/g,'_')+'.json'; el.click(); }
        else if (act==='restore'){
          if (a.kind==='week'){
            const w = JSON.parse(JSON.stringify(a.snapshot)); w.id='w'+Date.now();
            STATE.weeks.push(w); STATE.currentWeekId=w.id; save();
            $('.tab[data-tab="planner"]').click(); toast('Week restored');
          } else {
            // restore into editor
            if (!editors[a.kind]){ $(`.tab[data-tab="${a.kind}"]`).click(); setTimeout(()=>editors[a.kind].loadSlides(a.snapshot.slides),200); }
            else { editors[a.kind].loadSlides(a.snapshot.slides); $(`.tab[data-tab="${a.kind}"]`).click(); }
            toast('Restored');
          }
        }
      }));
    });
  }
  $('#archive-clear').addEventListener('click', ()=>{ if (confirm('Clear all archive?')){ STATE.archive=[]; save(); renderArchive(); }});

  // ----- SAVE ALL -----
  $('#save-all').addEventListener('click', ()=>{ save(); toast('All saved'); });

  // ----- TEMPLATES -----
  function renderMini(host, slide, w, h){
    host.style.width=w+'px'; host.style.height=h+'px';
    host.style.background = slide.bgImage?`#000 url(${slide.bgImage}) center/cover`:slide.bg||slide.bgColor;
    host.innerHTML='';
    slide.els.forEach(e=>{
      const n=document.createElement('div');
      n.style.position='absolute';n.style.left=e.x+'px';n.style.top=e.y+'px';
      n.style.width=e.w+'px';n.style.height=e.h+'px';
      n.style.transform=`rotate(${e.rotation||0}deg)`;n.style.opacity=e.opacity||1;
      if (e.type==='text'){
        n.style.fontFamily=e.fontFamily;n.style.fontSize=e.fontSize+'px';n.style.fontWeight=e.fontWeight;
        n.style.color=e.color;n.style.textAlign=e.align||'left';n.style.lineHeight=e.lineHeight||1.2;
        n.style.letterSpacing=(e.letterSpacing||0)+'px';n.style.textTransform=e.uppercase?'uppercase':'none';
        n.textContent=e.content;
      } else if (e.type==='shape'){
        n.style.background = e.hasFill!==false?e.fill:'transparent';
        if (e.shape==='circle') n.style.borderRadius='50%';
      }
      host.appendChild(n);
    });
  }
  function renderTemplates(){
    const T = window.HAMDY_TEMPLATES; if (!T) return;
    const buildCard = (t, type, w, h) => `<div class="tpl-card" data-type="${type}" data-id="${t.id}">
      <div class="tpl-preview ${type==='story'?'story':''}"><div class="mini"></div></div>
      <div class="tpl-info">
        <div class="pillar-tag" style="color:${t.accent}">${t.pillar} · ${t.subtitle||type}</div>
        <h4>${t.title}</h4>
        <div class="btn-row">
          <button class="btn btn-primary" data-act="use">Use</button>
          <button class="btn" data-act="preview">Preview</button>
        </div>
      </div>
    </div>`;
    $('#tpl-carousels').innerHTML = T.tplCarousels.map(t=>buildCard(t,'carousel',1080,1080)).join('');
    $('#tpl-posts').innerHTML = T.tplPosts.map(t=>buildCard(t,'post',1080,1080)).join('');
    $('#tpl-stories').innerHTML = T.tplStories.map(t=>buildCard(t,'story',1080,1920)).join('');
    // render previews
    const pr = (sel, list, key, w, h) => {
      list.forEach(t=>{
        const card = document.querySelector(`${sel} [data-id="${t.id}"]`);
        const mini = card.querySelector('.mini');
        const slide = t[key] ? t[key][0] : t.slide;
        renderMini(mini, slide, w, h);
        mini.style.transformOrigin='top left';
        mini.style.transform = `scale(${(card.querySelector('.tpl-preview').clientWidth||240)/w})`;
        mini.style.position='absolute';mini.style.top='0';mini.style.left='0';
      });
    };
    pr('#tpl-carousels', T.tplCarousels, 'slides', 1080, 1080);
    pr('#tpl-posts', T.tplPosts, null, 1080, 1080);
    pr('#tpl-stories', T.tplStories, 'frames', 1080, 1920);

    $$('.tpl-card [data-act]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      const card = b.closest('.tpl-card');
      const type = card.dataset.type, id = card.dataset.id;
      if (b.dataset.act==='use') useTemplate(type, id);
      // preview opens in stage via use
      else useTemplate(type, id);
    }));
  }
  function useTemplate(type, id){
    const T = window.HAMDY_TEMPLATES;
    let slides;
    if (type==='carousel'){ const t=T.tplCarousels.find(x=>x.id===id); slides=t.slides.map(s=>({id:'s'+Math.random().toString(36).slice(2,8),label:s.label,bgType:'solid',bgColor:s.bg,elements:JSON.parse(JSON.stringify(s.els))})); }
    else if (type==='post'){ const t=T.tplPosts.find(x=>x.id===id); slides=[{id:'s'+Math.random().toString(36).slice(2,8),label:t.slide.label,bgType:'solid',bgColor:t.slide.bg,elements:JSON.parse(JSON.stringify(t.slide.els))}]; }
    else if (type==='story'){ const t=T.tplStories.find(x=>x.id===id); slides=t.frames.map(f=>({id:'s'+Math.random().toString(36).slice(2,8),label:f.label,bgType:'solid',bgColor:f.bg,elements:JSON.parse(JSON.stringify(f.els))})); }
    $(`.tab[data-tab="${type}"]`).click();
    setTimeout(()=>{ if (editors[type]) editors[type].loadSlides(slides); toast('Template loaded'); },200);
  }

  // ----- INIT -----
  applyTheme();
  renderLogo();
  renderSwatches();
  renderVoice();
  renderType();
  renderPillars();
  renderAccentGrid();
  const currentAcc = ACCENTS.find(a=>a.id===STATE.accentId) || ACCENTS[0];
  setAccent(currentAcc);
  renderTags();
  initWeeks();
})();
