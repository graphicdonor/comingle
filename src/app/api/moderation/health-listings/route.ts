import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supabase/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { runModerationPipeline } from "@/lib/moderation";
import { sanitizeHealthListingBody, healthListingModerationText, CONSULTATION_MODES, type HealthListingBody } from "@/lib/health";
import { healthFeedPostContent, isCommunityMember, upsertCommunityFeedPost } from "@/lib/community-feed-post";

/** Same shape as the education-listings route: the insert goes through the
 * user's own session (so the owner-only RLS check still applies unchanged),
 * moderation_status is forced to 'pending_review' by the insert WITH CHECK
 * regardless of what's sent, and only the follow-up status flip after the
 * AI check resolves uses the service-role client. */
export async function POST(req: NextRequest) {
  let body: HealthListingBody & { communityId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!CONSULTATION_MODES.includes(body.consultation_mode)) {
    return NextResponse.json({ error: "consultation_mode is required" }, { status: 400 });
  }
  if (!body.communityId) {
    return NextResponse.json({ error: "communityId is required" }, { status: 400 });
  }

  const { supabase, user } = await getAuthedSupabase(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const admin = createAdminClient();
  if (!(await isCommunityMember(admin, body.communityId, user.id))) {
    return NextResponse.json({ error: "You must be a member of that community to publish there" }, { status: 403 });
  }

  const { data: listing, error: insertError } = await supabase
    .from("health_listings")
    .insert({ ...sanitizeHealthListingBody(body), owner_id: user.id, moderation_status: "pending_review" })
    .select("id")
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  const result = await runModerationPipeline(
    admin,
    {
      contentType: "health_listing",
      userId: user.id,
      text: healthListingModerationText(body),
      imageUrls: body.photo_urls ?? [],
      contextLink: "/services/health",
    },
    listing.id
  );

  const moderation_status = result.decision === "allow" ? "published" : result.decision === "block" ? "blocked" : "pending_review";
  if (moderation_status !== "pending_review") {
    await admin.from("health_listings").update({ moderation_status }).eq("id", listing.id);
  }

  const feedContent = healthFeedPostContent({
    title: body.title,
    provider_name: body.provider_name,
    provider_type: body.provider_type,
    specialty: body.specialty,
    consultation_mode: body.consultation_mode,
    city: body.city,
    photo_urls: body.photo_urls,
  });
  await upsertCommunityFeedPost(admin, {
    postType: "health_listing",
    refColumn: "health_listing_id",
    refId: listing.id,
    communityId: body.communityId,
    authorId: user.id,
    moderationStatus: moderation_status,
    title: feedContent.title,
    content: feedContent.content,
    imageUrl: feedContent.imageUrl,
  });

  return NextResponse.json({
    id: listing.id,
    decision: result.decision,
    message:
      result.decision === "allow"
        ? "Listed."
        : result.decision === "hold_for_review"
          ? "Your listing is awaiting review before it's visible to others."
          : "Your listing doesn't meet community guidelines and wasn't published.",
  });
}
