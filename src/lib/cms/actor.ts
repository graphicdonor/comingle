import { cookies } from "next/headers";
import { isAdminTokenValid } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { getRoles } from "./store";
import type { Actor, ReviewLang } from "./model";

/**
 * Who is using the CMS: the admin-password holder is Super Admin; anyone
 * else signs in with Google and has the role a Super Admin gave their email.
 * Returns null for everyone else.
 */
export async function getActor(): Promise<Actor | null> {
  const cookieStore = await cookies();
  const secret = process.env.ADMIN_SECRET;
  const token = cookieStore.get("admin-token")?.value;
  if (secret && token && isAdminTokenValid(token, secret)) {
    return { id: "admin", name: "Admin", role: "super_admin", languages: ["pali", "hi", "en"] };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email) return null;
  const assignment = (await getRoles()).find((r) => r.email.toLowerCase() === email);
  if (!assignment) return null;
  const meta = data.user?.user_metadata ?? {};
  return {
    id: email,
    name: (meta.full_name as string) || (meta.name as string) || email,
    role: assignment.role,
    languages: (assignment.languages ?? []) as ReviewLang[],
  };
}

/** The signed-in Google email, if any (to tell someone they have no CMS role). */
export async function signedInEmail(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}
