import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supabase/api-auth";
import { platformForUrl } from "@/lib/donations";
import { fetchLinkPreview } from "@/lib/link-preview";

/** Link preview for the "Share a fundraiser" form. Signed-in only, and only
 * for trusted donation-platform URLs (see lib/donations.ts), so this can't be
 * used to make the server fetch arbitrary addresses. */
export async function POST(req: NextRequest) {
  const { user } = await getAuthedSupabase(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { url } = await req.json().catch(() => ({}));
  const platform = typeof url === "string" ? platformForUrl(url) : null;
  if (!platform) {
    return NextResponse.json({ error: "Please paste an https link from one of the trusted donation platforms listed on the Donate page." }, { status: 400 });
  }

  const preview = await fetchLinkPreview(url);
  return NextResponse.json({ platform: { id: platform.id, name: platform.name }, ...preview });
}
