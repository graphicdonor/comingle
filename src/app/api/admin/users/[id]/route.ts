import { NextRequest, NextResponse } from "next/server";
import { isAdminTokenValid } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

function isAuthed(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  const token = req.cookies.get("admin-token")?.value;
  return !!secret && !!token && isAdminTokenValid(token, secret);
}

/** Activate/deactivate/delete a user. Route Handlers aren't covered by proxy.ts's
 * /admin page guard (that only matches page paths, not /api/*), so the same
 * admin-token cookie check happens here directly. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: { action?: "activate" | "deactivate" | "delete" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (body.action !== "activate" && body.action !== "deactivate" && body.action !== "delete") {
    return NextResponse.json({ error: "action must be 'activate', 'deactivate', or 'delete'" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (body.action === "delete") {
    // Deleting the auth.users row cascades to profiles and everything that
    // FKs to it (posts, community_members, moderation history, etc.) per
    // the `on delete cascade` set up in schema.sql.
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const { error } = await admin.from("profiles").update({ is_active: body.action === "activate" }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
