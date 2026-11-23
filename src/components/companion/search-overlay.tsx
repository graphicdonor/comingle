"use client";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Flower2, GraduationCap, Search, X, type LucideIcon } from "lucide-react";
import { normalise, search, type ResultKind } from "@/lib/practice/search";
import { useT } from "@/lib/i18n/use-t";
import type { MessageKey } from "@/lib/i18n/dictionary";

const GROUPS: { kind: ResultKind; label: MessageKey; icon: LucideIcon }[] = [
  { kind: "prayer", label: "search.prayers", icon: BookOpen },
  { kind: "guide", label: "search.guides", icon: GraduationCap },
  { kind: "meditation", label: "search.meditation", icon: Flower2 },
];

const SUGGESTIONS = { en: ["refuge", "metta", "knees", "offerings"], hi: ["शरण", "मैत्री", "घुटने", "दान"] };

/**
 * Highlights query words in `text`. Matching ignores case and diacritics, so
 * each character is normalised on its own and mapped back to its position.
 */
function Highlighted({ text, terms }: { text: string; terms: string[] }) {
  const chars = Array.from(text);
  let norm = "";
  const origin: number[] = [];
  chars.forEach((ch, i) => {
    const n = normalise(ch);
    for (let k = 0; k < n.length; k++) origin.push(i);
    norm += n;
  });
  const marked = new Array(chars.length).fill(false);
  for (const term of terms) {
    if (!term) continue;
    let at = norm.indexOf(term);
    while (at !== -1) {
      for (let k = at; k < at + term.length; k++) marked[origin[k]] = true;
      at = norm.indexOf(term, at + term.length);
    }
  }
  const parts: { text: string; mark: boolean }[] = [];
  chars.forEach((ch, i) => {
    const last = parts[parts.length - 1];
    if (last && last.mark === marked[i]) last.text += ch;
    else parts.push({ text: ch, mark: marked[i] });
  });
  return (
    <>
      {parts.map((p, i) =>
        p.mark ? (
          <mark key={i} className="bg-[#F6DFAE] text-inherit rounded-sm px-0.5">
            {p.text}
          </mark>
        ) : (
          <Fragment key={i}>{p.text}</Fragment>
        ),
      )}
    </>
  );
}

export function SearchButton() {
  const [open, setOpen] = useState(false);
  const { t } = useT();
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("search.open")}
        className="ml-auto w-10 h-10 -mr-2 rounded-full flex items-center justify-center text-[#6D252C] hover:bg-[#EFE7D8]"
      >
        <Search className="h-5 w-5" />
      </button>
      {/* Portalled to <body>: the header's backdrop blur would otherwise
          become the containing block for this fixed overlay and clip it. */}
      {open && createPortal(<SearchOverlay onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { t, lang } = useT();
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(query, lang), [query, lang]);
  const terms = normalise(query).split(/\s+/).filter(Boolean);
  const other = lang === "hi" ? "en" : "hi";

  useEffect(() => {
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={t("search.open")} className="fixed inset-0 z-[55] flex flex-col bg-[#F7F2E8]">
      <div className="flex-shrink-0 pt-[env(safe-area-inset-top)] border-b border-[#E7DCC8] bg-[#F7F2E8]">
        <div className="max-w-xl mx-auto h-16 px-4 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-full bg-white border border-[#E7DCC8] px-4 h-11 focus-within:border-[#6D252C]">
            <Search className="h-4 w-4 text-[#6D645D] flex-shrink-0" aria-hidden />
            <input
              ref={input}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              aria-label={t("search.placeholder")}
              enterKeyHint="search"
              className="flex-1 min-w-0 bg-transparent text-[15px] text-[#2A1A1C] placeholder:text-[#6E6560] outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label={t("search.clear")} className="text-[#6D645D]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label={t("search.close")} className="px-2 py-2 text-sm font-semibold text-[#6D252C]">
            {t("search.cancel")}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 py-5">
          {!query.trim() ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#885F19] mb-3">{t("search.try")}</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS[lang].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className="rounded-full bg-white border border-[#E7DCC8] px-4 py-2 text-sm font-medium text-[#2A1A1C] hover:border-[#C6A15B]"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mt-6 text-xs text-[#6D645D] leading-relaxed">{t("search.hint")}</p>
            </div>
          ) : results.length === 0 ? (
            <p className="mt-8 text-center text-[15px] text-[#5B5350] leading-relaxed">{t("search.none", { q: query.trim() })}</p>
          ) : (
            <div className="space-y-6">
              <p className="text-xs text-[#6D645D]" aria-live="polite">{t("search.count", { n: results.length })}</p>
              {GROUPS.map(({ kind, label, icon: Icon }) => {
                const group = results.filter((r) => r.kind === kind);
                if (group.length === 0) return null;
                return (
                  <section key={kind}>
                    <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#885F19] mb-2">
                      <Icon className="h-3.5 w-3.5" aria-hidden /> {t(label)}
                    </h2>
                    <ul className="space-y-2">
                      {group.map((r) => (
                        <li key={r.id}>
                          <Link
                            href={r.href}
                            onClick={onClose}
                            className="block rounded-2xl bg-white border border-[#E7DCC8] px-4 py-3 hover:border-[#C6A15B] transition-colors"
                          >
                            <p className="font-semibold text-[#2A1A1C]">
                              {r.kind === "prayer" && r.title.pi ? (
                                <span className="font-pali">
                                  <Highlighted text={r.title.pi} terms={terms} />
                                </span>
                              ) : (
                                <span lang={lang}>
                                  <Highlighted text={r.title[lang]} terms={terms} />
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-[#5B5350]">
                              {r.kind === "prayer" ? (
                                <span lang={lang}>
                                  <Highlighted text={r.title[lang]} terms={terms} />
                                </span>
                              ) : r.kind === "meditation" && r.title.pi ? (
                                <span className="font-pali">{r.title.pi}</span>
                              ) : (
                                <span lang={other}>{r.title[other]}</span>
                              )}
                            </p>
                            {r.snippet && (
                              <p className="mt-1.5 text-sm text-[#6E6560] leading-relaxed">
                                <Highlighted text={r.snippet} terms={terms} />
                              </p>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
