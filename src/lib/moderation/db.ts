import type { SupabaseClient } from "@supabase/supabase-js";
import { AUTO_BAN_VIOLATION_COUNT, AUTO_BAN_WINDOW_DAYS } from "./config";
import type { ModerationInput, ModerationResult } from "./types";

/**
 * All functions here take an already-constructed admin (service-role)
 * client — they write to tables regular users have no insert/update access
 * to at all, matching the same bypass-RLS pattern used elsewhere in this
 * app (increment_member_count, the notifications trigger, etc), just from
 * trusted server-side app code instead of a SQL trigger.
 */

export async function logModerationDecision(
  admin: SupabaseClient,
  input: ModerationInput,
  result: ModerationResult,
  contentId?: string
): Promise<string> {
  const { data, error } = await admin
    .from("moderation_logs")
    .insert({
      content_type: input.contentType,
      content_id: contentId ?? null,
      user_id: input.userId,
      input_text: input.text ?? null,
      input_image_urls: input.imageUrls ?? [],
      scores: result.scores,
      flagged_categories: result.flaggedCategories,
      decision: result.decision,
      context_link: input.contextLink,
      api_error: result.apiError ?? null,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to write moderation log: ${error.message}`);
  return data.id as string;
}

export async function enqueueForReview(admin: SupabaseClient, logId: string): Promise<void> {
  const { error } = await admin.from("moderation_queue").insert({ log_id: logId, status: "pending" });
  if (error) throw new Error(`Failed to enqueue moderation review: ${error.message}`);
}

/** Whether this user is currently suspended — suspended users' content always holds for review, skipping the AI call entirely. */
export async function isUserSuspended(admin: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await admin.from("user_trust_scores").select("suspended").eq("user_id", userId).maybeSingle();
  return data?.suspended ?? false;
}

/**
 * Called after logging a 'block' decision. Counts blocks in the rolling
 * window from moderation_logs directly (not a decaying counter — a plain
 * incrementing count can't "forget" old violations on its own) and
 * suspends the user if the configurable threshold is met.
 */
export async function recordViolationAndMaybeSuspend(admin: SupabaseClient, userId: string): Promise<void> {
  const windowStart = new Date(Date.now() - AUTO_BAN_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("moderation_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("decision", "block")
    .gte("created_at", windowStart);

  const violationCount = count ?? 0;
  const suspended = violationCount >= AUTO_BAN_VIOLATION_COUNT;

  await admin.from("user_trust_scores").upsert(
    {
      user_id: userId,
      violation_count: violationCount,
      suspended,
      suspended_at: suspended ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}
