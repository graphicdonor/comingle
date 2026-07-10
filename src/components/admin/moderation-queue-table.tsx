"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ModerationLog {
  id: string;
  content_type: string;
  content_id: string | null;
  user_id: string;
  input_text: string | null;
  input_image_urls: string[];
  scores: Record<string, number>;
  flagged_categories: string[];
  decision: string;
  api_error: string | null;
  created_at: string;
  profiles: { username: string; full_name: string | null } | null;
}

interface QueueRow {
  id: string;
  status: string;
  created_at: string;
  moderation_logs: ModerationLog;
}

interface AppealRow {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  moderation_logs: ModerationLog;
}

interface ModerationQueueTableProps {
  queueRows: QueueRow[];
  appealRows: AppealRow[];
}

export function ModerationQueueTable({ queueRows, appealRows }: ModerationQueueTableProps) {
  const [tab, setTab] = useState<"queue" | "appeals">("queue");

  return (
    <div>
      <div className="flex gap-1 mb-5 bg-white/5 rounded-full p-1 w-fit">
        {(["queue", "appeals"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-semibold transition-colors",
              tab === t ? "bg-[#8B1A6B] text-white" : "text-gray-400 hover:text-white"
            )}
          >
            {t === "queue" ? `Pending Review (${queueRows.length})` : `Appeals (${appealRows.length})`}
          </button>
        ))}
      </div>

      {tab === "queue" ? <QueueList rows={queueRows} /> : <AppealsList rows={appealRows} />}
    </div>
  );
}

function LogSummary({ log }: { log: ModerationLog }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
          {log.content_type.replace(/_/g, " ")}
        </span>
        <span className="text-xs text-gray-500">
          @{log.profiles?.username ?? log.user_id.slice(0, 8)}
        </span>
        <span className="text-[10px] text-gray-600">{new Date(log.created_at).toLocaleString()}</span>
      </div>
      {log.input_text && <p className="text-sm text-gray-200 mb-2 whitespace-pre-wrap line-clamp-4">{log.input_text}</p>}
      {log.input_image_urls.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {log.input_image_urls.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="Flagged content" className="w-16 h-16 rounded-lg object-cover" />
          ))}
        </div>
      )}
      {log.api_error ? (
        <p className="text-xs text-amber-400">Moderation API error: {log.api_error}</p>
      ) : log.flagged_categories.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {log.flagged_categories.map((cat) => (
            <span key={cat} className="text-[10px] font-medium bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">
              {cat} ({Math.round((log.scores[cat] ?? 0) * 100)}%)
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function QueueList({ rows }: { rows: QueueRow[] }) {
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const act = async (id: string, action: "approve" | "reject") => {
    setLoadingId(id);
    const res = await fetch(`/api/admin/moderation/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoadingId(null);
    if (res.ok) {
      setResolved((prev) => new Set(prev).add(id));
      router.refresh();
    }
  };

  const visible = rows.filter((r) => !resolved.has(r.id));
  if (visible.length === 0) return <p className="text-sm text-gray-500 py-8 text-center">Nothing pending review.</p>;

  return (
    <div className="space-y-3">
      {visible.map((row) => (
        <div key={row.id} className="bg-[#1A1D27] border border-white/8 rounded-2xl p-4 flex gap-4">
          <LogSummary log={row.moderation_logs} />
          <div className="flex flex-col gap-2 flex-shrink-0 justify-center">
            <button
              onClick={() => act(row.id, "approve")}
              disabled={loadingId === row.id}
              className="text-xs font-semibold px-4 py-2 rounded-full bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => act(row.id, "reject")}
              disabled={loadingId === row.id}
              className="text-xs font-semibold px-4 py-2 rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AppealsList({ rows }: { rows: AppealRow[] }) {
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const act = async (id: string, action: "approve" | "deny") => {
    setLoadingId(id);
    const res = await fetch(`/api/admin/moderation/appeals/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoadingId(null);
    if (res.ok) {
      setResolved((prev) => new Set(prev).add(id));
      router.refresh();
    }
  };

  const visible = rows.filter((r) => !resolved.has(r.id));
  if (visible.length === 0) return <p className="text-sm text-gray-500 py-8 text-center">No pending appeals.</p>;

  return (
    <div className="space-y-3">
      {visible.map((row) => (
        <div key={row.id} className="bg-[#1A1D27] border border-white/8 rounded-2xl p-4 flex gap-4">
          <div className="flex-1 min-w-0">
            <LogSummary log={row.moderation_logs} />
            <div className="mt-2 pt-2 border-t border-white/8">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Appeal reason</p>
              <p className="text-sm text-gray-200 whitespace-pre-wrap">{row.reason}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0 justify-center">
            <button
              onClick={() => act(row.id, "approve")}
              disabled={loadingId === row.id}
              className="text-xs font-semibold px-4 py-2 rounded-full bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors disabled:opacity-50"
            >
              Restore
            </button>
            <button
              onClick={() => act(row.id, "deny")}
              disabled={loadingId === row.id}
              className="text-xs font-semibold px-4 py-2 rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-50"
            >
              Deny
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
