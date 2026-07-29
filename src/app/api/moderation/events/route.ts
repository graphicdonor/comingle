import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runModerationPipeline } from "@/lib/moderation";
import { sanitizeEventListingBody, eventListingModerationText, type EventListingBody } from "@/lib/event";
import { eventFeedPostContent, isCommunityMember, upsertCommunityFeedPost } from "@/lib/community-feed-post";

/** Same shape as the business-listings route: the insert goes through the
 * user's own session (so the owner-only RLS check still applies unchanged),
 * moderation_status is forced to 'pending_review' by the insert WITH CHECK
 * regardless of what's sent, and only the follow-up status flip after the
 * AI check resolves uses the service-role client. */
export async function POST(req: NextRequest) {
  let body: EventListingBody & { communityId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!body.event_date) {
    return NextResponse.json({ error: "event_date is required" }, { status: 400 });
  }
  if (!body.communityId) {
    return NextResponse.json({ error: "communityId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const admin = createAdminClient();
  if (!(await isCommunityMember(admin, body.communityId, user.id))) {
    return NextResponse.json({ error: "You must be a member of that community to publish there" }, { status: 403 });
  }

  const { data: event, error: insertError } = await supabase
    .from("events")
    .insert({ ...sanitizeEventListingBody(body), organizer_id: user.id, moderation_status: "pending_review" })
    .select("id")
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  const result = await runModerationPipeline(
    admin,
    {
      contentType: "event_listing",
      userId: user.id,
      text: eventListingModerationText(body),
      imageUrls: body.photo_urls ?? [],
      contextLink: "/services/events",
    },
    event.id
  );

  const moderation_status = result.decision === "allow" ? "published" : result.decision === "block" ? "blocked" : "pending_review";
  if (moderation_status !== "pending_review") {
    await admin.from("events").update({ moderation_status }).eq("id", event.id);
  }

  const feedContent = eventFeedPostContent({
    title: body.title,
    event_date: body.event_date,
    venue_name: body.venue_name,
    city: body.city,
    is_online: body.is_online,
    photo_urls: body.photo_urls,
  });
  await upsertCommunityFeedPost(admin, {
    postType: "event_listing",
    refColumn: "event_listing_id",
    refId: event.id,
    communityId: body.communityId,
    authorId: user.id,
    moderationStatus: moderation_status,
    title: feedContent.title,
    content: feedContent.content,
    imageUrl: feedContent.imageUrl,
  });

  return NextResponse.json({
    id: event.id,
    decision: result.decision,
    message:
      result.decision === "allow"
        ? "Event published."
        : result.decision === "hold_for_review"
          ? "Your event is awaiting review before it's visible to others."
          : "Your event doesn't meet community guidelines and wasn't published.",
  });
}
