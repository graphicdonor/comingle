// The landing page journey: one day under the Bodhi tree, from dawn to
// night, across five chapters. Scrolling moves a camera up the steps and
// towards the tree, and the light changes with the time of day.
//
// Every keyframe list has one value per chapter. Positions are fractions of
// the painted scene (1536 × 1024); each layer image (public/landing/journey)
// is cropped to its painted area, placed by its `rect`.

export const CHAPTER_COUNT = 5;
export const ASPECT = 1536 / 1024;

export type Keys = readonly [number, number, number, number, number];
export type ColorKeys = readonly [string, string, string, string, string];

/** Where the camera looks (x and y across the painting) and how close it
 * is: the stupa at sunrise, the shrine and its lamps at dusk, and a wide
 * view with the moon at night. */
export const CAMERA = {
  focus: [0.5, 0.24, 0.48, 0.78, 0.68] as Keys,
  focusY: [0.5, 0.5, 0.5, 0.66, 0.56] as Keys,
  zoom: [1, 1.06, 1.12, 1.3, 1.1] as Keys,
};

export interface Layer {
  id: string;
  /** x, y, width, height of the cropped image within the scene. */
  rect: readonly [number, number, number, number];
  /** 0 = far away (moves little), 1 = close. */
  depth: number;
  /** Foreground layers leave the frame on their own path instead of panning. */
  exit?: { x: Keys; y: Keys; scale: Keys };
}

export const LAYERS: Layer[] = [
  { id: "mountains", rect: [0, 0.2393, 1, 0.7607], depth: 0.1 },
  { id: "valley", rect: [0, 0.4473, 1, 0.5527], depth: 0.3 },
  { id: "stupa", rect: [0, 0.2705, 0.6549, 0.7295], depth: 0.5 },
  { id: "bodhi", rect: [0.2695, 0, 0.7305, 1], depth: 0.7 },
  // Foreground: the plants step aside and the stairs drop away as we climb.
  { id: "left", rect: [0, 0.3018, 0.5293, 0.6982], depth: 1, exit: { x: [0, -0.95, -1.3, -1.3, -1.3], y: [0, 0.05, 0.1, 0.1, 0.1], scale: [1, 1.35, 1.6, 1.6, 1.6] } },
  { id: "right", rect: [0.4935, 0.2412, 0.5065, 0.7588], depth: 1, exit: { x: [0, 0.12, 0.95, 1.3, 1.3], y: [0, 0.02, 0.08, 0.1, 0.1], scale: [1, 1.1, 1.45, 1.6, 1.6] } },
  { id: "steps", rect: [0, 0.6748, 1, 0.3252], depth: 1.1, exit: { x: [0, 0, 0, 0, 0], y: [0, 0.12, 0.62, 1, 1], scale: [1, 1.18, 1.6, 1.8, 1.8] } },
];

/** Time of day: dawn, sunrise, midday, dusk, night. */
export const LIGHT = {
  skyTop: ["#3A4377", "#8FB3E0", "#9CC6EC", "#5B3F7A", "#1A2250"] as ColorKeys,
  skyBottom: ["#F2B99D", "#FFD7A3", "#EEF4F4", "#F2A07C", "#3D4680"] as ColorKeys,
  /** One light over the whole painted scene (multiplied, so white = daylight). */
  light: ["#C9C3E6", "#FFE6CC", "#FFFFFF", "#E7AFA0", "#4A5592"] as ColorKeys,
  stars: [0.3, 0, 0, 0.2, 1] as Keys,
  mist: [0.7, 0.55, 0.05, 0.2, 0.25] as Keys,
};

/** The sun rises behind the stupa, in the open sky left of the tree. */
export const SUN = { x: 0.2, size: 0.1, from: 0.4, to: 0.17 };
/** The moon comes out at night, in the same open sky. */
export const MOON = { x: 0.2, y: 0.19, w: 0.045 };

/** Diyas on the shrine (fractions of the scene), lit one by one at dusk. */
export const DIYAS: readonly (readonly [number, number])[] = [
  [988 / 1536, 812 / 1024],
  [1088 / 1536, 812 / 1024],
  [1381 / 1536, 812 / 1024],
  [1450 / 1536, 810 / 1024],
  [1033 / 1536, 868 / 1024],
  [1405 / 1536, 868 / 1024],
];

/** Stars in the open sky (left part of the screen): x, y, size in px. */
export const STARS: readonly (readonly [number, number, number])[] = Array.from({ length: 34 }, (_, i) => {
  // A fixed scatter (no randomness, so server and browser agree).
  const x = ((i * 0.6180339887) % 1) * 0.55 + 0.01;
  const y = ((i * 0.3819660113 + 0.13) % 1) * 0.4 + 0.03;
  const size = 1.5 + ((i * 7) % 5) * 0.45;
  return [x, y, size] as const;
});

/** Smooth step between keyframes. */
function step(p: number) {
  const t = Math.min(1, Math.max(0, p)) * (CHAPTER_COUNT - 1);
  const i = Math.min(CHAPTER_COUNT - 2, Math.floor(t));
  const f = t - i;
  return { i, e: f * f * (3 - 2 * f) };
}

export function at(keys: Keys, p: number): number {
  const { i, e } = step(p);
  return keys[i] + (keys[i + 1] - keys[i]) * e;
}

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));

export function colorAt(keys: ColorKeys, p: number): string {
  const { i, e } = step(p);
  const a = hex(keys[i]);
  const b = hex(keys[i + 1]);
  return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * e)).join(",")})`;
}

/** 0 → 1 as p goes from a to b. */
export const ramp = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
