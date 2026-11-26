// Drafts the Dhammapada's Hindi translations, explanations and reflection
// questions with an OpenAI model, once, ahead of time, into
// src/lib/learn/dhammapada-notes.json. Everything here is a DRAFT: the app
// labels it "awaiting review" until a reviewer approves it in the CMS. The
// Pali and the English (Müller) are the sources and are never changed here.
//
//   npx tsx scripts/generate-dhammapada-notes.ts             # whatever is missing
//   npx tsx scripts/generate-dhammapada-notes.ts --verses 1-12
//   npx tsx scripts/generate-dhammapada-notes.ts --redo 5,183
//
// Reads OPENAI_API_KEY from .env.local. Re-running only fills gaps.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import source from "../src/lib/learn/dhammapada-source.json";

const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "src/lib/learn/dhammapada-notes.json");
const MODEL = process.env.NOTES_MODEL ?? "gpt-5.5";
const BATCH = 6;
const PARALLEL = 4;

type Pair = { en: string; hi: string };
interface VerseNote { hi: string; explanation: Pair; reflection: Pair }
interface Notes {
  model: string;
  chapters: Record<string, { intro: Pair }>;
  verses: Record<string, VerseNote>;
}

function env(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  const file = join(ROOT, ".env.local");
  if (!existsSync(file)) return undefined;
  const line = readFileSync(file, "utf8").split("\n").find((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim().replace(/^["']|["']$/g, "") || undefined;
}

const GUIDE = `You prepare draft study material for WePray, a Buddhist practice app for Hindi- and English-speaking readers, many of them new to Buddhism. Your drafts will be checked by Pali and Hindi reviewers before they are approved.

House rules:
- Hindi is natural, clear modern Hindi in Devanagari, the way a thoughtful teacher would write for families in India. Use established Hindi Buddhist vocabulary (धम्म, बुद्ध, भिक्षु, निब्बान/निर्वाण, तृष्णा, अप्रमाद, शील, पुण्य, पाप, अर्हत). Do not write literal word-for-word Hindi of English sentences.
- Follow mainstream Theravāda understanding of the Dhammapada and its commentary. Do not present one school's view as the only one, do not compare traditions, and do not invent history, names or dates.
- Be warm and plain. No preaching, no fear, no guilt, no exclamation marks, no emojis.
- Readers are of every gender. In Hindi, never use first- or second-person verb forms that mark gender (not "मैं कर सकता हूँ" / "सकती हूँ", "तुम करते हो"); phrase questions around the subject instead ("मेरे लिए क्या…", "मुझे क्या…", "क्या है जो…", "किस बात से…").
- In chapter 26, "brāhmaṇa" means a person who is truly pure (an arahant), not a caste; in chapter 22 "niraya" is a state of suffering. Explain such words where they appear; never endorse caste.`;

const VERSE_TASK = `For each verse below you get the Pali (Mahāsaṅgīti edition) and F. Max Müller's 1881 English translation (for reference only; it is sometimes dated).

Return for each verse:
- "hi": a faithful Hindi TRANSLATION of the Pali verse itself (not of Müller, not a paraphrase, no added explanation). Keep its images and its order of ideas, about as long as the verse.
- "explanation": "en" and "hi", 2 to 3 short sentences (at most 60 words each) explaining what the verse means and how it applies to life today. If the verse continues the one before (a pair or a run on one theme), you may say so.
- "reflection": "en" and "hi", one gentle, open question for personal reflection, under 20 words, never judgmental.`;

const CHAPTER_TASK = `Write a short introduction to this chapter of the Dhammapada for readers about to read its verses: "en" and "hi", 2 to 3 sentences (at most 55 words each), saying what the chapter is about and what thread runs through its verses. No verse quotations.`;

const pairSchema = { type: "object", additionalProperties: false, required: ["en", "hi"], properties: { en: { type: "string" }, hi: { type: "string" } } };
const verseSchema = {
  name: "verse_notes",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["verses"],
    properties: {
      verses: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["n", "hi", "explanation", "reflection"],
          properties: { n: { type: "integer" }, hi: { type: "string" }, explanation: pairSchema, reflection: pairSchema },
        },
      },
    },
  },
};
const chapterSchema = { name: "chapter_intro", strict: true, schema: { type: "object", additionalProperties: false, required: ["intro"], properties: { intro: pairSchema } } };

async function ask<T>(key: string, task: string, input: string, schema: object): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        reasoning_effort: "medium",
        messages: [
          { role: "system", content: GUIDE },
          { role: "user", content: `${task}\n\n${input}` },
        ],
        response_format: { type: "json_schema", json_schema: schema },
      }),
    });
    if (res.ok) {
      const body = (await res.json()) as { choices: { message: { content: string } }[] };
      return JSON.parse(body.choices[0].message.content) as T;
    }
    const err = await res.text();
    if (attempt >= 4 || (res.status < 500 && res.status !== 429)) throw new Error(`${res.status}: ${err.slice(0, 300)}`);
    await new Promise((r) => setTimeout(r, 4000 * attempt));
  }
}

function range(arg: string | undefined): Set<number> | null {
  if (!arg) return null;
  const out = new Set<number>();
  for (const part of arg.split(",")) {
    const [a, b] = part.split("-").map(Number);
    for (let n = a; n <= (b || a); n++) out.add(n);
  }
  return out;
}

async function main() {
  const key = env("OPENAI_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY is empty. Add it to .env.local (that file is not committed).");
  const args = process.argv.slice(2);
  const only = range(args[args.indexOf("--verses") + 1] && args.includes("--verses") ? args[args.indexOf("--verses") + 1] : undefined);
  const redo = range(args.includes("--redo") ? args[args.indexOf("--redo") + 1] : undefined);

  const notes: Notes = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { model: MODEL, chapters: {}, verses: {} };
  notes.model = MODEL;
  const save = () => {
    const sorted = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).sort((a, b) => Number(a[0]) - Number(b[0])));
    writeFileSync(OUT, JSON.stringify({ ...notes, chapters: sorted(notes.chapters), verses: sorted(notes.verses) }, null, 1) + "\n");
  };

  const todo = source.verses.filter((v) => (redo ? redo.has(v.n) : !notes.verses[v.n]) && (!only || only.has(v.n)));
  // Batches stay within a chapter, so the model sees verses in context.
  const batches: (typeof todo)[] = [];
  for (const v of todo) {
    const last = batches.at(-1);
    if (last && last.length < BATCH && last[0].chapter === v.chapter && last.at(-1)!.n === v.n - 1) last.push(v);
    else batches.push([v]);
  }
  const chapters = source.chapters.filter((c) => !notes.chapters[c.number] && (!only || [...only].some((n) => n >= c.from && n <= c.to)));
  console.log(`${todo.length} verses in ${batches.length} batches, ${chapters.length} chapter introductions. Model ${MODEL}.`);

  const jobs: (() => Promise<void>)[] = [
    ...chapters.map((c) => async () => {
      const verses = source.verses.filter((v) => v.chapter === c.number).map((v) => `${v.n}. ${v.en}`).join("\n");
      const r = await ask<{ intro: Pair }>(key, CHAPTER_TASK, `Chapter ${c.number}: ${c.pi} ("${c.en}"), verses ${c.from}–${c.to}.\nMüller's English of its verses, for context:\n${verses}`, chapterSchema);
      notes.chapters[c.number] = r;
      save();
      console.log(`chapter ${c.number}`);
    }),
    ...batches.map((b) => async () => {
      const ch = source.chapters[b[0].chapter - 1];
      const input = `Chapter ${ch.number}: ${ch.pi} ("${ch.en}").\n\n` + b.map((v) => `Verse ${v.n}\nPali:\n${v.pi.join("\n")}\nMüller: ${v.en}`).join("\n\n");
      const r = await ask<{ verses: (VerseNote & { n: number })[] }>(key, VERSE_TASK, input, verseSchema);
      for (const { n, ...note } of r.verses) if (b.some((v) => v.n === n)) notes.verses[n] = note;
      save();
      console.log(`verses ${b[0].n}–${b.at(-1)!.n}`);
    }),
  ];

  let next = 0;
  await Promise.all(
    Array.from({ length: PARALLEL }, async () => {
      while (next < jobs.length) await jobs[next++]();
    }),
  );
  const gaps = source.verses.filter((v) => !notes.verses[v.n]).map((v) => v.n);
  console.log(gaps.length ? `Still missing: ${gaps.join(", ")}` : "All 423 verses have notes.");
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
