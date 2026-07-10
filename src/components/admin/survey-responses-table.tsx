"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SURVEYS, type SurveyDefinition, type SurveyQuestion } from "@/lib/surveys";
import type { SurveyResponse } from "@/lib/types";

interface SurveyResponsesTableProps {
  responsesBySurveyId: Record<number, SurveyResponse[]>;
}

export function SurveyResponsesTable({ responsesBySurveyId }: SurveyResponsesTableProps) {
  const [surveyId, setSurveyId] = useState(SURVEYS[0].id);
  const survey = SURVEYS.find((s) => s.id === surveyId)!;
  const rows = responsesBySurveyId[surveyId] ?? [];

  return (
    <div>
      <div className="flex gap-1 mb-5 bg-white/5 rounded-full p-1 w-fit">
        {SURVEYS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSurveyId(s.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-semibold transition-colors",
              surveyId === s.id ? "bg-[#8B1A6B] text-white" : "text-gray-400 hover:text-white"
            )}
          >
            {s.title} ({(responsesBySurveyId[s.id] ?? []).length})
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">No responses yet.</p>
      ) : (
        <div className="space-y-6">
          <AggregateSummary survey={survey} rows={rows} />
          <div className="space-y-3">
            {rows.map((row) => (
              <ResponseCard key={row.id} survey={survey} row={row} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AggregateSummary({ survey, rows }: { survey: SurveyDefinition; rows: SurveyResponse[] }) {
  return (
    <div className="bg-[#1A1D27] border border-white/8 rounded-2xl p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-3">
        {rows.length} response{rows.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-2 gap-4">
        {survey.questions
          .filter((q): q is Exclude<SurveyQuestion, { type: "text" }> => q.type !== "text")
          .map((q) => (
            <QuestionAggregate key={q.id} question={q} rows={rows} />
          ))}
      </div>
    </div>
  );
}

function QuestionAggregate({ question, rows }: { question: Exclude<SurveyQuestion, { type: "text" }>; rows: SurveyResponse[] }) {
  if (question.type === "rating") {
    const values = rows.map((r) => r.answers[question.id]).filter((v): v is number => typeof v === "number");
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return (
      <div>
        <p className="text-xs text-gray-400 mb-1.5">{question.label}</p>
        <p className="text-lg font-bold text-white">
          {avg.toFixed(1)} <span className="text-xs font-normal text-gray-500">/ {question.max} avg</span>
        </p>
      </div>
    );
  }

  const counts = new Map<string, number>();
  for (const opt of question.options) counts.set(opt, 0);
  for (const row of rows) {
    const value = row.answers[question.id];
    const selected = Array.isArray(value) ? value : value ? [String(value)] : [];
    for (const opt of selected) counts.set(opt, (counts.get(opt) ?? 0) + 1);
  }
  const total = rows.length || 1;

  return (
    <div>
      <p className="text-xs text-gray-400 mb-1.5">{question.label}</p>
      <div className="space-y-1">
        {[...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([opt, count]) => (
            <div key={opt} className="flex items-center gap-2 text-xs">
              <span className="text-gray-300 w-28 truncate flex-shrink-0">{opt}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-[#8B1A6B]" style={{ width: `${(count / total) * 100}%` }} />
              </div>
              <span className="text-gray-500 w-8 text-right flex-shrink-0">{count}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

function formatAnswer(question: SurveyQuestion, value: string | string[] | number | undefined): string {
  if (value === undefined || value === null || value === "") return "—";
  if (question.type === "rating") return `${value} / ${question.max}`;
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
}

function ResponseCard({ survey, row }: { survey: SurveyDefinition; row: SurveyResponse }) {
  return (
    <div className="bg-[#1A1D27] border border-white/8 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-300 font-medium">@{row.profiles?.username ?? row.user_id.slice(0, 8)}</span>
        <span className="text-[10px] text-gray-600">{new Date(row.created_at).toLocaleString()}</span>
      </div>
      <div className="space-y-2">
        {survey.questions.map((q) => (
          <div key={q.id} className="text-sm">
            <span className="text-gray-500">{q.label}: </span>
            <span className="text-gray-200">{formatAnswer(q, row.answers[q.id])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
