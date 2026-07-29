import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runModerationPipeline } from "@/lib/moderation";
import { sanitizeEventListingBody, eventListingModerationText, type EventListingBody } from "@/lib/event";
import { eventFeedPostContent, syncCommunityFeedPostIfExists } from "@/lib/community-feed-post";

/** Editing an event goes through the organizer's own session, same as
 * create — the update WITH CHECK forces moderation_status back to
 * 'pending_review' regardless of what's sent, and the organizer_id =
 * auth.uid() USING clause is what makes a non-organizer's edit affect zero
 * rows (surfaced below as the "not found" error from .single(), same
 * authorization check as any other owner-scoped update in this codebase). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: EventListingBody;
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: event, error: updateError } = await supabase
    .from("events")
    .update({ ...sanitizeEventListingBody(body), moderation_status: "pending_review" })
    .eq("id", id)
    .select("id")
    .single();

  if (updateError || !event) {
    return NextResponse.json({ error: updateError?.message || "Event not found" }, { status: 404 });
  }

  const admin = createAdminClient();
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
  await syncCommunityFeedPostIfExists(admin, {
    refColumn: "event_listing_id",
    refId: event.id,
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
        ? "Event updated and published."
        : result.decision === "hold_for_review"
          ? "Your changes are awaiting review before they're visible to others."
          : "Your changes don't meet community guidelines and weren't published.",
  });
}
