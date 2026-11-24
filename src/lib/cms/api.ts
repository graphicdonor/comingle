import { NextResponse } from "next/server";
import { getActor } from "./actor";
import { CMS_TYPES, type Actor, type CmsType } from "./model";
import { CmsError } from "./service";

/** Runs a CMS API handler for a signed-in CMS user, with consistent errors. */
export async function cmsRoute(handler: (actor: Actor) => Promise<unknown>): Promise<NextResponse> {
  try {
    const actor = await getActor();
    if (!actor) return NextResponse.json({ error: "Please sign in to the CMS." }, { status: 401 });
    const body = await handler(actor);
    return NextResponse.json(body ?? { ok: true });
  } catch (e) {
    if (e instanceof CmsError) return NextResponse.json({ error: e.message, problems: e.problems }, { status: e.status });
    console.error("CMS error", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export function cmsType(raw: string): CmsType {
  if (!(CMS_TYPES as readonly string[]).includes(raw)) throw new CmsError("Unknown content type.", 404);
  return raw as CmsType;
}

export async function json<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new CmsError("Invalid request.");
  }
}
