"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CONTACT_TOPICS, contactTopicLabel } from "@/lib/contact";

export interface ContactRow {
  id: string;
  topic: string;
  message: string;
  name: string | null;
  reply_to: string;
  status: "open" | "resolved";
  created_at: string;
  profiles: { username: string } | null;
}

export function ContactMessages({ rows }: { rows: ContactRow[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<"open" | "resolved" | "all">("open");
  const [topic, setTopic] = useState<string>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const shown = rows.filter((r) => (status === "all" || r.status === status) && (topic === "all" || r.topic === topic));

  const toggle = async (r: ContactRow) => {
    setBusyId(r.id);
    await fetch(`/api/admin/contact/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: r.status === "open" ? "resolved" : "open" }),
    });
    setBusyId(null);
    router.refresh();
  };

  const chip = (active: boolean) =>
    cn("px-3 py-1.5 rounded-full text-xs font-semibold transition-colors", active ? "bg-[#8B1A6B] text-white" : "text-gray-400 hover:text-white");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 bg-white/5 rounded-full p-1">
          {(["open", "resolved", "all"] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)} className={chip(status === s)}>
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 bg-white/5 rounded-full p-1">
          <button type="button" onClick={() => setTopic("all")} className={chip(topic === "all")}>All topics</button>
          {CONTACT_TOPICS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTopic(t.id)} className={chip(topic === t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="bg-[#1A1D27] border border-white/8 rounded-2xl p-10 text-center text-sm text-gray-400">No messages here.</div>
      ) : (
        shown.map((r) => (
          <div key={r.id} className="bg-[#1A1D27] border border-white/8 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
              <span className={cn("rounded-full px-2 py-0.5 font-semibold", r.topic === "privacy" || r.topic === "safety" || r.topic === "guardian" ? "bg-amber-500/15 text-amber-300" : "bg-white/10 text-gray-300")}>
                {contactTopicLabel(r.topic)}
              </span>
              <span className="text-gray-200 font-medium">{r.name || (r.profiles ? `@${r.profiles.username}` : "Anonymous")}</span>
              <span className="text-[#E879C9]">{r.reply_to}</span>
              {r.name && r.profiles && <span className="text-gray-500">@{r.profiles.username}</span>}
              <span className="text-[10px] text-gray-600">{new Date(r.created_at).toLocaleString()}</span>
              <button
                type="button"
                disabled={busyId === r.id}
                onClick={() => toggle(r)}
                className={cn(
                  "ml-auto rounded-full px-3 py-1 font-semibold transition-colors disabled:opacity-50",
                  r.status === "open" ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25" : "bg-white/10 text-gray-300 hover:bg-white/20"
                )}
              >
                {r.status === "open" ? "Mark resolved" : "Reopen"}
              </button>
            </div>
            <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{r.message}</p>
          </div>
        ))
      )}
    </div>
  );
}
