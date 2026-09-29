import { NextRequest, NextResponse } from "next/server";
import { isAdminTokenValid } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

/** Route Handlers aren't covered by proxy.ts's /admin page guard, so the
 * admin-token cookie is checked here directly (same as the moderation route). */
function isAuthed(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  const token = req.cookies.get("admin-token")?.value;
  return !!secret && !!token && isAdminTokenValid(token, secret);
}

/** Mark a contact message resolved or reopen it. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json().catch(() => ({}));
  if (status !== "open" && status !== "resolved") return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const { error } = await createAdminClient().from("contact_messages").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
