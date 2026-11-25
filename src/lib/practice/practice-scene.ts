// Layout of the animated morning / evening picture at the top of Today's
// practice card, shared by the website and the Android app. Every number is
// in the painting's own pixels (1536 × 1024); each side scales it to the
// card's width. The layers live in public/illustrations/practice (website)
// and native/assets/practice (app).

export type SceneVariant = "morning" | "evening";

export const SCENE = {
  width: 1536,
  height: 1024,
  /** The sun rises from behind the hills (x, start and end of its centre). */
  sun: { x: 392, size: 165, from: 520, to: 392 },
  rays: { size: 900 },
  /** The hills in front of the rising sun, cut from the morning painting. */
  hills: { x: 200, y: 370, w: 520, h: 320 },
  mist: { x: -40, y: 440, w: 820, h: 273 },
  /** Birds cross the morning sky, left of the tree. */
  birds: { x: -80, to: 680, y: 250, rise: 40 },
  moon: { x: 400, y: 300, w: 104, h: 120 },
  /** Lamp flames in the evening painting. */
  flames: [
    [1013, 494],
    [1053, 476],
    [1333, 476],
    [920, 569],
    [1347, 570],
  ] as const,
  glow: 90,
  /** Tip of the incense stick. */
  incense: { x: 1286, y: 505, w: 40, h: 100 },
  /** Stars in the evening sky: x, y, size. */
  stars: [
    [90, 70, 9],
    [210, 128, 7],
    [335, 58, 8],
    [470, 120, 7],
    [150, 215, 6],
    [292, 196, 9],
    [60, 300, 7],
    [228, 340, 6],
    [585, 318, 7],
    [520, 372, 6],
    [400, 200, 6],
    [655, 365, 8],
  ] as const,
} as const;
