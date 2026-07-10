import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runModerationPipeline } from "@/lib/moderation";

interface MatrimonialProfileBody {
  full_name: string;
  date_of_birth: string;
  time_of_birth?: string | null;
  place_of_birth?: string | null;
  city?: string | null;
  height?: string | null;
  mangalik_dosh: boolean;
  income_range?: string | null;
  marital_status?: string | null;
  education?: string | null;
  employment_status?: string | null;
  created_by?: string | null;
  about_me?: string | null;
  photo_urls: string[];
}

/** Replaces the direct .upsert() in the matrimonial profile edit page — same reasoning as the posts route. */
export async function POST(req: NextRequest) {
  let body: MatrimonialProfileBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.full_name?.trim() || !body.date_of_birth) {
    return NextResponse.json({ error: "full_name and date_of_birth are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { error: upsertError } = await supabase.from("matrimonial_profiles").upsert(
    {
      user_id: user.id,
      full_name: body.full_name.trim(),
      date_of_birth: body.date_of_birth,
      time_of_birth: body.time_of_birth || null,
      place_of_birth: body.place_of_birth?.trim() || null,
      city: body.city?.trim() || null,
      height: body.height?.trim() || null,
      mangalik_dosh: body.mangalik_dosh,
      income_range: body.income_range || null,
      marital_status: body.marital_status || null,
      education: body.education || null,
      employment_status: body.employment_status || null,
      created_by: body.created_by || null,
      about_me: body.about_me?.trim() || null,
      photo_urls: body.photo_urls,
      moderation_status: "pending_review",
    },
    { onConflict: "user_id" }
  );

  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 400 });

  const admin = createAdminClient();
  const result = await runModerationPipeline(
    admin,
    {
      contentType: "matrimonial_profile",
      userId: user.id,
      text: body.about_me?.trim() || undefined,
      imageUrls: body.photo_urls,
      contextLink: "/services/matrimonial/profile",
    },
    user.id
  );

  const moderation_status = result.decision === "allow" ? "published" : result.decision === "block" ? "blocked" : "pending_review";
  if (moderation_status !== "pending_review") {
    await admin.from("matrimonial_profiles").update({ moderation_status }).eq("user_id", user.id);
  }

  return NextResponse.json({
    decision: result.decision,
    message:
      result.decision === "allow"
        ? "Profile saved."
        : result.decision === "hold_for_review"
          ? "Your profile is awaiting review before other members can see it."
          : "Your profile doesn't meet community guidelines and wasn't published.",
  });
}
