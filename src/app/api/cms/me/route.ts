import { NextResponse } from "next/server";
import { getActor, signedInEmail } from "@/lib/cms/actor";

export const dynamic = "force-dynamic";

/** Who is signed in to the CMS; `email` without `actor` means signed in with no CMS role. */
export async function GET() {
  const actor = await getActor();
  return NextResponse.json({ actor, email: actor ? actor.id : await signedInEmail() });
}
