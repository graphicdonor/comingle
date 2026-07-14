import { NextRequest, NextResponse } from "next/server";
import { isAdminTokenValid } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

function isAuthed(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  const token = req.cookies.get("admin-token")?.value;
  return !!secret && !!token && isAdminTokenValid(token, secret);
}

const CONTENT_TABLE: Record<string, { table: string; idColumn: string }> = {
  post: { table: "posts", idColumn: "id" },
  matrimonial_profile: { table: "matrimonial_profiles", idColumn: "user_id" },
  business_listing: { table: "business_listings", idColumn: "id" },
  job_listing: { table: "job_listings", idColumn: "id" },
};

/** Approving an appeal restores the content and decrements the violation count it had contributed to; denying just records the outcome. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: { action?: "approve" | "deny"; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (body.action !== "approve" && body.action !== "deny") {
    return NextResponse.json({ error: "action must be 'approve' or 'deny'" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: appeal, error: fetchError } = await admin
    .from("moderation_appeals")
    .select("*, moderation_logs(content_type, content_id, user_id)")
    .eq("id", id)
    .single();
  if (fetchError || !appeal) return NextResponse.json({ error: "Appeal not found" }, { status: 404 });
  if (appeal.status !== "pending") return NextResponse.json({ error: "Already resolved" }, { status: 409 });

  const log = appeal.moderation_logs as { content_type: string; content_id: string | null; user_id: string };

  if (body.action === "approve") {
    const mapping = CONTENT_TABLE[log.content_type];
    if (mapping && log.content_id) {
      await admin.from(mapping.table).update({ moderation_status: "published" }).eq(mapping.idColumn, log.content_id);
    }
    const { data: trust } = await admin.from("user_trust_scores").select("violation_count").eq("user_id", log.user_id).maybeSingle();
    if (trust) {
      const violation_count = Math.max(0, trust.violation_count - 1);
      await admin
        .from("user_trust_scores")
        .update({ violation_count, suspended: false, suspended_at: null, updated_at: new Date().toISOString() })
        .eq("user_id", log.user_id);
    }
  }

  const { error: updateError } = await admin
    .from("moderation_appeals")
    .update({
      status: body.action === "approve" ? "approved" : "denied",
      reviewer_notes: body.notes || null,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
