import { createAdminClient } from "@/lib/supabase/admin";
import type { AuditEntry, CmsItem, CmsType, RoleAssignment, Version } from "./model";

// CMS storage in the project's existing Supabase Storage, in a private
// bucket only the server (service role) can read or write:
//
//   items/{type}/{slug}.json            the item: working copy, live copy, workflow
//   versions/{type}/{slug}/{n}.json     every saved version
//   audit/{YYYY-MM}/{time}-{rand}.json  one entry per action
//   config/roles.json                   who may do what
//
// AI voice clips made from the CMS go to the public "cms-audio" bucket and
// are served from this site at /audio/cms/… (netlify.toml), so the app's
// service worker can keep them for offline use.

export const CMS_BUCKET = "cms";
export const AUDIO_BUCKET = "cms-audio";

const db = () => createAdminClient().storage;

let bucketsReady: Promise<void> | null = null;
export function ensureBuckets(): Promise<void> {
  bucketsReady ??= (async () => {
    const { data } = await db().listBuckets();
    const names = new Set((data ?? []).map((b) => b.name));
    if (!names.has(CMS_BUCKET)) await db().createBucket(CMS_BUCKET, { public: false });
    if (!names.has(AUDIO_BUCKET)) await db().createBucket(AUDIO_BUCKET, { public: true });
  })().catch((e) => {
    bucketsReady = null;
    throw e;
  });
  return bucketsReady;
}

async function readJson<T>(path: string): Promise<T | null> {
  const { data, error } = await db().from(CMS_BUCKET).download(path);
  if (error || !data) return null;
  return JSON.parse(await data.text()) as T;
}

async function writeJson(path: string, value: unknown): Promise<void> {
  const body = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const { error } = await db().from(CMS_BUCKET).upload(path, body, { upsert: true, contentType: "application/json", cacheControl: "0" });
  if (error) throw new Error(`Couldn't save ${path}: ${error.message}`);
}

async function listNames(prefix: string): Promise<string[]> {
  const names: string[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await db().from(CMS_BUCKET).list(prefix, { limit: 1000, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(error.message);
    names.push(...(data ?? []).filter((f) => f.id).map((f) => f.name));
    if (!data || data.length < 1000) return names;
  }
}

// ── Items ───────────────────────────────────────────────────────────────
export async function getItem<T extends CmsType>(type: T, slug: string): Promise<CmsItem<T> | null> {
  await ensureBuckets();
  return readJson<CmsItem<T>>(`items/${type}/${slug}.json`);
}

export async function listItems<T extends CmsType>(type: T): Promise<CmsItem<T>[]> {
  await ensureBuckets();
  const names = await listNames(`items/${type}`);
  const items = await Promise.all(names.filter((n) => n.endsWith(".json")).map((n) => readJson<CmsItem<T>>(`items/${type}/${n}`)));
  return items.filter((i): i is CmsItem<T> => Boolean(i));
}

export async function putItem(item: CmsItem): Promise<void> {
  await writeJson(`items/${item.type}/${item.slug}.json`, item);
}

// ── Versions ────────────────────────────────────────────────────────────
export async function putVersion(type: CmsType, slug: string, version: Version): Promise<void> {
  await writeJson(`versions/${type}/${slug}/${String(version.version).padStart(5, "0")}.json`, version);
}

export async function listVersions(type: CmsType, slug: string): Promise<Version[]> {
  const names = await listNames(`versions/${type}/${slug}`);
  const versions = await Promise.all(names.map((n) => readJson<Version>(`versions/${type}/${slug}/${n}`)));
  return versions.filter((v): v is Version => Boolean(v)).sort((a, b) => b.version - a.version);
}

export async function getVersion(type: CmsType, slug: string, version: number): Promise<Version | null> {
  return readJson<Version>(`versions/${type}/${slug}/${String(version).padStart(5, "0")}.json`);
}

// ── Audit log ───────────────────────────────────────────────────────────
export async function audit(entry: Omit<AuditEntry, "at">): Promise<void> {
  const at = new Date().toISOString();
  const month = at.slice(0, 7);
  const name = `${at.replace(/[:.]/g, "-")}-${Math.random().toString(36).slice(2, 8)}.json`;
  await writeJson(`audit/${month}/${name}`, { at, ...entry });
}

/** Most recent first, from the latest months. */
export async function listAudit(limit = 200): Promise<AuditEntry[]> {
  await ensureBuckets();
  const months = (await db().from(CMS_BUCKET).list("audit", { limit: 100 })).data?.map((m) => m.name).sort().reverse() ?? [];
  const out: AuditEntry[] = [];
  for (const month of months) {
    const names = (await listNames(`audit/${month}`)).sort().reverse().slice(0, limit - out.length);
    const entries = await Promise.all(names.map((n) => readJson<AuditEntry>(`audit/${month}/${n}`)));
    out.push(...entries.filter((e): e is AuditEntry => Boolean(e)));
    if (out.length >= limit) break;
  }
  return out;
}

// ── Roles ───────────────────────────────────────────────────────────────
export async function getRoles(): Promise<RoleAssignment[]> {
  await ensureBuckets();
  return (await readJson<RoleAssignment[]>("config/roles.json")) ?? [];
}

export async function putRoles(roles: RoleAssignment[]): Promise<void> {
  await writeJson("config/roles.json", roles);
}

// ── Audio ───────────────────────────────────────────────────────────────
/** File names of clips already made from the CMS for a prayer. */
export async function listCmsClips(slug: string): Promise<Set<string>> {
  await ensureBuckets();
  const { data } = await db().from(AUDIO_BUCKET).list(slug, { limit: 1000 });
  return new Set((data ?? []).map((f) => f.name));
}

export async function putCmsClip(slug: string, file: string, body: Buffer, contentType: string): Promise<void> {
  const { error } = await db()
    .from(AUDIO_BUCKET)
    .upload(`${slug}/${file}`, new Blob([new Uint8Array(body)], { type: contentType }), { upsert: true, contentType, cacheControl: "31536000" });
  if (error) throw new Error(error.message);
}
