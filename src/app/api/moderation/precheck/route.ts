import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runModerationPipeline } from "@/lib/moderation";
import type { ContentType } from "@/lib/moderation";

const PRECHECK_TYPES: ContentType[] = ["profile_bio", "community_description", "community_rules", "avatar", "community_cover"];

/**
 * Synchronous precheck for settings-style fields that update in place with
 * no natural "publish moment" of their own (bio, community description/
 * rules, avatar, cover) — unlike posts and matrimonial profiles, these
 * don't get a pending/published split; on anything other than 'allow' the
 * caller is expected to refuse the save outright rather than persist it.
 * Still logs every check (so trust-score tracking sees these too), just
 * without a queue-and-reveal-later flow for the held case.
 */
export async function POST(req: NextRequest) {
  let body: { contentType?: ContentType; text?: string; imageUrl?: string; contextLink?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.contentType || !PRECHECK_TYPES.includes(body.contentType)) {
    return NextResponse.json({ error: `contentType must be one of: ${PRECHECK_TYPES.join(", ")}` }, { status: 400 });
  }
  if (!body.text?.trim() && !body.imageUrl) {
    return NextResponse.json({ decision: "allow", message: "" });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const admin = createAdminClient();
  const result = await runModerationPipeline(admin, {
    contentType: body.contentType,
    userId: user.id,
    text: body.text?.trim() || undefined,
    imageUrls: body.imageUrl ? [body.imageUrl] : [],
    contextLink: body.contextLink || "/",
  });

  return NextResponse.json({
    decision: result.decision,
    message:
      result.decision === "allow"
        ? ""
        : result.decision === "hold_for_review"
          ? "This doesn't meet community guidelines and has been sent for review — it wasn't saved."
          : "This doesn't meet community guidelines and wasn't saved.",
  });
}
