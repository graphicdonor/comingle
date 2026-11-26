// The Dhammapada: 423 verses in 26 chapters (Khuddaka Nikāya).
//
// What comes from where, kept apart on screen (literature PRD §7.3, §16):
// - Pali: the Mahāsaṅgīti edition from SuttaCentral (CC0), the source text.
// - English: F. Max Müller's translation (1881, public domain), credited.
// - Hindi translation, explanations and reflection questions: drafts
//   (scripts/generate-dhammapada-notes.ts), labelled "awaiting review"
//   until a Pali and Hindi reviewer approves them.
// The source text is built by scripts/build-dhammapada.ts.

import type { Localised } from "../practice/prayers";
import source from "./dhammapada-source.json";
import notes from "./dhammapada-notes.json";
import { COMMENTARY_STORIES } from "./dhammapada-stories";
import { COMMENTARY_SLUGS } from "./dhammapada-refs";

export * from "./dhammapada-stories";
export * from "./dhammapada-refs";

export interface DhpChapter {
  number: number;
  /** Pali name, e.g. Yamakavagga. */
  pi: string;
  title: Localised;
  from: number;
  to: number;
  intro: Localised | null;
}

export interface DhpVerse {
  n: number;
  chapter: number;
  /** Pali, one line per half-verse pair. */
  pi: string[];
  /** Müller's English. */
  en: string;
  /** When Müller translated two verses together, both numbers. */
  enWith: [number, number] | null;
  /** Hindi translation (draft). */
  hi: string | null;
  explanation: Localised | null;
  reflection: Localised | null;
  /** The commentary story this verse belongs to (Pali name). */
  vatthu: string;
}

type Notes = {
  chapters: Record<string, { intro: Localised } | undefined>;
  verses: Record<string, { hi: string; explanation: Localised; reflection: Localised } | undefined>;
};
const N = notes as unknown as Notes;

export const DHP_SOURCES = source.sources;

export const CHAPTERS: DhpChapter[] = source.chapters.map((c) => ({
  number: c.number,
  pi: c.pi,
  title: { en: c.en, hi: c.hi },
  from: c.from,
  to: c.to,
  intro: N.chapters[c.number]?.intro ?? null,
}));

export const VERSES: DhpVerse[] = source.verses.map((v) => {
  const note = N.verses[v.n];
  return {
    n: v.n,
    chapter: v.chapter,
    pi: v.pi,
    en: v.en,
    enWith: (v.enWith as [number, number] | undefined) ?? null,
    hi: note?.hi ?? null,
    explanation: note?.explanation ?? null,
    reflection: note?.reflection ?? null,
    vatthu: v.story,
  };
});

export const VERSE_COUNT = VERSES.length;

// The offline list names the stories without loading them; keep it in step.
if (COMMENTARY_STORIES.map((s) => s.slug).join() !== COMMENTARY_SLUGS.join()) throw new Error("COMMENTARY_SLUGS (dhammapada-refs.ts) is out of date");

export const getVerse = (n: number): DhpVerse | undefined => VERSES[n - 1];
export const getChapter = (n: number): DhpChapter | undefined => CHAPTERS[n - 1];
export const versesOf = (chapter: DhpChapter) => VERSES.slice(chapter.from - 1, chapter.to);


/** Roughly how long a verse takes to read with its explanation. */
export const DHP_VERSE_MINUTES = 1;
