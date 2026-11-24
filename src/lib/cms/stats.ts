import { createAdminClient } from "@/lib/supabase/admin";
import { CMS_BUCKET, ensureBuckets } from "./store";

// Anonymous usage counts (see src/lib/practice/usage.ts). Each device that
// opens the app on a day leaves one empty marker file, its details in the
// name, in the private CMS bucket:
//
//   stats/d/{YYYY-MM-DD}/{deviceId}_{lang}_{installed}{new}{platform}
//
// Counting is then just listing a day's folder. Daily totals are kept
// permanently in stats/daily.json; the per-device markers are deleted after
// 35 days (enough for the 30-day figures).

const storage = () => createAdminClient().storage.from(CMS_BUCKET);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const KEEP_DAYS = 35;

export const istDay = (d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
const dayOffset = (days: number) => istDay(new Date(Date.now() - days * 86_400_000));

export interface Ping {
  id: string;
  lang: "hi" | "en";
  installed: boolean;
  platform: "a" | "i" | "d";
  new: boolean;
}

export function parsePing(raw: unknown): Ping | null {
  const r = (raw ?? {}) as Record<string, unknown>;
  if (typeof r.id !== "string" || !UUID.test(r.id)) return null;
  return {
    id: r.id,
    lang: r.lang === "hi" ? "hi" : "en",
    installed: r.installed === true,
    platform: r.platform === "a" || r.platform === "i" ? r.platform : "d",
    new: r.new === true,
  };
}

export async function recordPing(p: Ping): Promise<void> {
  await ensureBuckets();
  const name = `${p.id}_${p.lang}_${p.installed ? 1 : 0}${p.new ? 1 : 0}${p.platform}`;
  await storage().upload(`stats/d/${istDay()}/${name}`, new Blob([""]), { upsert: true, contentType: "text/plain" });
}

interface DeviceDay {
  id: string;
  lang: "hi" | "en";
  installed: boolean;
  isNew: boolean;
  platform: "a" | "i" | "d";
}

async function devicesOn(day: string): Promise<DeviceDay[]> {
  const out = new Map<string, DeviceDay>();
  for (let offset = 0; ; offset += 1000) {
    const { data } = await storage().list(`stats/d/${day}`, { limit: 1000, offset });
    for (const f of data ?? []) {
      const m = /^([0-9a-f-]{36})_(hi|en)_([01])([01])([aid])$/.exec(f.name);
      if (!m) continue;
      const prev = out.get(m[1]);
      out.set(m[1], { id: m[1], lang: m[2] as "hi" | "en", installed: m[3] === "1" || Boolean(prev?.installed), isNew: m[4] === "1" || Boolean(prev?.isNew), platform: m[5] as DeviceDay["platform"] });
    }
    if (!data || data.length < 1000) break;
  }
  return [...out.values()];
}

interface DailyTotal {
  active: number;
  new: number;
  installed: number;
  hi: number;
  en: number;
  android: number;
  iphone: number;
  computer: number;
}

function totals(devices: DeviceDay[]): DailyTotal {
  return {
    active: devices.length,
    new: devices.filter((d) => d.isNew).length,
    installed: devices.filter((d) => d.installed).length,
    hi: devices.filter((d) => d.lang === "hi").length,
    en: devices.filter((d) => d.lang === "en").length,
    android: devices.filter((d) => d.platform === "a").length,
    iphone: devices.filter((d) => d.platform === "i").length,
    computer: devices.filter((d) => d.platform === "d").length,
  };
}

async function readDaily(): Promise<Record<string, DailyTotal>> {
  const { data } = await storage().download("stats/daily.json");
  return data ? JSON.parse(await data.text()) : {};
}

/** Hourly (from the CMS scheduler): keep daily totals, drop old per-device markers. */
export async function rollUpUsage(): Promise<void> {
  await ensureBuckets();
  const daily = await readDaily();
  const { data: folders } = await storage().list("stats/d", { limit: 1000 });
  const today = istDay();
  let changed = false;
  for (const f of folders ?? []) {
    const day = f.name;
    if (day < today && !daily[day]) {
      daily[day] = totals(await devicesOn(day));
      changed = true;
    }
    if (day < dayOffset(KEEP_DAYS)) {
      for (;;) {
        const { data } = await storage().list(`stats/d/${day}`, { limit: 1000 });
        if (!data?.length) break;
        await storage().remove(data.map((x) => `stats/d/${day}/${x.name}`));
        if (data.length < 1000) break;
      }
    }
  }
  if (changed) {
    await storage().upload("stats/daily.json", new Blob([JSON.stringify(daily)], { type: "application/json" }), { upsert: true, contentType: "application/json", cacheControl: "0" });
  }
}

export interface UsageSummary {
  generatedAt: string;
  since: string | null;
  today: number;
  yesterday: number;
  last7: number;
  last30: number;
  new7: number;
  new30: number;
  totalDevices: number;
  last30Detail: { installed: number; hi: number; en: number; android: number; iphone: number; computer: number };
  series: { day: string; active: number; new: number }[];
  accounts: { total: number; practiceSync: number; practiceActive30: number };
}

let cache: { at: number; value: UsageSummary } | null = null;

export async function usageSummary(): Promise<UsageSummary> {
  if (cache && Date.now() - cache.at < 5 * 60_000) return cache.value;
  await ensureBuckets();
  const days = Array.from({ length: 30 }, (_, i) => dayOffset(29 - i));
  const perDay = await Promise.all(days.map(devicesOn));
  const daily = await readDaily();

  // Unique devices over windows, with each device's latest details.
  const unique = (from: number) => {
    const m = new Map<string, DeviceDay>();
    perDay.slice(from).forEach((list) => list.forEach((d) => m.set(d.id, { ...d, isNew: d.isNew || Boolean(m.get(d.id)?.isNew), installed: d.installed || Boolean(m.get(d.id)?.installed) })));
    return [...m.values()];
  };
  const u7 = unique(23);
  const u30 = unique(0);

  const pastDays = Object.keys(daily).filter((d) => !days.includes(d));
  const newBefore = pastDays.reduce((n, d) => n + daily[d].new, 0);
  const allDays = [...Object.keys(daily), ...days.filter((d, i) => perDay[i].length)].sort();

  // Accounts (Google sign-in to sync practice data).
  const auth = createAdminClient().auth.admin;
  let total = 0;
  let practiceSync = 0;
  let practiceActive30 = 0;
  for (let page = 1; ; page++) {
    const { data, error } = await auth.listUsers({ page, perPage: 1000 });
    if (error) break;
    total += data.users.length;
    for (const u of data.users) {
      if (!u.user_metadata?.practice) continue;
      practiceSync++;
      if (u.last_sign_in_at && Date.now() - new Date(u.last_sign_in_at).getTime() < 30 * 86_400_000) practiceActive30++;
    }
    if (data.users.length < 1000) break;
  }

  const value: UsageSummary = {
    generatedAt: new Date().toISOString(),
    since: allDays[0] ?? null,
    today: perDay[29].length,
    yesterday: perDay[28].length,
    last7: u7.length,
    last30: u30.length,
    new7: u7.filter((d) => d.isNew).length,
    new30: u30.filter((d) => d.isNew).length,
    totalDevices: newBefore + perDay.reduce((n, list) => n + list.filter((d) => d.isNew).length, 0),
    last30Detail: {
      installed: u30.filter((d) => d.installed).length,
      hi: u30.filter((d) => d.lang === "hi").length,
      en: u30.filter((d) => d.lang === "en").length,
      android: u30.filter((d) => d.platform === "a").length,
      iphone: u30.filter((d) => d.platform === "i").length,
      computer: u30.filter((d) => d.platform === "d").length,
    },
    series: days.map((day, i) => ({ day, active: perDay[i].length, new: perDay[i].filter((d) => d.isNew).length })),
    accounts: { total, practiceSync, practiceActive30 },
  };
  cache = { at: Date.now(), value };
  return value;
}
