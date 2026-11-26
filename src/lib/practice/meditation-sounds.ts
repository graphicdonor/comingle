// The meditation timer's sounds, synthesised (no recordings, so no rights to
// clear). The website renders them in the browser; the Android app plays the
// same sounds as files made from this code (scripts/make-meditation-sounds.ts).
//
// - Bell: a soft bowl-like strike to begin.
// - End bell: three strikes, so the end is never mistaken for a chime.
// - Chime: a lighter, higher tone to mark time (halfway, every few minutes).
// - Breath: one 10-second cycle that swells for 4 s (breathe in) and ebbs for
//   6 s (breathe out), like a soft wave; silent at both ends, so it can be
//   played cycle after cycle in time with the breathing circle.

export const BREATH_IN_MS = 4000;
export const BREATH_CYCLE_MS = 10_000;

/** A small seeded random generator, so every rendering sounds the same. */
function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Struck partials with exponential decay: a bowl or chime. */
function strike(out: Float32Array, sampleRate: number, at: number, partials: readonly (readonly [number, number, number])[], level: number) {
  const start = Math.floor(at * sampleRate);
  const attack = Math.floor(0.012 * sampleRate);
  for (let i = start; i < out.length; i++) {
    const t = (i - start) / sampleRate;
    const a = i - start < attack ? (i - start) / attack : 1;
    let v = 0;
    // Each partial: frequency, loudness, decay time (s). A slow beat between
    // near partials gives the shimmer of a real bowl.
    for (const [f, l, d] of partials) v += l * Math.exp(-t / d) * Math.sin(2 * Math.PI * f * t);
    out[i] += level * a * v;
  }
}

const BOWL = [
  [432, 1, 2.6],
  [434.5, 0.5, 2.4],
  [1080, 0.32, 1.4],
  [1990, 0.13, 0.8],
] as const;

const CHIME = [
  [864, 1, 1.6],
  [867, 0.45, 1.5],
  [2177, 0.22, 0.7],
  [3980, 0.06, 0.35],
] as const;

function normalise(out: Float32Array, peak: number) {
  let max = 0;
  for (const v of out) max = Math.max(max, Math.abs(v));
  if (max > 0) for (let i = 0; i < out.length; i++) out[i] *= peak / max;
  return out;
}

export function renderBell(sampleRate: number): Float32Array {
  const out = new Float32Array(Math.ceil(7 * sampleRate));
  strike(out, sampleRate, 0, BOWL, 1);
  return normalise(out, 0.5);
}

export function renderEndBell(sampleRate: number): Float32Array {
  const out = new Float32Array(Math.ceil(11 * sampleRate));
  // Three strikes, each a little softer, like a teacher closing a sitting.
  [0, 2.6, 5.2].forEach((at, i) => strike(out, sampleRate, at, BOWL, 1 - i * 0.18));
  return normalise(out, 0.5);
}

export function renderChime(sampleRate: number): Float32Array {
  const out = new Float32Array(Math.ceil(4.5 * sampleRate));
  strike(out, sampleRate, 0, CHIME, 1);
  return normalise(out, 0.3);
}

/** How full the breath is at time t (s) in the cycle: 0 → 1 over 4 s, back to 0 over 6 s. */
function breathEnvelope(t: number) {
  const inS = BREATH_IN_MS / 1000;
  const outS = (BREATH_CYCLE_MS - BREATH_IN_MS) / 1000;
  if (t < inS) return 0.5 - 0.5 * Math.cos((Math.PI * t) / inS);
  const u = (t - inS) / outS;
  return Math.pow(0.5 + 0.5 * Math.cos(Math.PI * Math.min(1, u)), 1.4);
}

export function renderBreath(sampleRate: number): Float32Array {
  const n = Math.round((BREATH_CYCLE_MS / 1000) * sampleRate);
  const out = new Float32Array(n);
  const rnd = random(108);
  let brown = 0;
  let low = 0;
  let air = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const e = breathEnvelope(t);
    const white = rnd() * 2 - 1;
    // Deep, soft body of the wave: brown noise, brighter as the breath fills.
    brown = (brown + 0.02 * white) / 1.02;
    const cutoff = 260 + 900 * e;
    low += (1 - Math.exp((-2 * Math.PI * cutoff) / sampleRate)) * (brown * 3.5 - low);
    // A little "air" on top, only near the fullest point.
    air += (1 - Math.exp((-2 * Math.PI * 2400) / sampleRate)) * (white - air);
    const tone = 0.05 * Math.sin(2 * Math.PI * 108 * t) + 0.03 * Math.sin(2 * Math.PI * 162 * t);
    out[i] = e * (low + 0.06 * air * e) + e * e * tone;
  }
  // Exactly silent at both ends, so cycles join without a click.
  const fade = Math.floor(0.03 * sampleRate);
  for (let i = 0; i < fade; i++) {
    out[i] *= i / fade;
    out[n - 1 - i] *= i / fade;
  }
  return normalise(out, 0.32);
}

// ── Choices, kept on the device ──────────────────────────────────────────

export const CHIME_OPTIONS = ["off", "half", "5", "1"] as const;
export type ChimeOption = (typeof CHIME_OPTIONS)[number];

/** Seconds into the session at which the chime sounds; never at the start or the end. */
export function chimeTimes(option: ChimeOption, totalSeconds: number): number[] {
  if (option === "off") return [];
  if (option === "half") return totalSeconds >= 120 ? [Math.round(totalSeconds / 2)] : [];
  const every = Number(option) * 60;
  const times: number[] = [];
  for (let s = every; s < totalSeconds - 20; s += every) times.push(s);
  return times;
}
