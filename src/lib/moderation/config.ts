const DEFAULT_BLOCK_THRESHOLD = Number(process.env.MODERATION_BLOCK_THRESHOLD ?? "0.85");
const DEFAULT_REVIEW_THRESHOLD = Number(process.env.MODERATION_REVIEW_THRESHOLD ?? "0.5");

export const AUTO_BAN_VIOLATION_COUNT = Number(process.env.AUTO_BAN_VIOLATION_COUNT ?? "3");
export const AUTO_BAN_WINDOW_DAYS = Number(process.env.AUTO_BAN_WINDOW_DAYS ?? "30");

/**
 * Per-category block-threshold overrides. Categories not listed fall back
 * to MODERATION_BLOCK_THRESHOLD. sexual/minors gets near-zero tolerance —
 * any non-trivial score blocks outright rather than waiting for the same
 * bar as everything else.
 */
const CATEGORY_BLOCK_OVERRIDES: Partial<Record<string, number>> = {
  "sexual/minors": 0.01,
};

export function getBlockThreshold(category: string): number {
  return CATEGORY_BLOCK_OVERRIDES[category] ?? DEFAULT_BLOCK_THRESHOLD;
}

export function getReviewThreshold(): number {
  return DEFAULT_REVIEW_THRESHOLD;
}
