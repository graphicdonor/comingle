import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runModerationPipeline } from "@/lib/moderation";

interface BusinessListingBody {
  name: string;
  pin_code?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  street?: string | null;
  landmark?: string | null;
  area?: string | null;
  city?: string | null;
  state?: string | null;
  poc_name?: string | null;
  mobile_number?: string | null;
  whatsapp_number?: string | null;
  email?: string | null;
  categories: string[];
  open_days: string[];
  open_time?: string | null;
  close_time?: string | null;
  photo_urls: string[];
}

/** Same shape as the matrimonial-profile route: the insert goes through the
 * user's own session (so the owner-only RLS check still applies unchanged),
 * moderation_status is forced to 'pending_review' by the insert WITH CHECK
 * regardless of what's sent, and only the follow-up status flip after the
 * AI check resolves uses the service-role client. */
export async function POST(req: NextRequest) {
  let body: BusinessListingBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: listing, error: insertError } = await supabase
    .from("business_listings")
    .insert({
      owner_id: user.id,
      name: body.name.trim(),
      pin_code: body.pin_code?.trim() || null,
      address_line1: body.address_line1?.trim() || null,
      address_line2: body.address_line2?.trim() || null,
      street: body.street?.trim() || null,
      landmark: body.landmark?.trim() || null,
      area: body.area?.trim() || null,
      city: body.city?.trim() || null,
      state: body.state?.trim() || null,
      poc_name: body.poc_name?.trim() || null,
      mobile_number: body.mobile_number?.trim() || null,
      whatsapp_number: body.whatsapp_number?.trim() || null,
      email: body.email?.trim() || null,
      categories: body.categories ?? [],
      open_days: body.open_days ?? [],
      open_time: body.open_time || null,
      close_time: body.close_time || null,
      photo_urls: body.photo_urls ?? [],
      moderation_status: "pending_review",
    })
    .select("id")
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  const admin = createAdminClient();
  const result = await runModerationPipeline(
    admin,
    {
      contentType: "business_listing",
      userId: user.id,
      text: [body.name, body.address_line1, body.address_line2, body.categories?.join(", ")].filter(Boolean).join("\n\n"),
      imageUrls: body.photo_urls ?? [],
      contextLink: "/services/businesses",
    },
    listing.id
  );

  const moderation_status = result.decision === "allow" ? "published" : result.decision === "block" ? "blocked" : "pending_review";
  if (moderation_status !== "pending_review") {
    await admin.from("business_listings").update({ moderation_status }).eq("id", listing.id);
  }

  return NextResponse.json({
    id: listing.id,
    decision: result.decision,
    message:
      result.decision === "allow"
        ? "Listing published."
        : result.decision === "hold_for_review"
          ? "Your listing is awaiting review before it's visible to others."
          : "Your listing doesn't meet community guidelines and wasn't published.",
  });
}
