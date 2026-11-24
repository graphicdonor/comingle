import { cmsRoute, json } from "@/lib/cms/api";
import { can, ROLES, type RoleAssignment } from "@/lib/cms/model";
import { CmsError } from "@/lib/cms/service";
import { audit, getRoles, putRoles } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

export function GET() {
  return cmsRoute(async (actor) => {
    if (!can(actor, "manage_roles")) throw new CmsError("Only a Super Admin can manage access.", 403);
    return { roles: await getRoles() };
  });
}

export async function PUT(req: Request) {
  return cmsRoute(async (actor) => {
    if (!can(actor, "manage_roles")) throw new CmsError("Only a Super Admin can manage access.", 403);
    const { roles } = await json<{ roles: RoleAssignment[] }>(req);
    if (!Array.isArray(roles)) throw new CmsError("Invalid list.");
    const clean: RoleAssignment[] = [];
    for (const r of roles) {
      const email = String(r.email ?? "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new CmsError(`Not an email address: ${email || "(empty)"}`);
      if (!(ROLES as readonly string[]).includes(r.role)) throw new CmsError(`Unknown role for ${email}.`);
      if (clean.some((c) => c.email === email)) throw new CmsError(`${email} is listed twice.`);
      const languages = r.role === "language_reviewer" ? (r.languages ?? []).filter((l) => l === "pali" || l === "hi" || l === "en") : undefined;
      if (r.role === "language_reviewer" && !languages?.length) throw new CmsError(`Choose at least one language for ${email}.`);
      clean.push({ email, role: r.role, ...(languages ? { languages } : {}) });
    }
    await putRoles(clean);
    await audit({ by: actor.id, role: actor.role, action: "roles", detail: clean.map((c) => `${c.email}: ${c.role}`).join(", ") || "none" });
    return { roles: clean };
  });
}
