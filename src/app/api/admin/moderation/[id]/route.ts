import { NextRequest, NextResponse } from "next/server";
import { isAdminTokenValid } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordViolationAndMaybeSuspend } from "@/lib/moderation/db";

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

/** Approve or reject a held item. Route Handlers aren't covered by proxy.ts's /admin page guard (that only matches page paths, not /api/*), so the same admin-token cookie check happens here directly. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: { action?: "approve" | "reject" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: queueItem, error: fetchError } = await admin
    .from("moderation_queue")
    .select("*, moderation_logs(content_type, content_id, user_id)")
    .eq("id", id)
    .single();
  if (fetchError || !queueItem) return NextResponse.json({ error: "Queue item not found" }, { status: 404 });
  if (queueItem.status !== "pending") return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  const log = queueItem.moderation_logs as { content_type: string; content_id: string | null; user_id: string };
  const mapping = CONTENT_TABLE[log.content_type];
  const newStatus = body.action === "approve" ? "published" : "blocked";

  if (mapping && log.content_id) {
    await admin.from(mapping.table).update({ moderation_status: newStatus }).eq(mapping.idColumn, log.content_id);
  }
  if (body.action === "reject") {
    await recordViolationAndMaybeSuspend(admin, log.user_id);
  }

  const { error: updateError } = await admin
    .from("moderation_queue")
    .update({ status: body.action === "approve" ? "approved" : "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
