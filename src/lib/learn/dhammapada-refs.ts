// Dhammapada links and references, without the text itself, so pages that
// only link to a verse (Today's verse) don't load the whole Dhammapada.

export const DHP_VERSE_TOTAL = 423;

/** "Dhammapada 183" → 183, also "dhp 183", "धम्मपद 183", "183". */
export function parseVerseRef(text: string): number | null {
  const m = text.trim().match(/^(?:dhammapada|dhp|धम्मपद)?\s*(\d{1,3})$/i);
  const n = m ? Number(m[1]) : NaN;
  return n >= 1 && n <= DHP_VERSE_TOTAL ? n : null;
}

/** The commentary stories, in order (checked against dhammapada-stories.ts when the site builds). */
export const COMMENTARY_SLUGS = ["cakkhupala", "matthakundali", "kala-yakkhini", "kosambi-monks", "culapanthaka", "putigatta-tissa", "patacara", "kisa-gotami", "angulimala", "uttara"];

export const verseHref = (n: number) => `/learn/dhammapada/verse/${n}`;
export const chapterHref = (n: number) => `/learn/dhammapada/${n}`;
export const commentaryHref = (slug: string) => `/learn/dhammapada/stories/${slug}`;
