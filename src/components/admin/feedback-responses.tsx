"use client";
import { Download } from "lucide-react";
import { FEEDBACK_QUESTIONS } from "@/lib/feedback-survey";
import type { SurveyAnswers, SurveyQuestion } from "@/lib/surveys";

export interface FeedbackRow {
  id: string;
  answers: SurveyAnswers;
  name: string | null;
  contact: string | null;
  created_at: string;
  profiles: { username: string } | null;
}

type ChoiceQuestion = Extract<SurveyQuestion, { type: "single_choice" | "multi_choice" }>;
type RatingQuestion = Extract<SurveyQuestion, { type: "rating" }>;

function formatAnswer(q: SurveyQuestion, value: SurveyAnswers[string] | undefined): string {
  if (value === undefined || value === null || value === "") return "—";
  if (q.type === "rating") return `${value} / ${q.max}`;
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function downloadCsv(rows: FeedbackRow[]) {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = ["Submitted", "Name", "Contact", "Username", ...FEEDBACK_QUESTIONS.map((q) => q.label)];
  const lines = rows.map((r) =>
    [
      new Date(r.created_at).toISOString(),
      r.name ?? "",
      r.contact ?? "",
      r.profiles?.username ?? "",
      ...FEEDBACK_QUESTIONS.map((q) => {
        const v = r.answers[q.id];
        return v === undefined ? "" : Array.isArray(v) ? v.join("; ") : String(v);
      }),
    ]
      .map((c) => escape(String(c)))
      .join(",")
  );
  const blob = new Blob(["﻿" + [header.map(escape).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wepray-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function RatingSummary({ q, rows }: { q: RatingQuestion; rows: FeedbackRow[] }) {
  const values = rows.map((r) => r.answers[q.id]).filter((v): v is number => typeof v === "number");
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const counts = Array.from({ length: q.max }, (_, i) => values.filter((v) => v === i + 1).length);
  const peak = Math.max(1, ...counts);
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1.5">{q.label}</p>
      <p className="text-2xl font-bold text-white">
        {values.length ? avg.toFixed(1) : "—"} <span className="text-xs font-normal text-gray-500">/ {q.max} avg · {values.length} answers</span>
      </p>
      <div className="mt-2 flex items-end gap-1 h-10">
        {counts.map((c, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full rounded-sm bg-[#8B1A6B]" style={{ height: `${(c / peak) * 32}px`, minHeight: c ? 2 : 0 }} title={`${i + 1}: ${c}`} />
            <span className="text-[9px] text-gray-600">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChoiceSummary({ q, rows }: { q: ChoiceQuestion; rows: FeedbackRow[] }) {
  const counts = new Map(q.options.map((o) => [o, 0]));
  let answered = 0;
  for (const r of rows) {
    const v = r.answers[q.id];
    const picked = Array.isArray(v) ? v : typeof v === "string" ? [v] : [];
    if (picked.length) answered++;
    for (const p of picked) counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  const total = answered || 1;
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1.5">
        {q.label} <span className="text-gray-600">· {answered} answers</span>
      </p>
      <div className="space-y-1">
        {[...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([opt, count]) => (
            <div key={opt} className="flex items-center gap-2 text-xs">
              <span className="text-gray-300 w-40 truncate flex-shrink-0">{opt}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-[#8B1A6B]" style={{ width: `${(count / total) * 100}%` }} />
              </div>
              <span className="text-gray-500 w-14 text-right flex-shrink-0">
                {count} · {Math.round((count / total) * 100)}%
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

export function FeedbackResponses({ rows }: { rows: FeedbackRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="bg-[#1A1D27] border border-white/8 rounded-2xl p-10 text-center">
        <p className="text-sm text-gray-400">No feedback yet.</p>
        <p className="text-xs text-gray-600 mt-1">Share www.wepray.in/survey to start collecting responses.</p>
      </div>
    );
  }

  const textQuestions = FEEDBACK_QUESTIONS.filter((q) => q.type === "text");

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => downloadCsv(rows)}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#8B1A6B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#741458]"
        >
          <Download className="h-3.5 w-3.5" /> Download CSV
        </button>
      </div>

      <div className="bg-[#1A1D27] border border-white/8 rounded-2xl p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-4">Summary</p>
        <div className="grid md:grid-cols-2 gap-6">
          {FEEDBACK_QUESTIONS.map((q) =>
            q.type === "rating" ? (
              <RatingSummary key={q.id} q={q} rows={rows} />
            ) : q.type === "text" ? null : (
              <ChoiceSummary key={q.id} q={q} rows={rows} />
            )
          )}
        </div>
      </div>

      <div className="bg-[#1A1D27] border border-white/8 rounded-2xl p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-4">Suggestions and comments</p>
        <div className="space-y-5">
          {textQuestions.map((q) => {
            const entries = rows.filter((r) => typeof r.answers[q.id] === "string" && r.answers[q.id] !== "");
            return (
              <div key={q.id}>
                <p className="text-xs text-gray-400 mb-2">
                  {q.label} <span className="text-gray-600">· {entries.length}</span>
                </p>
                {entries.length === 0 ? (
                  <p className="text-xs text-gray-600">No answers yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {entries.map((r) => (
                      <li key={r.id} className="rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2 text-sm text-gray-200 whitespace-pre-wrap">
                        {String(r.answers[q.id])}
                        <span className="block mt-1 text-[10px] text-gray-600">
                          {r.name || r.profiles?.username ? `${r.name ?? "@" + r.profiles?.username} · ` : ""}
                          {new Date(r.created_at).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-3">All responses</p>
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="bg-[#1A1D27] border border-white/8 rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                <span className="text-gray-200 font-medium">{r.name || (r.profiles ? `@${r.profiles.username}` : "Anonymous")}</span>
                {r.contact && <span className="text-[#E879C9]">{r.contact}</span>}
                {r.name && r.profiles && <span className="text-gray-500">@{r.profiles.username}</span>}
                <span className="text-[10px] text-gray-600">{new Date(r.created_at).toLocaleString()}</span>
              </div>
              <div className="space-y-1.5">
                {FEEDBACK_QUESTIONS.map((q) => (
                  <div key={q.id} className="text-sm">
                    <span className="text-gray-500">{q.label}: </span>
                    <span className="text-gray-200 whitespace-pre-wrap">{formatAnswer(q, r.answers[q.id])}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
