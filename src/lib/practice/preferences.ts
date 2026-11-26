"use client";
import { createLocalStore } from "./local-store";
import type { TranslationLang } from "./prayers";

export type DisplayMode = "pali" | "both" | "translation";
export type PaliScript = "roman" | "devanagari";

export interface ReadingPrefs {
  mode: DisplayMode;
  translation: TranslationLang;
  script: PaliScript;
  /** Text scale step, 0 is the default size. */
  size: number;
  /** Keep the screen on during guided sessions and meditation. */
  keepAwake: boolean;
}

export const TEXT_SIZE_MIN = -1;
export const TEXT_SIZE_MAX = 3;

const DEFAULT_PREFS: ReadingPrefs = { mode: "both", translation: "hi", script: "roman", size: 0, keepAwake: true };

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export const readingPrefs = createLocalStore<ReadingPrefs>("practice:prefs", DEFAULT_PREFS, (raw) => {
  const r = (raw ?? {}) as Partial<ReadingPrefs>;
  const size = typeof r.size === "number" ? Math.min(TEXT_SIZE_MAX, Math.max(TEXT_SIZE_MIN, Math.round(r.size))) : 0;
  return {
    mode: pick(r.mode, ["pali", "both", "translation"] as const, DEFAULT_PREFS.mode),
    translation: pick(r.translation, ["hi", "en"] as const, DEFAULT_PREFS.translation),
    script: pick(r.script, ["roman", "devanagari"] as const, DEFAULT_PREFS.script),
    size,
    keepAwake: typeof r.keepAwake === "boolean" ? r.keepAwake : DEFAULT_PREFS.keepAwake,
  };
});

/** Recently opened prayers, most recent first. Stays on this device. */
export const recentPrayers = createLocalStore<string[]>("practice:recent", [], (raw) =>
  Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string").slice(0, 5) : [],
);

export function markPrayerOpened(slug: string) {
  const current = recentPrayers.get();
  if (current[0] === slug) return;
  recentPrayers.set([slug, ...current.filter((s) => s !== slug)].slice(0, 5));
}

export const favourites = createLocalStore<string[]>("practice:favourites", [], (raw) =>
  Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string") : [],
);

export function toggleFavourite(slug: string) {
  const current = favourites.get();
  favourites.set(current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]);
}

/** Whether the first-launch welcome screens have been completed or skipped. */
export const welcomeDone = createLocalStore<boolean>("practice:welcomed", false, (raw) => raw === true, true);

/** Sounds for sitting with eyes closed (meditation timer). */
export interface MeditationSoundPrefs {
  /** A soft swell to breathe with: in 4 s, out 6 s. */
  breath: boolean;
  /** When a light chime marks time: off, halfway, every 5 minutes, every minute. */
  chime: "off" | "half" | "5" | "1";
}

export const meditationSounds = createLocalStore<MeditationSoundPrefs>("practice:meditation-sounds", { breath: false, chime: "half" }, (raw) => {
  const r = (raw ?? {}) as Partial<MeditationSoundPrefs>;
  return { breath: r.breath === true, chime: pick(r.chime, ["off", "half", "5", "1"] as const, "half") };
});
