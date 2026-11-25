"use client";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { Localised, Prayer, PrayerLine, PrayerSection } from "@/lib/practice/prayers";
import type { MeditationPractice } from "@/lib/practice/meditations";
import type { DailyVerse } from "@/lib/practice/verses";
import type { JatakaStory } from "@/lib/learn/jataka";
import { Button, Card, Field, TextArea, TextInput } from "./ui";

function move<T>(list: T[], i: number, by: -1 | 1): T[] {
  const j = i + by;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function RowTools({ index, count, onMove, onRemove, label }: { index: number; count: number; onMove: (by: -1 | 1) => void; onRemove: () => void; label: string }) {
  return (
    <div className="flex gap-0.5">
      <button type="button" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(-1)} className="rounded-lg p-1.5 text-[#6D645D] hover:bg-[#F7F2E8] disabled:opacity-30">
        <ArrowUp className="h-4 w-4" />
      </button>
      <button type="button" aria-label={`Move ${label} down`} disabled={index === count - 1} onClick={() => onMove(1)} className="rounded-lg p-1.5 text-[#6D645D] hover:bg-[#F7F2E8] disabled:opacity-30">
        <ArrowDown className="h-4 w-4" />
      </button>
      <button type="button" aria-label={`Remove ${label}`} disabled={count === 1} onClick={onRemove} className="rounded-lg p-1.5 text-[#7A2A24] hover:bg-[#FBEDEA] disabled:opacity-30">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function Bilingual({ label, value, onChange, long }: { label: string; value: Localised | undefined; onChange: (v: Localised) => void; long?: boolean }) {
  const v = value ?? { hi: "", en: "" };
  const Input = long ? TextArea : TextInput;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label={`${label} · Hindi`}>
        <Input lang="hi" value={v.hi} onChange={(hi) => onChange({ ...v, hi })} />
      </Field>
      <Field label={`${label} · English`}>
        <Input lang="en" value={v.en} onChange={(en) => onChange({ ...v, en })} />
      </Field>
    </div>
  );
}

// ── Prayer ────────────────────────────────────────────────────────────────
export function PrayerForm({ value, onChange }: { value: Prayer; onChange: (v: Prayer) => void }) {
  const set = (patch: Partial<Prayer>) => onChange({ ...value, ...patch });
  const setSection = (i: number, s: PrayerSection) => set({ sections: value.sections.map((x, k) => (k === i ? s : x)) });

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <h2 className="font-bold">About this prayer</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Title · Pali">
            <TextInput className="font-pali" value={value.title.pi} onChange={(pi) => set({ title: { ...value.title, pi } })} />
          </Field>
          <Field label="Title · Hindi">
            <TextInput lang="hi" value={value.title.hi} onChange={(hi) => set({ title: { ...value.title, hi } })} />
          </Field>
          <Field label="Title · English">
            <TextInput value={value.title.en} onChange={(en) => set({ title: { ...value.title, en } })} />
          </Field>
        </div>
        <Bilingual label="Category" value={value.category} onChange={(category) => set({ category })} />
        <Bilingual label="Summary" value={value.summary} onChange={(summary) => set({ summary })} long />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Tradition / scope">
            <TextInput value={value.tradition} onChange={(tradition) => set({ tradition })} />
          </Field>
          <Field label="Duration (minutes)">
            <TextInput type="number" min={1} max={120} value={String(value.durationMinutes)} onChange={(v) => set({ durationMinutes: Number(v) || 0 })} />
          </Field>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Text</h2>
          <p className="text-xs text-[#6D645D]">Pali in Roman script with diacritics; Devanagari is generated from it.</p>
        </div>
        {value.sections.map((section, si) => (
          <Card key={si} className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-semibold">Section {si + 1}</h3>
              <label className="flex items-center gap-2 text-xs text-[#5B5350]">
                Recite
                <input
                  type="number"
                  min={1}
                  max={21}
                  value={section.repeat ?? 1}
                  onChange={(e) => {
                    const n = Number(e.target.value) || 1;
                    setSection(si, { ...section, repeat: n > 1 ? n : undefined });
                  }}
                  className="w-16 rounded-lg border border-[#E7DCC8] bg-[#FFFCF6] px-2 py-1 text-sm"
                />
                times
              </label>
              <label className="flex items-center gap-2 text-xs text-[#5B5350]">
                <input
                  type="checkbox"
                  checked={Boolean(section.heading)}
                  onChange={(e) => setSection(si, { ...section, heading: e.target.checked ? { hi: "", en: "" } : undefined })}
                />
                Heading
              </label>
              <div className="ml-auto">
                <RowTools
                  label={`section ${si + 1}`}
                  index={si}
                  count={value.sections.length}
                  onMove={(by) => set({ sections: move(value.sections, si, by) })}
                  onRemove={() => set({ sections: value.sections.filter((_, k) => k !== si) })}
                />
              </div>
            </div>
            {section.heading && <Bilingual label="Heading" value={section.heading} onChange={(heading) => setSection(si, { ...section, heading })} />}
            <ol className="space-y-3">
              {section.lines.map((line, li) => {
                const setLine = (l: PrayerLine) => setSection(si, { ...section, lines: section.lines.map((x, k) => (k === li ? l : x)) });
                return (
                  <li key={li} className="rounded-xl border border-[#EFE7D8] bg-[#FFFCF6] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#885F19]">Line {li + 1}</span>
                      <RowTools
                        label={`line ${li + 1}`}
                        index={li}
                        count={section.lines.length}
                        onMove={(by) => setSection(si, { ...section, lines: move(section.lines, li, by) })}
                        onRemove={() => setSection(si, { ...section, lines: section.lines.filter((_, k) => k !== li) })}
                      />
                    </div>
                    <div className="grid gap-2 lg:grid-cols-3">
                      <Field label="Pali">
                        <TextArea className="font-pali" value={line.pi} onChange={(pi) => setLine({ ...line, pi })} />
                      </Field>
                      <Field label="Hindi">
                        <TextArea lang="hi" value={line.hi} onChange={(hi) => setLine({ ...line, hi })} />
                      </Field>
                      <Field label="English">
                        <TextArea value={line.en} onChange={(en) => setLine({ ...line, en })} />
                      </Field>
                    </div>
                  </li>
                );
              })}
            </ol>
            <Button variant="ghost" onClick={() => setSection(si, { ...section, lines: [...section.lines, { pi: "", hi: "", en: "" }] })}>
              <Plus className="h-4 w-4" /> Add line
            </Button>
          </Card>
        ))}
        <Button variant="secondary" onClick={() => set({ sections: [...value.sections, { lines: [{ pi: "", hi: "", en: "" }] }] })}>
          <Plus className="h-4 w-4" /> Add section
        </Button>
      </div>

      <Card className="space-y-4">
        <h2 className="font-bold">Source, notes and rights</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Source title">
            <TextInput value={value.source.title} onChange={(title) => set({ source: { ...value.source, title } })} />
          </Field>
          <Field label="Source reference" hint="Edition and passage, e.g. Sutta Nipāta 2.4">
            <TextInput value={value.source.reference} onChange={(reference) => set({ source: { ...value.source, reference } })} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={Boolean(value.notes)} onChange={(e) => set({ notes: e.target.checked ? { hi: "", en: "" } : undefined })} />
          Notes for readers
        </label>
        {value.notes && <Bilingual label="Notes" value={value.notes} onChange={(notes) => set({ notes })} long />}
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Licence" hint="e.g. Public domain (Pali); translation © WePray">
            <TextInput value={value.rights?.licence ?? ""} onChange={(licence) => set({ rights: licence || value.rights?.translator ? { ...value.rights, licence } : undefined })} />
          </Field>
          <Field label="Translator">
            <TextInput value={value.rights?.translator ?? ""} onChange={(translator) => set({ rights: { licence: value.rights?.licence ?? "", ...value.rights, translator } })} />
          </Field>
          <Field label="Rights notes" hint="Permissions, edition used (not shown in the app)">
            <TextInput value={value.rights?.notes ?? ""} onChange={(notes) => set({ rights: { licence: value.rights?.licence ?? "", ...value.rights, notes } })} />
          </Field>
        </div>
      </Card>
    </div>
  );
}

// ── Meditation ────────────────────────────────────────────────────────────
export function MeditationForm({ value, onChange }: { value: MeditationPractice; onChange: (v: MeditationPractice) => void }) {
  const set = (patch: Partial<MeditationPractice>) => onChange({ ...value, ...patch });
  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <Bilingual label="Name" value={value.title} onChange={(title) => set({ title })} />
        <Field label="Pali name">
          <TextInput className="font-pali" value={value.pali} onChange={(pali) => set({ pali })} />
        </Field>
        <Bilingual label="Summary" value={value.summary} onChange={(summary) => set({ summary })} />
      </Card>
      <Card className="space-y-3">
        <h2 className="font-bold">Steps</h2>
        {value.steps.map((step, i) => (
          <div key={i} className="rounded-xl border border-[#EFE7D8] bg-[#FFFCF6] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#885F19]">Step {i + 1}</span>
              <RowTools
                label={`step ${i + 1}`}
                index={i}
                count={value.steps.length}
                onMove={(by) => set({ steps: move(value.steps, i, by) })}
                onRemove={() => set({ steps: value.steps.filter((_, k) => k !== i) })}
              />
            </div>
            <Bilingual label="Step" value={step} long onChange={(s) => set({ steps: value.steps.map((x, k) => (k === i ? s : x)) })} />
          </div>
        ))}
        <Button variant="ghost" onClick={() => set({ steps: [...value.steps, { hi: "", en: "" }] })}>
          <Plus className="h-4 w-4" /> Add step
        </Button>
      </Card>
      <Card>
        <Bilingual label="Context" value={value.context} onChange={(context) => set({ context })} long />
      </Card>
    </div>
  );
}

// ── Jātaka tale ───────────────────────────────────────────────────────────
export function StoryForm({ value, onChange }: { value: JatakaStory; onChange: (v: JatakaStory) => void }) {
  const set = (patch: Partial<JatakaStory>) => onChange({ ...value, ...patch });
  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <h2 className="font-bold">About this story</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Title · Pali" hint="e.g. Sasa Jātaka">
            <TextInput className="font-pali" value={value.title.pi} onChange={(pi) => set({ title: { ...value.title, pi } })} />
          </Field>
          <Field label="Title · Hindi">
            <TextInput lang="hi" value={value.title.hi} onChange={(hi) => set({ title: { ...value.title, hi } })} />
          </Field>
          <Field label="Title · English">
            <TextInput value={value.title.en} onChange={(en) => set({ title: { ...value.title, en } })} />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Jātaka number" hint="1–547">
            <TextInput type="number" min={1} max={547} value={String(value.number)} onChange={(v) => set({ number: Number(v) || 0, source: { ...value.source, reference: `Jātaka ${Number(v) || ""}` } })} />
          </Field>
          <Field label="Reading time (minutes)">
            <TextInput type="number" min={1} max={60} value={String(value.minutes)} onChange={(v) => set({ minutes: Number(v) || 0 })} />
          </Field>
        </div>
        <Bilingual label="Theme" value={value.theme} onChange={(theme) => set({ theme })} />
        <Bilingual label="Summary" value={value.summary} onChange={(summary) => set({ summary })} long />
      </Card>
      <Card className="space-y-3">
        <h2 className="font-bold">The story</h2>
        <p className="text-xs text-[#6D645D]">A short retelling, paragraph by paragraph. Each Hindi paragraph should say the same as its English one.</p>
        {value.paragraphs.map((p, i) => (
          <div key={i} className="rounded-xl border border-[#EFE7D8] bg-[#FFFCF6] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#885F19]">Paragraph {i + 1}</span>
              <RowTools
                label={`paragraph ${i + 1}`}
                index={i}
                count={value.paragraphs.length}
                onMove={(by) => set({ paragraphs: move(value.paragraphs, i, by) })}
                onRemove={() => set({ paragraphs: value.paragraphs.filter((_, k) => k !== i) })}
              />
            </div>
            <Bilingual label="Paragraph" value={p} long onChange={(x) => set({ paragraphs: value.paragraphs.map((y, k) => (k === i ? x : y)) })} />
          </div>
        ))}
        <Button variant="ghost" onClick={() => set({ paragraphs: [...value.paragraphs, { hi: "", en: "" }] })}>
          <Plus className="h-4 w-4" /> Add paragraph
        </Button>
      </Card>
      <Card className="space-y-4">
        <Bilingual label="What the story teaches" value={value.lesson} onChange={(lesson) => set({ lesson })} long />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Source title">
            <TextInput value={value.source.title} onChange={(title) => set({ source: { ...value.source, title } })} />
          </Field>
          <Field label="Source reference">
            <TextInput value={value.source.reference} onChange={(reference) => set({ source: { ...value.source, reference } })} />
          </Field>
        </div>
      </Card>
    </div>
  );
}

// ── Daily verse ───────────────────────────────────────────────────────────
export function VerseForm({ value, onChange }: { value: DailyVerse; onChange: (v: DailyVerse) => void }) {
  const set = (patch: Partial<DailyVerse>) => onChange({ ...value, ...patch });
  return (
    <Card className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Reference" hint="e.g. Dhammapada 5">
          <TextInput value={value.reference} onChange={(reference) => set({ reference })} />
        </Field>
        <Field label="Show on a date (optional)" hint="Otherwise verses take turns, one per day">
          <TextInput type="date" value={value.date ?? ""} onChange={(date) => set({ date: date || undefined })} />
        </Field>
      </div>
      <Field label="Pali" hint="One line per row">
        <TextArea className="font-pali" rows={3} value={value.pi.join("\n")} onChange={(v) => set({ pi: v.split("\n") })} />
      </Field>
      <Field label="Hindi">
        <TextArea lang="hi" rows={3} value={value.hi} onChange={(hi) => set({ hi })} />
      </Field>
      <Field label="English">
        <TextArea rows={3} value={value.en} onChange={(en) => set({ en })} />
      </Field>
    </Card>
  );
}
