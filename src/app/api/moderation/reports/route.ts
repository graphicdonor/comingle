import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ReportReason } from "@/lib/types";

const VALID_REASONS: ReportReason[] = ["spam", "harassment", "inappropriate", "misinformation", "other"];

/** Users can also insert directly via RLS (post_reports has its own "Users
 * can report a post once" policy) — this route exists for the same reason
 * appeals/route.ts does: turning the DB's unique-violation-on-duplicate
 * into a friendly message instead of a raw Postgres error, plus validating
 * the reason value up front. Enqueueing the post into the admin moderation
 * queue happens entirely in enqueue_post_report_for_review (a DB trigger on
 * post_reports), not here. */
export async function POST(req: NextRequest) {
  let body: { postId?: string; reason?: string; details?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!body.postId || !VALID_REASONS.includes(body.reason as ReportReason)) {
    return NextResponse.json({ error: "postId and a valid reason are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { error: insertError } = await supabase.from("post_reports").insert({
    post_id: body.postId,
    reporter_id: user.id,
    reason: body.reason,
    details: body.details?.trim() || null,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "You've already reported this post" }, { status: 409 });
    }
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
