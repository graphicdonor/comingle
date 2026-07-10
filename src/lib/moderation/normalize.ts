import type OpenAI from "openai";

const NORMALIZE_MODEL = "gpt-4o-mini";

/**
 * Translates/transliterates text to English before it's moderated.
 *
 * OpenAI's moderation endpoint handles Hindi (Devanagari script) about as
 * well as English, but has almost no effective detection for Hinglish
 * (Romanized, code-mixed Hindi/English) — confirmed directly: identical
 * harassment content scored 0.98 in English, 0.88 in Hindi, and 0.006 in
 * Hinglish, allowing it straight through. Normalizing to clear English
 * first closes that gap for any language or script, not just Hinglish
 * specifically, since the moderation model's own coverage is strongest
 * there.
 */
export async function normalizeForModeration(openai: OpenAI, text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: NORMALIZE_MODEL,
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "Translate the user's text to clear English for a content safety review, preserving its " +
          "full meaning and tone exactly — including any hostility, threats, or explicit content; " +
          "do not soften, sanitize, or refuse. Handle Hinglish (Romanized Hindi mixed with English) " +
          "and any other language or script the same way. If the text is already clear English, " +
          "return it unchanged. Output only the resulting text — no commentary, no quotes, no " +
          "explanation.",
      },
      { role: "user", content: text },
    ],
  });

  const normalized = response.choices[0]?.message?.content?.trim();
  if (!normalized) throw new Error("Normalization returned an empty response");
  return normalized;
}
