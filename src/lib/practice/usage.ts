"use client";
import { createLocalStore } from "./local-store";

// Anonymous usage count, so the team knows how many devices use the app.
// Once a day the app sends a random device ID (made on this device, linked
// to no one), the app language, whether it is installed, and the kind of
// device (Android, iPhone, computer). Nothing else: no name, email, prayers,
// settings or history. It can be switched off in Settings. Described in the
// Privacy Policy, section 4.

const DEVICE_ID = "practice:device-id";
const LAST_SENT = "practice:usage-sent";

/** Whether this device is counted (Settings → Your data). */
export const usageCounting = createLocalStore<boolean>("practice:usage-count", true, (raw) => raw !== false);

function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

function platform(): "a" | "i" | "d" {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "a";
  if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "i";
  return "d";
}

function installed(): boolean {
  return window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/** Sends today's anonymous count once per day, if allowed. Never throws. */
export function reportDailyUse(lang: "hi" | "en") {
  try {
    // Only the live site counts: never local test servers or deploy previews.
    if (!["www.wepray.in", "wepray.in"].includes(location.hostname)) return;
    if (!usageCounting.get() || localStorage.getItem(LAST_SENT) === today()) return;
    let id = localStorage.getItem(DEVICE_ID);
    const isNew = !id;
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID, id);
    }
    const body = JSON.stringify({ id, lang, installed: installed(), platform: platform(), new: isNew });
    void fetch("/api/stats/ping", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true })
      .then((r) => r.ok && localStorage.setItem(LAST_SENT, today()))
      .catch(() => {});
  } catch {
    // Storage unavailable (private mode): nothing is sent.
  }
}

/** Turning counting off also forgets the device ID. */
export function setUsageCounting(on: boolean) {
  usageCounting.set(on);
  if (!on) {
    try {
      localStorage.removeItem(DEVICE_ID);
      localStorage.removeItem(LAST_SENT);
    } catch {
      // nothing stored
    }
  }
}
