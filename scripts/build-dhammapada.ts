// Builds the Dhammapada's source text (src/lib/learn/dhammapada-source.json)
// from two public-domain sources kept in scripts/data/dhammapada:
//
//   dhp*_root-pli-ms.json  Pali, Mahāsaṅgīti edition, from SuttaCentral's
//                          bilara-data (CC0). Also names the commentary
//                          story (vatthu) that each verse belongs to.
//   muller.txt             English, F. Max Müller (1881), Project Gutenberg
//                          eBook #2017 (public domain).
//
//   npx tsx scripts/build-dhammapada.ts
//
// Hindi translations, explanations and reflections are drafts made
// separately (scripts/generate-dhammapada-notes.ts).

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..");
const DATA = join(ROOT, "scripts/data/dhammapada");

/** The 26 chapters (vagga): Pali name, English and Hindi display titles. */
const CHAPTERS: { pi: string; en: string; hi: string }[] = [
  { pi: "Yamakavagga", en: "The Pairs", hi: "जोड़े" },
  { pi: "Appamādavagga", en: "Heedfulness", hi: "अप्रमाद" },
  { pi: "Cittavagga", en: "The Mind", hi: "चित्त" },
  { pi: "Pupphavagga", en: "Flowers", hi: "पुष्प" },
  { pi: "Bālavagga", en: "The Fool", hi: "मूर्ख" },
  { pi: "Paṇḍitavagga", en: "The Wise", hi: "पंडित" },
  { pi: "Arahantavagga", en: "The Worthy", hi: "अर्हत" },
  { pi: "Sahassavagga", en: "Thousands", hi: "सहस्र" },
  { pi: "Pāpavagga", en: "Evil", hi: "पाप" },
  { pi: "Daṇḍavagga", en: "Violence", hi: "दंड" },
  { pi: "Jarāvagga", en: "Old Age", hi: "जरा" },
  { pi: "Attavagga", en: "The Self", hi: "आत्म" },
  { pi: "Lokavagga", en: "The World", hi: "लोक" },
  { pi: "Buddhavagga", en: "The Buddha", hi: "बुद्ध" },
  { pi: "Sukhavagga", en: "Happiness", hi: "सुख" },
  { pi: "Piyavagga", en: "Affection", hi: "प्रिय" },
  { pi: "Kodhavagga", en: "Anger", hi: "क्रोध" },
  { pi: "Malavagga", en: "Impurities", hi: "मल" },
  { pi: "Dhammaṭṭhavagga", en: "The Just", hi: "धर्मनिष्ठ" },
  { pi: "Maggavagga", en: "The Path", hi: "मार्ग" },
  { pi: "Pakiṇṇakavagga", en: "Miscellaneous", hi: "प्रकीर्ण" },
  { pi: "Nirayavagga", en: "Hell", hi: "नरक" },
  { pi: "Nāgavagga", en: "The Elephant", hi: "नाग" },
  { pi: "Taṇhāvagga", en: "Craving", hi: "तृष्णा" },
  { pi: "Bhikkhuvagga", en: "The Monk", hi: "भिक्षु" },
  { pi: "Brāhmaṇavagga", en: "The Worthy One", hi: "ब्राह्मण" },
];

// The app writes the niggahīta as ṃ (SuttaCentral uses ṁ).
const pali = (s: string) => s.trim().replace(/ṁ/g, "ṃ").replace(/Ṁ/g, "Ṃ");

// ── Pali ──────────────────────────────────────────────────────────────────
const segments: Record<string, string> = {};
for (const f of readdirSync(DATA).filter((f) => f.endsWith("_root-pli-ms.json")))
  Object.assign(segments, JSON.parse(readFileSync(join(DATA, f), "utf8")));

interface Verse {
  n: number;
  chapter: number;
  /** Pali, one line per pāda pair as printed. */
  pi: string[];
  en: string;
  /** Müller sometimes translates two verses together: both share one English text. */
  enWith?: [number, number];
  /** The commentary story this verse belongs to (Pali name). */
  story: string;
}

const verses: Verse[] = [];
const chapterStarts: number[] = [];
let story = "";
for (let n = 1; n <= 423; n++) {
  const keys = Object.keys(segments)
    .filter((k) => k.startsWith(`dhp${n}:`))
    .sort((a, b) => {
      const [x, y] = [a, b].map((k) => k.split(":")[1].split(".").map(Number));
      return x[0] - y[0] || (x[1] ?? 0) - (y[1] ?? 0);
    });
  const heads = keys.filter((k) => k.split(":")[1].startsWith("0")).map((k) => pali(segments[k]));
  // Headings: collection, book, chapter (vagga), story (vatthu); only what changes is given.
  const vagga = heads.find((h) => h.endsWith("vagga"));
  if (vagga) chapterStarts.push(n);
  const vatthu = heads.find((h) => h.endsWith("vatthu") || h.endsWith("vatthūni"));
  if (vatthu) story = vatthu;
  // Leave out the chapter's closing line ("Pāpavaggo navamo."), which follows its last verse.
  const lines = keys
    .filter((k) => !k.split(":")[1].startsWith("0"))
    .map((k) => pali(segments[k]))
    .filter((l) => !/^\S+vaggo\s/.test(l));
  // After the last verse comes the book's closing summary (uddāna), from "Ettāvatā" on.
  const end = lines.findIndex((l) => l.startsWith("Ettāvatā"));
  if (end >= 0) lines.length = end;
  // Verse 416 belongs to two stories and the source prints it again under the
  // second story's heading ("Jotikattheravatthu …"); keep it once.
  const again = lines.findIndex((l) => /\S+vatthu\b/.test(l));
  if (again >= 0) lines.length = again;
  // Two pādas to a line, as verses are usually printed.
  const pi: string[] = [];
  for (let i = 0; i < lines.length; i += 2) pi.push(lines.slice(i, i + 2).join(" "));
  verses.push({ n, chapter: chapterStarts.length, pi, en: "", story });
}
if (chapterStarts.length !== 26) throw new Error(`Expected 26 chapters, found ${chapterStarts.length}`);

// ── English (Müller) ──────────────────────────────────────────────────────
const txt = readFileSync(join(DATA, "muller.txt"), "utf8");
const body = txt.slice(txt.indexOf("Chapter I. The Twin-Verses"), txt.indexOf("*** END"));
for (const para of body.split(/\n\s*\n/)) {
  const p = para.split(/\s+/).join(" ").trim();
  const m = p.match(/^(\d+)(?:,\s*(\d+))?\.\s+(.*)$/);
  if (!m) continue;
  const a = Number(m[1]);
  const b = m[2] ? Number(m[2]) : null;
  const en = m[3].replace(/--/g, "—");
  for (const n of b ? [a, b] : [a]) {
    const v = verses[n - 1];
    v.en = en;
    if (b) v.enWith = [a, b];
  }
}
// The Gutenberg transcription dropped Müller's verse 127 and numbered his
// 128 as 127 (both begin "Not in the sky, not in the midst of the sea…").
// Restore both from his 1881 text (Sacred Books of the East, vol. X).
const SKY = "Not in the sky, not in the midst of the sea, not if we enter into the clefts of the mountains, is there known a spot in the whole world where ";
if (verses[126].en.includes("death could not overcome")) {
  verses[126].en = `${SKY}a man might be freed from an evil deed.`;
  verses[127].en = `${SKY}death could not overcome (the mortal).`;
}
const missing = verses.filter((v) => !v.en).map((v) => v.n);
if (missing.length) throw new Error(`No English for verses ${missing.join(", ")}`);

const chapters = CHAPTERS.map((c, i) => ({
  number: i + 1,
  ...c,
  from: chapterStarts[i],
  to: (chapterStarts[i + 1] ?? 424) - 1,
}));

const out = {
  sources: {
    pi: { title: "Dhammapada, Mahāsaṅgīti Tipiṭaka edition", by: "SuttaCentral (bilara-data)", licence: "CC0, public domain", url: "https://suttacentral.net/dhp" },
    en: { title: "The Dhammapada", by: "F. Max Müller (1881)", licence: "Public domain", url: "https://www.gutenberg.org/ebooks/2017" },
  },
  chapters,
  verses,
};
writeFileSync(join(ROOT, "src/lib/learn/dhammapada-source.json"), JSON.stringify(out, null, 1) + "\n");
console.log(`${chapters.length} chapters, ${verses.length} verses, ${verses.filter((v) => v.enWith).length} sharing an English text.`);
console.log(chapters.map((c) => `${c.number} ${c.pi} ${c.from}–${c.to}`).join("\n"));
