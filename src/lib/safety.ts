import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Blocking and reporting people (Google Play UGC requirements). Both go
 * straight to Supabase under the user's own session — RLS limits each user
 * to their own rows. Once a block exists, restrictive RLS policies hide the
 * blocked person's posts, comments, notifications and matrimonial messages
 * from the blocker (see the ugc_safety migration), so callers only need to
 * refresh after blocking. Mirrored in the native app.
 */
export const USER_REPORT_REASONS = [
  { value: "spam", label: "Spam or scam" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "impersonation", label: "Impersonation" },
  { value: "other", label: "Something else" },
] as const;
export type UserReportReason = (typeof USER_REPORT_REASONS)[number]["value"];

export function blockConfirmMessage(name: string) {
  return {
    variant: "warning" as const,
    title: `Block ${name}?`,
    message:
      "You won't see their posts, comments or messages, and they can't comment on your posts or contact you through Matrimonial. You can unblock them any time in Settings.",
  };
}

export async function blockUser(supabase: SupabaseClient, me: string, them: string) {
  const { error } = await supabase.from("user_blocks").insert({ blocker_id: me, blocked_id: them });
  // Already blocked counts as success.
  if (error && error.code !== "23505") throw error;
}

export async function unblockUser(supabase: SupabaseClient, me: string, them: string) {
  const { error } = await supabase.from("user_blocks").delete().eq("blocker_id", me).eq("blocked_id", them);
  if (error) throw error;
}

export async function reportUser(
  supabase: SupabaseClient,
  input: { me: string; reportedUserId: string; reason: UserReportReason; details?: string; commentId?: string }
) {
  const { error } = await supabase.from("user_reports").insert({
    reporter_id: input.me,
    reported_user_id: input.reportedUserId,
    comment_id: input.commentId ?? null,
    reason: input.reason,
    details: input.details?.trim().slice(0, 1000) || null,
  });
  if (error) throw error;
}
