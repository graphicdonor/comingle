"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { CMS_TYPES, STATUSES, TYPE_LABELS, can, type CmsType, type Status } from "@/lib/cms/model";
import { api, when } from "@/components/cms/api";
import { useActor } from "@/components/cms/cms-shell";
import { Button, Card, StatusBadge } from "@/components/cms/ui";
import { UsagePanel } from "@/components/cms/usage-panel";

interface Row {
  slug: string;
  title: string;
  status: Status;
  version: number;
  liveVersion: number | null;
  updatedAt: string;
  updatedBy: string;
  scheduledAt: string | null;
}

const ATTENTION: Status[] = ["submitted", "in_review", "changes_requested", "approved", "scheduled"];

export default function CmsDashboard() {
  const actor = useActor();
  const [lists, setLists] = useState<Record<CmsType, Row[]> | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<"import" | "rebuild" | null>(null);

  const load = useCallback(async () => {
    const entries = await Promise.all(CMS_TYPES.map(async (t) => [t, (await api<{ items: Row[] }>(`/api/cms/items/${t}`)).items] as const));
    setLists(Object.fromEntries(entries) as Record<CmsType, Row[]>);
  }, []);
  useEffect(() => {
    queueMicrotask(() => load().catch((e) => setMessage(e.message)));
  }, [load]);

  if (!lists) return <Loader2 className="h-6 w-6 animate-spin text-[#6D645D] mx-auto mt-20" aria-label="Loading" />;

  const empty = CMS_TYPES.every((t) => lists[t].length === 0);
  // A content type added since the last import (e.g. Jātaka tales) can be imported on its own.
  const missing = CMS_TYPES.filter((t) => lists[t].length === 0);
  const queue = CMS_TYPES.flatMap((t) => lists[t].filter((r) => ATTENTION.includes(r.status)).map((r) => ({ ...r, type: t })));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-[#5B5350]">Content in the app, what needs attention, and recent changes.</p>
        </div>
        {(can(actor, "publish") || can(actor, "audio")) && !empty && (
          <Button
            variant="secondary"
            disabled={busy !== null}
            onClick={async () => {
              setBusy("rebuild");
              try {
                await api("/api/cms/rebuild", { method: "POST" });
                setMessage("The app is updating with everything published. It's live in about 3 minutes.");
              } catch (e) {
                setMessage((e as Error).message);
              }
              setBusy(null);
            }}
          >
            {busy === "rebuild" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Update the app now
          </Button>
        )}
      </div>

      {message && (
        <p role="status" className="rounded-xl bg-white border border-[#E7DCC8] px-4 py-3 text-sm">
          {message}
        </p>
      )}

      {missing.length > 0 && (
        <Card>
          <h2 className="font-bold">{empty ? "Start with the app\u2019s current content" : `Import ${missing.map((t) => TYPE_LABELS[t].many).join(", ")}`}</h2>
          <p className="mt-1 text-sm text-[#5B5350]">
            {empty
              ? "The CMS is empty. Import the prayers, meditations, daily verses and Jātaka tales the app shows today; they arrive as published, so nothing changes for readers."
              : `The app has built-in ${missing.map((t) => TYPE_LABELS[t].many).join(", ")} that aren\u2019t in the CMS yet. Import them to edit them here; they arrive as published, and nothing you already have changes.`}
          </p>
          {actor.role === "super_admin" ? (
            <Button
              className="mt-4"
              disabled={busy !== null}
              onClick={async () => {
                setBusy("import");
                try {
                  const r = await api<{ added: number }>("/api/cms/import", { method: "POST" });
                  setMessage(`Imported ${r.added} items.`);
                  await load();
                } catch (e) {
                  setMessage((e as Error).message);
                }
                setBusy(null);
              }}
            >
              {busy === "import" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Import the app&apos;s content
            </Button>
          ) : (
            <p className="mt-3 text-sm text-[#6D645D]">A Super Admin needs to do this once.</p>
          )}
        </Card>
      )}

      {!empty && <UsagePanel />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CMS_TYPES.map((t) => {
          const rows = lists[t];
          const counts = STATUSES.map((s) => [s, rows.filter((r) => r.status === s).length] as const).filter(([, n]) => n);
          return (
            <Link key={t} href={`/cms/${t}`} className="rounded-2xl bg-white border border-[#E7DCC8] p-5 hover:border-[#6D252C]/40">
              <p className="text-sm font-semibold text-[#5B5350]">{TYPE_LABELS[t].many}</p>
              <p className="mt-1 text-3xl font-bold">{rows.length}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {counts.map(([s, n]) => (
                  <span key={s} className="flex items-center gap-1">
                    <StatusBadge status={s} /> <span className="text-xs text-[#6D645D]">{n}</span>
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      <Card>
        <h2 className="font-bold">Editorial queue</h2>
        <p className="text-sm text-[#5B5350]">Submitted, in review, waiting for changes, approved or scheduled.</p>
        {queue.length === 0 ? (
          <p className="mt-4 text-sm text-[#6D645D]">Nothing waiting.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[#EFE7D8]">
            {queue
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .map((r) => (
                <li key={`${r.type}/${r.slug}`}>
                  <Link href={`/cms/${r.type}/${r.slug}`} className="flex flex-wrap items-center gap-3 py-3 hover:bg-[#FFFCF6] -mx-2 px-2 rounded-lg">
                    <StatusBadge status={r.status} />
                    <span className="font-medium">{r.title}</span>
                    <span className="text-xs text-[#6D645D]">{TYPE_LABELS[r.type].one}</span>
                    <span className="ml-auto text-xs text-[#6D645D]">
                      {r.scheduledAt ? `Goes live ${when(r.scheduledAt)}` : `Updated ${when(r.updatedAt)} by ${r.updatedBy}`}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
