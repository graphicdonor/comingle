import * as Crypto from "expo-crypto";
import Storage from "expo-sqlite/kv-store";
import { createLocalStore } from "./local-store";
import { SITE } from "./site";

// Anonymous daily count, as on the website (Privacy Policy, section 4): once a
// day a random ID made on this phone, the app language and "Android". Never a
// name, prayers or settings. Can be switched off in Settings.

const DEVICE_ID = "practice:device-id";
const LAST_SENT = "practice:usage-sent";

export const usageCounting = createLocalStore<boolean>("practice:usage-count", true, (raw) => raw !== false);

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

export function reportDailyUse(lang: "hi" | "en") {
  try {
    if (__DEV__ || !usageCounting.get() || Storage.getItemSync(LAST_SENT) === today()) return;
    let id = Storage.getItemSync(DEVICE_ID);
    const isNew = !id;
    if (!id) {
      id = Crypto.randomUUID();
      Storage.setItemSync(DEVICE_ID, id);
    }
    const body = JSON.stringify({ id, lang, installed: true, platform: "a", new: isNew });
    fetch(`${SITE}/api/stats/ping`, { method: "POST", headers: { "Content-Type": "application/json" }, body })
      .then((r) => {
        if (r.ok) Storage.setItemSync(LAST_SENT, today());
      })
      .catch(() => {});
  } catch {
    // Nothing sent.
  }
}

export function setUsageCounting(on: boolean) {
  usageCounting.set(on);
  if (!on) {
    Storage.removeItemSync(DEVICE_ID);
    Storage.removeItemSync(LAST_SENT);
  }
}
