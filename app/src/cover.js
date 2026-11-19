// Draws the multi-panel poster: photos in their panels with a colour grade, a striped
// sunset disc and palm silhouettes, and the big caption in the title band below.
// Everything is drawn with the canvas 2D API — no images, fonts or art from outside app/.

import { POSTER_SIZES } from './layouts.js';

const GRADES = {
  sunset: { sky: ['#2b1055', '#7597de'], tint: 'rgba(255, 110, 60, 0.20)', bottom: 'rgba(120, 10, 90, 0.45)' },
  neon: { sky: ['#12082b', '#3b0f54'], tint: 'rgba(255, 46, 136, 0.28)', bottom: 'rgba(20, 10, 80, 0.50)' },
  palm: { sky: ['#3a1c5c', '#e26d5a'], tint: 'rgba(255, 170, 60, 0.18)', bottom: 'rgba(60, 20, 60, 0.42)' },
  noir: { sky: ['#101018', '#3c3c50'], tint: 'rgba(200, 200, 220, 0.10)', bottom: 'rgba(0, 0, 0, 0.55)' },
};

const GAP = 10; // pixels of white frame between panels, scaled by poster size

/** A seeded pseudo-random number, so the grain looks the same on every redraw. */
function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Draws one procedural palm silhouette — trunk plus drooping fronds. */
function drawPalm(ctx, x, y, scale, colour) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(16, -70, 36, -130);
  ctx.stroke();
  // Fronds arc out from the crown and droop down, like a palm in silhouette.
  for (let i = 0; i < 7; i++) {
    const angle = Math.PI * (1.05 + i * 0.14); // fan from down-left to down-right over the top
    const len = 80 - Math.abs(i - 3) * 9;
    const tx = 36 + Math.cos(angle) * len;
    const ty = -130 + Math.sin(angle) * len * 0.3 + len * 0.55;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(36, -130);
    ctx.quadraticCurveTo(36 + Math.cos(angle) * len * 0.55, -130 - 30, tx, ty);
    ctx.stroke();
  }
  ctx.restore();
}

/** The striped vapourwave sun, drawn on its own canvas first so the stripe gaps stay
 *  transparent (showing the band gradient behind) instead of erasing the poster. */
function drawStripedSun(ctx, cx, cy, radius) {
  const off = document.createElement('canvas');
  off.width = Math.ceil(radius * 2 + 4);
  off.height = Math.ceil(radius * 2 + 4);
  const octx = off.getContext('2d');
  const r = radius;
  const sun = octx.createLinearGradient(0, 0, 0, r * 2);
  sun.addColorStop(0, '#ffe259');
  sun.addColorStop(0.55, '#ff7e5f');
  sun.addColorStop(1, '#ff2e88');
  octx.fillStyle = sun;
  octx.beginPath();
  octx.arc(r + 2, r + 2, r, 0, Math.PI * 2);
  octx.fill();
  octx.globalCompositeOperation = 'destination-out';
  let gap = r * 0.08;
  for (let i = 0; i < 5; i++) {
    const y = r + 2 + r * (0.02 + i * 0.16);
    octx.fillRect(0, y, r * 2 + 4, gap);
    gap *= 1.5;
  }
  ctx.drawImage(off, cx - r - 2, cy - r - 2);
}

/** Fits `text` to `maxWidth` by shrinking the font, then returns the final size. */
function fitFont(ctx, text, startSize, maxWidth, weight) {
  let size = startSize;
  ctx.font = `${weight} ${size}px "Arial Black", "Archivo Black", sans-serif`;
  while (size > 14 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px "Arial Black", "Archivo Black", sans-serif`;
  }
  return size;
}

/** Draws one photo panel: cover-fit with the panel's zoom and pan, grade tint, frame. */
function drawPanel(ctx, photo, panel, zoom, panX, panY, grade, selected) {
  const { x, y, w, h } = panel;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = '#241533';
  ctx.fillRect(x, y, w, h);
  if (photo) {
    const base = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
    const scale = base * zoom;
    const pw = photo.naturalWidth * scale;
    const ph = photo.naturalHeight * scale;
    const dx = x + (w - pw) / 2 + panX * w;
    const dy = y + (h - ph) / 2 + panY * h;
    ctx.drawImage(photo, dx, dy, pw, ph);
  } else {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#3a1c5c');
    g.addColorStop(1, '#12081f');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `700 ${Math.max(14, h * 0.07)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', x + w / 2, y + h / 2);
  }
  ctx.fillStyle = grade.tint;
  ctx.fillRect(x, y, w, h);
  const shade = ctx.createLinearGradient(0, y + h * 0.55, 0, y + h);
  shade.addColorStop(0, 'rgba(0,0,0,0)');
  shade.addColorStop(1, grade.bottom);
  ctx.fillStyle = shade;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  ctx.lineWidth = Math.max(3, w * 0.008);
  ctx.strokeStyle = selected ? '#ffe259' : '#ffffff';
  ctx.strokeRect(x, y, w, h);
  if (selected) {
    ctx.fillStyle = '#ffe259';
    const label = 'SELECTED PANEL';
    ctx.font = `800 ${Math.max(11, w * 0.022)}px system-ui, sans-serif`;
    const tw = ctx.measureText(label).width;
    ctx.fillRect(x, y, tw + 16, Math.max(20, w * 0.045));
    ctx.fillStyle = '#1d0b26';
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 8, y + Math.max(15, w * 0.033));
  }
}

/** Draws the title band: sunset gradient, striped sun, palms, title and tagline. */
function drawTitleBand(ctx, state, bandY, bandH, width) {
  const band = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
  band.addColorStop(0, '#ff7e5f');
  band.addColorStop(0.5, '#ff2e88');
  band.addColorStop(1, '#7b1fa2');
  ctx.fillStyle = band;
  ctx.fillRect(0, bandY, width, bandH);
  drawStripedSun(ctx, width / 2, bandY + bandH * 0.40, bandH * 0.42);
  drawPalm(ctx, width * 0.012, bandY + bandH * 0.98, bandH / 230, 'rgba(30,8,40,0.8)');
  drawPalm(ctx, width * 0.988, bandY + bandH * 0.98, bandH / 250, 'rgba(30,8,40,0.8)');

  const title = (state.title || '').trim().toUpperCase();
  const tagline = (state.subtitle || '').trim().toUpperCase();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (title) {
    const size = fitFont(ctx, title, bandH * 0.46, width * 0.92, 900);
    const ty = bandY + bandH * 0.40;
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.16;
    ctx.strokeStyle = 'rgba(20,5,35,0.9)';
    ctx.strokeText(title, width / 2, ty);
    if (state.titleStyle === 'sunset') {
      const fill = ctx.createLinearGradient(0, ty - size / 2, 0, ty + size / 2);
      fill.addColorStop(0, '#fff7ae');
      fill.addColorStop(0.5, '#ffb347');
      fill.addColorStop(1, '#ff5e62');
      ctx.fillStyle = fill;
    } else if (state.titleStyle === 'neon') {
      ctx.shadowColor = '#ff2e88';
      ctx.shadowBlur = size * 0.35;
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.fillStyle = '#ffffff';
    }
    ctx.fillText(title, width / 2, ty);
    ctx.shadowBlur = 0;
  }
  if (tagline) {
    const subSize = Math.max(13, bandH * 0.13);
    ctx.font = `700 ${subSize}px system-ui, sans-serif`;
    try { ctx.letterSpacing = `${subSize * 0.22}px`; } catch { /* older canvas: no letter spacing */ }
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillText(tagline, width / 2, bandY + bandH * 0.85);
    try { ctx.letterSpacing = '0px'; } catch { /* reset */ }
  }
}

/**
 * Draws the whole poster onto `canvas` at its own size.
 * state: { sizeId, layout, photos, panelPhoto, zoom, panX, panY, title, subtitle,
 *           titleStyle, grade, selectedPanel, showSelection }
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  const size = POSTER_SIZES[state.sizeId] ?? POSTER_SIZES.square;
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const bandH = Math.round(H * size.titleBand);
  const photoH = H - bandH;
  const gap = Math.max(4, Math.round(GAP * (W / 1080)));

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(1, grade.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const panels = state.layout.panels.map((p) => ({
    x: Math.round(p.x * W + gap),
    y: Math.round(p.y * photoH + gap),
    w: Math.round(p.w * W - gap * 2),
    h: Math.round(p.h * photoH - gap * 2),
  }));
  panels.forEach((panel, i) => {
    const photo = state.photos[state.panelPhoto[i]] ?? null;
    drawPanel(ctx, photo, panel, state.zoom[i] ?? 1, state.panX[i] ?? 0, state.panY[i] ?? 0,
      grade, state.showSelection && state.selectedPanel === i);
  });

  drawTitleBand(ctx, state, photoH, bandH, W);

  // Film grain + vignette for a printed-poster feel.
  const rand = seededRandom(W * 31 + H * 17 + 7);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < 700; i++) {
    ctx.fillRect(rand() * W, rand() * H, 1.6, 1.6);
  }
  const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  return panels;
}

/** Panel rectangles in canvas pixels, for hit-testing clicks on the preview. */
export function panelRects(canvas, state) {
  return drawCoverRects(canvas, state);
}

function drawCoverRects(canvas, state) {
  const { width: W, height: H } = canvas;
  const size = POSTER_SIZES[state.sizeId] ?? POSTER_SIZES.square;
  const bandH = Math.round(H * size.titleBand);
  const photoH = H - bandH;
  const gap = Math.max(4, Math.round(GAP * (W / 1080)));
  return state.layout.panels.map((p) => ({
    x: Math.round(p.x * W + gap),
    y: Math.round(p.y * photoH + gap),
    w: Math.round(p.w * W - gap * 2),
    h: Math.round(p.h * photoH - gap * 2),
  }));
}
