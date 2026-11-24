"use client";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, History, Loader2, Mic, RotateCcw, Save } from "lucide-react";
import { CMS_TYPES, STATUS_LABELS, TYPE_LABELS, itemTitle, type CmsItem, type CmsType, type ReviewLang, type Status, type Transition } from "@/lib/cms/model";
import type { Prayer } from "@/lib/practice/prayers";
import type { MeditationPractice } from "@/lib/practice/meditations";
import type { DailyVerse } from "@/lib/practice/verses";
import { readingPrefs } from "@/lib/practice/preferences";
import { PrayerText } from "@/components/practice/prayer-text";
import { api, ApiError, when } from "@/components/cms/api";
import { MeditationForm, PrayerForm, VerseForm } from "@/components/cms/forms";
import { Button, Card, Problems, StatusBadge, TextArea, TextInput } from "@/components/cms/ui";

interface Loaded {
  item: CmsItem;
  versions: { version: number; at: string; by: string; note?: string }[];
  transitions: Transition[];
  may: { edit: boolean; audio: boolean; subject: boolean; languages: ReviewLang[]; override: boolean };
}

interface Clip {
  line: string;
  lang: "pi" | "hi" | "en";
  text: string;
  file: string;
  ready: boolean;
}

const LANG_LABEL: Record<ReviewLang, string> = { pali: "Pali", hi: "Hindi", en: "English" };

function cleaned(type: CmsType, data: unknown) {
  if (type === "verse") {
    const v = data as DailyVerse;
    return { ...v, pi: v.pi.map((l) => l.trim()).filter(Boolean) };
  }
  return data;
}

// ── Workflow ──────────────────────────────────────────────────────────────
function Workflow({ loaded, dirty, onDone }: { loaded: Loaded; dirty: boolean; onDone: (item: CmsItem, message: string) => void }) {
  const { item, transitions, may } = loaded;
  const [note, setNote] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [override, setOverride] = useState(false);
  const [busy, setBusy] = useState<Status | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  async function go(t: Transition) {
    setBusy(t.to);
    setError(null);
    try {
      const r = await api<{ item: CmsItem; rebuilding: boolean }>(`/api/cms/items/${item.type}/${item.slug}/transition`, {
        method: "POST",
        body: { to: t.to, note, scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined, overrideReviews: override },
      });
      setNote("");
      onDone(
        r.item,
        t.to === "published" ? (r.rebuilding ? "Published. The app updates in about 3 minutes." : "Published. It reaches the app with the next deploy.") : `Moved to “${STATUS_LABELS[t.to]}”.`,
      );
    } catch (e) {
      setError(e as ApiError);
    }
    setBusy(null);
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold">Workflow</h2>
        <StatusBadge status={item.status} />
      </div>
      {item.live ? (
        <p className="text-xs text-[#5B5350]">
          Live in the app: v{item.live.version}, published {when(item.live.publishedAt)}.
          {item.live.version !== item.version && " Changes since then are not live yet."}
        </p>
      ) : (
        <p className="text-xs text-[#5B5350]">Not in the app yet.</p>
      )}
      {item.scheduledAt && <p className="text-xs text-[#3B5B8A]">Goes live {when(item.scheduledAt)}.</p>}
      {dirty && <p className="text-xs text-[#885F19]">Save your changes before moving it on.</p>}
      {transitions.length === 0 ? (
        <p className="text-xs text-[#6D645D]">No steps available to your role at this stage.</p>
      ) : (
        <>
          <TextArea value={note} onChange={setNote} placeholder="Note (what changed, or what to change)" rows={2} />
          {transitions.some((t) => t.to === "scheduled") && (
            <label className="block text-xs text-[#5B5350]">
              Publish at
              <TextInput type="datetime-local" value={scheduledAt} onChange={setScheduledAt} className="mt-1" />
            </label>
          )}
          {transitions.some((t) => t.to === "approved") && may.override && (
            <label className="flex items-start gap-2 text-xs text-[#5B5350]">
              <input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} className="mt-0.5" />
              Approve even if some reviews aren&apos;t signed off (recorded in the audit log)
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            {transitions.map((t) => (
              <Button
                key={t.to}
                variant={t.to === "published" || t.to === "approved" ? "primary" : t.to === "archived" || t.to === "changes_requested" ? "danger" : "secondary"}
                disabled={dirty || busy !== null || (t.to === "scheduled" && !scheduledAt)}
                onClick={() => go(t)}
              >
                {busy === t.to && <Loader2 className="h-4 w-4 animate-spin" />} {t.label}
              </Button>
            ))}
          </div>
        </>
      )}
      <Problems message={error?.message} problems={error?.problems ?? []} />
    </Card>
  );
}

// ── Reviews ───────────────────────────────────────────────────────────────
function Reviews({ loaded, onDone }: { loaded: Loaded; onDone: (item: CmsItem, message: string) => void }) {
  const { item, may } = loaded;
  const [error, setError] = useState<string | null>(null);
  const langs: { lang: ReviewLang; reviewed: boolean; by?: string }[] =
    item.type === "prayer"
      ? (["pali", "hi", "en"] as const).map((l) => ({ lang: l, reviewed: (item.data as Prayer).review[l].status === "reviewed", by: (item.data as Prayer).review[l].reviewedBy }))
      : item.type === "verse"
        ? [{ lang: "hi", reviewed: (item.data as DailyVerse).review === "reviewed" }]
        : [];

  async function set(body: object) {
    setError(null);
    try {
      const r = await api<{ item: CmsItem }>(`/api/cms/items/${item.type}/${item.slug}/review`, { method: "POST", body });
      onDone(r.item, "Review updated.");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const row = (label: string, reviewed: boolean, by: string | undefined, allowed: boolean, body: (reviewed: boolean) => object) => (
    <li key={label} className="flex items-center gap-3 py-2">
      <span className={`flex h-6 w-6 items-center justify-center rounded-full ${reviewed ? "bg-[#56634A] text-white" : "bg-[#EFE7D8] text-[#6D645D]"}`}>
        {reviewed ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      </span>
      <span className="text-sm flex-1">
        {label}
        <span className="block text-xs text-[#6D645D]">{reviewed ? `Signed off${by ? ` by ${by}` : ""}` : "Not signed off"}</span>
      </span>
      {allowed && (
        <Button variant={reviewed ? "ghost" : "secondary"} className="px-3 py-1 text-xs" onClick={() => set(body(!reviewed))}>
          {reviewed ? "Undo" : "Sign off"}
        </Button>
      )}
    </li>
  );

  return (
    <Card>
      <h2 className="font-bold">Reviews</h2>
      <p className="text-xs text-[#5B5350]">Language and subject sign-off are needed before approval. Editing a language clears its sign-off.</p>
      <ul className="mt-2 divide-y divide-[#F4EEE4]">
        {langs.map((l) =>
          row(
            item.type === "verse" ? "Translations" : `${LANG_LABEL[l.lang]} text`,
            l.reviewed,
            l.by,
            item.type === "verse" ? (["pali", "hi", "en"] as const).every((x) => may.languages.includes(x)) : may.languages.includes(l.lang),
            (reviewed) => ({ kind: "language", lang: l.lang, reviewed }),
          ),
        )}
        {row("Subject (tradition, doctrine, sources)", item.subjectReview.status === "reviewed", item.subjectReview.by, may.subject, (reviewed) => ({ kind: "subject", reviewed }))}
      </ul>
      {error && <p className="mt-2 text-xs text-[#7A2A24]">{error}</p>}
    </Card>
  );
}

// ── Audio ────────────────────────────────────────────────────────────────
function Audio({ slug, canMake }: { slug: string; canMake: boolean }) {
  const [clips, setClips] = useState<Clip[] | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => api<{ clips: Clip[] }>(`/api/cms/audio/${slug}`).then((r) => setClips(r.clips)), [slug]);
  useEffect(() => {
    queueMicrotask(() => load().catch((e) => setError(e.message)));
  }, [load]);

  if (!clips) return null;
  const missing = clips.filter((c) => !c.ready);

  async function makeAll() {
    setError(null);
    setProgress({ done: 0, total: missing.length });
    for (const [i, c] of missing.entries()) {
      try {
        await api(`/api/cms/audio/${slug}`, { method: "POST", body: { file: c.file } });
      } catch (e) {
        setError(`${(e as Error).message} (line ${c.line}, ${c.lang})`);
        break;
      }
      setProgress({ done: i + 1, total: missing.length });
    }
    setProgress(null);
    await load();
  }

  return (
    <Card>
      <h2 className="font-bold flex items-center gap-2">
        <Mic className="h-4 w-4" /> Voice clips
      </h2>
      <p className="text-xs text-[#5B5350]">
        {clips.length - missing.length} of {clips.length} lines have an AI voice clip.
        {missing.length > 0 && " Lines without one use the reader's device voice."}
      </p>
      {missing.length > 0 && (
        <ul className="mt-2 max-h-40 overflow-y-auto text-xs text-[#5B5350] space-y-1">
          {missing.map((c) => (
            <li key={c.file}>
              <span className="font-semibold">{c.lang.toUpperCase()}</span> · {c.text}
            </li>
          ))}
        </ul>
      )}
      {missing.length > 0 && canMake && (
        <Button className="mt-3" variant="secondary" disabled={progress !== null} onClick={makeAll}>
          {progress ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> {progress.done} of {progress.total}
            </>
          ) : (
            `Make ${missing.length} missing clip${missing.length === 1 ? "" : "s"}`
          )}
        </Button>
      )}
      {missing.length === 0 && <p className="mt-2 text-xs text-[#56634A]">All lines are ready.</p>}
      <p className="mt-2 text-xs text-[#6D645D]">New clips reach the app with the next publish or “Update the app now”.</p>
      {error && <p className="mt-2 text-xs text-[#7A2A24]">{error}</p>}
    </Card>
  );
}

// ── Versions ─────────────────────────────────────────────────────────────
function Versions({ loaded, onRestored }: { loaded: Loaded; onRestored: (item: CmsItem, message: string) => void }) {
  const { item, versions, may } = loaded;
  const [error, setError] = useState<string | null>(null);
  return (
    <Card>
      <h2 className="font-bold flex items-center gap-2">
        <History className="h-4 w-4" /> Versions
      </h2>
      <ul className="mt-2 max-h-72 overflow-y-auto divide-y divide-[#F4EEE4]">
        {versions.map((v) => (
          <li key={v.version} className="py-2 flex items-start gap-2 text-xs">
            <div className="flex-1">
              <p className="font-semibold text-[#2A1A1C]">
                v{v.version}
                {v.version === item.version && " · current"}
                {v.version === item.live?.version && " · live"}
              </p>
              <p className="text-[#6D645D]">
                {when(v.at)} · {v.by}
                {v.note ? ` · ${v.note}` : ""}
              </p>
            </div>
            {may.edit && v.version !== item.version && (
              <button
                type="button"
                className="flex items-center gap-1 rounded-full px-2 py-1 text-[#6D252C] hover:bg-[#6D252C]/5"
                onClick={async () => {
                  if (!confirm(`Restore v${v.version} as a new version? The current text is kept in the history.`)) return;
                  try {
                    const r = await api<{ item: CmsItem }>(`/api/cms/items/${item.type}/${item.slug}/restore`, { method: "POST", body: { version: v.version } });
                    onRestored(r.item, `Restored v${v.version}.`);
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" /> Restore
              </button>
            )}
          </li>
        ))}
      </ul>
      {error && <p className="mt-2 text-xs text-[#7A2A24]">{error}</p>}
      {item.history.length > 0 && (
        <>
          <h3 className="mt-4 text-sm font-semibold">Workflow history</h3>
          <ul className="mt-1 max-h-48 overflow-y-auto text-xs text-[#5B5350] space-y-1.5">
            {[...item.history].reverse().map((h, i) => (
              <li key={i}>
                {when(h.at)} · {h.by}: {STATUS_LABELS[h.from]} → <span className="font-semibold">{STATUS_LABELS[h.to]}</span>
                {h.note && <span className="block text-[#6D645D]">“{h.note}”</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function CmsEditor({ params }: { params: Promise<{ type: string; slug: string }> }) {
  const { type: raw, slug } = use(params);
  const type = (CMS_TYPES as readonly string[]).includes(raw) ? (raw as CmsType) : null;
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [draft, setDraft] = useState<unknown>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const prefs = readingPrefs.use();

  const load = useCallback(async () => {
    const r = await api<Loaded>(`/api/cms/items/${type}/${slug}`);
    setLoaded(r);
    setDraft(r.item.data);
  }, [type, slug]);
  useEffect(() => {
    if (type) queueMicrotask(() => load().catch((e) => setError(e)));
  }, [type, load]);

  const dirty = useMemo(() => loaded !== null && JSON.stringify(cleaned(loaded.item.type, draft)) !== JSON.stringify(loaded.item.data), [draft, loaded]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!type) return <p>Unknown content type.</p>;
  if (!loaded) return error ? <Problems message={error.message} problems={[]} /> : <Loader2 className="h-6 w-6 animate-spin text-[#6D645D] mx-auto mt-20" aria-label="Loading" />;

  const { item, may } = loaded;
  const after = async (_item: CmsItem, msg: string) => {
    setMessage(msg);
    await load();
  };

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await api(`/api/cms/items/${type}/${slug}`, { method: "PUT", body: { data: cleaned(type!, draft), note } });
      setNote("");
      await load();
      setMessage("Saved as a new version.");
    } catch (e) {
      setError(e as ApiError);
    }
    setSaving(false);
  }

  const livePath = type === "prayer" ? `/practice/${slug}` : type === "meditation" ? `/meditate?practice=${slug}` : "/app";

  return (
    <div className="space-y-5">
      <Link href={`/cms/${type}`} className="inline-flex items-center gap-1.5 text-sm text-[#6D252C]">
        <ArrowLeft className="h-4 w-4" /> {TYPE_LABELS[type].many}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{itemTitle({ ...item, data: draft as never })}</h1>
        <StatusBadge status={item.status} />
        <span className="text-xs text-[#6D645D]">v{item.version}</span>
        {item.live && (
          <a href={livePath} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-sm text-[#6D252C] hover:underline">
            View in app <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      {message && (
        <p role="status" className="rounded-xl bg-[#E9EFE3] border border-[#CBD6C0] px-4 py-2.5 text-sm text-[#3F4A36]">
          {message}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4 min-w-0">
          {type === "prayer" && (
            <div className="flex gap-1" role="tablist">
              {(["edit", "preview"] as const).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === t ? "bg-[#6D252C] text-white" : "text-[#5B5350] hover:bg-[#6D252C]/5"}`}
                >
                  {t === "edit" ? "Edit" : "Preview"}
                </button>
              ))}
            </div>
          )}
          {tab === "preview" && type === "prayer" ? (
            <div className="rounded-3xl bg-[#FFFCF6] border border-[#E7DCC8] px-5 py-6 max-w-xl">
              <p className="font-pali text-2xl font-semibold text-[#3A1418] mb-4">{(draft as Prayer).title.pi}</p>
              <PrayerText prayer={draft as Prayer} prefs={prefs} />
            </div>
          ) : (
            <fieldset disabled={!may.edit} className="min-w-0">
              {!may.edit && <p className="mb-3 text-sm text-[#6D645D]">Your role can read but not edit this content.</p>}
              {type === "prayer" && <PrayerForm value={draft as Prayer} onChange={setDraft} />}
              {type === "meditation" && <MeditationForm value={draft as MeditationPractice} onChange={setDraft} />}
              {type === "verse" && <VerseForm value={draft as DailyVerse} onChange={setDraft} />}
            </fieldset>
          )}
        </div>

        <aside className="space-y-4">
          {may.edit && (
            <Card className="space-y-3 lg:sticky lg:top-20 z-10">
              <h2 className="font-bold">Save</h2>
              <TextInput value={note} onChange={setNote} placeholder="What did you change? (optional)" />
              <Button className="w-full" disabled={!dirty || saving} onClick={save}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {dirty ? "Save changes" : "No changes"}
              </Button>
              {dirty && (
                <Button variant="ghost" className="w-full" onClick={() => setDraft(item.data)}>
                  Discard changes
                </Button>
              )}
              <Problems message={error?.message} problems={error?.problems ?? []} />
              {(item.status === "published" || item.status === "approved") && <p className="text-xs text-[#6D645D]">Saving moves it back to Draft for review; the live version stays until the new one is published.</p>}
            </Card>
          )}
          <Workflow loaded={loaded} dirty={dirty} onDone={after} />
          <Reviews loaded={loaded} onDone={after} />
          {type === "prayer" && <Audio slug={slug} canMake={may.audio} />}
          <Versions loaded={loaded} onRestored={after} />
        </aside>
      </div>
    </div>
  );
}
