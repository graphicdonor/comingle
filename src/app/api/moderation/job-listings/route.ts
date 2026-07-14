import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runModerationPipeline } from "@/lib/moderation";
import { sanitizeJobListingBody, jobListingModerationText, type JobListingBody } from "@/lib/job";

/** Same shape as the business-listings route: the insert goes through the
 * user's own session (so the owner-only RLS check still applies unchanged),
 * moderation_status is forced to 'pending_review' by the insert WITH CHECK
 * regardless of what's sent, and only the follow-up status flip after the
 * AI check resolves uses the service-role client. */
export async function POST(req: NextRequest) {
  let body: JobListingBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: listing, error: insertError } = await supabase
    .from("job_listings")
    .insert({ ...sanitizeJobListingBody(body), owner_id: user.id, moderation_status: "pending_review" })
    .select("id")
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  const admin = createAdminClient();
  const result = await runModerationPipeline(
    admin,
    {
      contentType: "job_listing",
      userId: user.id,
      text: jobListingModerationText(body),
      imageUrls: body.photo_urls ?? [],
      contextLink: "/services/jobs",
    },
    listing.id
  );

  const moderation_status = result.decision === "allow" ? "published" : result.decision === "block" ? "blocked" : "pending_review";
  if (moderation_status !== "pending_review") {
    await admin.from("job_listings").update({ moderation_status }).eq("id", listing.id);
  }

  return NextResponse.json({
    id: listing.id,
    decision: result.decision,
    message:
      result.decision === "allow"
        ? "Job posted."
        : result.decision === "hold_for_review"
          ? "Your job posting is awaiting review before it's visible to others."
          : "Your job posting doesn't meet community guidelines and wasn't published.",
  });
}
