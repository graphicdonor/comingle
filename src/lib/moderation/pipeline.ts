import type { SupabaseClient } from "@supabase/supabase-js";
import { checkContent } from "./service";
import { enqueueForReview, isUserSuspended, logModerationDecision, recordViolationAndMaybeSuspend } from "./db";
import type { ModerationInput, ModerationResult } from "./types";

export interface ModerationPipelineOptions {
  /**
   * Skip the human review queue for a hold_for_review outcome and publish
   * immediately instead — used for content types where borderline results
   * shouldn't be stuck waiting on a reviewer. A block is never affected by
   * this: it always blocks regardless. Two things are deliberately excluded
   * from ever auto-approving, both checked below:
   *  - Suspended-user holds — an account-level restriction, not a signal
   *    about this specific content; auto-approving them would make a
   *    suspension trivially bypassable by switching content type.
   *  - Fail-closed holds (missing API key, a timed-out/errored call) —
   *    these carry `apiError` and are NOT the AI actually saying "this
   *    looks borderline," they're "we couldn't check at all." Approving
   *    those would mean an OpenAI outage silently publishes every video
   *    with zero check — exactly what fail-closed exists to prevent.
   */
  autoApproveHolds?: boolean;
}

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
  contentId?: string,
  options?: ModerationPipelineOptions
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

  const autoApproved =
    !!options?.autoApproveHolds && !suspended && result.decision === "hold_for_review" && !result.apiError;
  const effective: ModerationResult = autoApproved
    ? { ...result, decision: "allow", reason: `${result.reason} (auto-approved — review queue skipped for this content type)` }
    : result;

  const logId = await logModerationDecision(admin, input, effective, contentId);
  if (effective.decision === "hold_for_review") await enqueueForReview(admin, logId);
  if (effective.decision === "block") await recordViolationAndMaybeSuspend(admin, input.userId);

  return { ...effective, logId };
}
