import { NextRequest, NextResponse } from "next/server";
import { isAdminTokenValid } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

function isAuthed(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  const token = req.cookies.get("admin-token")?.value;
  return !!secret && !!token && isAdminTokenValid(token, secret);
}

/** Delete a community. Route Handlers aren't covered by proxy.ts's /admin page
 * guard (that only matches page paths, not /api/*), so the same admin-token
 * cookie check happens here directly. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  // Deleting the community cascades to community_members and posts (and from
  // there to post_likes/comments) per the `on delete cascade` in schema.sql.
  const { error } = await admin.from("communities").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
