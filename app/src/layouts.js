// Poster sizes and multi-panel layouts. A layout is a list of panels in fractions of
// the photo area (the poster above the title band). Every size offers three layouts.

export const POSTER_SIZES = {
  square: { label: 'Square', width: 1080, height: 1080, titleBand: 0.17 },
  portrait: { label: 'Portrait', width: 1080, height: 1350, titleBand: 0.15 },
  wide: { label: 'Wide', width: 1920, height: 1080, titleBand: 0.19 },
};

export const LAYOUTS = {
  square: [
    { id: 'vice-grid', name: 'Vice Grid', panels: [
      { x: 0, y: 0, w: 1, h: 0.62 },
      { x: 0, y: 0.62, w: 0.5, h: 0.38 },
      { x: 0.5, y: 0.62, w: 0.5, h: 0.38 },
    ] },
    { id: 'triptych', name: 'Triptych', panels: [
      { x: 0, y: 0, w: 0.34, h: 1 },
      { x: 0.34, y: 0, w: 0.32, h: 1 },
      { x: 0.66, y: 0, w: 0.34, h: 1 },
    ] },
    { id: 'duo', name: 'Duo Split', panels: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 },
    ] },
  ],
  portrait: [
    { id: 'vice-grid', name: 'Vice Grid', panels: [
      { x: 0, y: 0, w: 1, h: 0.55 },
      { x: 0, y: 0.55, w: 0.5, h: 0.45 },
      { x: 0.5, y: 0.55, w: 0.5, h: 0.45 },
    ] },
    { id: 'stack', name: 'Sunset Stack', panels: [
      { x: 0, y: 0, w: 1, h: 0.34 },
      { x: 0, y: 0.34, w: 1, h: 0.33 },
      { x: 0, y: 0.67, w: 1, h: 0.33 },
    ] },
    { id: 'duo', name: 'Duo Split', panels: [
      { x: 0, y: 0, w: 1, h: 0.5 },
      { x: 0, y: 0.5, w: 1, h: 0.5 },
    ] },
  ],
  wide: [
    { id: 'strip', name: 'Sunset Strip', panels: [
      { x: 0, y: 0, w: 0.6, h: 1 },
      { x: 0.6, y: 0, w: 0.4, h: 0.5 },
      { x: 0.6, y: 0.5, w: 0.4, h: 0.5 },
    ] },
    { id: 'triptych', name: 'Triptych', panels: [
      { x: 0, y: 0, w: 0.34, h: 1 },
      { x: 0.34, y: 0, w: 0.32, h: 1 },
      { x: 0.66, y: 0, w: 0.34, h: 1 },
    ] },
    { id: 'duo', name: 'Duo Split', panels: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 },
    ] },
  ],
};

/** The layout list for a poster size, defaulting to the first layout. */
export function layoutsForSize(sizeId) {
  return LAYOUTS[sizeId] ?? LAYOUTS.square;
}
