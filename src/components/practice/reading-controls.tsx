"use client";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TranslationLang } from "@/lib/practice/prayers";
import {
  readingPrefs,
  TEXT_SIZE_MAX,
  TEXT_SIZE_MIN,
  type DisplayMode,
  type ReadingPrefs,
} from "@/lib/practice/preferences";
import { useT } from "@/lib/i18n/use-t";

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  tone = "light",
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  tone?: "light" | "dark";
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex rounded-full p-0.5", tone === "dark" ? "bg-white/10" : "bg-[#EFE7D8]")}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap",
            tone === "dark"
              ? value === o.value ? "bg-[#F7F2E8] text-[#6D252C]" : "text-white/70 hover:text-white"
              : value === o.value ? "bg-[#6D252C] text-white shadow-sm" : "text-[#6D252C]/80 hover:text-[#6D252C]",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Display mode, translation language, Pali script and text size. */
export function ReadingControls({ prefs, className }: { prefs: ReadingPrefs; className?: string }) {
  const update = (patch: Partial<ReadingPrefs>) => readingPrefs.set({ ...prefs, ...patch });
  const { t } = useT();

  return (
    <div className={cn("space-y-2.5", className)}>
      <Segmented<DisplayMode>
        label={t("reading.show")}
        value={prefs.mode}
        onChange={(mode) => update({ mode })}
        options={[
          { value: "pali", label: t("reading.pali") },
          { value: "both", label: t("reading.both") },
          { value: "translation", label: t("reading.translation") },
        ]}
      />
      <div className="grid grid-cols-2 gap-2.5">
        <Segmented<TranslationLang>
          label={t("reading.translationLang")}
          value={prefs.translation}
          onChange={(translation) => update({ translation })}
          options={[
            { value: "hi", label: "हिन्दी" },
            { value: "en", label: "English" },
          ]}
        />
        <Segmented<ReadingPrefs["script"]>
          label={t("reading.script")}
          value={prefs.script}
          onChange={(script) => update({ script })}
          options={[
            { value: "roman", label: t("reading.roman") },
            { value: "devanagari", label: "देवनागरी" },
          ]}
        />
      </div>
      <div className="flex items-center justify-between pt-0.5">
        <span className="text-xs font-medium text-[#6E6560]">{t("reading.size")}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t("reading.smaller")}
            disabled={prefs.size <= TEXT_SIZE_MIN}
            onClick={() => update({ size: prefs.size - 1 })}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#6D252C] hover:bg-[#F7F2E8] disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={t("reading.larger")}
            disabled={prefs.size >= TEXT_SIZE_MAX}
            onClick={() => update({ size: prefs.size + 1 })}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#6D252C] hover:bg-[#F7F2E8] disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
