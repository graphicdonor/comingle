"use client";
import { useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";
import type { UsageSummary } from "@/lib/cms/stats";
import { api } from "./api";
import { Card } from "./ui";

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-xl bg-[#FFFCF6] border border-[#EFE7D8] px-4 py-3">
      <p className="text-xs font-semibold text-[#5B5350]">{label}</p>
      <p className="mt-0.5 text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-[#6D645D]">{hint}</p>}
    </div>
  );
}

function Share({ label, n, of }: { label: string; n: number; of: number }) {
  const pct = of ? Math.round((n / of) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-[#5B5350]">
        <span>{label}</span>
        <span className="tabular-nums">
          {n} · {pct}%
        </span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-[#EFE7D8]">
        <div className="h-1.5 rounded-full bg-[#6D252C]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const short = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/** How many devices use the app (anonymous daily count) and how many signed-in accounts. */
export function UsagePanel() {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ usage: UsageSummary }>("/api/cms/stats")
      .then((r) => setUsage(r.usage))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <Card className="text-sm text-[#7A2A24]">Couldn&apos;t load usage: {error}</Card>;
  if (!usage)
    return (
      <Card className="flex items-center gap-2 text-sm text-[#6D645D]">
        <Loader2 className="h-4 w-4 animate-spin" /> Counting users…
      </Card>
    );

  const max = Math.max(1, ...usage.series.map((d) => d.active));
  const d30 = usage.last30Detail;

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-bold flex items-center gap-2">
          <Users className="h-4 w-4" /> Users
        </h2>
        <p className="text-xs text-[#6D645D]">
          Devices that opened the app, counted anonymously once a day{usage.since ? ` since ${short(usage.since)}` : ""}. Updated {new Date(usage.generatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}.
        </p>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Stat label="Today" value={usage.today} hint={`Yesterday: ${usage.yesterday}`} />
        <Stat label="Last 7 days" value={usage.last7} hint={`${usage.new7} new`} />
        <Stat label="Last 30 days" value={usage.last30} hint={`${usage.new30} new`} />
        <Stat label="All devices counted" value={usage.totalDevices} hint="Since counting began" />
      </div>

      <div>
        <p className="text-xs font-semibold text-[#5B5350] mb-2">Daily active devices, last 30 days</p>
        <div className="flex items-end gap-[3px] h-28" role="img" aria-label={`Daily active devices over the last 30 days, from ${usage.series[0].active} to ${usage.series[29].active}`}>
          {usage.series.map((d) => (
            <div key={d.day} className="group relative flex-1 h-full flex flex-col justify-end">
              <div className="rounded-t bg-[#6D252C]/80 group-hover:bg-[#6D252C]" style={{ height: `${(d.active / max) * 100}%`, minHeight: d.active ? 3 : 0 }} />
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-[#2A1A1C] px-2 py-1 text-[11px] text-white">
                {short(d.day)}: {d.active} ({d.new} new)
              </span>
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-[#6D645D]">
          <span>{short(usage.series[0].day)}</span>
          <span>Today</span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#5B5350]">Language (30 days)</p>
          <Share label="Hindi" n={d30.hi} of={usage.last30} />
          <Share label="English" n={d30.en} of={usage.last30} />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#5B5350]">Device (30 days)</p>
          <Share label="Android" n={d30.android} of={usage.last30} />
          <Share label="iPhone / iPad" n={d30.iphone} of={usage.last30} />
          <Share label="Computer" n={d30.computer} of={usage.last30} />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#5B5350]">Installed & accounts</p>
          <Share label="Installed to home screen" n={d30.installed} of={usage.last30} />
          <p className="text-xs text-[#5B5350] pt-1">
            <span className="font-semibold text-[#2A1A1C]">{usage.accounts.practiceSync}</span> signed in with Google to sync ({usage.accounts.practiceActive30} active in 30 days)
          </p>
          <p className="text-[11px] text-[#6D645D]">{usage.accounts.total} accounts in total, including the earlier community app.</p>
        </div>
      </div>
      <p className="text-[11px] text-[#6D645D]">
        People can switch counting off in Settings, and clearing the app&apos;s data counts a device as new, so these are close estimates. Devices that used the app before counting began appear as new on their first day.
      </p>
    </Card>
  );
}
