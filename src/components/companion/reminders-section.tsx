"use client";
import { Bell, CalendarPlus, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/use-t";
import { Segmented } from "@/components/practice/reading-controls";
import {
  googleCalendarUrl,
  icsFile,
  reminderContent,
  reminderSettings,
  type Reminder,
  type ReminderId,
  type ReminderLang,
} from "@/lib/practice/reminders";

const ORDER: ReminderId[] = ["morning", "evening", "meditation", "custom"];
// Monday first, as most calendars in India show it.
const WEEK = [1, 2, 3, 4, 5, 6, 0];
const DAY_NAMES: Record<ReminderLang, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  hi: ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"],
};

function download(reminder: Reminder, lang: ReminderLang) {
  const blob = new Blob([icsFile([reminder], lang)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wepray-${reminder.id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ReminderCard({ reminder, lang }: { reminder: Reminder; lang: ReminderLang }) {
  const { t, lang: ui } = useT();
  const update = (patch: Partial<Reminder>) => {
    const s = reminderSettings.get();
    reminderSettings.set({ ...s, reminders: { ...s.reminders, [reminder.id]: { ...reminder, ...patch } } });
  };
  const preview = reminderContent(reminder, lang);
  const noDays = reminder.days.length === 0;
  const name = t(`remind.${reminder.id}`);

  return (
    <div className="rounded-3xl bg-white border border-[#E7DCC8] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-[#2A1A1C]">{name}</p>
        <label className="sr-only" htmlFor={`time-${reminder.id}`}>{t("remind.time", { name })}</label>
        <input
          id={`time-${reminder.id}`}
          type="time"
          value={reminder.time}
          onChange={(e) => e.target.value && update({ time: e.target.value })}
          className="rounded-xl border border-[#E7DCC8] bg-[#FFFCF6] px-3 py-1.5 text-[15px] font-semibold text-[#2A1A1C] focus:outline-none focus:border-[#6D252C]"
        />
      </div>

      {reminder.id === "custom" && (
        <div className="mt-3">
          <label htmlFor="custom-label" className="block text-xs font-medium text-[#6E6560] mb-1">{t("remind.customLabel")}</label>
          <input
            id="custom-label"
            type="text"
            maxLength={60}
            value={reminder.label ?? ""}
            placeholder={t("remind.customPlaceholder")}
            onChange={(e) => update({ label: e.target.value })}
            className="w-full rounded-xl border border-[#E7DCC8] bg-[#FFFCF6] px-3 py-2 text-sm text-[#2A1A1C] placeholder:text-[#6E6560]/80 focus:outline-none focus:border-[#6D252C]"
          />
        </div>
      )}

      <div role="group" aria-label={t("remind.days", { name })} className="mt-3 grid grid-cols-7 gap-1">
        {WEEK.map((d) => {
          const on = reminder.days.includes(d);
          return (
            <button
              key={d}
              type="button"
              aria-pressed={on}
              onClick={() => update({ days: on ? reminder.days.filter((x) => x !== d) : [...reminder.days, d] })}
              className={cn(
                "rounded-full py-1.5 text-[11px] font-semibold border transition-colors",
                on ? "bg-[#6D252C] text-[#F7F2E8] border-[#6D252C]" : "bg-white text-[#6D645D] border-[#E7DCC8]",
              )}
            >
              {DAY_NAMES[ui][d]}
            </button>
          );
        })}
      </div>

      {/* Notification preview */}
      <div className="mt-3 flex gap-3 rounded-2xl bg-[#F7F2E8] px-3 py-2.5" aria-label={t("remind.preview")}>
        <Bell className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#885F19]" aria-hidden />
        <div lang={lang} className="min-w-0">
          <p className="text-sm font-semibold text-[#2A1A1C]">{preview.title} · WePray</p>
          <p className="text-xs text-[#5B5350] leading-relaxed">{preview.body}</p>
        </div>
      </div>

      {noDays ? (
        <p className="mt-3 text-xs text-[#7A2A24]">{t("remind.pickDay")}</p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={googleCalendarUrl(reminder, lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-full bg-[#6D252C] px-3 py-2.5 text-xs font-bold text-[#F7F2E8] hover:bg-[#5E1F25]"
          >
            <CalendarPlus className="h-4 w-4" /> {t("remind.google")}
          </a>
          <button
            type="button"
            onClick={() => download(reminder, lang)}
            className="flex items-center justify-center gap-1.5 rounded-full border border-[#6D252C]/25 px-3 py-2.5 text-xs font-semibold text-[#6D252C]"
          >
            <Download className="h-4 w-4" /> {t("remind.other")}
          </button>
        </div>
      )}
    </div>
  );
}

/** Gentle practice reminders, added to the reader's own calendar. */
export function RemindersSection() {
  const { t, lang: ui } = useT();
  const settings = reminderSettings.use();
  const lang = settings.lang ?? ui;

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#5B5350] leading-relaxed">{t("remind.intro")}</p>
      <div className="rounded-3xl bg-white border border-[#E7DCC8] p-4">
        <p className="text-xs font-medium text-[#6E6560] mb-2">{t("remind.language")}</p>
        <Segmented<ReminderLang>
          label={t("remind.language")}
          value={lang}
          onChange={(l) => reminderSettings.set({ ...reminderSettings.get(), lang: l })}
          options={[
            { value: "hi", label: "हिन्दी" },
            { value: "en", label: "English" },
          ]}
        />
      </div>
      {ORDER.map((id) => (
        <ReminderCard key={id} reminder={settings.reminders[id]} lang={lang} />
      ))}
      <p className="text-xs text-[#6D645D] leading-relaxed">{t("remind.manage")}</p>
    </div>
  );
}
