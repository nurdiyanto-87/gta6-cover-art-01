// Fixed scenes for screenshots: ?shot=editor shows the page with sample photos loaded;
// ?shot=cover shows the finished cover alone. Query params: photo, photo2, photo3 (sample
// names), caption, subtitle, size (square|portrait|wide), layout (layout id), grade,
// titleStyle. window.__shotReady is set once painted.
import { layoutsForSize } from './layouts.js';

export async function runShot(shot, query, api) {
  const { state, loadImage, markThumb, resizeCanvas, buildLayoutButtons, redraw } = api;
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    state.showSelection = false;
  }
  const sizeId = query.get('size') ?? 'square';
  if (sizeId !== state.sizeId) {
    state.sizeId = sizeId;
    document.querySelectorAll('#sizeRow .pill').forEach((b) => {
      b.classList.toggle('active', b.dataset.size === sizeId);
    });
  }
  const layoutId = query.get('layout');
  const layouts = layoutsForSize(state.sizeId);
  state.layout = layouts.find((l) => l.id === layoutId) ?? layouts[0];
  const grade = query.get('grade');
  if (grade) {
    state.grade = grade;
    document.getElementById('grade').value = grade;
  }
  const titleStyle = query.get('titleStyle');
  if (titleStyle) {
    state.titleStyle = titleStyle;
    document.getElementById('titleStyle').value = titleStyle;
  }
  const names = [query.get('photo') ?? 'pier', query.get('photo2') ?? 'boulevard', query.get('photo3') ?? 'pier'];
  for (let slot = 0; slot < 3; slot++) {
    state.photos[slot] = await loadImage(`samples/${names[slot]}.jpg`);
    markThumb(slot);
  }
  api.setTitle(query.get('caption') ?? 'Sunset Heist');
  api.setSubtitle(query.get('subtitle') ?? 'ONE LAST RIDE DOWN THE BOULEVARD');
  resizeCanvas();
  buildLayoutButtons();
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
