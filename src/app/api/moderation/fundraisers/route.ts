import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supabase/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { runModerationPipeline } from "@/lib/moderation";
import { isCommunityMember } from "@/lib/community-feed-post";
import { platformForUrl } from "@/lib/donations";
import { fetchLinkPreview, optimiseRemoteImage } from "@/lib/link-preview";

/** Share a fundraiser link to a community's Donate tab. Same shape as the
 * listing routes: the insert runs as the user (RLS forces pending_review),
 * then moderation decides and the service-role client flips the status. The
 * preview (and so the image) is re-fetched here rather than trusted from the
 * client. */
export async function POST(req: NextRequest) {
  let body: { communityId?: string; url?: string; title?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const url = body.url?.trim() ?? "";
  const platform = platformForUrl(url);
  if (!platform || url.length > 500) {
    return NextResponse.json({ error: "Please share an https link from one of the trusted donation platforms." }, { status: 400 });
  }
  if (!body.communityId) return NextResponse.json({ error: "Choose a community to share this with" }, { status: 400 });

  const { supabase, user } = await getAuthedSupabase(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const admin = createAdminClient();
  if (!(await isCommunityMember(admin, body.communityId, user.id))) {
    return NextResponse.json({ error: "You must be a member of that community to share there" }, { status: 403 });
  }

  const preview = await fetchLinkPreview(url);
  const title = (body.title?.trim() || preview.title || "").slice(0, 200);
  if (!title) return NextResponse.json({ error: "Add a title for this fundraiser" }, { status: 400 });
  const note = body.note?.trim().slice(0, 1000) || null;
  const imageUrl = await optimiseRemoteImage(preview.imageUrl);

  const { data: row, error: insertError } = await supabase
    .from("fundraisers")
    .insert({
      owner_id: user.id,
      community_id: body.communityId,
      url,
      platform: platform.id,
      title,
      note,
      image_url: imageUrl,
      moderation_status: "pending_review",
    })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") return NextResponse.json({ error: "This fundraiser has already been shared in that community." }, { status: 409 });
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const result = await runModerationPipeline(
    admin,
    {
      contentType: "fundraiser",
      userId: user.id,
      text: [title, note, preview.description].filter(Boolean).join("\n\n"),
      imageUrls: imageUrl ? [imageUrl] : [],
      contextLink: "/donate",
    },
    row.id
  );

  const moderation_status = result.decision === "allow" ? "published" : result.decision === "block" ? "blocked" : "pending_review";
  if (moderation_status !== "pending_review") {
    await admin.from("fundraisers").update({ moderation_status }).eq("id", row.id);
  }

  return NextResponse.json({
    id: row.id,
    decision: result.decision,
    message:
      result.decision === "allow"
        ? "Shared. It's now on the Donate tab."
        : result.decision === "hold_for_review"
          ? "Thanks! It will appear on the Donate tab once it's been reviewed."
          : "This fundraiser doesn't meet community guidelines and wasn't shared.",
  });
}
