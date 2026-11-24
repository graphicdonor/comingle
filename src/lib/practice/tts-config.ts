// Settings for the AI voice clips, shared by everything that makes or finds
// them: scripts/generate-prayer-audio.ts, the CMS's audio tool and the build
// step that maps prayer lines to clips (scripts/fetch-cms-content.ts).
// A clip's file name carries a hash of these settings and its text, so a
// line keeps its clip while it is unchanged and gets a new one when edited.

import { createHash } from "node:crypto";

export type ClipLang = "pi" | "hi" | "en";

export const TTS_MODEL = process.env.TTS_MODEL ?? "gpt-4o-mini-tts";
export const TTS_VOICE = process.env.TTS_VOICE ?? "sage";

// How each language should sound. Pali is given in Devanagari, which the
// model pronounces far more accurately than romanised Pali.
export const TTS_INSTRUCTIONS: Record<ClipLang, string> = {
  pi:
    "This is a line of Pali, the classical Indian language of the Theravada Buddhist scriptures, written in Devanagari. " +
    "Recite it the way a Theravada monk chants: slow, steady, calm and reverent, with clear pronunciation of every syllable, " +
    "long vowels held (ā, ī, ū), aspirated consonants distinct, and a gentle, even rhythm. Do not translate or add anything.",
  hi:
    "Read this Hindi line in a calm, warm, respectful voice, at an unhurried pace, as you would explain a prayer's meaning to someone at a temple. " +
    "Natural standard Hindi pronunciation. Do not add anything.",
  en:
    "Read this English line in a calm, warm, respectful voice with a gentle Indian English accent, at an unhurried pace. Do not add anything.",
};

/** Content hash in a clip's file name: `${lang}-${clipHash(text, lang)}.m4a`. */
export function clipHash(text: string, lang: ClipLang): string {
  return createHash("sha256").update([TTS_MODEL, TTS_VOICE, TTS_INSTRUCTIONS[lang], text].join("\u0000")).digest("hex").slice(0, 10);
}

/** Asks OpenAI for one clip. `format` "aac" plays everywhere without re-encoding. */
export async function synthesize(text: string, lang: ClipLang, key: string, format: "mp3" | "aac" = "mp3"): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: TTS_MODEL, voice: TTS_VOICE, input: text, instructions: TTS_INSTRUCTIONS[lang], response_format: format }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const body = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      continue;
    }
    throw new Error(`OpenAI ${res.status}: ${body.slice(0, 200)}`);
  }
}
