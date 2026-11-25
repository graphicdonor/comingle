import { useState } from "react";
import { Linking, Pressable, Switch, View } from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Clock } from "lucide-react-native";
import { reminderSettings, type ReminderId } from "@/lib/practice/reminders";
import { allowNotifications, remindersOn, scheduleReminders } from "~/lib/notifications";
import { C } from "~/lib/theme";
import { useT, type MessageKey } from "~/lib/i18n";
import { Button, Muted, Segmented, T } from "./ui";

const NAMES: Record<ReminderId, MessageKey> = { morning: "remind.morning", evening: "remind.evening", meditation: "remind.meditation", custom: "remind.custom" };
const ORDER: ReminderId[] = ["morning", "evening", "meditation"];
const DAY_LETTERS = { en: ["S", "M", "T", "W", "T", "F", "S"], hi: ["र", "सो", "मं", "बु", "गु", "शु", "श"] };
const DAY_NAMES = { en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], hi: ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"] };

function label12(time: string, lang: "hi" | "en") {
  const [h, m] = time.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-IN", { hour: "numeric", minute: "2-digit" });
}

/** Practice reminders as notifications on this phone. */
export function RemindersSection() {
  const { t, lang } = useT();
  const settings = reminderSettings.use();
  const on = remindersOn.use();
  const [blocked, setBlocked] = useState(false);

  const apply = () => void scheduleReminders(reminderSettings.get(), remindersOn.get());

  const toggle = async (id: ReminderId, value: boolean) => {
    if (value && !(await allowNotifications())) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    remindersOn.set({ ...on, [id]: value });
    apply();
  };

  const pickTime = (id: ReminderId) => {
    const [h, m] = settings.reminders[id].time.split(":").map(Number);
    DateTimePickerAndroid.open({
      value: new Date(2000, 0, 1, h, m),
      mode: "time",
      is24Hour: false,
      onChange: (e, date) => {
        if (e.type !== "set" || !date) return;
        const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
        reminderSettings.set({ ...settings, reminders: { ...settings.reminders, [id]: { ...settings.reminders[id], time } } });
        apply();
      },
    });
  };

  const toggleDay = (id: ReminderId, d: number) => {
    const r = settings.reminders[id];
    const days = r.days.includes(d) ? r.days.filter((x) => x !== d) : [...r.days, d].sort();
    reminderSettings.set({ ...settings, reminders: { ...settings.reminders, [id]: { ...r, days } } });
    apply();
  };

  return (
    <View style={{ gap: 14 }}>
      <Muted style={{ fontSize: 14 }}>{lang === "hi" ? "आपके चुने समय पर फ़ोन पर एक शांत सूचना। यह सब इसी फ़ोन पर तय होता है; हमें कुछ नहीं भेजा जाता।" : "A gentle notification on this phone at the times you choose. Everything is set up on the phone itself; nothing is sent to us."}</Muted>
      {ORDER.map((id) => {
        const r = settings.reminders[id];
        const name = t(NAMES[id]);
        return (
          <View key={id} style={{ gap: 10, paddingVertical: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <T bold style={{ flex: 1, fontSize: 16 }}>
                {name}
              </T>
              <Switch value={on[id]} onValueChange={(v) => void toggle(id, v)} trackColor={{ true: C.burgundy, false: C.line }} thumbColor={C.paper} accessibilityLabel={name} />
            </View>
            {on[id] && (
              <>
                <Pressable
                  onPress={() => pickTime(id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t("remind.time", { name })}: ${label12(r.time, lang)}`}
                  style={{ flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", backgroundColor: C.tint, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}
                >
                  <Clock size={16} color={C.burgundy} />
                  <T bold style={{ color: C.burgundy }}>
                    {label12(r.time, lang)}
                  </T>
                </Pressable>
                <View style={{ flexDirection: "row", gap: 6 }} accessibilityLabel={t("remind.days", { name })}>
                  {DAY_LETTERS[lang].map((letter, d) => {
                    const sel = r.days.includes(d);
                    return (
                      <Pressable
                        key={d}
                        onPress={() => toggleDay(id, d)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: sel }}
                        accessibilityLabel={DAY_NAMES[lang][d]}
                        style={{ width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: sel ? C.burgundy : C.card, borderWidth: 1, borderColor: sel ? C.burgundy : C.line }}
                      >
                        <T bold style={{ fontSize: 13, color: sel ? C.cream : C.muted }}>
                          {letter}
                        </T>
                      </Pressable>
                    );
                  })}
                </View>
                {r.days.length === 0 && <T style={{ color: C.error, fontSize: 13 }}>{t("remind.pickDay")}</T>}
              </>
            )}
          </View>
        );
      })}
      <View style={{ gap: 8 }}>
        <T bold style={{ fontSize: 14, color: C.muted }}>
          {t("remind.language")}
        </T>
        <Segmented
          label={t("remind.language")}
          value={settings.lang ?? lang}
          onChange={(l) => {
            reminderSettings.set({ ...settings, lang: l });
            apply();
          }}
          options={[
            { value: "hi", label: "हिन्दी" },
            { value: "en", label: "English" },
          ]}
        />
      </View>
      {blocked && (
        <View style={{ gap: 8 }}>
          <T style={{ color: C.error, fontSize: 14 }}>{lang === "hi" ? "सूचनाएँ बंद हैं। फ़ोन की सेटिंग्स में WePray के लिए सूचनाएँ चालू करें।" : "Notifications are turned off. Turn them on for WePray in your phone's settings."}</T>
          <Button label={lang === "hi" ? "सेटिंग्स खोलें" : "Open settings"} variant="secondary" onPress={() => void Linking.openSettings()} />
        </View>
      )}
    </View>
  );
}
