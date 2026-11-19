// Wires the cover studio: photo uploads, panel picking, drag-to-pan, zoom, size/layout
// switches, caption editing and PNG export. A `?shot=` query sets up a fixed scene
// for a screenshot instead (./shots.js).
import { drawCover, panelRects } from './cover.js';
import { POSTER_SIZES, layoutsForSize } from './layouts.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const titleStyleInput = document.getElementById('titleStyle');
const gradeInput = document.getElementById('grade');
const zoomInput = document.getElementById('zoom');
const status = document.getElementById('status');

const state = {
  sizeId: 'square',
  layout: layoutsForSize('square')[0],
  photos: [null, null, null],
  panelPhoto: [0, 1, 2],
  zoom: [1, 1, 1],
  panX: [0, 0, 0],
  panY: [0, 0, 0],
  title: titleInput.value,
  subtitle: subtitleInput.value,
  titleStyle: titleStyleInput.value,
  grade: gradeInput.value,
  selectedPanel: 0,
  showSelection: true,
};

function redraw() {
  drawCover(canvas, state);
}

function resizeCanvas() {
  const size = POSTER_SIZES[state.sizeId];
  canvas.width = size.width;
  canvas.height = size.height;
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function markThumb(slot) {
  const thumb = document.getElementById(`thumb${slot}`);
  const photo = state.photos[slot];
  if (photo) {
    thumb.classList.add('loaded');
    thumb.style.backgroundImage = `url(${photo.src})`;
    thumb.textContent = '';
  } else {
    thumb.classList.remove('loaded');
    thumb.style.backgroundImage = '';
    thumb.textContent = '＋ add';
  }
}

function selectPhotoSlot(slot) {
  document.querySelectorAll('.thumb').forEach((t) => t.classList.remove('selected'));
  const thumb = document.getElementById(`thumb${slot}`);
  if (thumb) thumb.classList.add('selected');
  state.panelPhoto[state.selectedPanel] = slot;
  redraw();
}

function buildLayoutButtons() {
  const row = document.getElementById('layoutRow');
  row.innerHTML = '';
  layoutsForSize(state.sizeId).forEach((layout, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pill' + (state.layout.id === layout.id ? ' layout-active' : '');
    button.textContent = layout.name;
    button.addEventListener('click', () => {
      state.layout = layout;
      state.selectedPanel = 0;
      state.zoom = state.zoom.map(() => 1);
      state.panX = state.panX.map(() => 0);
      state.panY = state.panY.map(() => 0);
      zoomInput.value = '100';
      buildLayoutButtons();
      redraw();
    });
    row.appendChild(button);
  });
}

document.querySelectorAll('#sizeRow .pill').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('#sizeRow .pill').forEach((b) => b.classList.remove('active'));
    button.classList.add('active');
    state.sizeId = button.dataset.size;
    state.layout = layoutsForSize(state.sizeId)[0];
    state.selectedPanel = 0;
    resizeCanvas();
    buildLayoutButtons();
    redraw();
  });
});

for (let slot = 0; slot < 3; slot++) {
  document.getElementById(`photo${slot}`).addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    state.photos[slot] = await loadImage(URL.createObjectURL(file));
    markThumb(slot);
    selectPhotoSlot(slot);
    status.textContent = `Photo ${slot + 1} loaded — click a panel, then a photo, to place it.`;
  });
  document.getElementById(`thumb${slot}`).addEventListener('click', () => selectPhotoSlot(slot));
}

document.getElementById('samples').addEventListener('click', async () => {
  const names = ['pier', 'boulevard', 'pier'];
  for (let slot = 0; slot < 3; slot++) {
    if (!state.photos[slot]) {
      state.photos[slot] = await loadImage(`samples/${names[slot]}.jpg`);
      markThumb(slot);
    }
  }
  status.textContent = 'Sample photos loaded — swap in your own photos any time.';
  redraw();
});

document.getElementById('fillAll').addEventListener('click', () => {
  if (!state.photos[0]) { status.textContent = 'Add Photo 1 first.'; return; }
  state.panelPhoto = state.panelPhoto.map(() => 0);
  status.textContent = 'Every panel now shows Photo 1 — click a panel and a photo to change one.';
  redraw();
});

titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });
titleStyleInput.addEventListener('change', () => { state.titleStyle = titleStyleInput.value; redraw(); });
gradeInput.addEventListener('change', () => { state.grade = gradeInput.value; redraw(); });
zoomInput.addEventListener('input', () => {
  state.zoom[state.selectedPanel] = Number(zoomInput.value) / 100;
  redraw();
});

/** Click a panel to select it; drag on the preview to pan that panel's photo. */
function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

let dragging = false;
let dragStart = null;
let dragPan = null;

canvas.addEventListener('pointerdown', (event) => {
  const point = canvasPoint(event);
  const rects = panelRects(canvas, state);
  const hit = rects.findIndex((r) => point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h);
  if (hit === -1) return;
  state.selectedPanel = hit;
  zoomInput.value = String(Math.round((state.zoom[hit] ?? 1) * 100));
  dragging = true;
  dragStart = point;
  dragPan = { x: state.panX[hit], y: state.panY[hit] };
  canvas.setPointerCapture(event.pointerId);
  redraw();
});

canvas.addEventListener('pointermove', (event) => {
  if (!dragging || !dragStart) return;
  const point = canvasPoint(event);
  const rects = panelRects(canvas, state);
  const panel = rects[state.selectedPanel];
  state.panX[state.selectedPanel] = dragPan.x + (point.x - dragStart.x) / panel.w;
  state.panY[state.selectedPanel] = dragPan.y + (point.y - dragStart.y) / panel.h;
  redraw();
});

canvas.addEventListener('pointerup', () => { dragging = false; dragStart = null; });

/** Exports the poster at its exact post size as a PNG download. */
export function exportPoster() {
  const size = POSTER_SIZES[state.sizeId];
  const offscreen = document.createElement('canvas');
  offscreen.width = size.width;
  offscreen.height = size.height;
  drawCover(offscreen, { ...state, showSelection: false });
  return new Promise((resolve) => {
    offscreen.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-city-cover-${size.width}x${size.height}.png`;
      a.click();
      status.textContent = `Saved vice-city-cover-${size.width}x${size.height}.png`;
      resolve({ width: size.width, height: size.height, bytes: blob.size });
    }, 'image/png');
  });
}

document.getElementById('export').addEventListener('click', exportPoster);

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), {
    state, loadImage, markThumb, resizeCanvas, buildLayoutButtons, redraw,
    setTitle: (text) => { titleInput.value = text; state.title = text; },
    setSubtitle: (text) => { subtitleInput.value = text; state.subtitle = text; },
  });
} else {
  resizeCanvas();
  buildLayoutButtons();
  redraw();
}
