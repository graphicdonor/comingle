import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { CMS_BUCKET, ensureBuckets } from "@/lib/cms/store";

// People who chose to get occasional emails about new prayers, stories and
// app updates. Kept in the private CMS storage (no database table), one file
// per person, named by a hash of the email so signing up twice changes
// nothing. Only the CMS (Super Admin) can read the list.
//
//   subscribers/{hash}.json        { email, lang, source, consent, subscribedAt }
//   subscribe-rate/{hour}/{ip}-…   sign-up attempts, to limit abuse

export interface Subscriber {
  email: string;
  lang: "en" | "hi";
  /** Where they signed up: landing page, web app settings, Android app. */
  source: "landing" | "web" | "android";
  /** The words they agreed to, as shown next to the form. */
  consent: string;
  subscribedAt: string;
}

export const SUBSCRIBE_CONSENT =
  "Occasional emails from WePray about new prayers, stories and app updates. Unsubscribe anytime.";

const MAX_PER_HOUR = 5;
const storage = () => createAdminClient().storage.from(CMS_BUCKET);

export function normaliseEmail(raw: unknown): string | null {
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/.test(email) ? email : null;
}

export const subscriberId = (email: string) => createHash("sha256").update(`subscriber:${email}`).digest("hex").slice(0, 32);

function secret(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("ADMIN_SECRET is not set");
  return s;
}

/** The token in a subscriber's unsubscribe link (/unsubscribe?id=…&t=…). */
export const unsubscribeToken = (id: string) => createHmac("sha256", secret()).update(`unsubscribe:${id}`).digest("hex").slice(0, 32);

export function unsubscribeUrl(siteUrl: string, email: string): string {
  const id = subscriberId(email);
  return `${siteUrl}/unsubscribe?id=${id}&t=${unsubscribeToken(id)}`;
}

export function validUnsubscribe(id: string, token: string): boolean {
  if (!/^[0-9a-f]{32}$/.test(id) || !/^[0-9a-f]{32}$/.test(token)) return false;
  return timingSafeEqual(Buffer.from(unsubscribeToken(id)), Buffer.from(token));
}

/** False when this address has tried too often in the last hour. */
export async function allowAttempt(ip: string): Promise<boolean> {
  await ensureBuckets();
  const hour = new Date().toISOString().slice(0, 13).replace(/\D/g, "");
  const who = createHash("sha256").update(`subscribe:${ip}`).digest("hex").slice(0, 16);
  const { data } = await storage().list(`subscribe-rate/${hour}`, { limit: 100, search: who });
  if ((data?.length ?? 0) >= MAX_PER_HOUR) return false;
  await storage().upload(`subscribe-rate/${hour}/${who}-${randomBytes(4).toString("hex")}`, new Blob([""]), { contentType: "text/plain" });
  return true;
}

/** Adds someone; signing up again keeps the original date. */
export async function addSubscriber(s: Omit<Subscriber, "subscribedAt" | "consent">): Promise<void> {
  await ensureBuckets();
  const path = `subscribers/${subscriberId(s.email)}.json`;
  const { data: existing } = await storage().download(path);
  if (existing) return;
  const record: Subscriber = { ...s, consent: SUBSCRIBE_CONSENT, subscribedAt: new Date().toISOString() };
  const { error } = await storage().upload(path, new Blob([JSON.stringify(record)], { type: "application/json" }), { contentType: "application/json", upsert: true });
  if (error) throw error;
}

export async function removeSubscriber(id: string): Promise<void> {
  if (!/^[0-9a-f]{32}$/.test(id)) return;
  await storage().remove([`subscribers/${id}.json`]);
}

export async function listSubscribers(): Promise<(Subscriber & { id: string })[]> {
  await ensureBuckets();
  const files: string[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await storage().list("subscribers", { limit: 1000, offset });
    if (error) throw error;
    files.push(...(data ?? []).map((f) => f.name).filter((n) => n.endsWith(".json")));
    if (!data || data.length < 1000) break;
  }
  const out: (Subscriber & { id: string })[] = [];
  // Download in small batches.
  for (let i = 0; i < files.length; i += 20) {
    const batch = await Promise.all(
      files.slice(i, i + 20).map(async (name) => {
        const { data } = await storage().download(`subscribers/${name}`);
        if (!data) return null;
        try {
          return { id: name.replace(/\.json$/, ""), ...(JSON.parse(await data.text()) as Subscriber) };
        } catch {
          return null;
        }
      }),
    );
    out.push(...batch.filter((x): x is Subscriber & { id: string } => x !== null));
  }
  return out.sort((a, b) => b.subscribedAt.localeCompare(a.subscribedAt));
}

/** Deletes sign-up attempt records older than a day (called by the hourly CMS job). */
export async function pruneRateRecords(): Promise<void> {
  const { data } = await storage().list("subscribe-rate", { limit: 1000 });
  const cutoff = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 13).replace(/\D/g, "");
  for (const folder of data ?? []) {
    if (folder.name >= cutoff) continue;
    const { data: files } = await storage().list(`subscribe-rate/${folder.name}`, { limit: 1000 });
    if (files?.length) await storage().remove(files.map((f) => `subscribe-rate/${folder.name}/${f.name}`));
  }
}
