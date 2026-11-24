// Checks that content saved from the CMS has the shape the app needs, so a
// mistake in the editor can never break a page. Returns readable problems.

import type { CmsType } from "./model";

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => typeof v === "string" && v.trim().length > 0;

function localised(v: unknown, path: string, out: string[]) {
  if (!isObj(v) || !str(v.hi) || !str(v.en)) out.push(`${path}: Hindi and English are both required.`);
}

function review(v: unknown, out: string[]) {
  if (!isObj(v)) return out.push("Review status is missing.");
  for (const k of ["pali", "hi", "en"]) {
    const r = v[k];
    if (!isObj(r) || (r.status !== "draft" && r.status !== "reviewed")) out.push(`Review (${k}) must be draft or reviewed.`);
    else if (r.status === "reviewed" && !str(r.reviewedBy)) out.push(`Review (${k}): add who reviewed it.`);
  }
}

function prayer(d: Obj, out: string[]) {
  if (!isObj(d.title) || !str(d.title.pi) || !str(d.title.hi) || !str(d.title.en)) out.push("Title: Pali, Hindi and English are required.");
  localised(d.category, "Category", out);
  localised(d.summary, "Summary", out);
  if (!str(d.tradition)) out.push("Tradition is required.");
  if (typeof d.durationMinutes !== "number" || d.durationMinutes < 1 || d.durationMinutes > 120) out.push("Duration must be 1–120 minutes.");
  if (!Array.isArray(d.sections) || d.sections.length === 0) out.push("Add at least one section.");
  else
    d.sections.forEach((s, i) => {
      if (!isObj(s)) return out.push(`Section ${i + 1} is invalid.`);
      if (s.heading !== undefined) localised(s.heading, `Section ${i + 1} heading`, out);
      if (s.repeat !== undefined && (typeof s.repeat !== "number" || s.repeat < 1 || s.repeat > 21)) out.push(`Section ${i + 1}: repeat must be 1–21.`);
      if (!Array.isArray(s.lines) || s.lines.length === 0) return out.push(`Section ${i + 1}: add at least one line.`);
      s.lines.forEach((l, j) => {
        if (!isObj(l) || !str(l.pi) || !str(l.hi) || !str(l.en)) out.push(`Section ${i + 1}, line ${j + 1}: Pali, Hindi and English are required.`);
      });
    });
  if (!isObj(d.source) || !str(d.source.title) || !str(d.source.reference)) out.push("Source title and reference are required.");
  if (d.notes !== undefined) localised(d.notes, "Notes", out);
  review(d.review, out);
}

function meditation(d: Obj, out: string[]) {
  localised(d.title, "Title", out);
  if (!str(d.pali)) out.push("Pali name is required.");
  localised(d.summary, "Summary", out);
  if (!Array.isArray(d.steps) || d.steps.length === 0) out.push("Add at least one step.");
  else d.steps.forEach((s, i) => localised(s, `Step ${i + 1}`, out));
  localised(d.context, "Context", out);
}

function verse(d: Obj, out: string[]) {
  if (!str(d.reference)) out.push("Reference is required (e.g. Dhammapada 5).");
  if (!Array.isArray(d.pi) || d.pi.length === 0 || !d.pi.every(str)) out.push("Pali: add at least one line.");
  if (!str(d.hi) || !str(d.en)) out.push("Hindi and English translations are required.");
  if (d.review !== "draft" && d.review !== "reviewed") out.push("Review must be draft or reviewed.");
  if (d.date !== undefined && d.date !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(String(d.date))) out.push("Date must be YYYY-MM-DD.");
}

export function validate(type: CmsType, data: unknown): string[] {
  const out: string[] = [];
  if (!isObj(data)) return ["Content is missing."];
  if (type === "prayer") prayer(data, out);
  else if (type === "meditation") meditation(data, out);
  else verse(data, out);
  return out;
}
