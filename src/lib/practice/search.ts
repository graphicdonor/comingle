// In-app search over prayers, guides, meditation practices and Jātaka tales (PRD §7.2).
//
// Everything is bundled, so search runs on the device with no server call.
// Matching ignores case and Latin diacritics (typing "tisarana" finds
// "Tisaraṇa"), works in Hindi, and matches Pali typed in Devanagari against
// the transliterated text.

import { PRAYERS } from "./prayers";
import { MEDITATIONS } from "./meditations";
import { paliToDevanagari } from "./pali-devanagari";
import { GUIDES } from "@/lib/learn/guides";
import { STORIES } from "@/lib/learn/jataka";
import type { UiLang } from "@/lib/i18n/dictionary";

export type ResultKind = "prayer" | "guide" | "meditation" | "story";

interface Field {
  text: string;
  /** Title fields rank above body text. */
  weight: number;
  /** Language the field is written in; snippets prefer the reader's language or Pali. */
  lang: UiLang | "pi";
}

interface Entry {
  kind: ResultKind;
  id: string;
  href: string;
  title: { en: string; hi: string; pi?: string };
  fields: Field[];
}

export interface SearchResult {
  kind: ResultKind;
  id: string;
  href: string;
  title: { en: string; hi: string; pi?: string };
  /** A short excerpt around the first match in body text, if the match wasn't in a title. */
  snippet?: string;
  score: number;
}

/** Lower-case and strip Latin combining marks (ā → a, ṃ → m). Devanagari is left intact. */
export function normalise(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function buildIndex(): Entry[] {
  const entries: Entry[] = [];

  for (const p of PRAYERS) {
    const fields: Field[] = [
      { text: p.title.pi, weight: 10, lang: "pi" },
      { text: p.title.en, weight: 10, lang: "en" },
      { text: p.title.hi, weight: 10, lang: "hi" },
      { text: p.category.en, weight: 6, lang: "en" },
      { text: p.category.hi, weight: 6, lang: "hi" },
      { text: p.summary.en, weight: 3, lang: "en" },
      { text: p.summary.hi, weight: 3, lang: "hi" },
    ];
    for (const section of p.sections) {
      for (const line of section.lines) {
        fields.push(
          { text: line.pi, weight: 2, lang: "pi" },
          { text: paliToDevanagari(line.pi), weight: 2, lang: "pi" },
          { text: line.en, weight: 1, lang: "en" },
          { text: line.hi, weight: 1, lang: "hi" },
        );
      }
    }
    entries.push({ kind: "prayer", id: p.slug, href: `/practice/${p.slug}`, title: { en: p.title.en, hi: p.title.hi, pi: p.title.pi }, fields });
  }

  for (const g of GUIDES) {
    const fields: Field[] = [
      { text: g.title.en, weight: 10, lang: "en" },
      { text: g.title.hi, weight: 10, lang: "hi" },
      { text: g.summary.en, weight: 3, lang: "en" },
      { text: g.summary.hi, weight: 3, lang: "hi" },
    ];
    for (const step of g.steps) {
      fields.push({ text: step.title.en, weight: 5, lang: "en" }, { text: step.title.hi, weight: 5, lang: "hi" });
      for (const b of step.body) fields.push({ text: b.en, weight: 1, lang: "en" }, { text: b.hi, weight: 1, lang: "hi" });
      for (const c of step.cues ?? []) fields.push({ text: c.text.en, weight: 1, lang: "en" }, { text: c.text.hi, weight: 1, lang: "hi" });
    }
    entries.push({ kind: "guide", id: g.slug, href: `/learn/${g.slug}`, title: g.title, fields });
  }

  for (const m of MEDITATIONS) {
    const fields: Field[] = [
      { text: m.title.en, weight: 10, lang: "en" },
      { text: m.title.hi, weight: 10, lang: "hi" },
      { text: m.pali, weight: 8, lang: "pi" },
      { text: m.summary.en, weight: 3, lang: "en" },
      { text: m.summary.hi, weight: 3, lang: "hi" },
      ...m.steps.flatMap((s): Field[] => [
        { text: s.en, weight: 1, lang: "en" },
        { text: s.hi, weight: 1, lang: "hi" },
      ]),
    ];
    entries.push({ kind: "meditation", id: m.id, href: `/meditate?practice=${m.id}`, title: { ...m.title, pi: m.pali }, fields });
  }

  for (const st of STORIES) {
    const fields: Field[] = [
      { text: st.title.en, weight: 10, lang: "en" },
      { text: st.title.hi, weight: 10, lang: "hi" },
      { text: st.title.pi, weight: 10, lang: "pi" },
      { text: `Jataka ${st.number} जातक`, weight: 8, lang: "en" },
      { text: st.theme.en, weight: 6, lang: "en" },
      { text: st.theme.hi, weight: 6, lang: "hi" },
      { text: st.summary.en, weight: 3, lang: "en" },
      { text: st.summary.hi, weight: 3, lang: "hi" },
      ...st.paragraphs.flatMap((p): Field[] => [
        { text: p.en, weight: 1, lang: "en" },
        { text: p.hi, weight: 1, lang: "hi" },
      ]),
    ];
    entries.push({ kind: "story", id: st.slug, href: `/learn/jataka/${st.slug}`, title: st.title, fields });
  }

  return entries;
}

let index: (Entry & { normalised: string[] })[] | null = null;

function getIndex() {
  index ??= buildIndex().map((e) => ({ ...e, normalised: e.fields.map((f) => normalise(f.text)) }));
  return index;
}

function excerpt(text: string, at: number, length: number): string {
  const radius = 40;
  let start = Math.max(0, at - radius);
  let end = Math.min(text.length, at + length + radius);
  // Snap to word boundaries so the excerpt never starts or ends mid-word.
  if (start > 0) {
    const space = text.indexOf(" ", start);
    if (space !== -1 && space < at) start = space + 1;
  }
  if (end < text.length) {
    const space = text.lastIndexOf(" ", end);
    if (space > at + length) end = space;
  }
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

/**
 * Every word of the query must appear somewhere in the item. Results are
 * ranked by where the words matched (titles first) and grouped by kind.
 */
export function search(query: string, lang: UiLang): SearchResult[] {
  const terms = normalise(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const results: SearchResult[] = [];
  for (const entry of getIndex()) {
    let score = 0;
    let allFound = true;
    for (const term of terms) {
      let best = 0;
      entry.normalised.forEach((text, i) => {
        if (text.includes(term)) best = Math.max(best, entry.fields[i].weight + (text.startsWith(term) ? 1 : 0));
      });
      if (best === 0) {
        allFound = false;
        break;
      }
      score += best;
    }
    if (!allFound) continue;

    // Snippet from the first body field (not a title) containing the first term,
    // preferring the reader's language, then Pali, then the other language.
    let snippet: string | undefined;
    const titleHit = entry.normalised.some((text, i) => entry.fields[i].weight >= 8 && text.includes(terms[0]));
    if (!titleHit) {
      const order = [lang, "pi", lang === "hi" ? "en" : "hi"];
      const candidates = entry.fields
        .map((f, i) => ({ f, i }))
        .filter(({ f, i }) => f.weight < 8 && entry.normalised[i].includes(terms[0]))
        .sort((a, b) => order.indexOf(a.f.lang) - order.indexOf(b.f.lang));
      const hit = candidates[0];
      if (hit) {
        // Normalising Latin text can shorten it, so locate the match in the original by position ratio.
        const at = entry.normalised[hit.i].indexOf(terms[0]);
        const ratio = hit.f.text.length / Math.max(1, entry.normalised[hit.i].length);
        snippet = excerpt(hit.f.text, Math.floor(at * ratio), terms[0].length);
      }
    }

    results.push({ kind: entry.kind, id: entry.id, href: entry.href, title: entry.title, snippet, score });
  }

  return results.sort((a, b) => b.score - a.score);
}
