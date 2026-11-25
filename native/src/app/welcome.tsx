import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";
import { readingPrefs, welcomeDone } from "@/lib/practice/preferences";
import { Button, H1, Muted, Segmented, T } from "~/components/ui";
import { Animation } from "~/components/figure";
import { ReadingControls } from "~/components/reading-options";
import { C, F } from "~/lib/theme";
import { uiLang, useT } from "~/lib/i18n";

export default function Welcome() {
  const { t, lang } = useT();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const prefs = readingPrefs.use();

  const finish = () => welcomeDone.set(true);

  return (
    <View style={{ flex: 1, backgroundColor: C.cream, paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, height: 52 }}>
        <View style={{ flexDirection: "row", gap: 6 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {[0, 1].map((i) => (
            <View key={i} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: i === step ? C.burgundy : C.line }} />
          ))}
        </View>
        <Button variant="ghost" label={t("welcome.skip")} onPress={finish} style={{ paddingHorizontal: 8 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 20, flexGrow: 1 }}>
        {step === 0 ? (
          <>
            <Segmented
              label={t("settings.appLanguage")}
              value={lang}
              onChange={(l) => uiLang.set(l)}
              options={[
                { value: "hi", label: "हिन्दी" },
                { value: "en", label: "English" },
              ]}
            />
            <View style={{ backgroundColor: C.tint, borderRadius: 32, paddingVertical: 18 }}>
              <Animation id="breathe" height={230} />
            </View>
            <View style={{ gap: 8 }}>
              <T bold style={{ fontSize: 22, color: C.burgundy }}>
                WePray
              </T>
              <H1>{t("welcome.introTitle")}</H1>
              <Muted style={{ fontSize: 16, lineHeight: 24 }}>{t("welcome.introBody")}</Muted>
            </View>
            <View style={{ gap: 10 }}>
              {(["welcome.point.prayers", "welcome.point.practice", "welcome.point.learn"] as const).map((k) => (
                <View key={k} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#E3E9DC", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                    <Check size={14} color="#4F5E44" />
                  </View>
                  <T style={{ flex: 1, fontSize: 15, lineHeight: 22 }}>{t(k)}</T>
                </View>
              ))}
              <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#E3E9DC", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                  <Check size={14} color="#4F5E44" />
                </View>
                <T style={{ flex: 1, fontSize: 15, lineHeight: 22 }}>
                  {lang === "hi" ? "निःशुल्क और निजी: कोई खाता नहीं, और आपका अभ्यास इसी फ़ोन पर रहता है" : "Free and private: no account, and your practice stays on this phone"}
                </T>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={{ gap: 8 }}>
              <H1>{t("welcome.readingTitle")}</H1>
              <Muted style={{ fontSize: 16, lineHeight: 24 }}>{t("welcome.readingBody")}</Muted>
            </View>
            <View style={{ backgroundColor: C.card, borderRadius: 22, borderWidth: 1, borderColor: C.line, padding: 18, gap: 4 }}>
              <T bold style={{ fontSize: 12, color: C.gold, letterSpacing: 1.2 }}>
                {t("settings.preview").toUpperCase()}
              </T>
              {prefs.mode !== "translation" && (
                <T style={{ fontFamily: prefs.script === "devanagari" ? F.deva : F.pali, fontSize: 19, lineHeight: 30 }}>
                  {prefs.script === "devanagari" ? "बुद्धं सरणं गच्छामि।" : "Buddhaṃ saraṇaṃ gacchāmi."}
                </T>
              )}
              {prefs.mode !== "pali" && (
                <T style={{ fontSize: 16, color: prefs.mode === "translation" ? C.ink : C.muted, lineHeight: 25 }}>
                  {prefs.translation === "hi" ? "मैं बुद्ध की शरण में जाता/जाती हूँ।" : "I go to the Buddha for refuge."}
                </T>
              )}
            </View>
            <ReadingControls />
          </>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 24, gap: 10 }}>
        {step === 0 ? <Button label={t("welcome.next")} onPress={() => setStep(1)} /> : <Button label={t("welcome.start")} onPress={finish} />}
      </View>
    </View>
  );
}
