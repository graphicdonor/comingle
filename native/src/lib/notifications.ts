import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { reminderContent, reminderSettings, type Reminder, type ReminderId, type ReminderSettings } from "@/lib/practice/reminders";
import { createLocalStore } from "./local-store";
import { uiLang } from "./i18n";

// Practice reminders as phone notifications, scheduled on the phone itself:
// nothing is sent to a server. The times, days and wording are the website's
// reminder settings (src/lib/practice/reminders.ts); this adds which ones are on.

export const CHANNEL = "reminders";

/** Which reminders are switched on. */
export const remindersOn = createLocalStore<Record<ReminderId, boolean>>(
  "native:reminders-on",
  { morning: false, evening: false, meditation: false, custom: false },
  (raw) => {
    const r = (raw ?? {}) as Partial<Record<ReminderId, unknown>>;
    return { morning: r.morning === true, evening: r.evening === true, meditation: r.meditation === true, custom: r.custom === true };
  },
);

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

async function ensureChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: "Practice reminders",
    // eslint-disable-next-line import/namespace -- re-exported enum the lint rule can't follow
    importance: Notifications.AndroidImportance.DEFAULT,
    description: "Gentle reminders for the practice times you choose.",
  });
}

/** Asks for permission to show notifications. Resolves whether they're allowed. */
export async function allowNotifications(): Promise<boolean> {
  await ensureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/** A site path from a reminder ("https://www.wepray.in/practice/session/morning") as an app route. */
export function routeFor(url: string): string {
  const path = url.replace(/^https?:\/\/[^/]+/, "");
  return path === "/app" || path === "" ? "/" : path;
}

/** Replaces every scheduled reminder with the current settings. */
export async function scheduleReminders(settings: ReminderSettings = reminderSettings.get(), on = remindersOn.get()): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const active = (Object.keys(on) as ReminderId[]).filter((id) => on[id]);
  if (!active.length) return;
  await ensureChannel();
  const lang = settings.lang ?? uiLang.get();
  for (const id of active) {
    const r: Reminder = settings.reminders[id];
    if (!r.days.length) continue;
    const [hour, minute] = r.time.split(":").map(Number);
    const { title, body, url } = reminderContent(r, lang);
    const content = { title, body, data: { url: routeFor(url) } };
    if (r.days.length === 7) {
      await Notifications.scheduleNotificationAsync({ content, trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL } });
    } else {
      // Weekly triggers count days from 1 (Sunday) to 7 (Saturday).
      for (const d of r.days) {
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: d + 1, hour, minute, channelId: CHANNEL },
        });
      }
    }
  }
}
