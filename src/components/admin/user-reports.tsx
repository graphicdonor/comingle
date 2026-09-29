"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { USER_REPORT_REASONS } from "@/lib/safety";

export interface UserReportRow {
  id: string;
  reason: string;
  details: string | null;
  status: "open" | "resolved";
  created_at: string;
  reporter: { username: string } | null;
  reported: { username: string; full_name: string | null } | null;
  comment: { content: string } | null;
}

const reasonLabel = (r: string) => USER_REPORT_REASONS.find((x) => x.value === r)?.label ?? r;

export function UserReports({ rows }: { rows: UserReportRow[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<"open" | "resolved" | "all">("open");
  const [busyId, setBusyId] = useState<string | null>(null);
  const shown = rows.filter((r) => status === "all" || r.status === status);

  const toggle = async (r: UserReportRow) => {
    setBusyId(r.id);
    await fetch(`/api/admin/user-reports/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: r.status === "open" ? "resolved" : "open" }),
    });
    setBusyId(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-white/5 rounded-full p-1 w-fit">
        {(["open", "resolved", "all"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-semibold", status === s ? "bg-[#8B1A6B] text-white" : "text-gray-400 hover:text-white")}
          >
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="bg-[#1A1D27] border border-white/8 rounded-2xl p-10 text-center text-sm text-gray-400">No reports here.</div>
      ) : (
        shown.map((r) => (
          <div key={r.id} className="bg-[#1A1D27] border border-white/8 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
              <span className="rounded-full bg-amber-500/15 text-amber-300 px-2 py-0.5 font-semibold">{reasonLabel(r.reason)}</span>
              <span className="text-gray-400">
                {r.comment ? "Comment by" : "User"}{" "}
                {r.reported ? (
                  <a href={`/profile/${r.reported.username}`} target="_blank" className="text-[#E879C9] hover:underline">
                    @{r.reported.username}
                  </a>
                ) : (
                  "a deleted account"
                )}
              </span>
              <span className="text-gray-500">reported by @{r.reporter?.username ?? "deleted"}</span>
              <span className="text-[10px] text-gray-600">{new Date(r.created_at).toLocaleString()}</span>
              <button
                type="button"
                disabled={busyId === r.id}
                onClick={() => toggle(r)}
                className={cn(
                  "ml-auto rounded-full px-3 py-1 font-semibold disabled:opacity-50",
                  r.status === "open" ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25" : "bg-white/10 text-gray-300 hover:bg-white/20"
                )}
              >
                {r.status === "open" ? "Mark resolved" : "Reopen"}
              </button>
            </div>
            {r.comment && <p className="text-sm text-gray-200 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2 whitespace-pre-wrap">“{r.comment.content}”</p>}
            {r.details && <p className="mt-2 text-sm text-gray-400 whitespace-pre-wrap">{r.details}</p>}
          </div>
        ))
      )}
    </div>
  );
}
