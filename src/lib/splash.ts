// Splash artwork. A plain module (not "use client") so the root layout, a
// server component, can preload the images, the offline download can list
// them, and the Android app can share the same timeline.

/** The sunrise painting (see scripts/process-splash.mjs), back to front. It
 * was the splash screen; the welcome flow and the landing page still use it. */
export const SPLASH_LAYERS = [
  { src: "/splash/splash-sky-predawn.webp", className: "" },
  { src: "/splash/splash-sky-dawn.webp", className: "sp-dawn" },
  { src: "/splash/splash-rays.webp", className: "sp-rays" },
  { src: "/splash/splash-sun.webp", className: "sp-sun" },
  { src: "/splash/splash-hills-far.webp", className: "sp-far" },
  { src: "/splash/splash-mist.webp", className: "sp-mist" },
  { src: "/splash/splash-hill-near.webp", className: "sp-near" },
] as const;

// ── The lotus portal (the splash screen) ────────────────────────────────────
// Dark water; a bud rises and ripples spread; three rings of petals unfold;
// the golden centre lights up in a burst; the flower turns away as the Dharma
// wheel spins out of it and the name appears; then the camera dives through
// the wheel into the app. Artwork: scripts/process-lotus-splash.mjs.

export const LOTUS_ART = ["water", "bud", "petal-outer", "petal-inner", "centre", "wheel", "pad-1", "pad-2", "pad-3"] as const;
export type LotusArt = (typeof LOTUS_ART)[number];
export const lotusSrc = (name: LotusArt) => `/splash/lotus/${name}.webp`;

/** Where the flower sits, as a fraction of the screen height. */
export const LOTUS_Y = 0.42;

/**
 * The flower's size, L: its diameter when open. Everything below is in
 * fractions of L. Seconds count from when the artwork is ready.
 */
export const LOTUS = {
  bud: { w: 0.3, rise: 0.25, riseFor: 0.8, burst: 1.0, burstFor: 0.45 },
  ripples: [0.3, 0.75, 1.2, 2.0],
  rippleFor: 2.6,
  /** Petal rings, back to front: image, length, angle offset, first delay, delay between petals. */
  rings: [
    { img: "petal-outer", length: 0.5, offset: 0, delay: 0.95, step: 0.045, dim: 0.82 },
    { img: "petal-outer", length: 0.44, offset: 22.5, delay: 1.1, step: 0.045, dim: 1 },
    { img: "petal-inner", length: 0.3, offset: 0, delay: 1.28, step: 0.04, dim: 1 },
  ] as const,
  petalFor: 0.85,
  centre: { w: 0.24, at: 1.6, for: 0.55 },
  burst: { at: 1.95, for: 1.1 },
  specks: { at: 1.95, count: 26 },
  /** The flower turns away and the wheel spins out of it. */
  turn: { at: 2.3, for: 0.75 },
  wheel: { w: 0.6, at: 2.3, for: 1.0 },
  name: { at: 2.85 },
  tagline: { at: 3.15 },
  /** How long the whole thing plays before diving in. */
  total: 4.0,
  /** The dive through the wheel. */
  dive: 0.75,
};

const PETALS_PER_RING = 8;

/** Every petal: its ring, angle, length and when it opens. */
export const LOTUS_PETALS = LOTUS.rings.flatMap((ring, r) =>
  Array.from({ length: PETALS_PER_RING }, (_, i) => ({
    key: `${r}-${i}`,
    img: ring.img as LotusArt,
    angle: ring.offset + (i * 360) / PETALS_PER_RING,
    length: ring.length,
    dim: ring.dim,
    // Opening goes round the ring, so the bloom seems to swirl.
    delay: ring.delay + i * ring.step,
  })),
);

/** Gold specks thrown out by the burst: direction (degrees), distance (× L), size (px), delay. */
export const LOTUS_SPECKS = Array.from({ length: LOTUS.specks.count }, (_, i) => {
  // A fixed scatter (no randomness, so server and browser agree).
  const angle = (i * 137.508) % 360;
  const distance = 0.45 + ((i * 0.618) % 1) * 0.55;
  const size = 3.5 + ((i * 5) % 4) * 1.2;
  const delay = LOTUS.specks.at + ((i * 0.382) % 1) * 0.35;
  return { angle, distance, size, delay };
});

/** Lily pads drifting near the edges: x and y (fractions of the screen), width (× L), turn. */
export const LOTUS_PADS = [
  { img: "pad-1", x: 0.06, y: 0.8, w: 0.42, turn: 14 },
  { img: "pad-2", x: 0.86, y: 0.12, w: 0.36, turn: -18 },
  { img: "pad-3", x: 0.9, y: 0.7, w: 0.26, turn: 22 },
] as const;
