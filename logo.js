// Logo SVGs and small inline utilities

function logoIcon(size = 48, accent = 'var(--accent)') {
  // Isometric 3x3 grid of cubes, one taller (urban hotspot)
  // Use an SVG with clean isometric projection
  const s = size;
  return `
  <svg width="${s}" height="${s}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-label="HAMDY icon">
    <defs>
      <g id="cube">
        <!-- top face -->
        <polygon points="0,-14 24,0 0,14 -24,0" fill="#F6F3EE"/>
        <!-- left face -->
        <polygon points="-24,0 0,14 0,42 -24,28" fill="#1C1C1C"/>
        <!-- right face -->
        <polygon points="24,0 0,14 0,42 24,28" fill="${accent}"/>
      </g>
      <g id="cubeTall">
        <polygon points="0,-28 24,-14 0,0 -24,-14" fill="#F6F3EE"/>
        <polygon points="-24,-14 0,0 0,42 -24,28" fill="#1C1C1C"/>
        <polygon points="24,-14 0,0 0,42 24,28" fill="${accent}"/>
      </g>
    </defs>
    <g transform="translate(60,30)">
      <!-- back row (farthest) -->
      <use href="#cube" transform="translate(-24,-14)"/>
      <use href="#cube" transform="translate(0,-28)"/>
      <use href="#cube" transform="translate(24,-14)"/>
      <!-- middle row -->
      <use href="#cube" transform="translate(-48,0)"/>
      <use href="#cubeTall" transform="translate(-24,14)"/>
      <use href="#cube" transform="translate(0,0)"/>
      <!-- front row -->
      <use href="#cube" transform="translate(-24,28)"/>
      <use href="#cube" transform="translate(0,42)"/>
      <use href="#cube" transform="translate(24,28)"/>
    </g>
  </svg>`;
}

function logoWordmark(color = 'var(--color-cream)', accent = 'var(--accent)', fontSize = 28) {
  return `
  <div class="wm-lockup" style="display:inline-flex;flex-direction:column;gap:4px;align-items:flex-start;">
    <div style="font-family:var(--font-headline);font-weight:800;letter-spacing:0.08em;font-size:${fontSize}px;color:${color};line-height:1;">MOHAMED HAMDY</div>
    <div style="height:3px;width:100%;background:${accent};"></div>
  </div>`;
}

function logoFull(variant = 'light', size = 64, accent = 'var(--accent)') {
  // light = on dark; dark = on cream
  const textColor = variant === 'light' ? 'var(--color-cream)' : 'var(--color-black)';
  const fontSize = size * 0.42;
  return `
  <div style="display:inline-flex;align-items:center;gap:${size*0.18}px;">
    ${logoIcon(size, accent)}
    ${logoWordmark(textColor, accent, fontSize)}
  </div>`;
}

window.HAMDY_LOGO = { logoIcon, logoWordmark, logoFull };
