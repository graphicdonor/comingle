import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runModerationPipeline } from "@/lib/moderation";
import { sanitizeJobListingBody, jobListingModerationText, type JobListingBody } from "@/lib/job";

/** Editing a listing goes through the owner's own session, same as create —
 * the update WITH CHECK forces moderation_status back to 'pending_review'
 * regardless of what's sent, and the owner_id = auth.uid() USING clause is
 * what makes a non-owner's edit affect zero rows (surfaced below as the
 * "not found" error from .single(), same authorization check as any other
 * owner-scoped update in this codebase). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const { data: listing, error: updateError } = await supabase
    .from("job_listings")
    .update({ ...sanitizeJobListingBody(body), moderation_status: "pending_review" })
    .eq("id", id)
    .select("id")
    .single();

  if (updateError || !listing) {
    return NextResponse.json({ error: updateError?.message || "Job listing not found" }, { status: 404 });
  }

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
        ? "Job posting updated and published."
        : result.decision === "hold_for_review"
          ? "Your changes are awaiting review before they're visible to others."
          : "Your changes don't meet community guidelines and weren't published.",
  });
}
