// Prayer catalogue for the Practice section.
//
// Content lives in code (like src/lib/blog.ts) until there is enough of it to
// justify a CMS. Each line carries the Pali source alongside Hindi and English
// renderings so the reader can show them in parallel.
//
// Review status is tracked per language and shown to readers: nothing here is
// presented as reviewed until a qualified reviewer has signed it off. To mark
// a language reviewed, set its status to "reviewed" and fill in `reviewedBy`.

import published from "@/lib/cms/published-content.json";
import { SEED_PRAYERS } from "./prayers-seed";

export type ReviewStatus = "draft" | "reviewed";
export type TranslationLang = "hi" | "en";

export interface Localised {
  hi: string;
  en: string;
}

export interface PrayerLine {
  /** Pali in Roman script with standard diacritics. Devanagari is derived from this. */
  pi: string;
  hi: string;
  en: string;
}

export interface PrayerSection {
  heading?: Localised;
  /** How many times this section is traditionally recited, when more than once. */
  repeat?: number;
  lines: PrayerLine[];
}

export interface PrayerReview {
  status: ReviewStatus;
  reviewedBy?: string;
}

export interface Prayer {
  slug: string;
  title: { pi: string } & Localised;
  category: Localised;
  summary: Localised;
  tradition: string;
  durationMinutes: number;
  sections: PrayerSection[];
  source: {
    title: string;
    reference: string;
  };
  notes?: Localised;
  /** Rights record (PRD §9.4): licence of the text and translations, and who made them. */
  rights?: {
    licence: string;
    translator?: string;
    notes?: string;
  };
  review: {
    pali: PrayerReview;
    hi: PrayerReview;
    en: PrayerReview;
  };
  /** Chanting audio. Null until a rights-cleared recording exists. */
  audio: null | { url: string; credit: string; language: string; durationSeconds: number };
}

export { SEED_PRAYERS };

/**
 * Prayers the app shows: what is published in the CMS (fetched at build time
 * by scripts/fetch-cms-content.ts), or the built-in set before the CMS has
 * any content.
 */
export const PRAYERS: Prayer[] = (published.prayers as unknown as Prayer[]).length ? (published.prayers as unknown as Prayer[]) : SEED_PRAYERS;

export function getPrayer(slug: string): Prayer | undefined {
  return PRAYERS.find((p) => p.slug === slug);
}
