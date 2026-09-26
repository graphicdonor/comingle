import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supabase/api-auth";
import { isMediaKind } from "@/lib/media";
import { createSignedUpload, isCloudinaryConfigured } from "@/lib/cloudinary";

/** Issues a one-off Cloudinary upload signature (see lib/media.ts). Works
 * with both the web session cookie and the native app's Bearer token. */
export async function POST(req: NextRequest) {
  const { user } = await getAuthedSupabase(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { kind } = await req.json().catch(() => ({}));
  if (!isMediaKind(kind)) return NextResponse.json({ error: "Unknown media type" }, { status: 400 });

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "Uploads aren't configured yet." }, { status: 500 });
  }

  return NextResponse.json(createSignedUpload(kind, user.id));
}
