"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { readingPrefs, favourites, recentPrayers, welcomeDone } from "@/lib/practice/preferences";
import { uiLang, useT } from "@/lib/i18n/use-t";
import type { UiLang } from "@/lib/i18n/dictionary";
import { getPrayer } from "@/lib/practice/prayers";
import { ReadingControls, Segmented } from "@/components/practice/reading-controls";
import { PrayerText } from "@/components/practice/prayer-text";
import { OfflineSettings } from "./offline-settings";
import { AccountSection } from "./account-section";
import { RemindersSection } from "./reminders-section";
import { useAccount } from "@/lib/practice/sync";

const PREVIEW = getPrayer("buddha-vandana");

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#885F19] mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function PreferencesView() {
  const prefs = readingPrefs.use();
  const favs = favourites.use();
  const recent = recentPrayers.use();
  const [cleared, setCleared] = useState<string | null>(null);
  const { t, lang } = useT();
  const account = useAccount();

  function clear(what: "history" | "saved") {
    if (what === "history") recentPrayers.set([]);
    else favourites.set([]);
    setCleared(what);
    setTimeout(() => setCleared(null), 2000);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-[#2A1A1C]">{t("settings.title")}</h1>
        <p className="mt-1 text-[15px] text-[#5B5350]">{t("settings.intro")}</p>
      </header>

      <Section title={t("account.section")}>
        <AccountSection />
      </Section>

      <Section title={t("settings.language")}>
        <div className="rounded-3xl bg-white border border-[#E7DCC8] p-4">
          <p className="text-xs font-medium text-[#6E6560] mb-2">{t("settings.appLanguage")}</p>
          <Segmented<UiLang>
            label={t("settings.appLanguage")}
            value={lang}
            onChange={(l) => uiLang.set(l)}
            options={[
              { value: "hi", label: "हिन्दी" },
              { value: "en", label: "English" },
            ]}
          />
        </div>
      </Section>

      <Section title={t("settings.reading")}>
        <div className="rounded-3xl bg-white border border-[#E7DCC8] p-4">
          <ReadingControls prefs={prefs} />
          {PREVIEW && (
            <div className="mt-4 rounded-2xl bg-[#FFFCF6] border border-[#EFE5D3] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6D645D] mb-2">{t("settings.preview")}</p>
              <PrayerText prayer={PREVIEW} prefs={prefs} />
            </div>
          )}
        </div>
      </Section>

      <Section title={t("settings.practice")}>
        <label className="flex items-center justify-between gap-4 rounded-3xl bg-white border border-[#E7DCC8] px-5 py-4 cursor-pointer">
          <span>
            <span className="block font-semibold text-[#2A1A1C]">{t("settings.keepAwake")}</span>
            <span className="block text-sm text-[#5B5350]">{t("settings.keepAwakeHint")}</span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={prefs.keepAwake}
            onChange={(e) => readingPrefs.set({ ...prefs, keepAwake: e.target.checked })}
            className="sr-only peer"
          />
          <span
            aria-hidden
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors flex-shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-[#6D252C]/40",
              prefs.keepAwake ? "bg-[#6D252C]" : "bg-[#8E847C]",
            )}
          >
            <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all", prefs.keepAwake ? "left-6" : "left-1")} />
          </span>
        </label>
      </Section>

      <Section title={t("remind.section")}>
        <RemindersSection />
      </Section>

      <Section title={t("offline.section")}>
        <OfflineSettings />
      </Section>

      <Section title={t("settings.data")}>
        <div className="rounded-3xl bg-white border border-[#E7DCC8] divide-y divide-[#EFE5D3]">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <span>
              <span className="block font-semibold text-[#2A1A1C]">{t("settings.recent")}</span>
              <span className="block text-sm text-[#5B5350]">{t("settings.recentCount", { n: recent.length })}</span>
            </span>
            <button
              type="button"
              disabled={recent.length === 0}
              onClick={() => clear("history")}
              className="rounded-full border border-[#6D252C]/25 px-4 py-2 text-sm font-semibold text-[#6D252C] disabled:opacity-40"
            >
              {cleared === "history" ? t("settings.cleared") : t("settings.clear")}
            </button>
          </div>
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <span>
              <span className="block font-semibold text-[#2A1A1C]">{t("settings.savedPrayers")}</span>
              <span className="block text-sm text-[#5B5350]">{t("settings.savedCount", { n: favs.length })}</span>
            </span>
            <button
              type="button"
              disabled={favs.length === 0}
              onClick={() => clear("saved")}
              className="rounded-full border border-[#6D252C]/25 px-4 py-2 text-sm font-semibold text-[#6D252C] disabled:opacity-40"
            >
              {cleared === "saved" ? t("settings.removed") : t("settings.removeAll")}
            </button>
          </div>
        </div>
        <p className="mt-3 flex gap-2 text-xs text-[#6E6560] leading-relaxed">
          <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#87977A]" />
          {account.user ? t("settings.privacyNoteSynced") : t("settings.privacyNote")}
        </p>
      </Section>

      <Section title={t("settings.about")}>
        <div className="rounded-3xl bg-white border border-[#E7DCC8] divide-y divide-[#EFE5D3]">
          {[
            { href: "/privacy", label: t("settings.privacy") },
            { href: "/terms", label: t("settings.terms") },
            { href: "/contact", label: t("settings.contact") },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center justify-between px-5 py-4 text-[15px] font-medium text-[#2A1A1C]">
              {l.label}
              <ChevronRight className="h-4 w-4 text-[#B5AA9F]" />
            </Link>
          ))}
          <button
            type="button"
            onClick={() => welcomeDone.set(false)}
            className="w-full flex items-center justify-between px-5 py-4 text-[15px] font-medium text-[#2A1A1C] text-left"
          >
            {t("settings.showWelcome")}
            <ChevronRight className="h-4 w-4 text-[#B5AA9F]" />
          </button>
        </div>
      </Section>
    </div>
  );
}
