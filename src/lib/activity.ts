import { CMS_BUCKET, ensureBuckets, listNames, readJson, writeJson } from "@/lib/cms/store";
import { createAdminClient } from "@/lib/supabase/admin";

// A log of account events for the CMS: sign-ups and sign-ins, email
// subscription changes and account deletions. Only those events, never what
// anyone reads or practises (Privacy Policy §3). Kept in the private CMS
// storage for 12 months:
//
//   activity/{YYYY-MM}/{time}-{rand}.json   { at, event, email, userId?, source? }

export const ACTIVITY_EVENTS = ["signed_up", "signed_in", "subscribed", "unsubscribed", "subscriber_removed", "account_deleted"] as const;
export type ActivityEvent = (typeof ACTIVITY_EVENTS)[number];

export interface ActivityEntry {
  at: string;
  event: ActivityEvent;
  email: string | null;
  userId?: string;
  /** Where it happened, e.g. "landing", "web", "android", "google", "cms". */
  source?: string;
}

const KEEP_MONTHS = 12;

/** Records an event; never throws (logging must not break the action itself). */
export async function logActivity(entry: Omit<ActivityEntry, "at">): Promise<void> {
  try {
    const at = new Date().toISOString();
    const name = `${at.replace(/[:.]/g, "-")}-${Math.random().toString(36).slice(2, 8)}.json`;
    await writeJson(`activity/${at.slice(0, 7)}/${name}`, { at, ...entry });
  } catch (e) {
    console.error("activity log failed", e);
  }
}

/** Most recent first. */
export async function listActivity(limit = 500): Promise<ActivityEntry[]> {
  await ensureBuckets();
  const { data } = await createAdminClient().storage.from(CMS_BUCKET).list("activity", { limit: 100 });
  const months = (data ?? []).map((m) => m.name).sort().reverse();
  const out: ActivityEntry[] = [];
  for (const month of months) {
    const names = (await listNames(`activity/${month}`)).sort().reverse().slice(0, limit - out.length);
    for (let i = 0; i < names.length; i += 25) {
      const batch = await Promise.all(names.slice(i, i + 25).map((n) => readJson<ActivityEntry>(`activity/${month}/${n}`)));
      out.push(...batch.filter((e): e is ActivityEntry => Boolean(e)));
    }
    if (out.length >= limit) break;
  }
  return out;
}

/** Deletes months older than a year (called by the hourly CMS job). */
export async function pruneActivity(): Promise<void> {
  const storage = createAdminClient().storage.from(CMS_BUCKET);
  const { data } = await storage.list("activity", { limit: 100 });
  const d = new Date();
  d.setMonth(d.getMonth() - KEEP_MONTHS);
  const cutoff = d.toISOString().slice(0, 7);
  for (const m of data ?? []) {
    if (m.name >= cutoff) continue;
    const names = await listNames(`activity/${m.name}`);
    for (let i = 0; i < names.length; i += 100) await storage.remove(names.slice(i, i + 100).map((n) => `activity/${m.name}/${n}`));
  }
}

export interface AccountRow {
  id: string;
  email: string | null;
  name: string | null;
  provider: string;
  createdAt: string;
  lastSignInAt: string | null;
  /** Practice data synced to the account (saved prayers, settings). */
  sync: boolean;
}

/** Every signed-in account, from Supabase Auth. */
export async function listAccounts(): Promise<AccountRow[]> {
  const admin = createAdminClient();
  const out: AccountRow[] = [];
  for (let page = 1; page < 200; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    for (const u of data.users) {
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      out.push({
        id: u.id,
        email: u.email ?? null,
        name: (typeof meta.full_name === "string" && meta.full_name) || (typeof meta.name === "string" && meta.name) || null,
        provider: u.app_metadata?.provider ?? (u.phone ? "phone" : "email"),
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        sync: Boolean(meta.practice),
      });
    }
    if (data.users.length < 1000) break;
  }
  return out.sort((a, b) => (b.lastSignInAt ?? b.createdAt).localeCompare(a.lastSignInAt ?? a.createdAt));
}
