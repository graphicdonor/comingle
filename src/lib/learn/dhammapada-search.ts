// Makes the Dhammapada's verses and commentary stories searchable. A separate
// module so the website can load it (and the whole Dhammapada) only when
// search opens; the app registers it up front.

import { addToSearch, type Entry, type Field } from "@/lib/practice/search";
import { paliToDevanagari } from "@/lib/practice/pali-devanagari";
import {
  COMMENTARY_STORIES,
  VERSES,
  commentaryHref,
  getChapter,
  verseHref,
} from "./dhammapada";

let done = false;

export function registerDhammapadaSearch() {
  if (done) return;
  done = true;
  addToSearch(() => {
    const entries: Entry[] = [];

    for (const st of COMMENTARY_STORIES) {
      const fields: Field[] = [
        { text: st.title.en, weight: 10, lang: "en" },
        { text: st.title.hi, weight: 10, lang: "hi" },
        { text: st.title.pi, weight: 10, lang: "pi" },
        {
          text: `Dhammapada ${st.verses.join(" ")} धम्मपद`,
          weight: 8,
          lang: "en",
        },
        { text: st.theme.en, weight: 6, lang: "en" },
        { text: st.theme.hi, weight: 6, lang: "hi" },
        { text: st.summary.en, weight: 3, lang: "en" },
        { text: st.summary.hi, weight: 3, lang: "hi" },
        ...st.paragraphs.flatMap((p): Field[] => [
          { text: p.en, weight: 1, lang: "en" },
          { text: p.hi, weight: 1, lang: "hi" },
        ]),
      ];
      entries.push({
        kind: "story",
        id: `dhp-${st.slug}`,
        href: commentaryHref(st.slug),
        title: st.title,
        fields,
      });
    }

    for (const v of VERSES) {
      const chapter = getChapter(v.chapter)!;
      const fields: Field[] = [
        {
          text: `Dhammapada ${v.n} dhp ${v.n} धम्मपद ${v.n}`,
          weight: 9,
          lang: "en",
        },
        { text: chapter.pi, weight: 4, lang: "pi" },
        { text: chapter.title.en, weight: 4, lang: "en" },
        { text: chapter.title.hi, weight: 4, lang: "hi" },
        ...v.pi.flatMap((line): Field[] => [
          { text: line, weight: 2, lang: "pi" },
          { text: paliToDevanagari(line), weight: 2, lang: "pi" },
        ]),
        { text: v.en, weight: 2, lang: "en" },
        ...(v.hi ? [{ text: v.hi, weight: 2, lang: "hi" as const }] : []),
        ...(v.explanation
          ? [
              { text: v.explanation.en, weight: 1, lang: "en" as const },
              { text: v.explanation.hi, weight: 1, lang: "hi" as const },
            ]
          : []),
      ];
      entries.push({
        kind: "verse",
        id: String(v.n),
        href: verseHref(v.n),
        title: {
          en: `Dhammapada ${v.n}`,
          hi: `धम्मपद ${v.n}`,
          pi: v.pi[0].replace(/[;,]\s*$/, ""),
        },
        fields,
      });
    }

    return entries;
  });
}
