"use client";
import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Mail, Trash2 } from "lucide-react";
import { api, ApiError, when } from "@/components/cms/api";
import { useActor } from "@/components/cms/cms-shell";
import { Button, Card, Problems, TextInput } from "@/components/cms/ui";

interface Row {
  id: string;
  email: string;
  lang: "en" | "hi";
  source: "landing" | "web" | "android";
  consent: string;
  subscribedAt: string;
  unsubscribe: string;
}

const SOURCE: Record<Row["source"], string> = { landing: "Landing page", web: "Web app", android: "Android app" };

function csv(rows: Row[]) {
  const q = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [["email", "language", "source", "subscribed_at", "unsubscribe_link"].join(",")];
  for (const r of rows) lines.push([r.email, r.lang, r.source, r.subscribedAt, r.unsubscribe].map(q).join(","));
  return lines.join("\n");
}

export default function CmsSubscribers() {
  const actor = useActor();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [query, setQuery] = useState("");
  // Counted when the list loads (not on every render).
  const [week, setWeek] = useState(0);

  useEffect(() => {
    api<{ subscribers: Row[] }>("/api/cms/subscribers")
      .then((r) => {
        const since = Date.now() - 7 * 86400_000;
        setWeek(r.subscribers.filter((x) => Date.parse(x.subscribedAt) > since).length);
        setRows(r.subscribers);
      })
      .catch(setError);
  }, []);

  const shown = useMemo(() => (rows ?? []).filter((r) => r.email.includes(query.trim().toLowerCase())), [rows, query]);

  if (actor.role !== "super_admin") return <p>Only a Super Admin can see subscribers.</p>;
  if (!rows) return error ? <Problems message={error.message} problems={[]} /> : <Loader2 className="h-6 w-6 animate-spin text-[#6D645D]" aria-label="Loading" />;

  const exportCsv = () => {
    const blob = new Blob([csv(shown)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `wepray-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const remove = async (r: Row) => {
    if (!confirm(`Remove ${r.email} from the list?`)) return;
    await api("/api/cms/subscribers", { method: "DELETE", body: { id: r.id } });
    setRows(rows.filter((x) => x.id !== r.id));
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Email subscribers</h1>
        <p className="text-sm text-[#5B5350]">
          People who chose to get occasional emails about new prayers, stories and app updates. This is personal data: use it only for that, and
          include each person&apos;s unsubscribe link (in the export) in every email.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          ["Subscribers", rows.length],
          ["This week", week],
          ["Hindi", rows.filter((r) => r.lang === "hi").length],
        ].map(([label, n]) => (
          <Card key={label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#885F19]">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{n}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <TextInput className="flex-1 min-w-[14rem]" type="search" aria-label="Search email" placeholder="Search email" value={query} onChange={setQuery} />
          <Button onClick={exportCsv} disabled={!shown.length}>
            <Download className="h-4 w-4" /> Export CSV ({shown.length})
          </Button>
        </div>
        {shown.length === 0 ? (
          <p className="flex items-center gap-2 py-6 text-sm text-[#6D645D]">
            <Mail className="h-4 w-4" /> {rows.length ? "No email matches." : "No one has signed up yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#6D645D]">
                  <th className="py-2 pr-3 font-semibold">Email</th>
                  <th className="py-2 pr-3 font-semibold">Language</th>
                  <th className="py-2 pr-3 font-semibold">Signed up on</th>
                  <th className="py-2 pr-3 font-semibold">When</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} className="border-t border-[#EFE7D8]">
                    <td className="py-2.5 pr-3 font-medium break-all">{r.email}</td>
                    <td className="py-2.5 pr-3">{r.lang === "hi" ? "Hindi" : "English"}</td>
                    <td className="py-2.5 pr-3">{SOURCE[r.source]}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-[#5B5350]">{when(r.subscribedAt)}</td>
                    <td className="py-2.5 text-right">
                      <button type="button" aria-label={`Remove ${r.email}`} onClick={() => remove(r)} className="rounded-lg p-2 text-[#7A2A24] hover:bg-[#FBEDEA]">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
