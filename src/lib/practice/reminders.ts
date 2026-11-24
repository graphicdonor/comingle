"use client";
import { createLocalStore } from "./local-store";
import type { Localised } from "./prayers";

// Practice reminders (PRD §7.12) as repeating calendar events. Calendar
// reminders arrive reliably even when the app is closed, need no
// notification permission or server, and the reader stays in control:
// they edit or delete them in their own calendar. The wording is gentle:
// no streaks, no guilt (PRD §7.12).

export type ReminderId = "morning" | "evening" | "meditation" | "custom";
export type ReminderLang = "hi" | "en";

export interface Reminder {
  id: ReminderId;
  /** "HH:MM", 24-hour, local time. */
  time: string;
  /** 0 = Sunday … 6 = Saturday. */
  days: number[];
  /** Name of a custom reminder. */
  label?: string;
}

export interface ReminderSettings {
  lang: ReminderLang | null;
  reminders: Record<ReminderId, Reminder>;
}

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];

const DEFAULTS: ReminderSettings = {
  lang: null,
  reminders: {
    morning: { id: "morning", time: "06:30", days: EVERY_DAY },
    evening: { id: "evening", time: "19:30", days: EVERY_DAY },
    meditation: { id: "meditation", time: "07:00", days: EVERY_DAY },
    custom: { id: "custom", time: "12:00", days: [1, 2, 3, 4, 5], label: "" },
  },
};

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function parse(raw: unknown): ReminderSettings {
  const r = (raw ?? {}) as Partial<ReminderSettings>;
  const reminders = { ...DEFAULTS.reminders };
  for (const id of Object.keys(reminders) as ReminderId[]) {
    const saved = r.reminders?.[id];
    if (!saved) continue;
    reminders[id] = {
      id,
      time: typeof saved.time === "string" && TIME.test(saved.time) ? saved.time : reminders[id].time,
      days: Array.isArray(saved.days) ? saved.days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6) : reminders[id].days,
      label: typeof saved.label === "string" ? saved.label.slice(0, 60) : reminders[id].label,
    };
  }
  return { lang: r.lang === "hi" || r.lang === "en" ? r.lang : null, reminders };
}

export const reminderSettings = createLocalStore<ReminderSettings>("practice:reminders", DEFAULTS, parse);

export const REMINDER_TEXT: Record<Exclude<ReminderId, "custom">, { title: Localised; body: Localised; path: string }> = {
  morning: {
    title: { en: "Morning prayer", hi: "प्रातः वंदना" },
    body: {
      en: "A few quiet minutes for homage, the refuges and the precepts, whenever you're ready.",
      hi: "जब आप तैयार हों, वंदना, त्रिशरण और पंचशील के लिए कुछ शांत क्षण।",
    },
    path: "/practice/session/morning",
  },
  evening: {
    title: { en: "Evening prayer", hi: "सायं वंदना" },
    body: {
      en: "A gentle close to the day: recollection, loving-kindness and sharing merit.",
      hi: "दिन का शांत समापन: अनुस्मृति, मैत्री भावना और पुण्यानुमोदन।",
    },
    path: "/practice/session/evening",
  },
  meditation: {
    title: { en: "Meditation", hi: "ध्यान" },
    body: {
      en: "Time to sit for a little while, if it suits you today.",
      hi: "यदि आज सुविधा हो, तो थोड़ी देर ध्यान में बैठने का समय।",
    },
    path: "/meditate",
  },
};

const CUSTOM_DEFAULT: { title: Localised; body: Localised; path: string } = {
  title: { en: "Practice", hi: "अभ्यास" },
  body: { en: "A moment for your practice, whenever you're ready.", hi: "जब आप तैयार हों, अपने अभ्यास के लिए एक क्षण।" },
  path: "/app",
};

export function reminderContent(r: Reminder, lang: ReminderLang) {
  const base = r.id === "custom" ? CUSTOM_DEFAULT : REMINDER_TEXT[r.id];
  const title = r.id === "custom" && r.label?.trim() ? r.label.trim() : base.title[lang];
  return { title, body: base.body[lang], url: `https://www.wepray.in${base.path}` };
}

// ── Calendar ────────────────────────────────────────────────────────────────
const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const pad = (n: number) => String(n).padStart(2, "0");
const stamp = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

/** The next start at or after now, on one of the chosen days. */
function firstOccurrence(r: Reminder, now = new Date()): Date {
  const [h, m] = r.time.split(":").map(Number);
  for (let add = 0; add < 8; add++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + add, h, m);
    if (d >= now && r.days.includes(d.getDay())) return d;
  }
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, h, m);
}

function rrule(r: Reminder) {
  return r.days.length === 7 ? "RRULE:FREQ=DAILY" : `RRULE:FREQ=WEEKLY;BYDAY=${[...r.days].sort().map((d) => BYDAY[d]).join(",")}`;
}

const MINUTES = 10;

/** Opens Google Calendar's "new event" screen, already filled in and repeating. */
export function googleCalendarUrl(r: Reminder, lang: ReminderLang): string {
  const { title, body, url } = reminderContent(r, lang);
  const start = firstOccurrence(r);
  const end = new Date(start.getTime() + MINUTES * 60000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${title} · WePray`,
    dates: `${stamp(start)}/${stamp(end)}`,
    ctz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    recur: rrule(r),
    details: `${body}\n\n${url}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

const escapeIcs = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** An .ics file (Apple Calendar, Outlook and others) with the chosen reminders. */
export function icsFile(reminders: Reminder[], lang: ReminderLang): string {
  const now = new Date();
  const utc = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const events = reminders.flatMap((r) => {
    if (!r.days.length) return [];
    const { title, body, url } = reminderContent(r, lang);
    const start = firstOccurrence(r, now);
    const end = new Date(start.getTime() + MINUTES * 60000);
    // Floating local times: the reminder follows the phone's clock.
    return [
      "BEGIN:VEVENT",
      `UID:wepray-${r.id}-${utc}@wepray.in`,
      `DTSTAMP:${utc}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      rrule(r),
      `SUMMARY:${escapeIcs(`${title} · WePray`)}`,
      `DESCRIPTION:${escapeIcs(`${body}\n\n${url}`)}`,
      `URL:${url}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcs(title)}`,
      "TRIGGER:PT0M",
      "END:VALARM",
      "END:VEVENT",
    ];
  });
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//WePray//Practice reminders//EN", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR", ""].join("\r\n");
}
