import type { SupabaseClient } from "@supabase/supabase-js";
import { checkContent } from "./service";
import { enqueueForReview, isUserSuspended, logModerationDecision, recordViolationAndMaybeSuspend } from "./db";
import type { ModerationInput, ModerationResult } from "./types";

/**
 * The single entry point Route Handlers should call: runs the AI check
 * (skipped entirely for suspended users, who always hold for review),
 * logs the outcome, queues it for human review if needed, and updates the
 * user's violation count on a block. Every Route Handler in this app that
 * touches moderated content calls this exactly once per submission.
 */
export async function runModerationPipeline(
  admin: SupabaseClient,
  input: ModerationInput,
  contentId?: string
): Promise<ModerationResult & { logId: string }> {
  const suspended = await isUserSuspended(admin, input.userId);
  const result: ModerationResult = suspended
    ? {
        decision: "hold_for_review",
        scores: {},
        flaggedCategories: [],
        reason: "Account is currently suspended pending review — all new content is held automatically.",
      }
    : await checkContent(input);

  const logId = await logModerationDecision(admin, input, result, contentId);
  if (result.decision === "hold_for_review") await enqueueForReview(admin, logId);
  if (result.decision === "block") await recordViolationAndMaybeSuspend(admin, input.userId);

  return { ...result, logId };
}
