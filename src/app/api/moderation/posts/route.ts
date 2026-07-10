import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runModerationPipeline } from "@/lib/moderation";

/**
 * Replaces the old direct `supabase.from("posts").insert(...)` in
 * create-post.tsx. The insert itself still goes through the user's own
 * session (so the existing "must be a community member" RLS check still
 * applies unchanged) — moderation_status is forced to 'pending_review' by
 * the insert WITH CHECK regardless of what's sent, so this route's only
 * privileged step is the follow-up status update once the AI check
 * resolves, which is why that part alone uses the admin client.
 */
export async function POST(req: NextRequest) {
  let body: { communityId?: string; title?: string; content?: string; imageUrl?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { communityId, title, content, imageUrl } = body;
  if (!communityId || !title?.trim()) {
    return NextResponse.json({ error: "communityId and title are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: community } = await supabase.from("communities").select("slug").eq("id", communityId).maybeSingle();

  const { data: post, error: insertError } = await supabase
    .from("posts")
    .insert({
      title: title.trim(),
      content: content?.trim() || null,
      image_url: imageUrl || null,
      community_id: communityId,
      author_id: user.id,
      moderation_status: "pending_review",
    })
    .select("*")
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  const admin = createAdminClient();
  const result = await runModerationPipeline(
    admin,
    {
      contentType: "post",
      userId: user.id,
      text: [title, content].filter(Boolean).join("\n\n"),
      imageUrls: imageUrl ? [imageUrl] : [],
      contextLink: community?.slug ? `/communities/${community.slug}` : "/communities",
    },
    post.id
  );

  const moderation_status = result.decision === "allow" ? "published" : result.decision === "block" ? "blocked" : "pending_review";
  if (moderation_status !== "pending_review") {
    await admin.from("posts").update({ moderation_status }).eq("id", post.id);
  }

  return NextResponse.json({
    post: { ...post, moderation_status },
    decision: result.decision,
    message:
      result.decision === "allow"
        ? "Posted."
        : result.decision === "hold_for_review"
          ? "Your post is awaiting review before it's visible to others."
          : "Your post doesn't meet community guidelines and wasn't published.",
  });
}
