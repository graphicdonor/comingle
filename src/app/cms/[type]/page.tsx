"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { CMS_TYPES, STATUSES, STATUS_LABELS, TYPE_LABELS, can, type CmsType, type Status } from "@/lib/cms/model";
import { api, ApiError, when } from "@/components/cms/api";
import { useActor } from "@/components/cms/cms-shell";
import { template } from "@/components/cms/templates";
import { Button, Card, Field, Problems, StatusBadge, TextInput } from "@/components/cms/ui";

interface Row {
  slug: string;
  title: string;
  status: Status;
  version: number;
  liveVersion: number | null;
  updatedAt: string;
  updatedBy: string;
}

export default function CmsList({ params }: { params: Promise<{ type: string }> }) {
  const { type: raw } = use(params);
  const type = (CMS_TYPES as readonly string[]).includes(raw) ? (raw as CmsType) : null;
  const actor = useActor();
  const router = useRouter();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [creating, setCreating] = useState(false);
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (type) api<{ items: Row[] }>(`/api/cms/items/${type}`).then((r) => setRows(r.items)).catch(setError);
  }, [type]);

  if (!type) return <p>Unknown content type.</p>;
  const shown = rows?.filter((r) => filter === "all" || r.status === filter) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{TYPE_LABELS[type].many}</h1>
          <p className="text-sm text-[#5B5350]">{rows ? `${rows.length} in the CMS` : "Loading…"}</p>
        </div>
        {can(actor, "create") && (
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New {TYPE_LABELS[type].one.toLowerCase()}
          </Button>
        )}
      </div>

      {creating && (
        <Card>
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              try {
                await api(`/api/cms/items/${type}`, { method: "POST", body: { slug, data: template(type, slug) } });
                router.push(`/cms/${type}/${slug}`);
              } catch (err) {
                setError(err as ApiError);
              }
            }}
          >
            <div className="flex-1 min-w-[16rem]">
              <Field label="Address (slug)" hint={type === "prayer" ? `The prayer's page will be /practice/${slug || "…"}` : "Lowercase letters, numbers and hyphens"}>
                <TextInput value={slug} onChange={(v) => setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="e.g. karaniya-metta" autoFocus />
              </Field>
            </div>
            <Button type="submit" disabled={!slug}>
              Create draft
            </Button>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
          </form>
        </Card>
      )}
      <Problems message={error?.message} problems={error?.problems ?? []} />

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-semibold border ${filter === s ? "bg-[#6D252C] text-white border-[#6D252C]" : "bg-white text-[#5B5350] border-[#E7DCC8]"}`}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {!rows ? (
        <Loader2 className="h-6 w-6 animate-spin text-[#6D645D]" aria-label="Loading" />
      ) : shown.length === 0 ? (
        <p className="text-sm text-[#6D645D]">Nothing here{rows.length === 0 ? " yet. Import the app's content from the Dashboard to begin." : "."}</p>
      ) : (
        <div className="rounded-2xl bg-white border border-[#E7DCC8] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-[#6D645D] border-b border-[#EFE7D8]">
              <tr>
                <th className="px-4 py-2 font-semibold">Title</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Version</th>
                <th className="px-4 py-2 font-semibold">Last change</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.slug} className="border-b border-[#F4EEE4] last:border-0 hover:bg-[#FFFCF6]">
                  <td className="px-4 py-3">
                    <Link href={`/cms/${type}/${r.slug}`} className="font-medium text-[#6D252C] hover:underline">
                      {r.title}
                    </Link>
                    <span className="block text-xs text-[#6D645D]">{r.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-[#5B5350]">
                    v{r.version}
                    {r.liveVersion !== null && r.liveVersion !== r.version && <span className="block">live: v{r.liveVersion}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#5B5350]">
                    {when(r.updatedAt)}
                    <span className="block">{r.updatedBy}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
