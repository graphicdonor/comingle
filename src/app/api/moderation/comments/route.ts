import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runModerationPipeline } from "@/lib/moderation";

/** Same shape as the posts route: the insert goes through the user's own
 * session (so the "must be signed in" RLS check still applies unchanged),
 * moderation_status is forced to 'pending_review' by the insert WITH CHECK
 * regardless of what's sent, and only the follow-up status flip (plus the
 * comment_count bump, which only happens once a comment is actually
 * visible to anyone but its author) uses the service-role client. */
export async function POST(req: NextRequest) {
  let body: { postId?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { postId, content } = body;
  if (!postId || !content?.trim()) {
    return NextResponse.json({ error: "postId and content are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: post } = await supabase.from("posts").select("communities(slug)").eq("id", postId).maybeSingle();
  const communitySlug = (post?.communities as unknown as { slug: string } | null)?.slug;

  const { data: comment, error: insertError } = await supabase
    .from("comments")
    .insert({ content: content.trim(), post_id: postId, author_id: user.id, moderation_status: "pending_review" })
    .select("*, profiles!comments_author_id_fkey(*)")
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  const admin = createAdminClient();
  const result = await runModerationPipeline(
    admin,
    {
      contentType: "comment",
      userId: user.id,
      text: content.trim(),
      contextLink: communitySlug ? `/communities/${communitySlug}` : "/communities",
    },
    comment.id
  );

  const moderation_status = result.decision === "allow" ? "published" : result.decision === "block" ? "blocked" : "pending_review";
  if (moderation_status !== "pending_review") {
    await admin.from("comments").update({ moderation_status }).eq("id", comment.id);
  }
  if (moderation_status === "published") {
    await admin.rpc("increment_comment_count", { post_id: postId });
  }

  return NextResponse.json({
    comment: { ...comment, moderation_status },
    decision: result.decision,
    message:
      result.decision === "allow"
        ? "Comment posted."
        : result.decision === "hold_for_review"
          ? "Your comment is awaiting review before others can see it."
          : "Your comment doesn't meet community guidelines and wasn't posted.",
  });
}
