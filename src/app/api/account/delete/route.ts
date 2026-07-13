import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** A user can't call the Auth Admin API themselves, so this verifies the
 * caller's own session first, then uses the service-role client to actually
 * delete their auth.users row — which cascades to profiles and everything
 * that FKs to it (posts, community_members, moderation history, etc.) per
 * the `on delete cascade` set up in schema.sql. */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
