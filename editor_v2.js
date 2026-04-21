// HAMDY Editor v2 — Crextio style
// Canvas with drag/resize/rotate elements; text, shapes (12 kinds), emoji, image
// Zoom fit + slider 25-400%, multi-slide rail

(function(){
  const uid = () => 'e' + Math.random().toString(36).slice(2,9);
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

  const SHAPES = [
    {k:'rect', label:'▭'}, {k:'circle', label:'●'}, {k:'triangle', label:'▲'},
    {k:'diamond', label:'◆'}, {k:'star', label:'★'}, {k:'ring', label:'○'},
    {k:'line-h', label:'—'}, {k:'line-v', label:'│'}, {k:'arrow', label:'→'},
    {k:'pill', label:'▰'}, {k:'chevron', label:'❯'}, {k:'burst', label:'✦'}
  ];
  const EMOJIS = ['🔥','🌡️','🏙️','🏗️','🌳','☀️','💧','⚡','📊','📈','📍','🧊','🌍','🌿','🧱','🏠','🔬','💡','⚠️','✅','❌','❓','💬','📌'];
  const FONTS = [
    "'Space Grotesk', sans-serif",
    "'Inter', sans-serif",
    "'Roboto Condensed', sans-serif",
    "Georgia, serif",
    "'Courier New', monospace"
  ];
  const COLORS_FG = ['#151515','#FFFFFF','#F5F2EA','#FFD84D','#EB5A2A','#2D5016','#1B3A6B','#C0522A','#F5B59A','#4A5568','#E2C9A8','#7FA250','#8A8781','#9CA3AF','#070707','#FFE480'];

  function defaultText(o){
    return { id:uid(), type:'text', x:o.x||80, y:o.y||80, w:o.w||800, h:o.h||100, rotation:0, zIndex:1,
      content:o.content||'Your text', fontFamily:o.fontFamily||FONTS[0], fontSize:o.fontSize||48,
      fontWeight:o.fontWeight||700, color:o.color||'#151515', align:o.align||'left',
      lineHeight:o.lineHeight||1.2, letterSpacing:o.letterSpacing||0,
      uppercase:o.uppercase||false, fontStyle:o.fontStyle||'normal', opacity:o.opacity||1 };
  }
  function defaultShape(kind, o){
    return { id:uid(), type:'shape', shape:kind, x:o.x||100,y:o.y||100,w:o.w||200,h:o.h||200,
      rotation:0,zIndex:1,fill:o.fill||'#FFD84D',hasFill:true,stroke:'#151515',strokeW:0,
      opacity:o.opacity||1 };
  }
  function defaultImage(src, o){
    o = o || {};
    return { id:uid(), type:'image', src, x:o.x||100,y:o.y||100,w:o.w||400,h:o.h||400,
      rotation:0,zIndex:1,opacity:1,fit:'cover' };
  }
  function defaultEmoji(em, o){
    o = o || {};
    return { id:uid(), type:'text', x:o.x||200,y:o.y||200,w:o.w||200,h:o.h||200, rotation:0, zIndex:1,
      content:em, fontFamily:"'Apple Color Emoji','Segoe UI Emoji',sans-serif", fontSize:120,
      fontWeight:400, color:'#151515', align:'center', lineHeight:1, letterSpacing:0,
      uppercase:false, fontStyle:'normal', opacity:1, isEmoji:true };
  }

  function blankSlide(mode){
    return {
      id:'s'+uid(),
      label:'Slide',
      bgType:'solid',
      bgColor: '#151515',
      elements: [
        defaultText({ x:80, y:mode==='story'?420:360, w:920, h:260,
          content:'Your headline here.',
          fontSize: mode==='story'?92:72,
          color:'#F5F2EA'
        })
      ]
    };
  }

  class Editor {
    constructor(host, opts){
      this.host = host;
      this.mode = opts.mode; // carousel | post | story
      this.W = opts.canvasW;
      this.H = opts.canvasH;
      this.autosaveKey = opts.autosaveKey;
      this.slides = [];
      this.idx = 0;
      this.selectedId = null;
      this.zoom = 1;
      this.fitMode = true;
      this._restore();
      this._build();
      this.render();
      setTimeout(()=>this.fitZoom(), 80);
      window.addEventListener('resize', () => { if (this.fitMode) this.fitZoom(); });
    }
    _restore(){
      try {
        const raw = localStorage.getItem(this.autosaveKey);
        if (raw) {
          const d = JSON.parse(raw);
          if (d.slides && d.slides.length) { this.slides = d.slides; return; }
        }
      } catch(e){}
      this.slides = [blankSlide(this.mode)];
    }
    _persist(){
      try { localStorage.setItem(this.autosaveKey, JSON.stringify({slides:this.slides})); } catch(e){}
    }
    _build(){
      this.host.innerHTML = `
        <aside class="left-panel">
          <div class="left-section">
            <h4>Add element</h4>
            <div class="tool-grid">
              <button class="tool-tile" data-add="text" title="Text"><span>T</span></button>
              <button class="tool-tile" data-add="headline" title="Headline"><span>H</span></button>
              <button class="tool-tile" data-add="image" title="Image">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
              </button>
              <button class="tool-tile" data-add="logo" title="Logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
              </button>
            </div>
          </div>

          <div class="left-section">
            <h4>Shapes</h4>
            <div class="tool-grid">
              ${SHAPES.map(s => `<button class="tool-tile" data-add-shape="${s.k}" title="${s.k}"><span>${s.label}</span></button>`).join('')}
            </div>
          </div>

          <div class="left-section">
            <h4>Emoji</h4>
            <div class="emoji-grid">
              ${EMOJIS.map(e => `<button class="emoji-tile" data-add-emoji="${e}">${e}</button>`).join('')}
            </div>
          </div>

          <div class="left-section">
            <h4>Slide background</h4>
            <div class="field">
              <label>Color</label>
              <div class="color-row" id="bg-colors"></div>
              <input type="color" id="bg-custom" style="margin-top:4px"/>
            </div>
            <div class="field">
              <label>Image</label>
              <input type="file" id="bg-image" accept="image/*"/>
            </div>
          </div>

          <div class="left-section">
            <h4>Brand Smart Elements</h4>
            <div class="smart-grid">
              <button class="smart-btn" data-smart="brand-logo">＋ Brand Logo</button>
              <button class="smart-btn" data-smart="slide-counter">＋ Slide Counter</button>
              <button class="smart-btn" data-smart="accent-bar">＋ Accent Bar</button>
              <button class="smart-btn" data-smart="swipe">＋ Swipe →</button>
              <button class="smart-btn" data-smart="source">＋ Source Box</button>
              <button class="smart-btn" data-smart="progress">＋ Progress Dots</button>
              <button class="smart-btn" data-smart="hamdy-mark">＋ HAMDY Mark</button>
              <button class="smart-btn" data-smart="hero-word">＋ Hero Word</button>
              <button class="smart-btn" data-smart="stat">＋ Stat Number</button>
              <button class="smart-btn" data-smart="caption">＋ Caption</button>
            </div>
            <div class="hint">Tip: Click an element to edit it, or drag an image onto the canvas.</div>
          </div>

          <div class="left-section">
            <h4>Slide</h4>
            <button class="btn" id="slide-dup" style="width:100%;margin-bottom:6px">Duplicate slide</button>
            <button class="btn" id="slide-del" style="width:100%">Delete slide</button>
          </div>

          <div class="left-section">
            <h4>Export</h4>
            <div class="export-grid">
              <button class="btn" data-exp="png">Export PNG</button>
              <button class="btn" data-exp="all-png">Export All PNG</button>
              <button class="btn" data-exp="pdf">Print PDF</button>
              <button class="btn" data-exp="save">Save Project</button>
              <button class="btn" data-exp="load">Load Project</button>
              <button class="btn" data-exp="copy-captions">Copy Captions</button>
            </div>
          </div>
        </aside>

        <div class="stage">
          <div class="stage-bar">
            <div class="group">
              <button class="tool-btn" id="undo-btn" title="Undo">↶</button>
              <button class="tool-btn" id="redo-btn" title="Redo">↷</button>
            </div>
            <div class="group" title="Align">
              <button class="tool-btn" data-align="left" title="Align left">⇤</button>
              <button class="tool-btn" data-align="cx" title="Center horizontally">↔</button>
              <button class="tool-btn" data-align="right" title="Align right">⇥</button>
              <button class="tool-btn" data-align="top" title="Align top">⇧</button>
              <button class="tool-btn" data-align="cy" title="Center vertically">↕</button>
              <button class="tool-btn" data-align="bottom" title="Align bottom">⇩</button>
            </div>
            <div class="group" title="Layer">
              <button class="tool-btn" data-layer="front" title="Bring front">Front</button>
              <button class="tool-btn" data-layer="up" title="Up">Up</button>
              <button class="tool-btn" data-layer="down" title="Down">Down</button>
              <button class="tool-btn" data-layer="back" title="Back">Back</button>
            </div>
            <div class="group">
              <button class="tool-btn" id="el-dup" title="Duplicate">Duplicate</button>
              <button class="tool-btn" id="el-delete" title="Delete">Delete</button>
              <button class="tool-btn" id="el-lock" title="Lock">Lock</button>
              <button class="tool-btn" id="el-hide" title="Hide">Hide</button>
            </div>
            <div class="zoom">
              <button class="tool-btn" id="zoom-fit" title="Fit">⛶</button>
              <button class="tool-btn" id="zoom-out">−</button>
              <input type="range" id="zoom-range" min="25" max="400" step="5" value="50"/>
              <button class="tool-btn" id="zoom-in">+</button>
              <span class="zoom-v" id="zoom-v">50%</span>
            </div>
          </div>
          <div class="canvas-wrap" id="canvas-wrap">
            <div class="canvas-scroll">
              <div class="canvas" id="canvas"></div>
            </div>
          </div>
          <div class="thumb-rail" id="thumb-rail"></div>
        </div>

        <aside class="right-panel" id="right-panel">
          <div id="inspect-empty" style="color:var(--muted);font-size:13px;padding:20px 0;text-align:center">
            Select an element to edit it.
          </div>
          <div id="inspect" class="hidden"></div>
        </aside>
      `;

      // Add element handlers
      this.host.querySelectorAll('[data-add]').forEach(b => {
        b.addEventListener('click', ()=>{
          const t = b.dataset.add;
          if (t==='text') this._add(defaultText({x:200,y:200,w:600,h:80,content:'New text',fontSize:36,fontWeight:500,color:'#F5F2EA'}));
          else if (t==='headline') this._add(defaultText({x:80,y:300,w:920,h:300,content:'HEADLINE',fontSize:96,color:'#F5F2EA',uppercase:true}));
          else if (t==='image') this._uploadImage();
          else if (t==='logo') this._insertLogo();
        });
      });
      this.host.querySelectorAll('[data-add-shape]').forEach(b => {
        b.addEventListener('click', ()=> this._add(defaultShape(b.dataset.addShape, {x:300,y:300})));
      });
      this.host.querySelectorAll('[data-add-emoji]').forEach(b => {
        b.addEventListener('click', ()=> this._add(defaultEmoji(b.dataset.addEmoji, {x:300,y:300})));
      });

      // BG colors
      const bgColors = this.host.querySelector('#bg-colors');
      COLORS_FG.forEach(c => {
        const d = document.createElement('div');
        d.className='color-dot'; d.style.background=c; d.dataset.c=c;
        d.addEventListener('click', ()=>{ this.slide().bgColor=c; this.render(); this._persist(); });
        bgColors.appendChild(d);
      });
      this.host.querySelector('#bg-custom').addEventListener('input', e => { this.slide().bgColor=e.target.value; this.render(); this._persist(); });
      this.host.querySelector('#bg-image').addEventListener('change', e => {
        const f = e.target.files[0]; if(!f) return;
        const r = new FileReader();
        r.onload = ev => { this.slide().bgImage = ev.target.result; this.render(); this._persist(); };
        r.readAsDataURL(f);
      });

      // Slide ops
      this.host.querySelector('#slide-dup').addEventListener('click', ()=>{
        const copy = JSON.parse(JSON.stringify(this.slide()));
        copy.id='s'+uid(); copy.elements.forEach(e=> e.id=uid());
        this.slides.splice(this.idx+1,0,copy); this.idx++; this.render(); this._persist();
      });
      this.host.querySelector('#slide-del').addEventListener('click', ()=>{
        if (this.slides.length===1){ this.slides=[blankSlide(this.mode)]; this.idx=0; }
        else { this.slides.splice(this.idx,1); this.idx=Math.min(this.idx,this.slides.length-1); }
        this.render(); this._persist();
      });

      // Top bar ops
      this.host.querySelector('#el-delete').addEventListener('click', ()=>{
        if (!this.selectedId) return;
        this.slide().elements = this.slide().elements.filter(e=>e.id!==this.selectedId);
        this.selectedId=null; this.render(); this._persist();
      });
      this.host.querySelector('#el-dup').addEventListener('click', ()=>{
        const el = this._sel(); if(!el) return;
        const copy = JSON.parse(JSON.stringify(el));
        copy.id=uid(); copy.x+=20; copy.y+=20;
        this.slide().elements.push(copy); this.selectedId=copy.id; this.render(); this._persist();
      });
      this.host.querySelector('#el-lock').addEventListener('click', ()=>{
        const el=this._sel(); if(!el) return;
        el.locked = !el.locked; this.render(); this._persist();
      });
      this.host.querySelector('#el-hide').addEventListener('click', ()=>{
        const el=this._sel(); if(!el) return;
        el.hidden = !el.hidden; this.render(); this._persist();
      });

      // Layer controls
      this.host.querySelectorAll('[data-layer]').forEach(b => {
        b.addEventListener('click', ()=>{
          const el=this._sel(); if(!el) return;
          const zs = this.slide().elements.map(e=>e.zIndex||1);
          const op = b.dataset.layer;
          if (op==='front') el.zIndex = Math.max(...zs)+1;
          else if (op==='back') el.zIndex = Math.min(...zs)-1;
          else if (op==='up') el.zIndex = (el.zIndex||1)+1;
          else if (op==='down') el.zIndex = (el.zIndex||1)-1;
          this.render(); this._persist();
        });
      });

      // Align controls (within canvas)
      this.host.querySelectorAll('[data-align]').forEach(b => {
        b.addEventListener('click', ()=>{
          const el=this._sel(); if(!el) return;
          const a = b.dataset.align;
          if (a==='left') el.x = 0;
          else if (a==='right') el.x = this.W - el.w;
          else if (a==='cx') el.x = (this.W - el.w)/2;
          else if (a==='top') el.y = 0;
          else if (a==='bottom') el.y = this.H - el.h;
          else if (a==='cy') el.y = (this.H - el.h)/2;
          this.render(); this._snapshot(); this._persist();
        });
      });

      // Smart Elements
      this.host.querySelectorAll('[data-smart]').forEach(b => {
        b.addEventListener('click', ()=> this._insertSmart(b.dataset.smart));
      });

      // Export panel (delegate to window.HAMDY_EXPORT if present; fallback minimal)
      this.host.querySelectorAll('[data-exp]').forEach(b => {
        b.addEventListener('click', ()=>{
          const act = b.dataset.exp;
          if (window.HAMDY_EXPORT && window.HAMDY_EXPORT[act]) window.HAMDY_EXPORT[act](this);
          else if (window.HAMDY_APP && window.HAMDY_APP.editorExport) window.HAMDY_APP.editorExport(act, this);
          else console.warn('export not wired:', act);
        });
      });

      // Zoom
      const zRange = this.host.querySelector('#zoom-range');
      zRange.addEventListener('input', ()=>{ this.fitMode=false; this.zoom = zRange.value/100; this._applyZoom(); });
      this.host.querySelector('#zoom-in').addEventListener('click', ()=>{ this.fitMode=false; this.zoom=clamp(this.zoom+0.1,0.25,4); zRange.value=Math.round(this.zoom*100); this._applyZoom(); });
      this.host.querySelector('#zoom-out').addEventListener('click', ()=>{ this.fitMode=false; this.zoom=clamp(this.zoom-0.1,0.25,4); zRange.value=Math.round(this.zoom*100); this._applyZoom(); });
      this.host.querySelector('#zoom-fit').addEventListener('click', ()=>{ this.fitMode=true; this.fitZoom(); });

      // Undo/Redo — simple
      this.history=[]; this.historyPos=-1;
      this._snapshot();
      this.host.querySelector('#undo-btn').addEventListener('click', ()=>this._undo());
      this.host.querySelector('#redo-btn').addEventListener('click', ()=>this._redo());

      // Deselect on empty canvas click
      const wrap = this.host.querySelector('#canvas-wrap');
      wrap.addEventListener('mousedown', e => {
        if (e.target === wrap || e.target.classList.contains('canvas-scroll') || e.target.id==='canvas') {
          this.selectedId=null; this.render();
        }
      });
    }

    _snapshot(){
      this.history = this.history.slice(0,this.historyPos+1);
      this.history.push(JSON.stringify(this.slides));
      if (this.history.length>50) this.history.shift();
      this.historyPos = this.history.length-1;
    }
    _undo(){ if (this.historyPos>0){ this.historyPos--; this.slides = JSON.parse(this.history[this.historyPos]); this.selectedId=null; this.render(); this._persist(); } }
    _redo(){ if (this.historyPos<this.history.length-1){ this.historyPos++; this.slides=JSON.parse(this.history[this.historyPos]); this.selectedId=null; this.render(); this._persist(); } }

    slide(){ return this.slides[this.idx]; }
    _sel(){ return this.slide().elements.find(e=>e.id===this.selectedId); }

    _add(el){
      this.slide().elements.push(el);
      const max = Math.max(0,...this.slide().elements.map(e=>e.zIndex||1));
      el.zIndex = max+1;
      this.selectedId = el.id;
      this.render(); this._snapshot(); this._persist();
    }
    _uploadImage(){
      const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*';
      inp.onchange = e => {
        const f = e.target.files[0]; if(!f) return;
        const r = new FileReader();
        r.onload = ev => {
          const img = new Image();
          img.onload = () => {
            const maxW = this.W*0.5;
            const scale = Math.min(1, maxW/img.width);
            this._add(defaultImage(ev.target.result, { x:200, y:200, w:img.width*scale, h:img.height*scale }));
          };
          img.src = ev.target.result;
        };
        r.readAsDataURL(f);
      };
      inp.click();
    }
    _insertLogo(){
      const src = window.HAMDY_STATE && window.HAMDY_STATE.logoSrc;
      if (src) this._add(defaultImage(src, {x:100,y:100,w:200,h:200}));
      else {
        // insert SVG logo as text
        const letter = (window.HAMDY_STATE && window.HAMDY_STATE.logoLetter) || 'H';
        this._add(defaultText({x:80,y:80,w:200,h:200,content:letter,fontSize:160,fontWeight:800,color:getComputedStyle(document.documentElement).getPropertyValue('--brand')||'#EB5A2A'}));
      }
    }

    _insertSmart(kind){
      const W = this.W, H = this.H;
      const brand = (getComputedStyle(document.documentElement).getPropertyValue('--brand') || '#EB5A2A').trim();
      const accent = (window.HAMDY_STATE && window.HAMDY_STATE.currentAccent) || brand;
      const total = this.slides.length;
      const i = this.idx + 1;
      if (kind==='brand-logo') { this._insertLogo(); return; }
      if (kind==='slide-counter') {
        this._add(defaultText({
          x:W-260, y:H-120, w:200, h:60,
          content: String(i).padStart(2,'0')+' / '+String(total).padStart(2,'0'),
          fontSize:32, fontWeight:600, color:'#F5F2EA', align:'right',
          fontFamily:"'Roboto Condensed', sans-serif"
        }));
        return;
      }
      if (kind==='accent-bar') {
        this._add(defaultShape('rect', {x:80, y:H-80, w:200, h:8, fill:accent}));
        return;
      }
      if (kind==='swipe') {
        const pill = defaultShape('pill', {x:W-340, y:H-140, w:260, h:80, fill:accent});
        const txt = defaultText({x:W-340, y:H-140, w:260, h:80, content:'SWIPE →', fontSize:32, fontWeight:700, color:'#151515', align:'center', uppercase:true});
        this._add(pill); this._add(txt);
        return;
      }
      if (kind==='source') {
        const box = defaultShape('rect', {x:80, y:H-120, w:480, h:60, fill:'rgba(0,0,0,0.6)'});
        const txt = defaultText({x:100, y:H-120, w:440, h:60, content:'Source: UKHSA, 2024', fontSize:22, fontWeight:500, color:'#F5F2EA', align:'left'});
        this._add(box); this._add(txt);
        return;
      }
      if (kind==='progress') {
        // build dot row as a single SVG shape-like text block using circles as separate shapes
        const count = Math.min(10, Math.max(2, total));
        const dotW = 20, gap = 14;
        const totalW = count*dotW + (count-1)*gap;
        const startX = (W-totalW)/2;
        for (let n=0; n<count; n++){
          this._add(defaultShape('circle', {
            x: startX + n*(dotW+gap), y: H-80, w: dotW, h: dotW,
            fill: n===this.idx ? accent : '#F5F2EA'
          }));
        }
        return;
      }
      if (kind==='hamdy-mark') {
        this._add(defaultText({
          x:80, y:80, w:400, h:80, content:'MOHAMED HAMDY',
          fontSize:28, fontWeight:800, color:'#F5F2EA',
          fontFamily:"'Space Grotesk', sans-serif", uppercase:true, letterSpacing:3
        }));
        return;
      }
      if (kind==='hero-word') {
        this._add(defaultText({
          x:60, y:H*0.35, w:W-120, h:300, content:'HEAT.',
          fontSize:320, fontWeight:800, color:'#F5F2EA', align:'left',
          fontFamily:"'Space Grotesk', sans-serif", uppercase:true, letterSpacing:-8, lineHeight:0.9
        }));
        return;
      }
      if (kind==='stat') {
        this._add(defaultText({
          x:80, y:H*0.3, w:W-160, h:300, content:'72%',
          fontSize:360, fontWeight:800, color:accent, align:'left',
          fontFamily:"'Space Grotesk', sans-serif", lineHeight:0.9, letterSpacing:-10
        }));
        return;
      }
      if (kind==='caption') {
        this._add(defaultText({
          x:80, y:H-180, w:W-160, h:60, content:'A note or context line.',
          fontSize:26, fontWeight:500, color:'#F5F2EA', align:'left',
          fontFamily:"'Inter', sans-serif", fontStyle:'italic'
        }));
        return;
      }
    }

    fitZoom(){
      const wrap = this.host.querySelector('#canvas-wrap');
      if (!wrap) return;
      const pad = 80;
      const w = wrap.clientWidth - pad;
      const h = wrap.clientHeight - pad;
      if (w<=0||h<=0) return;
      this.zoom = Math.min(w/this.W, h/this.H);
      this.zoom = clamp(this.zoom, 0.25, 4);
      this.host.querySelector('#zoom-range').value = Math.round(this.zoom*100);
      this._applyZoom();
    }
    _applyZoom(){
      const c = this.host.querySelector('#canvas');
      if (!c) return;
      c.style.width = this.W+'px';
      c.style.height = this.H+'px';
      c.style.transform = `scale(${this.zoom})`;
      this.host.querySelector('#zoom-v').textContent = Math.round(this.zoom*100)+'%';
    }

    render(){
      this._renderCanvas();
      this._renderThumbs();
      this._renderInspector();
      this._applyZoom();
    }
    _renderCanvas(){
      const c = this.host.querySelector('#canvas');
      if (!c) return;
      const s = this.slide();
      c.style.background = s.bgImage ? `#000 url(${s.bgImage}) center/cover no-repeat` : s.bgColor;
      c.innerHTML = '';
      const sorted = [...s.elements].sort((a,b)=>(a.zIndex||1)-(b.zIndex||1));
      sorted.forEach(e => { if (!e.hidden) this._renderEl(c, e); });
    }
    _renderEl(c, e){
      const n = document.createElement('div');
      n.className='elem' + (e.id===this.selectedId?' selected':'');
      n.dataset.id = e.id;
      n.style.left=e.x+'px'; n.style.top=e.y+'px';
      n.style.width=e.w+'px'; n.style.height=e.h+'px';
      n.style.transform = `rotate(${e.rotation||0}deg)`;
      n.style.opacity = e.opacity!=null?e.opacity:1;
      n.style.zIndex = e.zIndex||1;

      if (e.type==='text'){
        const t = document.createElement('div');
        t.className='text-el'; t.style.width='100%'; t.style.height='100%';
        t.style.fontFamily=e.fontFamily; t.style.fontSize=e.fontSize+'px';
        t.style.fontWeight=e.fontWeight; t.style.color=e.color;
        t.style.textAlign=e.align; t.style.lineHeight=e.lineHeight;
        t.style.letterSpacing=e.letterSpacing+'px';
        t.style.textTransform=e.uppercase?'uppercase':'none';
        t.style.fontStyle=e.fontStyle||'normal';
        t.style.display='flex';
        t.style.alignItems='center';
        t.style.justifyContent = e.align==='center'?'center': (e.align==='right'?'flex-end':'flex-start');
        t.textContent = e.content;
        t.addEventListener('dblclick', ev => {
          ev.stopPropagation();
          t.contentEditable=true; t.focus();
          const range = document.createRange(); range.selectNodeContents(t);
          const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
          t.addEventListener('blur', ()=>{ e.content = t.textContent; t.contentEditable=false; this.render(); this._snapshot(); this._persist(); }, {once:true});
        });
        n.appendChild(t);
      } else if (e.type==='shape'){
        n.appendChild(this._shapeSVG(e));
      } else if (e.type==='image'){
        const i = document.createElement('img');
        i.className='image-el'; i.src=e.src; i.style.objectFit=e.fit||'cover';
        n.appendChild(i);
      }

      if (e.id===this.selectedId){
        ['nw','n','ne','e','se','s','sw','w'].forEach(p => {
          const h = document.createElement('div'); h.className='handle '+p; h.dataset.h=p;
          n.appendChild(h);
        });
        const rot = document.createElement('div'); rot.className='rot'; rot.dataset.rot='1';
        n.appendChild(rot);
      }

      this._bindDrag(n, e);
      c.appendChild(n);
    }
    _shapeSVG(e){
      const s = document.createElement('div');
      s.className='shape-el';
      const fill = e.hasFill?e.fill:'none';
      const stroke = e.strokeW>0?`stroke:${e.stroke};stroke-width:${e.strokeW}px;`:'';
      let svg='';
      if (e.shape==='rect') svg=`<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><rect width="100" height="100" fill="${fill}" style="${stroke}"/></svg>`;
      else if (e.shape==='circle') svg=`<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><ellipse cx="50" cy="50" rx="50" ry="50" fill="${fill}" style="${stroke}"/></svg>`;
      else if (e.shape==='ring') svg=`<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><ellipse cx="50" cy="50" rx="48" ry="48" fill="none" stroke="${e.fill}" stroke-width="6"/></svg>`;
      else if (e.shape==='triangle') svg=`<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><polygon points="50,5 95,95 5,95" fill="${fill}" style="${stroke}"/></svg>`;
      else if (e.shape==='diamond') svg=`<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><polygon points="50,5 95,50 50,95 5,50" fill="${fill}" style="${stroke}"/></svg>`;
      else if (e.shape==='star') svg=`<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><polygon points="50,5 61,38 96,38 68,59 79,92 50,72 21,92 32,59 4,38 39,38" fill="${fill}"/></svg>`;
      else if (e.shape==='line-h') svg=`<svg viewBox="0 0 100 10" preserveAspectRatio="none" width="100%" height="100%"><rect y="3" width="100" height="4" fill="${e.fill}"/></svg>`;
      else if (e.shape==='line-v') svg=`<svg viewBox="0 0 10 100" preserveAspectRatio="none" width="100%" height="100%"><rect x="3" width="4" height="100" fill="${e.fill}"/></svg>`;
      else if (e.shape==='arrow') svg=`<svg viewBox="0 0 100 40" preserveAspectRatio="none" width="100%" height="100%"><path d="M0,20 L80,20 M70,5 L85,20 L70,35" stroke="${e.fill}" stroke-width="5" fill="none" stroke-linejoin="round"/></svg>`;
      else if (e.shape==='pill') svg=`<svg viewBox="0 0 100 40" preserveAspectRatio="none" width="100%" height="100%"><rect rx="20" ry="20" width="100" height="40" fill="${fill}"/></svg>`;
      else if (e.shape==='chevron') svg=`<svg viewBox="0 0 60 100" preserveAspectRatio="none" width="100%" height="100%"><path d="M10,10 L50,50 L10,90" stroke="${e.fill}" stroke-width="10" fill="none" stroke-linejoin="round"/></svg>`;
      else if (e.shape==='burst') svg=`<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><polygon points="50,2 55,35 85,20 65,50 98,55 65,65 80,90 55,70 50,98 45,70 20,90 35,65 2,55 35,50 15,20 45,35" fill="${fill}"/></svg>`;
      s.innerHTML=svg;
      return s;
    }

    _bindDrag(n, e){
      n.addEventListener('mousedown', ev => {
        if (ev.target.classList.contains('handle')) { this._startResize(ev, e, ev.target.dataset.h); return; }
        if (ev.target.dataset.rot) { this._startRotate(ev, e); return; }
        if (ev.target.contentEditable === 'true') return;
        ev.stopPropagation();
        this.selectedId = e.id;
        this.render();
        this._startMove(ev, e);
      });
      n.addEventListener('touchstart', ev => {
        const t = ev.touches[0];
        if (t.target.classList.contains('handle')) { this._startResize({clientX:t.clientX,clientY:t.clientY,preventDefault:()=>{}}, e, t.target.dataset.h, true); return; }
        this.selectedId = e.id; this.render();
        this._startMove({clientX:t.clientX,clientY:t.clientY,preventDefault:()=>{}}, e, true);
      }, {passive:true});
    }
    _startMove(ev, e, touch){
      const sx = ev.clientX, sy = ev.clientY;
      const ox = e.x, oy = e.y, z = this.zoom;
      const move = (m) => {
        const mx = touch?m.touches[0].clientX:m.clientX;
        const my = touch?m.touches[0].clientY:m.clientY;
        e.x = ox + (mx-sx)/z;
        e.y = oy + (my-sy)/z;
        this._updateElNode(e);
      };
      const up = () => {
        window.removeEventListener(touch?'touchmove':'mousemove', move);
        window.removeEventListener(touch?'touchend':'mouseup', up);
        this._snapshot(); this._persist(); this._renderInspector();
      };
      window.addEventListener(touch?'touchmove':'mousemove', move);
      window.addEventListener(touch?'touchend':'mouseup', up);
    }
    _startResize(ev, e, dir, touch){
      ev.preventDefault && ev.preventDefault();
      const sx = ev.clientX, sy = ev.clientY;
      const ox = e.x, oy = e.y, ow = e.w, oh = e.h, z = this.zoom;
      const move = m => {
        const mx = touch?m.touches[0].clientX:m.clientX;
        const my = touch?m.touches[0].clientY:m.clientY;
        const dx = (mx-sx)/z, dy = (my-sy)/z;
        let nx=ox, ny=oy, nw=ow, nh=oh;
        if (dir.includes('e')) nw = Math.max(20, ow+dx);
        if (dir.includes('s')) nh = Math.max(20, oh+dy);
        if (dir.includes('w')) { nw = Math.max(20, ow-dx); nx = ox+(ow-nw); }
        if (dir.includes('n')) { nh = Math.max(20, oh-dy); ny = oy+(oh-nh); }
        e.x=nx; e.y=ny; e.w=nw; e.h=nh;
        this._updateElNode(e);
      };
      const up = () => {
        window.removeEventListener(touch?'touchmove':'mousemove', move);
        window.removeEventListener(touch?'touchend':'mouseup', up);
        this._snapshot(); this._persist(); this._renderInspector();
      };
      window.addEventListener(touch?'touchmove':'mousemove', move);
      window.addEventListener(touch?'touchend':'mouseup', up);
    }
    _startRotate(ev, e){
      ev.preventDefault();
      const n = this.host.querySelector(`.elem[data-id="${e.id}"]`);
      const r = n.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const move = m => {
        const a = Math.atan2(m.clientY-cy, m.clientX-cx)*180/Math.PI + 90;
        e.rotation = Math.round(a);
        this._updateElNode(e);
      };
      const up = () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
        this._snapshot(); this._persist(); this._renderInspector();
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    }
    _updateElNode(e){
      const n = this.host.querySelector(`.elem[data-id="${e.id}"]`);
      if (!n) return;
      n.style.left=e.x+'px'; n.style.top=e.y+'px';
      n.style.width=e.w+'px'; n.style.height=e.h+'px';
      n.style.transform=`rotate(${e.rotation||0}deg)`;
    }

    _renderThumbs(){
      const rail = this.host.querySelector('#thumb-rail');
      rail.innerHTML='';
      this.slides.forEach((s,i) => {
        const t = document.createElement('div');
        t.className='thumb'+(this.mode==='story'?' story':'')+(i===this.idx?' active':'');
        t.innerHTML = `<div class="mini"></div><div class="n">${i+1}</div>`;
        const mini = t.querySelector('.mini');
        mini.style.width=this.W+'px'; mini.style.height=this.H+'px';
        mini.style.background = s.bgImage?`#000 url(${s.bgImage}) center/cover`:s.bgColor;
        s.elements.forEach(e => {
          const n = document.createElement('div');
          n.style.position='absolute';n.style.left=e.x+'px';n.style.top=e.y+'px';
          n.style.width=e.w+'px';n.style.height=e.h+'px';
          n.style.transform=`rotate(${e.rotation||0}deg)`;n.style.opacity=e.opacity||1;
          if (e.type==='text'){
            n.style.fontFamily=e.fontFamily;n.style.fontSize=e.fontSize+'px';
            n.style.fontWeight=e.fontWeight;n.style.color=e.color;n.style.textAlign=e.align;
            n.style.lineHeight=e.lineHeight;n.style.letterSpacing=e.letterSpacing+'px';
            n.style.textTransform=e.uppercase?'uppercase':'none';
            n.textContent=e.content;
          } else if (e.type==='shape'){ n.innerHTML = this._shapeSVG(e).innerHTML; }
          else if (e.type==='image'){ n.style.background=`url(${e.src}) center/${e.fit||'cover'}`; }
          mini.appendChild(n);
        });
        const scale = this.mode==='story' ? 48/this.W : 78/this.W;
        mini.style.transform=`scale(${scale})`; mini.style.transformOrigin='top left';
        t.addEventListener('click', ()=>{ this.idx=i; this.selectedId=null; this.render(); });
        rail.appendChild(t);
      });
      const add = document.createElement('div');
      add.className='thumb-add'+(this.mode==='story'?' story':''); add.textContent='+';
      add.addEventListener('click', ()=>{
        this.slides.push(blankSlide(this.mode));
        this.idx = this.slides.length-1;
        this.render(); this._snapshot(); this._persist();
      });
      rail.appendChild(add);
    }

    _renderInspector(){
      const empty = this.host.querySelector('#inspect-empty');
      const ins = this.host.querySelector('#inspect');
      const el = this._sel();
      if (!el) { empty.classList.remove('hidden'); ins.classList.add('hidden'); return; }
      empty.classList.add('hidden'); ins.classList.remove('hidden');

      let html = `<div class="kicker">${el.type==='text'?'Text':el.type==='shape'?('Shape · '+el.shape):el.type==='image'?'Image':''}</div>`;
      html += `<div class="field"><label>Position</label><div class="hstack">
        <input type="number" value="${Math.round(el.x)}" data-k="x" style="width:50%"/>
        <input type="number" value="${Math.round(el.y)}" data-k="y" style="width:50%"/>
      </div></div>`;
      html += `<div class="field"><label>Size</label><div class="hstack">
        <input type="number" value="${Math.round(el.w)}" data-k="w" style="width:50%"/>
        <input type="number" value="${Math.round(el.h)}" data-k="h" style="width:50%"/>
      </div></div>`;
      html += `<div class="field"><label>Rotation · ${el.rotation||0}°</label>
        <input type="range" min="-180" max="180" value="${el.rotation||0}" data-k="rotation"/></div>`;
      html += `<div class="field"><label>Opacity · ${Math.round((el.opacity||1)*100)}%</label>
        <input type="range" min="0" max="100" value="${Math.round((el.opacity||1)*100)}" data-k="opacityPct"/></div>`;

      if (el.type==='text'){
        html += `<div class="field"><label>Content</label><textarea data-k="content">${el.content}</textarea></div>`;
        html += `<div class="field"><label>Font</label><select data-k="fontFamily">
          ${FONTS.map(f=>`<option value="${f}" ${el.fontFamily===f?'selected':''}>${f.split(',')[0].replace(/'/g,'')}</option>`).join('')}
        </select></div>`;
        html += `<div class="field"><label>Size · ${el.fontSize}px</label><input type="range" min="12" max="300" value="${el.fontSize}" data-k="fontSize"/></div>`;
        html += `<div class="field"><label>Weight</label><div class="chip-row">
          ${[400,500,700,800].map(w=>`<button class="chip ${el.fontWeight==w?'active':''}" data-set="fontWeight" data-v="${w}">${w}</button>`).join('')}
        </div></div>`;
        html += `<div class="field"><label>Align</label><div class="chip-row">
          ${['left','center','right'].map(a=>`<button class="chip ${el.align===a?'active':''}" data-set="align" data-v="${a}">${a}</button>`).join('')}
        </div></div>`;
        html += `<div class="field"><label>Color</label><div class="color-row">
          ${COLORS_FG.map(c=>`<div class="color-dot ${el.color===c?'active':''}" data-set="color" data-v="${c}" style="background:${c}"></div>`).join('')}
        </div><input type="color" value="${el.color}" data-k="color"/></div>`;
        html += `<div class="field"><label>Tracking · ${el.letterSpacing}px</label><input type="range" min="-5" max="20" value="${el.letterSpacing}" data-k="letterSpacing"/></div>`;
        html += `<div class="field"><label>Line · ${el.lineHeight}</label><input type="range" min="0.8" max="2" step="0.05" value="${el.lineHeight}" data-k="lineHeight"/></div>`;
        html += `<div class="field"><label>Style</label><div class="chip-row">
          <button class="chip ${el.uppercase?'active':''}" data-toggle="uppercase">UPPER</button>
          <button class="chip ${el.fontStyle==='italic'?'active':''}" data-toggle="italic">Italic</button>
        </div></div>`;
      } else if (el.type==='shape'){
        html += `<div class="field"><label>Fill</label><div class="color-row">
          ${COLORS_FG.map(c=>`<div class="color-dot ${el.fill===c?'active':''}" data-set="fill" data-v="${c}" style="background:${c}"></div>`).join('')}
        </div><input type="color" value="${el.fill}" data-k="fill"/></div>`;
        html += `<div class="field"><label>Stroke · ${el.strokeW||0}px</label><input type="range" min="0" max="20" value="${el.strokeW||0}" data-k="strokeW"/></div>`;
      } else if (el.type==='image'){
        html += `<div class="field"><label>Fit</label><div class="chip-row">
          ${['cover','contain','fill'].map(f=>`<button class="chip ${el.fit===f?'active':''}" data-set="fit" data-v="${f}">${f}</button>`).join('')}
        </div></div>`;
        html += `<div class="field"><button class="btn" data-replace-img style="width:100%">Replace image</button></div>`;
      }

      ins.innerHTML = html;
      ins.querySelectorAll('[data-k]').forEach(inp => {
        inp.addEventListener('input', ()=>{
          const k = inp.dataset.k;
          let v = inp.type==='number'||inp.type==='range'?parseFloat(inp.value):inp.value;
          if (k==='opacityPct'){ el.opacity = v/100; }
          else el[k] = v;
          this._renderCanvas(); this._persist();
        });
        inp.addEventListener('change', ()=>{ this._snapshot(); });
      });
      ins.querySelectorAll('[data-set]').forEach(b => {
        b.addEventListener('click', ()=>{
          el[b.dataset.set] = isNaN(b.dataset.v)?b.dataset.v:(+b.dataset.v || b.dataset.v);
          this.render(); this._snapshot(); this._persist();
        });
      });
      ins.querySelectorAll('[data-toggle]').forEach(b => {
        b.addEventListener('click', ()=>{
          const t = b.dataset.toggle;
          if (t==='uppercase') el.uppercase = !el.uppercase;
          else if (t==='italic') el.fontStyle = el.fontStyle==='italic'?'normal':'italic';
          this.render(); this._snapshot(); this._persist();
        });
      });
      const rb = ins.querySelector('[data-replace-img]');
      if (rb) rb.addEventListener('click', ()=>{
        const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*';
        inp.onchange = e => { const f=e.target.files[0]; if(!f) return;
          const r=new FileReader(); r.onload=ev=>{ el.src=ev.target.result; this.render(); this._snapshot(); this._persist();};
          r.readAsDataURL(f);
        }; inp.click();
      });
    }

    loadSlides(slides){
      this.slides = JSON.parse(JSON.stringify(slides));
      this.idx=0; this.selectedId=null;
      this.render(); this._snapshot(); this._persist();
    }
    getSnapshot(){ return { slides: JSON.parse(JSON.stringify(this.slides)), W:this.W, H:this.H, mode:this.mode }; }
  }

  window.HAMDY_EDITOR = { Editor, defaultText, defaultShape, defaultImage, defaultEmoji, SHAPES, EMOJIS, COLORS_FG, FONTS };
})();
