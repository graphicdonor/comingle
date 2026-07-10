import OpenAI from "openai";
import type { ModerationMultiModalInput } from "openai/resources/moderations";
import { getBlockThreshold, getReviewThreshold } from "./config";
import type { ModerationInput, ModerationResult } from "./types";

let cachedClient: OpenAI | null | undefined;

function getClient(): OpenAI | null {
  if (cachedClient !== undefined) return cachedClient;
  cachedClient = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  return cachedClient;
}

/**
 * Server-side only — never import this from a "use client" component.
 * Runs text/image content through OpenAI's moderation endpoint and
 * translates category scores into a publish decision.
 *
 * Fails closed: a missing API key or a failed/timed-out API call both
 * resolve to hold_for_review, never allow — an outage should never be the
 * reason something unsafe slips through.
 */
export async function checkContent(input: ModerationInput): Promise<ModerationResult> {
  const openai = getClient();
  if (!openai) {
    return {
      decision: "hold_for_review",
      scores: {},
      flaggedCategories: [],
      reason: "Moderation is not configured (OPENAI_API_KEY is not set) — held for manual review as a safe default.",
      apiError: "OPENAI_API_KEY is not set",
    };
  }

  const moderationInput: ModerationMultiModalInput[] = [];
  if (input.text?.trim()) moderationInput.push({ type: "text", text: input.text });
  for (const url of input.imageUrls ?? []) moderationInput.push({ type: "image_url", image_url: { url } });

  if (moderationInput.length === 0) {
    return { decision: "allow", scores: {}, flaggedCategories: [], reason: "Nothing to check." };
  }

  try {
    const response = await openai.moderations.create({ model: "omni-moderation-latest", input: moderationInput });

    // Multiple inputs (several photos, or text + image together) each get
    // their own result — take the worst-case score per category across all
    // of them, since any one bad photo should be enough to flag the batch.
    const scores: Record<string, number> = {};
    const flagged = new Set<string>();
    for (const result of response.results) {
      for (const [category, score] of Object.entries(result.category_scores)) {
        scores[category] = Math.max(scores[category] ?? 0, score as number);
      }
      for (const [category, isFlagged] of Object.entries(result.categories)) {
        if (isFlagged) flagged.add(category);
      }
    }

    let decision: ModerationResult["decision"] = "allow";
    for (const [category, score] of Object.entries(scores)) {
      if (score >= getBlockThreshold(category)) {
        decision = "block";
        break;
      }
      if (score >= getReviewThreshold()) {
        decision = "hold_for_review";
      }
    }
    // A category the API flagged outright always at least holds for
    // review, even if its raw score happened to land under our own
    // review threshold — OpenAI's own calibration shouldn't be ignored.
    if (decision === "allow" && flagged.size > 0) decision = "hold_for_review";

    return {
      decision,
      scores,
      flaggedCategories: [...flagged],
      reason:
        decision === "allow"
          ? "Passed automated review."
          : `Flagged categories: ${[...flagged].join(", ") || "elevated category scores"}`,
    };
  } catch (err) {
    // OpenAI's SDK error class carries the actual API error body (type/code),
    // which is far more actionable than the bare HTTP status text — e.g.
    // "insufficient_quota" (billing) vs "rate_limit_exceeded" (throttling)
    // need completely different fixes, and a plain err.message collapses
    // that distinction into "429 Too Many Requests" either way.
    let apiError = err instanceof Error ? err.message : String(err);
    if (err && typeof err === "object" && "error" in err) {
      const body = (err as { error?: { type?: string; code?: string; message?: string } }).error;
      if (body) apiError = [body.type, body.code, body.message].filter(Boolean).join(" / ") || apiError;
    }
    return {
      decision: "hold_for_review",
      scores: {},
      flaggedCategories: [],
      reason: "Moderation API call failed — held for manual review as a safe default.",
      apiError,
    };
  }
}
