"use client";
import { useEffect, useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, ApiError, when } from "@/components/cms/api";
import { useActor } from "@/components/cms/cms-shell";
import { Button, Card, Problems, TextInput } from "@/components/cms/ui";

interface Account {
  id: string;
  email: string | null;
  name: string | null;
  provider: string;
  createdAt: string;
  lastSignInAt: string | null;
  sync: boolean;
  subscribed: boolean;
}
interface Activity {
  at: string;
  event: "signed_up" | "signed_in" | "subscribed" | "unsubscribed" | "subscriber_removed" | "account_deleted";
  email: string | null;
  source?: string;
}

const EVENT: Record<Activity["event"], { label: string; tone: string }> = {
  signed_up: { label: "Signed up", tone: "bg-[#E3E9DC] text-[#4F5E44]" },
  signed_in: { label: "Signed in", tone: "bg-[#F3ECDF] text-[#5B5350]" },
  subscribed: { label: "Subscribed to emails", tone: "bg-[#F6E7C8] text-[#6B4A12]" },
  unsubscribed: { label: "Unsubscribed", tone: "bg-[#FBEDEA] text-[#7A2A24]" },
  subscriber_removed: { label: "Removed from email list", tone: "bg-[#FBEDEA] text-[#7A2A24]" },
  account_deleted: { label: "Deleted account", tone: "bg-[#FBEDEA] text-[#7A2A24]" },
};
const SOURCE: Record<string, string> = { landing: "landing page", web: "web app", android: "Android app", google: "Google", link: "email link", cms: "CMS", phone: "phone" };

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;
function download(name: string, rows: string[][]) {
  const blob = new Blob([rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function CmsUsers() {
  const actor = useActor();
  const [data, setData] = useState<{ accounts: Account[]; activity: Activity[] } | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [tab, setTab] = useState<"accounts" | "activity">("accounts");
  const [query, setQuery] = useState("");
  const [event, setEvent] = useState<Activity["event"] | "all">("all");

  useEffect(() => {
    api<{ accounts: Account[]; activity: Activity[] }>("/api/cms/users").then(setData).catch(setError);
  }, []);

  const q = query.trim().toLowerCase();
  const accounts = useMemo(() => (data?.accounts ?? []).filter((a) => !q || (a.email ?? "").includes(q) || (a.name ?? "").toLowerCase().includes(q)), [data, q]);
  const activity = useMemo(() => (data?.activity ?? []).filter((a) => (event === "all" || a.event === event) && (!q || (a.email ?? "").includes(q))), [data, q, event]);

  if (actor.role !== "super_admin") return <p>Only a Super Admin can see users.</p>;
  if (!data) return error ? <Problems message={error.message} problems={[]} /> : <Loader2 className="h-6 w-6 animate-spin text-[#6D645D]" aria-label="Loading" />;

  const day = 86400_000;
  const latest = Date.parse(data.activity[0]?.at ?? data.accounts[0]?.lastSignInAt ?? "") || 0;

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-[#5B5350]">
          People who signed in, and a log of account events (sign-ups, sign-ins, email subscriptions, deletions). Never what anyone reads or practises. Personal
          data: use it only to run WePray. The log keeps 12 months.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Accounts", data.accounts.length],
          ["With email", data.accounts.filter((a) => a.email).length],
          ["Syncing practice", data.accounts.filter((a) => a.sync).length],
          ["Subscribed to emails", data.accounts.filter((a) => a.subscribed).length],
        ].map(([label, n]) => (
          <Card key={label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#885F19]">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{n}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" className="flex rounded-full bg-[#F3ECDF] p-1">
          {(["accounts", "activity"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              type="button"
              onClick={() => setTab(t)}
              className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", tab === t ? "bg-white text-[#2A1A1C] shadow-sm" : "text-[#5B5350]")}
            >
              {t === "accounts" ? `Accounts (${data.accounts.length})` : `Activity log (${data.activity.length})`}
            </button>
          ))}
        </div>
        <TextInput className="flex-1 min-w-[12rem]" type="search" aria-label="Search" placeholder="Search email or name" value={query} onChange={setQuery} />
        {tab === "activity" && (
          <select aria-label="Event" value={event} onChange={(e) => setEvent(e.target.value as typeof event)} className="rounded-xl border border-[#E7DCC8] bg-white px-3 py-2 text-sm">
            <option value="all">All events</option>
            {Object.entries(EVENT).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        )}
        <Button
          onClick={() =>
            tab === "accounts"
              ? download(`wepray-accounts-${new Date().toISOString().slice(0, 10)}.csv`, [
                  ["email", "name", "sign_in_with", "signed_up", "last_sign_in", "syncing_practice", "subscribed_to_emails"],
                  ...accounts.map((a) => [a.email ?? "", a.name ?? "", a.provider, a.createdAt, a.lastSignInAt ?? "", String(a.sync), String(a.subscribed)]),
                ])
              : download(`wepray-activity-${new Date().toISOString().slice(0, 10)}.csv`, [
                  ["when", "event", "email", "source"],
                  ...activity.map((a) => [a.at, a.event, a.email ?? "", a.source ?? ""]),
                ])
          }
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card className="overflow-x-auto">
        {tab === "accounts" ? (
          accounts.length === 0 ? (
            <p className="py-6 text-sm text-[#6D645D]">No accounts{q ? " match" : " yet"}.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#6D645D]">
                  <th className="py-2 pr-3 font-semibold">Email</th>
                  <th className="py-2 pr-3 font-semibold">Name</th>
                  <th className="py-2 pr-3 font-semibold">Signed up</th>
                  <th className="py-2 pr-3 font-semibold">Last sign-in</th>
                  <th className="py-2 pr-3 font-semibold">Sync</th>
                  <th className="py-2 font-semibold">Emails</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-t border-[#EFE7D8]">
                    <td className="py-2.5 pr-3 font-medium break-all">
                      {a.email ?? <span className="text-[#6D645D]">({SOURCE[a.provider] ?? a.provider})</span>}
                    </td>
                    <td className="py-2.5 pr-3">{a.name ?? "—"}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-[#5B5350]">{when(a.createdAt)}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-[#5B5350]">
                      {a.lastSignInAt ? when(a.lastSignInAt) : "—"}
                      {a.lastSignInAt && latest - Date.parse(a.lastSignInAt) < 7 * day && <span className="ml-1.5 rounded-full bg-[#E3E9DC] px-1.5 py-0.5 text-[10px] font-semibold text-[#4F5E44]">this week</span>}
                    </td>
                    <td className="py-2.5 pr-3">{a.sync ? "On" : "—"}</td>
                    <td className="py-2.5">{a.subscribed ? "Subscribed" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : activity.length === 0 ? (
          <p className="py-6 text-sm text-[#6D645D]">No events{q || event !== "all" ? " match" : " yet. They're recorded from now on"}.</p>
        ) : (
          <ol className="divide-y divide-[#EFE7D8]">
            {activity.map((a, i) => (
              <li key={`${a.at}-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
                <span className="w-36 flex-shrink-0 whitespace-nowrap text-[#6D645D]">{when(a.at)}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", EVENT[a.event]?.tone)}>{EVENT[a.event]?.label ?? a.event}</span>
                <span className="font-medium break-all">{a.email ?? "—"}</span>
                {a.source && <span className="text-xs text-[#6D645D]">via {SOURCE[a.source] ?? a.source}</span>}
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
