// ============================================
// HAMDY App Controller — tabs, dashboard, accent, hashtags, planner, templates
// ============================================

(function(){
  const { ACCENTS, PILLARS, TOPICS, CAROUSEL_TYPES, POST_TYPES, STORY_FRAMES,
          HASHTAGS_IG, HASHTAGS_LI, VOICE_DO, VOICE_DONT, DIMENSIONS, SCHEDULE } = window.HAMDY;
  const { logoIcon, logoWordmark, logoFull } = window.HAMDY_LOGO;

  // ---------- Toast ----------
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  window.HAMDY_TOAST = function(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  };

  // ---------- Accent management ----------
  let currentAccent = ACCENTS[0];
  function setAccent(a, showToast = false) {
    currentAccent = a;
    const root = document.documentElement;
    root.style.setProperty('--accent', a.hex);
    root.style.setProperty('--accent-rgb', a.rgb);
    document.getElementById('accent-name').textContent = a.name;
    renderTopbarLogo();
    renderLogosDashboard();
    renderAccentPicker();
    // re-render editors so preview colours update
    Object.values(editors).forEach(ed => ed && ed._renderCanvas && ed._renderCanvas());
    Object.values(editors).forEach(ed => ed && ed._renderThumbs && ed._renderThumbs());
    if (showToast) window.HAMDY_TOAST(a.name + ' set');
    try { localStorage.setItem('hamdy_accent', a.id); } catch(e){}
  }
  // Restore
  try {
    const saved = localStorage.getItem('hamdy_accent');
    const found = ACCENTS.find(a => a.id === saved);
    if (found) currentAccent = found;
  } catch(e){}

  // ---------- Topbar logo ----------
  function renderTopbarLogo() {
    document.getElementById('topbar-logo').innerHTML = `
      <span style="display:inline-flex;align-items:center;gap:10px;">
        ${logoIcon(32, currentAccent.hex)}
        <span style="font-family:var(--font-headline);font-weight:800;letter-spacing:0.08em;font-size:18px;color:var(--color-cream);">MOHAMED HAMDY</span>
      </span>`;
  }

  // ---------- Tabs ----------
  const editors = {};
  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const key = t.dataset.tab;
      document.querySelectorAll('.tab-panel').forEach(p => p.hidden = p.dataset.panel !== key);
      // lazy init editors
      if (key === 'carousel' && !editors.carousel) {
        editors.carousel = new window.HAMDY_EDITOR.Editor(document.getElementById('editor-carousel'), { mode:'carousel', canvasW:1080, canvasH:1080, autosaveKey:'hamdy_carousel' });
      }
      if (key === 'post' && !editors.post) {
        editors.post = new window.HAMDY_EDITOR.Editor(document.getElementById('editor-post'), { mode:'post', canvasW:1080, canvasH:1080, autosaveKey:'hamdy_post' });
      }
      if (key === 'story' && !editors.story) {
        editors.story = new window.HAMDY_EDITOR.Editor(document.getElementById('editor-story'), { mode:'story', canvasW:1080, canvasH:1920, autosaveKey:'hamdy_story' });
      }
      if (editors[key]) requestAnimationFrame(() => editors[key].fitZoom());
    });
  });

  // ---------- Dashboard ----------
  function renderSwatches() {
    const baseSw = [
      { name:'Rich Black', hex:'#070707', rgb:'7,7,7', mood:'Primary background', bg:'#070707', fg:'#F6F3EE' },
      { name:'Dark Charcoal', hex:'#1C1C1C', rgb:'28,28,28', mood:'Overlay background', bg:'#1C1C1C', fg:'#F6F3EE' },
      { name:'Off-White', hex:'#F6F3EE', rgb:'246,243,238', mood:'Light background', bg:'#F6F3EE', fg:'#070707' },
      { name:'Pure White', hex:'#FFFFFF', rgb:'255,255,255', mood:'Body text on dark', bg:'#FFFFFF', fg:'#070707' }
    ];
    const all = [...baseSw, ...ACCENTS.map(a => ({...a, bg:a.hex, fg:a.hex==='#E2C9A8'||a.hex==='#F5B59A'?'#070707':'#F6F3EE'}))];
    document.getElementById('swatch-grid').innerHTML = all.map(s => `
      <div class="swatch" data-hex="${s.hex}" style="background:${s.bg};color:${s.fg};">
        <div>
          <div class="name">${s.name}</div>
          <div class="mood">${s.mood}</div>
        </div>
        <div>
          <div class="hex">${s.hex}</div>
          <div class="rgb">RGB ${s.rgb}</div>
        </div>
      </div>`).join('');
    document.querySelectorAll('#swatch-grid .swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        navigator.clipboard.writeText(sw.dataset.hex);
        window.HAMDY_TOAST('Copied ' + sw.dataset.hex);
      });
    });
  }

  function renderVoice() {
    document.getElementById('voice-do').innerHTML = VOICE_DO.map(v => `<li>${v}</li>`).join('');
    document.getElementById('voice-dont').innerHTML = VOICE_DONT.map(v => `<li>${v}</li>`).join('');
  }

  function renderTypeSamples() {
    const rows = [
      { nm:'Space Grotesk · 800', meta:'Hero / 96px', sample:'Overheating.', style:"font-family:var(--font-headline);font-weight:800;font-size:64px;letter-spacing:-0.02em;line-height:1;" },
      { nm:'Space Grotesk · 700', meta:'H1 / 64px', sample:'The city won\'t cool down.', style:"font-family:var(--font-headline);font-weight:700;font-size:44px;line-height:1.05;" },
      { nm:'Roboto Condensed · 700', meta:'Sub / 28px · ALL-CAPS', sample:'URBAN HEAT ISLAND', style:"font-family:var(--font-supporting);font-weight:700;font-size:24px;letter-spacing:0.15em;text-transform:uppercase;" },
      { nm:'Inter · 400', meta:'Body / 18px', sample:'Plain-language explanation of jargon on first use — always tied to why this matters to the reader.', style:"font-family:var(--font-body);font-weight:400;font-size:18px;color:#bcb5a8;max-width:640px;line-height:1.5;" },
      { nm:'Inter · 500 · italic', meta:'Source / 12px', sample:'Source — CIBSE TM59 (2020) · EPC Register · 2024', style:"font-family:var(--font-body);font-weight:500;font-style:italic;font-size:13px;color:#9CA3AF;" }
    ];
    document.getElementById('type-samples').innerHTML = rows.map(r => `
      <div class="type-row">
        <div class="meta"><span class="nm">${r.nm}</span>${r.meta}</div>
        <div style="${r.style}">${r.sample}</div>
      </div>`).join('');
  }

  function renderPillarTable() {
    document.querySelector('#pillar-table tbody').innerHTML = PILLARS.map(p => `
      <tr>
        <td class="pillar">${p.id}</td>
        <td><strong style="color:var(--color-cream)">${p.name}</strong><div style="font-size:12px;color:var(--color-muted);margin-top:4px;">${p.desc}</div></td>
        <td style="color:var(--color-muted);font-size:12px;">${p.platforms}</td>
        <td style="color:var(--accent);font-family:var(--font-supporting);font-weight:700;font-size:12px;letter-spacing:1px;text-transform:uppercase;">${p.cadence}</td>
      </tr>`).join('');
  }
  function renderScheduleTable() {
    document.querySelector('#schedule-table tbody').innerHTML = SCHEDULE.map(r => `
      <tr><td class="pillar">${r[0]}</td><td><strong style="color:var(--color-cream)">${r[1]}</strong></td><td style="color:var(--color-muted);font-size:12px;">${r[2]}</td></tr>`).join('');
    document.querySelector('#dim-table tbody').innerHTML = DIMENSIONS.map(r => `
      <tr><td><strong style="color:var(--color-cream)">${r[0]}</strong></td><td style="color:var(--accent);font-family:var(--font-body);font-weight:600;">${r[1]}</td><td style="color:var(--color-muted);font-size:12px;">${r[2]}</td></tr>`).join('');
  }
  function renderLogosDashboard() {
    document.getElementById('logo-fl').innerHTML = logoFull('light', 56, currentAccent.hex);
    document.getElementById('logo-fd').innerHTML = logoFull('dark', 56, currentAccent.hex);
    document.getElementById('logo-icon').innerHTML = `
      <div style="display:flex;align-items:flex-end;gap:16px;">
        ${logoIcon(32, currentAccent.hex)}
        ${logoIcon(56, currentAccent.hex)}
        ${logoIcon(96, currentAccent.hex)}
      </div>`;
    document.getElementById('logo-word').innerHTML = `<div style="display:flex;flex-direction:column;gap:14px;">
      ${logoWordmark('#070707', currentAccent.hex, 32)}
      ${logoWordmark('#070707', currentAccent.hex, 20)}
    </div>`;
  }

  // ---------- Accent picker ----------
  let usedAccents = [];
  try { usedAccents = JSON.parse(localStorage.getItem('hamdy_accent_used') || '[]'); } catch(e){}

  function renderAccentPicker() {
    const host = document.getElementById('accent-grid');
    if (!host) return;
    host.innerHTML = ACCENTS.map(a => {
      const used = usedAccents.includes(a.id);
      const isActive = a.id === currentAccent.id;
      const textColor = ['#F5B59A','#E2C9A8'].includes(a.hex) ? '#070707' : '#F6F3EE';
      return `
        <div class="accent-card ${isActive?'active':''}" data-acc="${a.id}" style="background:${a.hex};color:${textColor};">
          ${used ? `<span class="used-chip">Used</span>` : ''}
          <div>
            <div style="font-family:var(--font-supporting);font-size:10px;letter-spacing:0.15em;text-transform:uppercase;font-weight:700;opacity:0.7;">${a.id}</div>
            <div style="font-family:var(--font-headline);font-weight:800;font-size:24px;margin-top:4px;">${a.name}</div>
            <div style="font-size:12px;opacity:0.7;margin-top:4px;font-style:italic;">${a.mood}</div>
          </div>
          <div>
            <div style="font-family:var(--font-body);font-weight:600;font-size:13px;">${a.hex}</div>
            <div style="font-size:11px;opacity:0.7;">RGB ${a.rgb}</div>
            <div style="margin-top:10px;display:flex;gap:6px;">
              <button class="btn btn-sm" style="background:${textColor};color:${a.hex};padding:4px 10px;border:none;" data-acc-act="use" data-acc-id="${a.id}">Use</button>
              <button class="btn btn-sm" style="background:transparent;border:1px solid ${textColor};color:${textColor};padding:4px 10px;" data-acc-act="copy" data-acc-id="${a.id}">Copy</button>
              <button class="btn btn-sm" style="background:transparent;border:1px solid ${textColor};color:${textColor};padding:4px 10px;" data-acc-act="mark" data-acc-id="${a.id}">${used?'Unmark':'Mark used'}</button>
            </div>
          </div>
        </div>`;
    }).join('');
    host.querySelectorAll('.accent-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-acc-act]');
        const id = card.dataset.acc;
        const a = ACCENTS.find(x => x.id === id);
        if (btn) {
          e.stopPropagation();
          const act = btn.dataset.accAct;
          if (act === 'use') {
            if (usedAccents.includes(id)) window.HAMDY_TOAST('⚠ Already used this rotation');
            setAccent(a, true);
          } else if (act === 'copy') {
            navigator.clipboard.writeText(a.hex);
            window.HAMDY_TOAST('Copied ' + a.hex);
          } else if (act === 'mark') {
            if (usedAccents.includes(id)) usedAccents = usedAccents.filter(x => x !== id);
            else usedAccents.push(id);
            localStorage.setItem('hamdy_accent_used', JSON.stringify(usedAccents));
            renderAccentPicker();
          }
        } else {
          setAccent(a, true);
        }
      });
    });
  }

  // ---------- Hashtags ----------
  function renderTags() {
    const render = (host, arr) => {
      host.innerHTML = arr.map(t => `<span class="hashtag" data-tag="${t}">${t}</span>`).join('');
      host.querySelectorAll('.hashtag').forEach(el => {
        el.addEventListener('click', () => {
          navigator.clipboard.writeText(el.dataset.tag);
          window.HAMDY_TOAST('Copied ' + el.dataset.tag);
        });
      });
    };
    render(document.getElementById('tags-ig'), HASHTAGS_IG);
    render(document.getElementById('tags-li'), HASHTAGS_LI);
  }
  document.getElementById('copy-ig').addEventListener('click', () => {
    navigator.clipboard.writeText(HASHTAGS_IG.join(' '));
    window.HAMDY_TOAST('Copied 25 Instagram tags');
  });
  document.getElementById('copy-li').addEventListener('click', () => {
    navigator.clipboard.writeText(HASHTAGS_LI.join(' '));
    window.HAMDY_TOAST('Copied 12 LinkedIn tags');
  });
  document.getElementById('tag-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.hashtag').forEach(el => {
      el.style.display = el.dataset.tag.toLowerCase().includes(q) ? '' : 'none';
    });
  });

  // ---------- Weekly Planner ----------
  const DAYS = ['Mon','Tue','Wed','Thu','Fri'];
  const FORMATS = ['Carousel','Single Post','Story Series','Reel'];
  let plannerState = {};
  let plannerHistory = [];
  try {
    plannerState = JSON.parse(localStorage.getItem('hamdy_planner') || '{}');
    plannerHistory = JSON.parse(localStorage.getItem('hamdy_planner_history') || '[]');
  } catch(e){}

  function plannerDefault(day) {
    return plannerState[day] || { topic:'', format:'Carousel', accent:'AC1' };
  }

  function topicUsedRecently(topicId) {
    return plannerHistory.slice(-4).some(wk =>
      Object.values(wk.week || {}).some(v => v.topic === topicId)
    );
  }

  function renderPlanner() {
    const grid = document.getElementById('planner-grid');
    grid.innerHTML = DAYS.map(d => {
      const st = plannerDefault(d);
      return `
        <div class="day-col" data-day="${d}">
          <div class="day-h"><span>${d}</span><span class="dd">${suggestedFormat(d)}</span></div>
          <div class="label">Topic</div>
          <select class="select" data-pk="topic">
            <option value="">— choose —</option>
            ${TOPICS.map(t => {
              const used = topicUsedRecently(t.id);
              return `<option value="${t.id}" ${st.topic===t.id?'selected':''} ${used?'disabled':''}>${t.id} · ${t.label}${used?' (used)':''}</option>`;
            }).join('')}
          </select>
          <div class="label" style="margin-top:10px">Format</div>
          <select class="select" data-pk="format">
            ${FORMATS.map(f => `<option ${st.format===f?'selected':''}>${f}</option>`).join('')}
          </select>
          <div class="label" style="margin-top:10px">Accent</div>
          <div class="accent-select">
            ${ACCENTS.map(a => `<div class="sw ${st.accent===a.id?'selected':''}" data-pk="accent" data-acc="${a.id}" style="background:${a.hex}" title="${a.name}"></div>`).join('')}
          </div>
          <div class="pillar-line" style="margin-top:10px;font-family:var(--font-supporting);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:var(--color-muted);">${pillarLabel(st.topic)}</div>
          <div class="warn-zone"></div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.day-col').forEach(col => {
      const d = col.dataset.day;
      col.querySelectorAll('[data-pk]').forEach(el => {
        const key = el.dataset.pk;
        if (el.tagName === 'SELECT') {
          el.addEventListener('change', () => {
            plannerState[d] = { ...plannerDefault(d), [key]: el.value };
            saveAndRefreshPlanner();
          });
        } else {
          el.addEventListener('click', () => {
            plannerState[d] = { ...plannerDefault(d), accent: el.dataset.acc };
            saveAndRefreshPlanner();
          });
        }
      });
    });

    // warnings
    const weekAccents = DAYS.map(d => plannerDefault(d).accent);
    const weekPillars = DAYS.map(d => {
      const t = TOPICS.find(x => x.id === plannerDefault(d).topic);
      return t ? t.pillar : '';
    });
    DAYS.forEach((d, i) => {
      const col = grid.querySelector(`[data-day="${d}"]`);
      const zone = col.querySelector('.warn-zone');
      let warns = [];
      if (weekPillars[i] && weekPillars[i-1] === weekPillars[i]) warns.push(`<span class="warn-badge red">⚠ Same pillar as ${DAYS[i-1]}</span>`);
      if (weekPillars[i] && weekPillars[i+1] === weekPillars[i]) warns.push(`<span class="warn-badge red">⚠ Same pillar as ${DAYS[i+1]}</span>`);
      const topicId = plannerDefault(d).topic;
      if (topicId && plannerHistory.slice(-4).some(w => Object.values(w.week||{}).some(v=>v.topic===topicId))) {
        warns.push(`<span class="warn-badge yellow">⚠ Topic used in past 4 weeks</span>`);
      }
      const accentId = plannerDefault(d).accent;
      if (weekAccents.filter(a => a === accentId).length > 1) {
        warns.push(`<span class="warn-badge orange">⚠ Accent repeats this week</span>`);
      }
      zone.innerHTML = warns.join('');
    });
  }
  function suggestedFormat(d) {
    return { Mon:'IG Carousel', Tue:'LI Post', Wed:'IG Post', Thu:'Behind the Sci.', Fri:'YT / LI' }[d];
  }
  function pillarLabel(topicId) {
    if (!topicId) return '—';
    const t = TOPICS.find(x => x.id === topicId);
    if (!t) return '—';
    const p = PILLARS.find(x => x.id === t.pillar);
    return `${t.pillar} · ${p.name}`;
  }
  function saveAndRefreshPlanner() {
    localStorage.setItem('hamdy_planner', JSON.stringify(plannerState));
    renderPlanner();
  }

  function renderPlannerHistory() {
    const host = document.getElementById('planner-history');
    if (!plannerHistory.length) {
      host.innerHTML = `<div style="color:var(--color-muted);font-size:13px;">No weeks saved yet.</div>`;
      return;
    }
    host.innerHTML = plannerHistory.slice(-4).reverse().map((wk, i) => `
      <div style="padding:12px 14px;border-bottom:1px solid var(--color-line);display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-family:var(--font-supporting);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:var(--accent);font-weight:700;">Week ${wk.when}</div>
          <div style="font-size:12px;color:var(--color-muted);margin-top:4px;">${DAYS.map(d => (wk.week[d]?.topic || '—')).join(' · ')}</div>
        </div>
      </div>`).join('');
  }

  document.getElementById('planner-save').addEventListener('click', () => {
    const when = new Date().toISOString().slice(0,10);
    plannerHistory.push({ when, week: JSON.parse(JSON.stringify(plannerState)) });
    plannerHistory = plannerHistory.slice(-12);
    localStorage.setItem('hamdy_planner_history', JSON.stringify(plannerHistory));
    window.HAMDY_TOAST('Week saved');
    renderPlannerHistory();
  });
  document.getElementById('planner-summary').addEventListener('click', () => {
    const host = document.getElementById('planner-summary-out');
    host.innerHTML = `
      <div style="border:1px solid var(--color-line);border-radius:var(--radius-md);padding:20px;background:#0f0f0f;">
        <div class="label">Week summary</div>
        <h3 style="font-family:var(--font-headline);font-size:22px;margin-bottom:14px;">${new Date().toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}</h3>
        ${DAYS.map(d => {
          const s = plannerDefault(d);
          const t = TOPICS.find(x => x.id === s.topic);
          const a = ACCENTS.find(x => x.id === s.accent);
          return `<div style="padding:10px 0;border-bottom:1px solid var(--color-line);display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
            <div><strong>${d}</strong> — ${s.format} · ${t ? (t.id + ' ' + t.label) : '(no topic)'}</div>
            <div style="display:flex;align-items:center;gap:6px;"><span style="width:12px;height:12px;border-radius:50%;background:${a?a.hex:'#333'};display:inline-block;"></span>${a?a.name:''}</div>
          </div>`;
        }).join('')}
      </div>`;
  });
  document.getElementById('planner-md').addEventListener('click', () => {
    let md = `# Mohamed Hamdy — Week plan\n\n`;
    DAYS.forEach(d => {
      const s = plannerDefault(d);
      const t = TOPICS.find(x => x.id === s.topic);
      const a = ACCENTS.find(x => x.id === s.accent);
      md += `## ${d} — ${s.format}\n`;
      md += `- [ ] Topic: ${t ? (t.id + ' ' + t.label) : '(choose)'}\n`;
      md += `- [ ] Accent: ${a?a.name:''} ${a?a.hex:''}\n`;
      md += `- [ ] Draft  - [ ] Design  - [ ] Publish\n\n`;
    });
    const blob = new Blob([md], {type:'text/markdown'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'HAMDY_week_' + new Date().toISOString().slice(0,10) + '.md';
    a.click();
  });
  document.getElementById('planner-json').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(plannerState,null,2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'HAMDY_week.json'; a.click();
  });
  document.getElementById('planner-reset').addEventListener('click', () => {
    plannerState = {};
    localStorage.removeItem('hamdy_planner');
    renderPlanner();
  });

  // ---------- Template gallery ----------
  function renderMini(container, slide, w=1080, h=1080) {
    container.style.background = slide.bg;
    container.style.width = w + 'px';
    container.style.height = h + 'px';
    container.innerHTML = '';
    slide.els.forEach(e => {
      const n = document.createElement('div');
      n.style.position = 'absolute';
      n.style.left = e.x+'px'; n.style.top=e.y+'px';
      n.style.width = e.w+'px'; n.style.height=e.h+'px';
      n.style.opacity = e.opacity||1;
      n.style.transform = `rotate(${e.rotation||0}deg)`;
      if (e.type==='text') {
        n.style.fontFamily=e.fontFamily; n.style.fontSize=e.fontSize+'px';
        n.style.fontWeight=e.fontWeight; n.style.color=e.color;
        n.style.textAlign=e.align||'left'; n.style.lineHeight=e.lineHeight||1.2;
        n.style.letterSpacing=(e.letterSpacing||0)+'px';
        n.style.textTransform=e.uppercase?'uppercase':'none';
        if (e.fontStyle) n.style.fontStyle=e.fontStyle;
        n.textContent = e.content;
      } else if (e.type==='shape') {
        n.style.background = e.hasFill ? e.fill : 'transparent';
        if (e.shape==='circle') n.style.borderRadius='50%';
      }
      container.appendChild(n);
    });
  }

  function renderTemplates() {
    const T = window.HAMDY_TEMPLATES;
    // Carousels
    const c = document.getElementById('tpl-carousels');
    c.innerHTML = T.tplCarousels.map(t => `
      <div class="template-card" data-tpl-type="carousel" data-tpl-id="${t.id}">
        <div class="template-preview"><div class="mini"></div></div>
        <div class="template-info">
          <div class="pillar-tag" style="color:${t.accent};">${t.pillar} · ${t.subtitle}</div>
          <h4>${t.title}</h4>
          <div class="meta">Accent: ${t.accent}</div>
          <div class="btn-row">
            <button class="btn btn-primary" data-tpl-act="use">Use Template</button>
            <button class="btn btn-secondary" data-tpl-act="preview">Preview</button>
          </div>
        </div>
      </div>`).join('');
    T.tplCarousels.forEach(t => {
      const card = c.querySelector(`[data-tpl-id="${t.id}"]`);
      const mini = card.querySelector('.mini');
      renderMini(mini, t.slides[0], 1080, 1080);
    });

    // Posts
    const p = document.getElementById('tpl-posts');
    p.innerHTML = T.tplPosts.map(t => `
      <div class="template-card" data-tpl-type="post" data-tpl-id="${t.id}">
        <div class="template-preview"><div class="mini"></div></div>
        <div class="template-info">
          <div class="pillar-tag" style="color:${t.accent};">${t.pillar} · Single post</div>
          <h4>${t.title}</h4>
          <div class="btn-row">
            <button class="btn btn-primary" data-tpl-act="use">Use Template</button>
            <button class="btn btn-secondary" data-tpl-act="preview">Preview</button>
          </div>
        </div>
      </div>`).join('');
    T.tplPosts.forEach(t => {
      const card = p.querySelector(`[data-tpl-id="${t.id}"]`);
      const mini = card.querySelector('.mini');
      renderMini(mini, t.slide, 1080, 1080);
    });

    // Stories
    const s = document.getElementById('tpl-stories');
    s.innerHTML = T.tplStories.map(t => `
      <div class="template-card" data-tpl-type="story" data-tpl-id="${t.id}">
        <div class="template-preview story"><div class="mini"></div></div>
        <div class="template-info">
          <div class="pillar-tag" style="color:${t.accent};">${t.pillar} · Story series</div>
          <h4>${t.title}</h4>
          <div class="btn-row">
            <button class="btn btn-primary" data-tpl-act="use">Use Template</button>
            <button class="btn btn-secondary" data-tpl-act="preview">Preview</button>
          </div>
        </div>
      </div>`).join('');
    T.tplStories.forEach(t => {
      const card = s.querySelector(`[data-tpl-id="${t.id}"]`);
      const mini = card.querySelector('.mini');
      renderMini(mini, t.frames[0], 1080, 1920);
    });

    // wire buttons
    document.querySelectorAll('.template-card [data-tpl-act]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.template-card');
        const type = card.dataset.tplType;
        const id = card.dataset.tplId;
        const act = btn.dataset.tplAct;
        if (act === 'preview') {
          openLightbox(type, id);
        } else {
          useTemplate(type, id);
        }
      });
    });
  }

  function useTemplate(type, id) {
    const T = window.HAMDY_TEMPLATES;
    if (type === 'carousel') {
      const tpl = T.tplCarousels.find(x => x.id === id);
      if (!editors.carousel) editors.carousel = new window.HAMDY_EDITOR.Editor(document.getElementById('editor-carousel'), { mode:'carousel', canvasW:1080, canvasH:1080, autosaveKey:'hamdy_carousel' });
      // build slides from template
      editors.carousel.slides = tpl.slides.map(s => ({
        id: 's' + Math.random().toString(36).slice(2,8),
        label: s.label, bgType:'solid', bgColor:s.bg,
        bgGradA:'#070707', bgGradB:'#1C1C1C', bgGradAngle:180,
        bgImage:null, bgImgOpacity:1, bgImgFit:'cover', bgImgBlur:0, texture:false,
        elements: JSON.parse(JSON.stringify(s.els))
      }));
      editors.carousel.currentIdx = 0;
      editors.carousel.selectedId = null;
      editors.carousel.snapshot();
      editors.carousel.render();
      // switch tab
      document.querySelector('[data-tab="carousel"]').click();
      // apply accent
      const a = ACCENTS.find(x => x.hex === tpl.accent);
      if (a) setAccent(a);
      window.HAMDY_TOAST('Template loaded');
    } else if (type === 'post') {
      const tpl = T.tplPosts.find(x => x.id === id);
      if (!editors.post) editors.post = new window.HAMDY_EDITOR.Editor(document.getElementById('editor-post'), { mode:'post', canvasW:1080, canvasH:1080, autosaveKey:'hamdy_post' });
      editors.post.slides = [{
        id: 's' + Math.random().toString(36).slice(2,8),
        label: tpl.slide.label, bgType:'solid', bgColor: tpl.slide.bg,
        bgGradA:'#070707', bgGradB:'#1C1C1C', bgGradAngle:180,
        bgImage:null, bgImgOpacity:1, bgImgFit:'cover', bgImgBlur:0, texture:false,
        elements: JSON.parse(JSON.stringify(tpl.slide.els))
      }];
      editors.post.currentIdx = 0;
      editors.post.selectedId = null;
      editors.post.snapshot(); editors.post.render();
      document.querySelector('[data-tab="post"]').click();
      const a = ACCENTS.find(x => x.hex === tpl.accent);
      if (a) setAccent(a);
      window.HAMDY_TOAST('Template loaded');
    } else if (type === 'story') {
      const tpl = T.tplStories.find(x => x.id === id);
      if (!editors.story) editors.story = new window.HAMDY_EDITOR.Editor(document.getElementById('editor-story'), { mode:'story', canvasW:1080, canvasH:1920, autosaveKey:'hamdy_story' });
      editors.story.slides = tpl.frames.map(f => ({
        id: 's' + Math.random().toString(36).slice(2,8),
        label:f.label, bgType:'solid', bgColor:f.bg,
        bgGradA:'#070707', bgGradB:'#1C1C1C', bgGradAngle:180,
        bgImage:null, bgImgOpacity:1, bgImgFit:'cover', bgImgBlur:0, texture:false,
        elements: JSON.parse(JSON.stringify(f.els))
      }));
      editors.story.currentIdx = 0;
      editors.story.selectedId = null;
      editors.story.snapshot(); editors.story.render();
      document.querySelector('[data-tab="story"]').click();
      const a = ACCENTS.find(x => x.hex === tpl.accent);
      if (a) setAccent(a);
      window.HAMDY_TOAST('Template loaded');
    }
  }

  function openLightbox(type, id) {
    const T = window.HAMDY_TEMPLATES;
    let slides;
    let w = 1080, h = 1080;
    if (type === 'carousel') slides = T.tplCarousels.find(x => x.id === id).slides;
    else if (type === 'post') slides = [T.tplPosts.find(x => x.id === id).slide];
    else if (type === 'story') { slides = T.tplStories.find(x => x.id === id).frames; h = 1920; }

    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:500;display:flex;align-items:center;justify-content:center;padding:24px;overflow:auto;';
    backdrop.innerHTML = `<div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;">
      ${slides.map((s, i) => `<div style="width:260px;aspect-ratio:${w}/${h};position:relative;overflow:hidden;border-radius:6px;outline:1px solid rgba(255,255,255,0.1);">
        <div class="mini-box" data-i="${i}" style="position:absolute;inset:0;transform:scale(${260/w});transform-origin:top left;"></div>
      </div>`).join('')}
    </div>
    <button style="position:fixed;top:18px;right:20px;background:var(--color-cream);color:#000;border:none;padding:10px 16px;font-family:var(--font-supporting);font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-size:11px;cursor:pointer;border-radius:2px;">Close</button>`;
    document.body.appendChild(backdrop);
    slides.forEach((s, i) => {
      const m = backdrop.querySelector(`.mini-box[data-i="${i}"]`);
      renderMini(m, s, w, h);
    });
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop || e.target.tagName === 'BUTTON') backdrop.remove(); });
  }

  // ---------- Init ----------
  renderTopbarLogo();
  renderSwatches();
  renderVoice();
  renderTypeSamples();
  renderPillarTable();
  renderScheduleTable();
  renderLogosDashboard();
  renderAccentPicker();
  renderTags();
  renderPlanner();
  renderPlannerHistory();
  renderTemplates();
  // Apply restored accent
  setAccent(currentAccent);
})();
