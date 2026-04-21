// ============================================
// HAMDY Canvas Editor — DOM-based editor engine
// Handles: slides, elements, selection, drag/resize/rotate,
// layers, undo/redo, export
// ============================================

(function(){
  const { ACCENTS, CAROUSEL_TYPES, POST_TYPES, STORY_FRAMES } = window.HAMDY;
  const { logoIcon, logoWordmark } = window.HAMDY_LOGO;

  // ------------------------------------------------------------------
  // Factories for default element data
  // ------------------------------------------------------------------
  let _elId = 1;
  const newId = () => 'e' + (_elId++) + '_' + Math.random().toString(36).slice(2,6);

  function defaultText(overrides = {}) {
    return {
      id: newId(), type: 'text',
      x: 120, y: 480, w: 840, h: 120,
      rotation: 0, opacity: 1, zIndex: 1, locked:false, visible:true,
      content: 'Double-click to edit',
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: 72, fontWeight: 700,
      color: '#F6F3EE',
      align: 'left',
      lineHeight: 1.1,
      letterSpacing: 0,
      uppercase: false,
      bgFill: 'none', bgColor: '#EB5A2A', bgOpacity: 1,
      borderWidth: 0, borderColor: '#F6F3EE',
      name: 'Text',
      ...overrides
    };
  }
  function defaultShape(shape = 'rect', overrides = {}) {
    return {
      id: newId(), type: 'shape', shape,
      x: 400, y: 400, w: 280, h: 280,
      rotation: 0, opacity: 1, zIndex: 1, locked:false, visible:true,
      fill: 'var(--accent)', hasFill: true,
      stroke: '#F6F3EE', strokeW: 0, strokeStyle: 'solid',
      radius: shape === 'rect' ? 0 : 0,
      name: shape.charAt(0).toUpperCase() + shape.slice(1),
      ...overrides
    };
  }
  function defaultImage(src, overrides = {}) {
    return {
      id: newId(), type: 'image',
      x: 200, y: 200, w: 680, h: 680,
      rotation: 0, opacity: 1, zIndex: 1, locked:false, visible:true,
      src, fit: 'cover',
      flipH: false, flipV: false,
      blend: 'normal',
      borderWidth: 0, borderColor: '#F6F3EE', borderRadius: 0,
      name: 'Image',
      ...overrides
    };
  }

  // ------------------------------------------------------------------
  // Editor class
  // ------------------------------------------------------------------
  class Editor {
    constructor(root, opts = {}) {
      this.root = root;
      this.mode = opts.mode || 'carousel'; // 'carousel' | 'post' | 'story'
      this.canvasW = opts.canvasW || 1080;
      this.canvasH = opts.canvasH || 1080;
      this.scale = 1;
      this.slides = [];
      this.currentIdx = 0;
      this.selectedId = null;
      this.history = [];
      this.future = [];
      this.gridOn = false;
      this.safeOn = true;
      this.rulerOn = false;
      this.carouselType = 'A';
      this.postType = 'A';
      this.autosaveKey = opts.autosaveKey || 'hamdy_' + this.mode;
      this._buildDOM();
      this._bindGlobal();
      // try loading
      const loaded = this._tryLoad();
      if (!loaded) {
        if (this.mode === 'carousel') this.setCarouselType('A');
        else if (this.mode === 'post') this.setPostType('A');
        else this.initStory();
      }
      this.render();
    }

    // ---------- DOM scaffolding ----------
    _buildDOM() {
      this.root.innerHTML = `
        <div class="editor-shell">
          <div class="editor-left">
            ${this.mode === 'carousel' ? `
              <div class="slide-strip">
                <div class="sidebar-h">
                  <span>Slides</span>
                  <button class="btn-ghost" data-act="add-slide">+ Add</button>
                </div>
                <div class="slide-thumbs"></div>
                <div class="slide-actions">
                  <button data-act="dup-slide">Dup</button>
                  <button data-act="del-slide">Del</button>
                </div>
              </div>
            ` : this.mode === 'story' ? `
              <div class="slide-strip">
                <div class="sidebar-h"><span>Frames</span></div>
                <div class="slide-thumbs"></div>
              </div>
            ` : ''}
            <div class="layer-panel">
              <div class="sidebar-h"><span>Layers</span></div>
              <div class="layer-list"></div>
            </div>
          </div>

          <div class="editor-center">
            <div class="editor-toolbar">
              ${this.mode === 'carousel' ? `
                <select class="select tool-btn labeled" data-act="carousel-type" style="min-width:160px">
                  ${Object.entries(CAROUSEL_TYPES).map(([k,v]) => `<option value="${k}">Type ${k} — ${v.name}</option>`).join('')}
                </select>
                <div class="toolbar-sep"></div>
              ` : this.mode === 'post' ? `
                <select class="select tool-btn labeled" data-act="post-type" style="min-width:160px">
                  ${Object.entries(POST_TYPES).map(([k,v]) => `<option value="${k}">Type ${k} — ${v}</option>`).join('')}
                </select>
                <div class="toolbar-sep"></div>
              ` : ''}
              <button class="tool-btn labeled" data-act="add-text" title="Add text">＋ Text</button>
              <button class="tool-btn labeled" data-act="add-image" title="Add image">＋ Image</button>
              <button class="tool-btn labeled" data-act="add-rect">＋ Rect</button>
              <button class="tool-btn labeled" data-act="add-circle">＋ Circle</button>
              <button class="tool-btn labeled" data-act="add-line">＋ Line</button>
              <button class="tool-btn labeled" data-act="add-triangle">＋ Tri</button>
              <div class="toolbar-sep"></div>
              <button class="tool-btn" data-act="undo" title="Undo (Ctrl+Z)">↶</button>
              <button class="tool-btn" data-act="redo" title="Redo (Ctrl+Y)">↷</button>
              <div class="toolbar-sep"></div>
              <button class="tool-btn" data-act="toggle-grid" title="Grid">▦</button>
              <button class="tool-btn active" data-act="toggle-safe" title="Safe zone">▢</button>
              <button class="tool-btn" data-act="toggle-ruler" title="Ruler">┼</button>
              <div class="toolbar-sep"></div>
              <button class="tool-btn" data-act="zoom-out">−</button>
              <button class="tool-btn labeled" data-act="zoom-reset"><span class="zoom-v">100%</span></button>
              <button class="tool-btn" data-act="zoom-in">+</button>
              <button class="tool-btn labeled" data-act="zoom-fit">FIT</button>
              <input type="file" class="file-in" accept="image/*" style="display:none" multiple>
            </div>

            <div class="canvas-stage">
              <div class="canvas-wrap">
                <div class="canvas ${this.mode === 'story' ? 'story-ratio' : ''} canvas-safe"
                     style="width:${this.canvasW}px;height:${this.canvasH}px;"></div>
              </div>
            </div>

            <div class="canvas-meta">
              <span><span class="cm-size">${this.canvasW} × ${this.canvasH}</span> · <span class="cm-mode">${this.mode.toUpperCase()}</span></span>
              <span class="counter"><span class="cm-idx">1 / 1</span></span>
            </div>
          </div>

          <div class="editor-right">
            <div class="props"></div>
            <div class="export-section">
              <div class="label">Export</div>
              <button class="btn btn-primary" data-act="export-png">Export PNG</button>
              <button class="btn btn-secondary" data-act="export-all">Export All PNG</button>
              <button class="btn btn-secondary" data-act="export-pdf">Print PDF</button>
              <button class="btn btn-secondary" data-act="save-project">Save Project</button>
              <button class="btn btn-secondary" data-act="load-project">Load Project</button>
              <button class="btn btn-secondary" data-act="copy-captions">Copy Captions</button>
            </div>
          </div>
        </div>
      `;

      this.$canvas = this.root.querySelector('.canvas');
      this.$canvasWrap = this.root.querySelector('.canvas-wrap');
      this.$stage = this.root.querySelector('.canvas-stage');
      this.$thumbs = this.root.querySelector('.slide-thumbs');
      this.$layers = this.root.querySelector('.layer-list');
      this.$props = this.root.querySelector('.props');
      this.$fileIn = this.root.querySelector('.file-in');
      this.$idx = this.root.querySelector('.cm-idx');
      this.$zoomV = this.root.querySelector('.zoom-v');

      this._bindToolbar();
      this._bindCanvas();
      this._bindFileInput();
      this._bindStage();
    }

    _bindToolbar() {
      this.root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]');
        if (!b) return;
        const act = b.dataset.act;
        const actions = {
          'add-slide': () => this.addSlide(),
          'dup-slide': () => this.duplicateSlide(),
          'del-slide': () => this.deleteSlide(),
          'add-text': () => this.addElement(defaultText()),
          'add-image': () => this.$fileIn.click(),
          'add-rect': () => this.addElement(defaultShape('rect')),
          'add-circle': () => this.addElement(defaultShape('circle', {w:280,h:280})),
          'add-line': () => this.addElement(defaultShape('line', {w:400,h:4})),
          'add-triangle': () => this.addElement(defaultShape('triangle', {w:300,h:240})),
          'undo': () => this.undo(),
          'redo': () => this.redo(),
          'toggle-grid': () => this.toggleGrid(),
          'toggle-safe': () => this.toggleSafe(),
          'toggle-ruler': () => this.toggleRuler(),
          'zoom-in': () => this.setZoom(this.scale * 1.15),
          'zoom-out': () => this.setZoom(this.scale * 0.87),
          'zoom-reset': () => this.setZoom(1),
          'zoom-fit': () => this.fitZoom(),
          'export-png': () => this.exportPNG(),
          'export-all': () => this.exportAllPNG(),
          'export-pdf': () => this.exportPDF(),
          'save-project': () => this.saveProject(true),
          'load-project': () => { this._tryLoad(true); this.render(); },
          'copy-captions': () => this.copyCaptions()
        };
        if (actions[act]) { actions[act](); }
      });

      this.root.addEventListener('change', (e) => {
        if (e.target.matches('[data-act="carousel-type"]')) {
          this.setCarouselType(e.target.value);
        }
        if (e.target.matches('[data-act="post-type"]')) {
          this.setPostType(e.target.value);
        }
      });
    }

    _bindCanvas() {
      // Click empty canvas -> deselect
      this.$canvas.addEventListener('mousedown', (e) => {
        if (e.target === this.$canvas) {
          this.select(null);
        }
      });
    }

    _bindFileInput() {
      this.$fileIn.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        files.forEach(f => this._addImageFile(f));
        e.target.value = '';
      });

      // Drag-drop onto canvas
      this.$canvas.addEventListener('dragover', (e) => { e.preventDefault(); });
      this.$canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
        files.forEach(f => this._addImageFile(f));
      });
    }

    _addImageFile(file) {
      const r = new FileReader();
      r.onload = () => {
        this.addElement(defaultImage(r.result, { x: 200, y: 200, w: 680, h: 680 }));
      };
      r.readAsDataURL(file);
    }

    _bindStage() {
      // resize observer for auto-fit
      const ro = new ResizeObserver(() => this.fitZoom());
      ro.observe(this.$stage);
    }

    _bindGlobal() {
      // keyboard shortcuts
      this._keyHandler = (e) => {
        // skip when typing in inputs / contenteditable
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
        // only when editor is visible in DOM
        if (!this.root.offsetParent) return;
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); this.undo(); }
        else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); this.redo(); }
        else if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); this.duplicateSelected(); }
        else if (e.key === 'Delete' || e.key === 'Backspace') {
          if (this.selectedId) { e.preventDefault(); this.deleteSelected(); }
        }
      };
      window.addEventListener('keydown', this._keyHandler);
    }

    // ---------- Slide management ----------
    newSlide(label = 'Slide', bg = '#070707') {
      return {
        id: 's' + Math.random().toString(36).slice(2, 8),
        label,
        bgType: 'solid', bgColor: bg,
        bgGradA: '#070707', bgGradB: '#1C1C1C', bgGradAngle: 180,
        bgImage: null, bgImgOpacity: 1, bgImgFit: 'cover', bgImgBlur: 0,
        texture: false,
        elements: []
      };
    }

    setCarouselType(k) {
      this.carouselType = k;
      const labels = CAROUSEL_TYPES[k].slides;
      this.slides = labels.map((l, i) => {
        const even = i % 2 === 0;
        const bg = i === 0 ? '#070707' : (even ? '#F6F3EE' : '#070707');
        const s = this.newSlide(l, bg);
        s.elements = this._templateElements(l, i, labels.length, bg);
        return s;
      });
      this.currentIdx = 0;
      this.selectedId = null;
      this.snapshot();
      this.render();
    }

    setPostType(k) {
      this.postType = k;
      const s = this.newSlide(POST_TYPES[k], this._postBgFor(k));
      s.elements = this._postTemplateElements(k);
      this.slides = [s];
      this.currentIdx = 0;
      this.selectedId = null;
      this.snapshot();
      this.render();
    }

    initStory() {
      this.slides = STORY_FRAMES.map((name, i) => {
        const s = this.newSlide(name, i % 2 === 0 ? '#070707' : '#F6F3EE');
        s.elements = this._storyTemplateElements(name, i);
        return s;
      });
      this.currentIdx = 0;
      this.selectedId = null;
      this.snapshot();
      this.render();
    }

    _postBgFor(k) {
      return { A:'#070707', B:'#F6F3EE', C:'#070707', D:'var(--accent)', E:'#F6F3EE', F:'#1C1C1C' }[k];
    }

    _templateElements(label, idx, total, bg) {
      const dark = bg === '#070707' || bg === '#1C1C1C' || bg === 'var(--accent)';
      const fg = dark ? '#F6F3EE' : '#070707';
      const els = [];
      if (idx === 0) {
        // cover
        els.push(defaultText({
          content: label.toUpperCase() + ' — MOHAMED HAMDY',
          x: 80, y: 80, w: 720, h: 60,
          fontFamily: "'Roboto Condensed', sans-serif",
          fontSize: 22, fontWeight: 700, uppercase: true,
          letterSpacing: 2,
          color: fg, align: 'left'
        }));
        els.push(defaultShape('rect', {
          x: 80, y: 500, w: 80, h: 4, fill: 'var(--accent)', hasFill: true
        }));
        els.push(defaultText({
          content: 'Headline goes here — one bold sentence.',
          x: 80, y: 540, w: 920, h: 360,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 78, fontWeight: 800, color: fg, lineHeight: 1.05
        }));
        els.push(defaultText({
          content: 'swipe →',
          x: 860, y: 960, w: 180, h: 40,
          fontFamily: "'Roboto Condensed', sans-serif",
          fontSize: 18, fontWeight: 700, uppercase: true, letterSpacing: 2,
          color: dark ? '#9CA3AF' : '#6B7280', align: 'right'
        }));
      } else {
        // content
        els.push(defaultText({
          content: String(idx + 1).padStart(2,'0') + ' / ' + String(total).padStart(2,'0'),
          x: 880, y: 60, w: 140, h: 30,
          fontFamily: "'Roboto Condensed', sans-serif",
          fontSize: 16, fontWeight: 700, uppercase: true, letterSpacing: 2,
          color: dark ? '#9CA3AF' : '#6B7280', align: 'right'
        }));
        els.push(defaultShape('rect', { x: 80, y: 200, w: 60, h: 4, fill: 'var(--accent)' }));
        els.push(defaultText({
          content: label.toUpperCase(),
          x: 80, y: 230, w: 900, h: 40,
          fontFamily: "'Roboto Condensed', sans-serif",
          fontSize: 22, fontWeight: 700, uppercase: true, letterSpacing: 2,
          color: dark ? '#F5B59A' : '#C0522A'
        }));
        els.push(defaultText({
          content: 'Slide headline — one specific, evidence-driven sentence.',
          x: 80, y: 290, w: 900, h: 220,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 56, fontWeight: 700, color: fg, lineHeight: 1.1
        }));
        els.push(defaultText({
          content: 'Supporting body text. Plain-language explanation of the idea. Why this matters to the reader — tied to comfort, bills, policy, or health. Include a specific number or dataset where useful.',
          x: 80, y: 560, w: 900, h: 280,
          fontFamily: "'Inter', sans-serif",
          fontSize: 22, fontWeight: 400, color: fg, lineHeight: 1.45
        }));
        els.push(defaultText({
          content: 'Source — dataset, paper, or standard · 2024',
          x: 80, y: 980, w: 700, h: 24,
          fontFamily: "'Inter', sans-serif",
          fontSize: 13, fontStyle: 'italic',
          color: '#9CA3AF'
        }));
      }
      els.forEach((e, i) => e.zIndex = i + 1);
      return els;
    }

    _postTemplateElements(k) {
      const els = [];
      if (k === 'A') {
        els.push(defaultText({
          content: 'OVERHEATING',
          x: 60, y: 380, w: 960, h: 220,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 140, fontWeight: 800, color: 'var(--accent)', align: 'left', letterSpacing: -4
        }));
        els.push(defaultText({
          content: 'TM59 FAILURES IN UK HOUSING',
          x: 60, y: 620, w: 960, h: 40,
          fontFamily: "'Roboto Condensed', sans-serif",
          fontSize: 28, fontWeight: 700, uppercase: true, letterSpacing: 3, color: '#F6F3EE'
        }));
        els.push(defaultText({
          content: 'Four of five new-build flats in Leeds failed CIBSE\'s TM59 overheating test when re-run against 2050 weather files.',
          x: 60, y: 700, w: 960, h: 200,
          fontFamily: "'Inter', sans-serif",
          fontSize: 20, color: '#F6F3EE', lineHeight: 1.5
        }));
      } else if (k === 'B') {
        els.push(defaultText({
          content: '50,000',
          x: 60, y: 120, w: 960, h: 260,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 220, fontWeight: 800, color: 'var(--accent)', letterSpacing: -6
        }));
        els.push(defaultText({
          content: 'EPC RECORDS MAPPED IN LEEDS',
          x: 60, y: 420, w: 960, h: 60,
          fontFamily: "'Roboto Condensed', sans-serif",
          fontSize: 32, fontWeight: 700, uppercase: true, letterSpacing: 3, color: '#070707'
        }));
        els.push(defaultShape('rect', { x: 0, y: 540, w: 1080, h: 540, fill: '#070707', radius: 0 }));
        els.push(defaultText({
          content: 'Plotted against Landsat LST to find where heat risk and poor insulation overlap.',
          x: 60, y: 620, w: 960, h: 240,
          fontFamily: "'Inter', sans-serif",
          fontSize: 22, color: '#F6F3EE', lineHeight: 1.45
        }));
      } else if (k === 'D') {
        els.push(defaultText({
          content: '"The carbon is already spent before a single person moves in."',
          x: 80, y: 200, w: 920, h: 520,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 56, fontWeight: 700, color: '#070707', lineHeight: 1.15
        }));
        els.push(defaultText({
          content: '— on embodied carbon in new housing',
          x: 80, y: 820, w: 920, h: 40,
          fontFamily: "'Roboto Condensed', sans-serif",
          fontSize: 20, fontWeight: 700, uppercase: true, letterSpacing: 2, color: '#070707'
        }));
      } else {
        els.push(defaultText({
          content: 'POST TYPE ' + k,
          x: 60, y: 480, w: 960, h: 120,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 96, fontWeight: 800, color: 'var(--accent)', align: 'center'
        }));
      }
      els.forEach((e,i) => e.zIndex = i+1);
      return els;
    }

    _storyTemplateElements(name, idx) {
      const els = [];
      const dark = idx % 2 === 0;
      const fg = dark ? '#F6F3EE' : '#070707';
      els.push(defaultText({
        content: (idx+1) + ' / 5',
        x: 60, y: 160, w: 200, h: 32,
        fontFamily: "'Roboto Condensed', sans-serif",
        fontSize: 16, fontWeight: 700, uppercase: true, letterSpacing: 3,
        color: dark ? '#9CA3AF' : '#6B7280'
      }));
      els.push(defaultShape('rect', { x: 60, y: 220, w: 60, h: 4, fill: 'var(--accent)' }));
      els.push(defaultText({
        content: name.toUpperCase(),
        x: 60, y: 250, w: 960, h: 40,
        fontFamily: "'Roboto Condensed', sans-serif",
        fontSize: 22, fontWeight: 700, uppercase: true, letterSpacing: 3,
        color: dark ? '#F5B59A' : '#C0522A'
      }));
      els.push(defaultText({
        content: name === 'Hook' ? 'A city that can\'t cool down.' :
                 name === 'Problem' ? 'UK flats weren\'t built for 35°C.' :
                 name === 'Insight' ? 'Night-time temperatures are the real killer.' :
                 name === 'Evidence' ? '40% of Leeds flats failed TM59 against 2050 weather.' :
                 'Read the full analysis →',
        x: 60, y: 310, w: 960, h: 1200,
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 96, fontWeight: 800, color: fg, lineHeight: 1.05
      }));
      els.forEach((e,i) => e.zIndex = i+1);
      return els;
    }

    addSlide() {
      const s = this.newSlide('New Slide', '#070707');
      this.slides.push(s);
      this.currentIdx = this.slides.length - 1;
      this.snapshot();
      this.render();
    }
    duplicateSlide() {
      const s = JSON.parse(JSON.stringify(this.slides[this.currentIdx]));
      s.id = 's' + Math.random().toString(36).slice(2, 8);
      s.elements.forEach(e => e.id = newId());
      this.slides.splice(this.currentIdx + 1, 0, s);
      this.currentIdx++;
      this.snapshot();
      this.render();
    }
    deleteSlide() {
      if (this.slides.length <= 1) return;
      this.slides.splice(this.currentIdx, 1);
      this.currentIdx = Math.max(0, this.currentIdx - 1);
      this.snapshot();
      this.render();
    }
    goToSlide(i) {
      this.currentIdx = Math.max(0, Math.min(this.slides.length - 1, i));
      this.selectedId = null;
      this.render();
    }

    // ---------- Element management ----------
    currentSlide() { return this.slides[this.currentIdx]; }
    addElement(e) {
      const s = this.currentSlide();
      e.zIndex = (s.elements.length ? Math.max(...s.elements.map(x => x.zIndex)) : 0) + 1;
      s.elements.push(e);
      this.selectedId = e.id;
      this.snapshot();
      this.render();
    }
    getElement(id) {
      return this.currentSlide().elements.find(e => e.id === id);
    }
    updateElement(id, patch, push = true) {
      const e = this.getElement(id);
      if (!e) return;
      Object.assign(e, patch);
      if (push) this.snapshot();
      this._renderCanvas();
      this._renderLayers();
      this._renderProps();
      this._renderThumbs();
    }
    deleteSelected() {
      if (!this.selectedId) return;
      const s = this.currentSlide();
      s.elements = s.elements.filter(e => e.id !== this.selectedId);
      this.selectedId = null;
      this.snapshot();
      this.render();
    }
    duplicateSelected() {
      if (!this.selectedId) return;
      const e = this.getElement(this.selectedId);
      if (!e) return;
      const copy = JSON.parse(JSON.stringify(e));
      copy.id = newId();
      copy.x += 40; copy.y += 40;
      this.addElement(copy);
    }
    select(id) {
      this.selectedId = id;
      this._renderCanvas();
      this._renderLayers();
      this._renderProps();
    }

    bringFront() {
      if (!this.selectedId) return;
      const s = this.currentSlide();
      const max = Math.max(...s.elements.map(e => e.zIndex));
      this.updateElement(this.selectedId, { zIndex: max + 1 });
    }
    sendBack() {
      if (!this.selectedId) return;
      const s = this.currentSlide();
      const min = Math.min(...s.elements.map(e => e.zIndex));
      this.updateElement(this.selectedId, { zIndex: min - 1 });
    }
    moveLayerUp() {
      if (!this.selectedId) return;
      const s = this.currentSlide();
      const sorted = [...s.elements].sort((a,b) => a.zIndex - b.zIndex);
      const i = sorted.findIndex(e => e.id === this.selectedId);
      if (i < sorted.length - 1) {
        const [a,b] = [sorted[i], sorted[i+1]];
        const tz = a.zIndex; a.zIndex = b.zIndex; b.zIndex = tz;
        this.snapshot(); this._renderCanvas(); this._renderLayers();
      }
    }
    moveLayerDown() {
      if (!this.selectedId) return;
      const s = this.currentSlide();
      const sorted = [...s.elements].sort((a,b) => a.zIndex - b.zIndex);
      const i = sorted.findIndex(e => e.id === this.selectedId);
      if (i > 0) {
        const [a,b] = [sorted[i], sorted[i-1]];
        const tz = a.zIndex; a.zIndex = b.zIndex; b.zIndex = tz;
        this.snapshot(); this._renderCanvas(); this._renderLayers();
      }
    }

    // ---------- History ----------
    snapshot() {
      this.history.push(JSON.stringify({slides:this.slides, idx:this.currentIdx}));
      if (this.history.length > 50) this.history.shift();
      this.future = [];
      this._autosave();
    }
    undo() {
      if (this.history.length < 2) return;
      const cur = this.history.pop();
      this.future.push(cur);
      const prev = JSON.parse(this.history[this.history.length - 1]);
      this.slides = prev.slides; this.currentIdx = prev.idx;
      this.selectedId = null;
      this.render();
    }
    redo() {
      if (!this.future.length) return;
      const next = this.future.pop();
      this.history.push(next);
      const n = JSON.parse(next);
      this.slides = n.slides; this.currentIdx = n.idx;
      this.selectedId = null;
      this.render();
    }

    // ---------- Zoom ----------
    setZoom(z) {
      this.scale = Math.max(0.1, Math.min(3, z));
      this._applyZoom();
    }
    fitZoom() {
      const sw = this.$stage.clientWidth - 80;
      const sh = this.$stage.clientHeight - 80;
      this.scale = Math.min(sw / this.canvasW, sh / this.canvasH);
      this._applyZoom();
    }
    _applyZoom() {
      this.$canvasWrap.style.transform = `scale(${this.scale})`;
      this.$canvasWrap.style.width = (this.canvasW) + 'px';
      this.$canvasWrap.style.height = (this.canvasH) + 'px';
      // Adjust stage padding to reserve space
      const w = this.canvasW * this.scale;
      const h = this.canvasH * this.scale;
      this.$canvasWrap.style.marginLeft = 'auto';
      this.$canvasWrap.style.marginRight = 'auto';
      if (this.$zoomV) this.$zoomV.textContent = Math.round(this.scale * 100) + '%';
      // Re-apply to keep centered, by setting transform-origin top-left & offsetting
      this.$canvasWrap.style.transformOrigin = 'top left';
      this.$canvasWrap.style.position = 'relative';
      this.$canvasWrap.style.width = (this.canvasW * this.scale) + 'px';
      this.$canvasWrap.style.height = (this.canvasH * this.scale) + 'px';
      this.$canvas.style.transform = `scale(${this.scale})`;
      this.$canvas.style.transformOrigin = 'top left';
    }

    // ---------- Toggles ----------
    toggleGrid() { this.gridOn = !this.gridOn; this.$canvas.classList.toggle('canvas-grid', this.gridOn); this.root.querySelector('[data-act="toggle-grid"]').classList.toggle('active', this.gridOn); }
    toggleSafe() { this.safeOn = !this.safeOn; this.$canvas.classList.toggle('canvas-safe', this.safeOn); this.root.querySelector('[data-act="toggle-safe"]').classList.toggle('active', this.safeOn); }
    toggleRuler() { this.rulerOn = !this.rulerOn; this.root.querySelector('[data-act="toggle-ruler"]').classList.toggle('active', this.rulerOn); this._renderCanvas(); }

    // ---------- Rendering ----------
    render() {
      this._renderCanvas();
      this._renderThumbs();
      this._renderLayers();
      this._renderProps();
      this.$idx.textContent = (this.currentIdx + 1) + ' / ' + this.slides.length;
      // sync type select
      const sel = this.root.querySelector('[data-act="carousel-type"]');
      if (sel) sel.value = this.carouselType;
      const pSel = this.root.querySelector('[data-act="post-type"]');
      if (pSel) pSel.value = this.postType;
      requestAnimationFrame(() => this.fitZoom());
    }

    _renderCanvas() {
      const s = this.currentSlide();
      if (!s) return;
      this.$canvas.innerHTML = '';
      // background
      this.$canvas.style.background = this._bgStyle(s);

      // optional rulers
      if (this.rulerOn) {
        const r = document.createElement('div');
        r.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:2;
          background:
            repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 100px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 100px);`;
        this.$canvas.appendChild(r);
      }

      // background image
      if (s.bgImage) {
        const bi = document.createElement('img');
        bi.src = s.bgImage;
        bi.style.cssText = `position:absolute;inset:0;width:100%;height:100%;
          object-fit:${s.bgImgFit};
          opacity:${s.bgImgOpacity};
          filter:blur(${s.bgImgBlur}px);
          z-index:0;pointer-events:none;`;
        this.$canvas.appendChild(bi);
      }
      if (s.texture) {
        const t = document.createElement('div');
        t.style.cssText = `position:absolute;inset:0;z-index:1;pointer-events:none;
          background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/></svg>");
          opacity:0.12;mix-blend-mode:overlay;`;
        this.$canvas.appendChild(t);
      }

      // sort by z
      const sorted = [...s.elements].sort((a,b) => a.zIndex - b.zIndex);
      for (const e of sorted) {
        if (!e.visible) continue;
        const node = this._renderEl(e);
        this.$canvas.appendChild(node);
      }
    }

    _bgStyle(s) {
      if (s.bgType === 'gradient') {
        return `linear-gradient(${s.bgGradAngle}deg, ${s.bgGradA}, ${s.bgGradB})`;
      }
      // solid (bgImage painted over)
      return s.bgColor || '#070707';
    }

    _renderEl(e) {
      const node = document.createElement('div');
      node.className = 'el' + (e.id === this.selectedId ? ' selected' : '') + (e.locked ? ' locked' : '');
      node.dataset.id = e.id;
      node.style.left = e.x + 'px';
      node.style.top = e.y + 'px';
      node.style.width = e.w + 'px';
      node.style.height = e.h + 'px';
      node.style.opacity = e.opacity;
      node.style.zIndex = 10 + e.zIndex;
      const rot = e.rotation || 0;
      node.style.transform = `rotate(${rot}deg)`;

      if (e.type === 'text') {
        node.classList.add('el-text');
        node.style.fontFamily = e.fontFamily;
        node.style.fontSize = e.fontSize + 'px';
        node.style.fontWeight = e.fontWeight;
        node.style.color = e.color;
        node.style.textAlign = e.align;
        node.style.lineHeight = e.lineHeight;
        node.style.letterSpacing = e.letterSpacing + 'px';
        node.style.textTransform = e.uppercase ? 'uppercase' : 'none';
        if (e.fontStyle) node.style.fontStyle = e.fontStyle;
        if (e.bgFill === 'solid') {
          node.style.background = e.bgColor;
        } else if (e.bgFill === 'semi') {
          node.style.background = e.bgColor;
          node.style.opacity = e.bgOpacity;
        }
        if (e.borderWidth) {
          node.style.border = `${e.borderWidth}px solid ${e.borderColor}`;
        }
        node.textContent = e.content;
      } else if (e.type === 'image') {
        node.classList.add('el-image');
        const img = document.createElement('img');
        img.src = e.src;
        img.style.objectFit = e.fit;
        img.style.mixBlendMode = e.blend;
        let t = '';
        if (e.flipH) t += ' scaleX(-1)';
        if (e.flipV) t += ' scaleY(-1)';
        if (t) img.style.transform = t;
        node.appendChild(img);
        if (e.borderWidth) node.style.border = `${e.borderWidth}px solid ${e.borderColor}`;
        if (e.borderRadius) node.style.borderRadius = e.borderRadius + '%';
      } else if (e.type === 'shape') {
        node.classList.add('el-shape', e.shape);
        if (e.shape === 'triangle') {
          node.style.borderLeftWidth = (e.w/2) + 'px';
          node.style.borderRightWidth = (e.w/2) + 'px';
          node.style.borderBottomWidth = e.h + 'px';
          node.style.borderBottomColor = e.hasFill ? e.fill : 'transparent';
          node.style.width = '0'; node.style.height = '0';
        } else {
          node.style.background = e.hasFill ? e.fill : 'transparent';
          if (e.strokeW) {
            const ss = e.strokeStyle || 'solid';
            node.style.border = `${e.strokeW}px ${ss} ${e.stroke}`;
          }
          if (e.shape === 'rect' && e.radius) node.style.borderRadius = e.radius + '%';
          if (e.shape === 'circle') node.style.borderRadius = '50%';
          if (e.shape === 'arrow') {
            node.innerHTML = `
              <div style="position:absolute;left:0;top:50%;width:100%;height:${Math.max(2, e.h/6)}px;background:${e.fill};transform:translateY(-50%);"></div>
              <div style="position:absolute;right:0;top:50%;transform:translateY(-50%);width:0;height:0;border-left:${e.h/2}px solid ${e.fill};border-top:${e.h/2}px solid transparent;border-bottom:${e.h/2}px solid transparent;"></div>
            `;
            node.style.background = 'transparent';
          }
        }
      }

      if (e.id === this.selectedId && !e.locked) {
        ['tl','tr','bl','br','t','b','l','r'].forEach(pos => {
          const h = document.createElement('div');
          h.className = 'handle ' + pos;
          h.dataset.handle = pos;
          node.appendChild(h);
          h.addEventListener('mousedown', (ev) => this._startResize(ev, e.id, pos));
        });
        const rh = document.createElement('div');
        rh.className = 'handle rot';
        node.appendChild(rh);
        rh.addEventListener('mousedown', (ev) => this._startRotate(ev, e.id));
      }

      // interactions
      node.addEventListener('mousedown', (ev) => {
        if (ev.target.classList.contains('handle')) return;
        this.select(e.id);
        if (!e.locked) this._startDrag(ev, e.id);
      });
      if (e.type === 'text') {
        node.addEventListener('dblclick', (ev) => {
          if (e.locked) return;
          ev.stopPropagation();
          node.contentEditable = 'true';
          node.focus();
          // select all
          const range = document.createRange();
          range.selectNodeContents(node);
          const sel = window.getSelection();
          sel.removeAllRanges(); sel.addRange(range);
          const finish = () => {
            node.contentEditable = 'false';
            this.updateElement(e.id, { content: node.textContent });
            node.removeEventListener('blur', finish);
          };
          node.addEventListener('blur', finish);
        });
      }
      return node;
    }

    _startDrag(ev, id) {
      ev.preventDefault();
      const e = this.getElement(id); if (!e || e.locked) return;
      const startX = ev.clientX, startY = ev.clientY;
      const ox = e.x, oy = e.y;
      const onMove = (m) => {
        const dx = (m.clientX - startX) / this.scale;
        const dy = (m.clientY - startY) / this.scale;
        e.x = Math.round(ox + dx);
        e.y = Math.round(oy + dy);
        this._renderCanvas();
        this._renderThumbs();
        this._renderProps();
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        this.snapshot();
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }

    _startResize(ev, id, pos) {
      ev.preventDefault(); ev.stopPropagation();
      const e = this.getElement(id); if (!e) return;
      const startX = ev.clientX, startY = ev.clientY;
      const ox = e.x, oy = e.y, ow = e.w, oh = e.h;
      const onMove = (m) => {
        const dx = (m.clientX - startX) / this.scale;
        const dy = (m.clientY - startY) / this.scale;
        let nx = ox, ny = oy, nw = ow, nh = oh;
        if (pos.includes('r')) nw = Math.max(20, ow + dx);
        if (pos.includes('l')) { nw = Math.max(20, ow - dx); nx = ox + dx; }
        if (pos.includes('b')) nh = Math.max(20, oh + dy);
        if (pos.includes('t')) { nh = Math.max(20, oh - dy); ny = oy + dy; }
        e.x = Math.round(nx); e.y = Math.round(ny);
        e.w = Math.round(nw); e.h = Math.round(nh);
        this._renderCanvas(); this._renderThumbs(); this._renderProps();
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        this.snapshot();
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }

    _startRotate(ev, id) {
      ev.preventDefault(); ev.stopPropagation();
      const e = this.getElement(id); if (!e) return;
      const node = this.$canvas.querySelector(`[data-id="${id}"]`);
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const onMove = (m) => {
        const dx = m.clientX - cx; const dy = m.clientY - cy;
        let deg = Math.atan2(dy, dx) * 180 / Math.PI + 90;
        if (m.shiftKey) deg = Math.round(deg / 15) * 15;
        e.rotation = Math.round(deg);
        this._renderCanvas(); this._renderProps();
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        this.snapshot();
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }

    // ---------- Thumbs ----------
    _renderThumbs() {
      if (!this.$thumbs) return;
      this.$thumbs.innerHTML = '';
      const isStory = this.mode === 'story';
      this.slides.forEach((s, i) => {
        const t = document.createElement('div');
        t.className = 'slide-thumb' + (i === this.currentIdx ? ' active' : '') + (isStory ? ' story-thumb' : '');
        t.innerHTML = `<div class="idx">${String(i+1).padStart(2,'0')}</div><div class="mini"></div><div class="type">${s.label}</div>`;
        t.addEventListener('click', () => this.goToSlide(i));
        this.$thumbs.appendChild(t);
        // Render mini (simplified)
        const mini = t.querySelector('.mini');
        this._renderMini(mini, s);
      });
    }

    _renderMini(container, s) {
      container.style.background = this._bgStyle(s);
      container.style.width = this.canvasW + 'px';
      container.style.height = this.canvasH + 'px';
      container.style.position = 'absolute';
      container.innerHTML = '';
      if (s.bgImage) {
        const bi = document.createElement('img');
        bi.src = s.bgImage;
        bi.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:${s.bgImgFit};opacity:${s.bgImgOpacity};`;
        container.appendChild(bi);
      }
      const sorted = [...s.elements].sort((a,b) => a.zIndex - b.zIndex);
      for (const e of sorted) {
        if (!e.visible) continue;
        const n = this._miniEl(e);
        container.appendChild(n);
      }
    }
    _miniEl(e) {
      const n = document.createElement('div');
      n.style.position = 'absolute';
      n.style.left = e.x + 'px'; n.style.top = e.y + 'px';
      n.style.width = e.w + 'px'; n.style.height = e.h + 'px';
      n.style.opacity = e.opacity;
      n.style.transform = `rotate(${e.rotation||0}deg)`;
      if (e.type === 'text') {
        n.style.fontFamily = e.fontFamily;
        n.style.fontSize = e.fontSize + 'px';
        n.style.fontWeight = e.fontWeight;
        n.style.color = e.color;
        n.style.textAlign = e.align;
        n.style.lineHeight = e.lineHeight;
        n.style.letterSpacing = e.letterSpacing + 'px';
        n.style.textTransform = e.uppercase ? 'uppercase' : 'none';
        n.textContent = e.content;
        if (e.bgFill === 'solid') n.style.background = e.bgColor;
      } else if (e.type === 'image') {
        const img = document.createElement('img');
        img.src = e.src;
        img.style.cssText = `width:100%;height:100%;object-fit:${e.fit};`;
        n.appendChild(img);
      } else if (e.type === 'shape') {
        if (e.shape === 'triangle') {
          n.style.width = '0'; n.style.height = '0';
          n.style.borderLeft = `${e.w/2}px solid transparent`;
          n.style.borderRight = `${e.w/2}px solid transparent`;
          n.style.borderBottom = `${e.h}px solid ${e.hasFill?e.fill:'transparent'}`;
        } else {
          n.style.background = e.hasFill ? e.fill : 'transparent';
          if (e.shape === 'circle') n.style.borderRadius = '50%';
          if (e.shape === 'rect' && e.radius) n.style.borderRadius = e.radius + '%';
          if (e.strokeW) n.style.border = `${e.strokeW}px ${e.strokeStyle||'solid'} ${e.stroke}`;
        }
      }
      return n;
    }

    // ---------- Layers ----------
    _renderLayers() {
      if (!this.$layers) return;
      const s = this.currentSlide();
      const sorted = [...s.elements].sort((a,b) => b.zIndex - a.zIndex);
      this.$layers.innerHTML = sorted.map(e => {
        const icon = e.type === 'text' ? 'T' : e.type === 'image' ? '□' : (e.shape === 'circle' ? '●' : e.shape === 'triangle' ? '▲' : e.shape === 'line' ? '—' : '▭');
        return `<div class="layer-row ${e.id === this.selectedId ? 'active' : ''}" data-id="${e.id}">
          <span class="ic">${icon}</span>
          <span class="name">${e.name}${e.type==='text' ? ': "'+(e.content||'').slice(0,18)+'"' : ''}</span>
          <span class="ctrls">
            <button data-la="vis" title="Show/Hide">${e.visible?'👁':'⊘'}</button>
            <button data-la="lock" title="Lock">${e.locked?'🔒':'🔓'}</button>
            <button data-la="up">▲</button>
            <button data-la="down">▼</button>
            <button data-la="del">×</button>
          </span>
        </div>`;
      }).join('');
      this.$layers.querySelectorAll('.layer-row').forEach(row => {
        const id = row.dataset.id;
        row.addEventListener('click', (ev) => {
          if (ev.target.closest('[data-la]')) return;
          this.select(id);
        });
        row.querySelectorAll('[data-la]').forEach(b => {
          b.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const action = b.dataset.la;
            const el = this.getElement(id);
            if (action === 'vis') this.updateElement(id, { visible: !el.visible });
            else if (action === 'lock') this.updateElement(id, { locked: !el.locked });
            else if (action === 'del') { this.selectedId = id; this.deleteSelected(); }
            else if (action === 'up') { this.selectedId = id; this.moveLayerUp(); }
            else if (action === 'down') { this.selectedId = id; this.moveLayerDown(); }
          });
        });
      });
    }

    // ---------- Properties panel ----------
    _renderProps() {
      const el = this.selectedId ? this.getElement(this.selectedId) : null;
      const s = this.currentSlide();
      this.$props.innerHTML = this._propsHTML(el, s);
      this._bindProps();
    }

    _propsHTML(el, s) {
      const bgSection = `
        <div class="prop-section">
          <h4>Background · Slide</h4>
          <div class="prop-row"><label>Type</label>
            <select class="select" data-bg="type">
              <option value="solid" ${s.bgType==='solid'?'selected':''}>Solid</option>
              <option value="gradient" ${s.bgType==='gradient'?'selected':''}>Gradient</option>
            </select>
          </div>
          ${s.bgType === 'solid' ? `
            <div class="prop-row"><label>Colour</label>
              <input type="color" data-bg="color" value="${this._resolveColor(s.bgColor)}"/>
            </div>
            <div class="swatch-row">
              ${['#070707','#1C1C1C','#F6F3EE','var(--accent)','#FFFFFF'].map(c =>
                `<div class="preset-swatch" style="background:${c}" data-bg-preset="${c}"></div>`).join('')}
              ${['#2D5016','#1B3A6B','#C0522A','#EB5A2A','#F5B59A'].map(c =>
                `<div class="preset-swatch" style="background:${c}" data-bg-preset="${c}"></div>`).join('')}
            </div>
          ` : `
            <div class="prop-row"><label>From</label><input type="color" data-bg="gradA" value="${s.bgGradA}"/></div>
            <div class="prop-row"><label>To</label><input type="color" data-bg="gradB" value="${s.bgGradB}"/></div>
            <div class="prop-row"><label>Angle</label><input type="range" min="0" max="360" value="${s.bgGradAngle}" data-bg="gradAngle"/></div>
          `}
          <div class="prop-row"><label>Bg Image</label>
            <button class="btn btn-secondary btn-sm" data-bg="upload">Upload</button>
          </div>
          ${s.bgImage ? `
            <div class="prop-row"><label>Opacity</label><input type="range" min="0" max="1" step="0.01" value="${s.bgImgOpacity}" data-bg="bgOp"/></div>
            <div class="prop-row"><label>Fit</label>
              <select class="select" data-bg="bgFit">
                ${['cover','contain','fill','none'].map(f=>`<option value="${f}" ${s.bgImgFit===f?'selected':''}>${f}</option>`).join('')}
              </select>
            </div>
            <div class="prop-row"><label>Blur</label><input type="range" min="0" max="20" value="${s.bgImgBlur}" data-bg="bgBlur"/></div>
            <div class="prop-row"><label></label><button class="btn-ghost" data-bg="removeImg">Remove image</button></div>
          ` : ''}
          <div class="prop-row"><label>Texture</label>
            <input type="checkbox" ${s.texture?'checked':''} data-bg="tex"/>
          </div>
        </div>`;

      const smartSection = `
        <div class="prop-section">
          <h4>Brand Smart Elements</h4>
          <div class="smart-grid">
            <button class="smart-btn" data-smart="logo">＋ Brand Logo</button>
            <button class="smart-btn" data-smart="counter">＋ Slide Counter</button>
            <button class="smart-btn" data-smart="bar">＋ Accent Bar</button>
            <button class="smart-btn" data-smart="swipe">＋ Swipe →</button>
            <button class="smart-btn" data-smart="source">＋ Source Box</button>
            <button class="smart-btn" data-smart="dots">＋ Progress Dots</button>
            <button class="smart-btn" data-smart="wordmark">＋ HAMDY Mark</button>
            <button class="smart-btn" data-smart="heroWord">＋ Hero Word</button>
            <button class="smart-btn" data-smart="stat">＋ Stat Number</button>
            <button class="smart-btn" data-smart="caption">＋ Caption</button>
          </div>
        </div>`;

      if (!el) {
        return bgSection + smartSection +
          `<div class="prop-section"><h4>Tip</h4><div style="font-size:12px;color:var(--color-muted);">Click an element to edit it, or drag an image onto the canvas.</div></div>`;
      }

      let typeSection = '';
      if (el.type === 'text') {
        typeSection = `
          <div class="prop-section">
            <h4>Text</h4>
            <div class="prop-row"><label>Content</label>
              <textarea class="input" rows="2" data-p="content">${el.content.replace(/</g,'&lt;')}</textarea>
            </div>
            <div class="prop-row"><label>Font</label>
              <select class="select" data-p="fontFamily">
                <option value="'Space Grotesk', sans-serif" ${el.fontFamily.includes('Space')?'selected':''}>Space Grotesk</option>
                <option value="'Roboto Condensed', sans-serif" ${el.fontFamily.includes('Roboto')?'selected':''}>Roboto Condensed</option>
                <option value="'Inter', sans-serif" ${el.fontFamily.includes('Inter')?'selected':''}>Inter</option>
              </select>
            </div>
            <div class="prop-row"><label>Size</label>
              <div class="inline"><input type="range" min="8" max="220" value="${el.fontSize}" data-p="fontSize"/><input type="number" class="input" style="width:60px" value="${el.fontSize}" data-p="fontSize"/></div>
            </div>
            <div class="prop-row"><label>Weight</label>
              <select class="select" data-p="fontWeight">
                ${[400,500,600,700,800].map(w => `<option value="${w}" ${el.fontWeight==w?'selected':''}>${w}</option>`).join('')}
              </select>
            </div>
            <div class="prop-row"><label>Colour</label><input type="color" data-p="color" value="${this._resolveColor(el.color)}"/></div>
            <div class="prop-row"><label>Align</label>
              <div class="btn-grid">
                ${['left','center','right','justify'].map(a => `<button data-p="align" data-v="${a}" class="${el.align===a?'active':''}">${a[0].toUpperCase()}</button>`).join('')}
              </div>
            </div>
            <div class="prop-row"><label>Line ht</label><input type="range" min="0.8" max="3" step="0.05" value="${el.lineHeight}" data-p="lineHeight"/></div>
            <div class="prop-row"><label>Letter sp</label><input type="range" min="-2" max="20" step="0.5" value="${el.letterSpacing}" data-p="letterSpacing"/></div>
            <div class="prop-row"><label>UPPERCASE</label><input type="checkbox" ${el.uppercase?'checked':''} data-p="uppercase"/></div>
            <div class="prop-row"><label>Highlight</label>
              <select class="select" data-p="bgFill">
                <option value="none" ${el.bgFill==='none'?'selected':''}>None</option>
                <option value="solid" ${el.bgFill==='solid'?'selected':''}>Solid</option>
                <option value="semi" ${el.bgFill==='semi'?'selected':''}>Semi</option>
              </select>
            </div>
            ${el.bgFill !== 'none' ? `<div class="prop-row"><label>Bg colour</label><input type="color" data-p="bgColor" value="${this._resolveColor(el.bgColor)}"/></div>` : ''}
          </div>`;
      } else if (el.type === 'image') {
        typeSection = `
          <div class="prop-section">
            <h4>Image</h4>
            <div class="prop-row"><label>Opacity</label><input type="range" min="0" max="1" step="0.01" value="${el.opacity}" data-p="opacity"/></div>
            <div class="prop-row"><label>Fit</label>
              <select class="select" data-p="fit">${['cover','contain','fill','none'].map(f=>`<option value="${f}" ${el.fit===f?'selected':''}>${f}</option>`).join('')}</select>
            </div>
            <div class="prop-row"><label>Blend</label>
              <select class="select" data-p="blend">${['normal','multiply','screen','overlay','soft-light','color-burn'].map(b=>`<option value="${b}" ${el.blend===b?'selected':''}>${b}</option>`).join('')}</select>
            </div>
            <div class="prop-row"><label>Flip</label>
              <div class="inline">
                <button class="btn btn-secondary btn-sm ${el.flipH?'active':''}" data-p="flipH" data-v="toggle">↔</button>
                <button class="btn btn-secondary btn-sm ${el.flipV?'active':''}" data-p="flipV" data-v="toggle">↕</button>
              </div>
            </div>
            <div class="prop-row"><label>Radius</label><input type="range" min="0" max="50" value="${el.borderRadius}" data-p="borderRadius"/></div>
            <div class="prop-row"><label>Border</label><input type="range" min="0" max="20" value="${el.borderWidth}" data-p="borderWidth"/></div>
            ${el.borderWidth ? `<div class="prop-row"><label>Border Col</label><input type="color" data-p="borderColor" value="${this._resolveColor(el.borderColor)}"/></div>` : ''}
          </div>`;
      } else if (el.type === 'shape') {
        typeSection = `
          <div class="prop-section">
            <h4>Shape — ${el.shape}</h4>
            <div class="prop-row"><label>Fill</label><input type="color" data-p="fill" value="${this._resolveColor(el.fill)}"/></div>
            <div class="prop-row"><label>Has fill</label><input type="checkbox" ${el.hasFill?'checked':''} data-p="hasFill"/></div>
            <div class="prop-row"><label>Stroke</label><input type="color" data-p="stroke" value="${this._resolveColor(el.stroke)}"/></div>
            <div class="prop-row"><label>Stroke W</label><input type="range" min="0" max="20" value="${el.strokeW}" data-p="strokeW"/></div>
            <div class="prop-row"><label>Stroke style</label>
              <select class="select" data-p="strokeStyle">
                ${['solid','dashed','dotted'].map(v => `<option value="${v}" ${el.strokeStyle===v?'selected':''}>${v}</option>`).join('')}
              </select>
            </div>
            ${el.shape === 'rect' ? `<div class="prop-row"><label>Radius %</label><input type="range" min="0" max="50" value="${el.radius||0}" data-p="radius"/></div>` : ''}
          </div>`;
      }

      const commonSection = `
        <div class="prop-section">
          <h4>Position · Size</h4>
          <div class="prop-row"><label>X</label><input type="number" class="input" value="${el.x}" data-p="x"/></div>
          <div class="prop-row"><label>Y</label><input type="number" class="input" value="${el.y}" data-p="y"/></div>
          <div class="prop-row"><label>W</label><input type="number" class="input" value="${el.w}" data-p="w"/></div>
          <div class="prop-row"><label>H</label><input type="number" class="input" value="${el.h}" data-p="h"/></div>
          <div class="prop-row"><label>Rotation</label><input type="range" min="-180" max="180" value="${el.rotation}" data-p="rotation"/></div>
          <div class="prop-row"><label>Opacity</label><input type="range" min="0" max="1" step="0.01" value="${el.opacity}" data-p="opacity"/></div>
        </div>
        <div class="prop-section">
          <h4>Align · Layer</h4>
          <div class="align-grid">
            <button data-align="l" title="Left">⇤</button>
            <button data-align="hc" title="H Centre">↔</button>
            <button data-align="r" title="Right">⇥</button>
            <button data-align="t" title="Top">⇧</button>
            <button data-align="vc" title="V Centre">↕</button>
            <button data-align="b" title="Bottom">⇩</button>
          </div>
          <div style="height:8px"></div>
          <div class="btn-grid">
            <button data-layer="front">Front</button>
            <button data-layer="up">Up</button>
            <button data-layer="down">Down</button>
            <button data-layer="back">Back</button>
          </div>
          <div style="height:8px"></div>
          <div class="btn-grid">
            <button data-act2="duplicate">Duplicate</button>
            <button data-act2="delete">Delete</button>
            <button data-p="locked" data-v="toggle" class="${el.locked?'active':''}">${el.locked?'Unlock':'Lock'}</button>
            <button data-p="visible" data-v="toggle" class="${!el.visible?'active':''}">${el.visible?'Hide':'Show'}</button>
          </div>
        </div>`;

      return bgSection + smartSection + typeSection + commonSection;
    }

    _resolveColor(c) {
      if (!c) return '#000000';
      if (c.startsWith('var(')) {
        const name = c.match(/var\((.*?)\)/)[1];
        const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return val || '#EB5A2A';
      }
      return c;
    }

    _bindProps() {
      // background
      this.$props.querySelectorAll('[data-bg]').forEach(inp => {
        const key = inp.dataset.bg;
        const s = this.currentSlide();
        if (inp.tagName === 'INPUT' || inp.tagName === 'SELECT' || inp.tagName === 'TEXTAREA') {
          inp.addEventListener('input', () => {
            if (key === 'type') s.bgType = inp.value;
            else if (key === 'color') s.bgColor = inp.value;
            else if (key === 'gradA') s.bgGradA = inp.value;
            else if (key === 'gradB') s.bgGradB = inp.value;
            else if (key === 'gradAngle') s.bgGradAngle = +inp.value;
            else if (key === 'bgOp') s.bgImgOpacity = +inp.value;
            else if (key === 'bgFit') s.bgImgFit = inp.value;
            else if (key === 'bgBlur') s.bgImgBlur = +inp.value;
            else if (key === 'tex') s.texture = inp.checked;
            this._renderCanvas(); this._renderThumbs();
          });
          inp.addEventListener('change', () => { this.snapshot(); this._renderProps(); });
        } else if (inp.tagName === 'BUTTON') {
          inp.addEventListener('click', () => {
            if (key === 'upload') {
              const i = document.createElement('input');
              i.type = 'file'; i.accept = 'image/*';
              i.onchange = () => {
                const f = i.files[0]; if (!f) return;
                const r = new FileReader();
                r.onload = () => { s.bgImage = r.result; this.snapshot(); this._renderCanvas(); this._renderThumbs(); this._renderProps(); };
                r.readAsDataURL(f);
              };
              i.click();
            } else if (key === 'removeImg') {
              s.bgImage = null; this.snapshot(); this._renderCanvas(); this._renderThumbs(); this._renderProps();
            }
          });
        }
      });
      this.$props.querySelectorAll('[data-bg-preset]').forEach(d => {
        d.addEventListener('click', () => {
          const s = this.currentSlide(); s.bgColor = d.dataset.bgPreset; s.bgType = 'solid';
          this.snapshot(); this._renderCanvas(); this._renderThumbs(); this._renderProps();
        });
      });

      // smart
      this.$props.querySelectorAll('[data-smart]').forEach(b => {
        b.addEventListener('click', () => this._insertSmart(b.dataset.smart));
      });

      // element props
      if (!this.selectedId) return;
      const el = this.getElement(this.selectedId); if (!el) return;

      this.$props.querySelectorAll('[data-p]').forEach(inp => {
        const key = inp.dataset.p;
        if (inp.tagName === 'BUTTON') {
          if (inp.dataset.v === 'toggle') {
            inp.addEventListener('click', () => this.updateElement(el.id, { [key]: !el[key] }));
          } else {
            inp.addEventListener('click', () => this.updateElement(el.id, { [key]: inp.dataset.v }));
          }
          return;
        }
        inp.addEventListener('input', () => {
          let v = inp.value;
          if (inp.type === 'checkbox') v = inp.checked;
          else if (inp.type === 'number' || inp.type === 'range') v = +inp.value;
          const e = this.getElement(el.id);
          if (!e) return;
          e[key] = v;
          this._renderCanvas(); this._renderThumbs();
        });
        inp.addEventListener('change', () => { this.snapshot(); });
      });

      // align
      this.$props.querySelectorAll('[data-align]').forEach(b => {
        b.addEventListener('click', () => {
          const a = b.dataset.align;
          const e = this.getElement(el.id); if (!e) return;
          if (a === 'l') e.x = 0;
          else if (a === 'r') e.x = this.canvasW - e.w;
          else if (a === 'hc') e.x = (this.canvasW - e.w) / 2;
          else if (a === 't') e.y = 0;
          else if (a === 'b') e.y = this.canvasH - e.h;
          else if (a === 'vc') e.y = (this.canvasH - e.h) / 2;
          this.snapshot(); this._renderCanvas(); this._renderProps();
        });
      });
      this.$props.querySelectorAll('[data-layer]').forEach(b => {
        b.addEventListener('click', () => {
          const a = b.dataset.layer;
          if (a === 'front') this.bringFront();
          else if (a === 'back') this.sendBack();
          else if (a === 'up') this.moveLayerUp();
          else if (a === 'down') this.moveLayerDown();
        });
      });
      this.$props.querySelectorAll('[data-act2]').forEach(b => {
        b.addEventListener('click', () => {
          if (b.dataset.act2 === 'duplicate') this.duplicateSelected();
          if (b.dataset.act2 === 'delete') this.deleteSelected();
        });
      });
    }

    _insertSmart(type) {
      const idx = this.currentIdx + 1;
      const total = this.slides.length;
      if (type === 'logo') {
        // inline SVG via special element - represent as image using svg data url
        const svg = window.HAMDY_LOGO.logoIcon(80, getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());
        const src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
        this.addElement(defaultImage(src, { x: 940, y: 940, w: 100, h: 100, name:'Logo mark' }));
      } else if (type === 'counter') {
        this.addElement(defaultText({
          content: `${String(idx).padStart(2,'0')} / ${String(total).padStart(2,'0')}`,
          x: 880, y: 60, w: 140, h: 32,
          fontFamily: "'Roboto Condensed', sans-serif",
          fontSize: 16, fontWeight: 700, uppercase: true, letterSpacing: 2,
          color: '#9CA3AF', align: 'right',
          name: 'Counter'
        }));
      } else if (type === 'bar') {
        this.addElement(defaultShape('rect', {
          x: 80, y: 200, w: 80, h: 4, fill: 'var(--accent)', hasFill: true, name: 'Accent bar'
        }));
      } else if (type === 'swipe') {
        this.addElement(defaultText({
          content: 'swipe →', x: 860, y: 980, w: 180, h: 32,
          fontFamily: "'Roboto Condensed', sans-serif",
          fontSize: 18, fontWeight: 700, uppercase: true, letterSpacing: 2,
          color: '#9CA3AF', align: 'right', name:'Swipe'
        }));
      } else if (type === 'source') {
        this.addElement(defaultText({
          content: 'Source — dataset or paper · 2024',
          x: 60, y: 990, w: 600, h: 30,
          fontFamily: "'Inter', sans-serif",
          fontSize: 13, fontStyle: 'italic', color: '#9CA3AF',
          name:'Source'
        }));
      } else if (type === 'dots') {
        // 6 dots
        for (let i = 0; i < 6; i++) {
          this.addElement(defaultShape('circle', {
            x: 60 + i * 28, y: 60, w: 12, h: 12,
            fill: i < idx ? 'var(--accent)' : '#4A5568', hasFill: true,
            name: `Dot ${i+1}`
          }));
        }
      } else if (type === 'wordmark') {
        this.addElement(defaultText({
          content: 'MOHAMED HAMDY',
          x: 720, y: 60, w: 320, h: 40,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 28, fontWeight: 800, letterSpacing: 2.2, color: '#F6F3EE',
          align:'right', name:'Wordmark'
        }));
      } else if (type === 'heroWord') {
        this.addElement(defaultText({
          content: 'OVERHEATING',
          x: 60, y: 400, w: 960, h: 180,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 120, fontWeight: 800, color: 'var(--accent)',
          letterSpacing: -3, name:'Hero word'
        }));
      } else if (type === 'stat') {
        this.addElement(defaultText({
          content: '40%',
          x: 60, y: 300, w: 500, h: 220,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 200, fontWeight: 800, color: 'var(--accent)', letterSpacing: -5,
          name: 'Stat number'
        }));
      } else if (type === 'caption') {
        this.addElement(defaultText({
          content: 'Caption or supporting label goes here.',
          x: 60, y: 900, w: 900, h: 40,
          fontFamily: "'Inter', sans-serif",
          fontSize: 14, color: '#9CA3AF', name: 'Caption'
        }));
      }
    }

    // ---------- Persistence ----------
    _autosave() {
      try {
        localStorage.setItem(this.autosaveKey, JSON.stringify({
          slides: this.slides, idx: this.currentIdx,
          carouselType: this.carouselType, postType: this.postType
        }));
      } catch(e){}
    }
    saveProject(showToast) {
      this._autosave();
      if (showToast) window.HAMDY_TOAST && window.HAMDY_TOAST('Project saved to browser');
    }
    _tryLoad(showToast) {
      try {
        const raw = localStorage.getItem(this.autosaveKey);
        if (!raw) return false;
        const d = JSON.parse(raw);
        if (!d.slides || !d.slides.length) return false;
        this.slides = d.slides;
        this.currentIdx = d.idx || 0;
        this.carouselType = d.carouselType || this.carouselType;
        this.postType = d.postType || this.postType;
        if (showToast) window.HAMDY_TOAST && window.HAMDY_TOAST('Project loaded');
        return true;
      } catch(e) { return false; }
    }

    // ---------- Export ----------
    async exportPNG() {
      if (!window.html2canvas) { alert('html2canvas still loading…'); return; }
      const prevScale = this.scale;
      this.setZoom(1);
      this.select(null);
      // Wait a tick for DOM
      await new Promise(r => setTimeout(r, 50));
      const canvas = await html2canvas(this.$canvas, { backgroundColor: null, scale: 1, width: this.canvasW, height: this.canvasH, useCORS: true });
      this._downloadCanvas(canvas, `HAMDY_slide_${String(this.currentIdx+1).padStart(2,'0')}.png`);
      this.setZoom(prevScale);
    }
    async exportAllPNG() {
      if (!window.html2canvas) return;
      const prevScale = this.scale;
      const prevIdx = this.currentIdx;
      this.setZoom(1);
      this.select(null);
      for (let i = 0; i < this.slides.length; i++) {
        this.currentIdx = i;
        this._renderCanvas();
        await new Promise(r => setTimeout(r, 80));
        const canvas = await html2canvas(this.$canvas, { backgroundColor: null, scale: 1, width: this.canvasW, height: this.canvasH, useCORS: true });
        this._downloadCanvas(canvas, `HAMDY_slide_${String(i+1).padStart(2,'0')}.png`);
        await new Promise(r => setTimeout(r, 200));
      }
      this.currentIdx = prevIdx;
      this.setZoom(prevScale);
      this.render();
    }
    exportPDF() {
      // Simple print to PDF via new window
      const html = this.slides.map((s, i) => {
        const style = `width:${this.canvasW}px;height:${this.canvasH}px;background:${this._bgStyle(s)};position:relative;page-break-after:always;margin:0 auto 20px;`;
        const inner = [...s.elements].sort((a,b)=>a.zIndex-b.zIndex).map(e => {
          const base = `position:absolute;left:${e.x}px;top:${e.y}px;width:${e.w}px;height:${e.h}px;opacity:${e.opacity};transform:rotate(${e.rotation}deg);`;
          if (e.type === 'text') {
            return `<div style="${base}font-family:${e.fontFamily};font-size:${e.fontSize}px;font-weight:${e.fontWeight};color:${e.color};text-align:${e.align};line-height:${e.lineHeight};letter-spacing:${e.letterSpacing}px;text-transform:${e.uppercase?'uppercase':'none'};">${this._escape(e.content)}</div>`;
          }
          if (e.type === 'image') {
            return `<div style="${base}overflow:hidden;"><img src="${e.src}" style="width:100%;height:100%;object-fit:${e.fit};"/></div>`;
          }
          if (e.type === 'shape') {
            if (e.shape === 'triangle') {
              return `<div style="position:absolute;left:${e.x}px;top:${e.y}px;width:0;height:0;border-left:${e.w/2}px solid transparent;border-right:${e.w/2}px solid transparent;border-bottom:${e.h}px solid ${e.hasFill?e.fill:'transparent'};opacity:${e.opacity};transform:rotate(${e.rotation}deg);"></div>`;
            }
            return `<div style="${base}background:${e.hasFill?e.fill:'transparent'};${e.shape==='circle'?'border-radius:50%;':''}${e.radius?'border-radius:'+e.radius+'%;':''}${e.strokeW?'border:'+e.strokeW+'px '+(e.strokeStyle||'solid')+' '+e.stroke+';':''}"></div>`;
          }
          return '';
        }).join('');
        return `<div style="${style}">${inner}</div>`;
      }).join('');
      const w = window.open('', '_blank');
      w.document.write(`<!doctype html><html><head><title>HAMDY export</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Condensed:wght@700&family=Space+Grotesk:wght@400;700;800&display=swap" rel="stylesheet">
        <style>body{margin:0;background:#222;}@media print{body{background:#fff;}div[style*="page-break"]{margin:0 !important;}}</style>
        </head><body>${html}<script>setTimeout(()=>window.print(),600);</script></body></html>`);
      w.document.close();
    }
    _escape(s){return (s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
    copyCaptions() {
      const text = this.slides.map((s,i) => {
        const t = s.elements.filter(e => e.type==='text').map(e => e.content).join(' — ');
        return `${i+1}. [${s.label}] ${t}`;
      }).join('\n\n');
      navigator.clipboard.writeText(text);
      window.HAMDY_TOAST && window.HAMDY_TOAST('Captions copied');
    }
    _downloadCanvas(canvas, filename) {
      canvas.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 3000);
      });
    }

    destroy() { window.removeEventListener('keydown', this._keyHandler); }
  }

  // Expose factories
  window.HAMDY_EDITOR = {
    Editor,
    defaultText, defaultShape, defaultImage
  };
})();
