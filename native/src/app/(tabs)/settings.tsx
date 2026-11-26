import { useState, type ReactNode } from "react";
import { Alert, Pressable, Switch, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { ChevronRight, CloudDownload } from "lucide-react-native";
import { favourites, readingPrefs, recentPrayers, welcomeDone } from "@/lib/practice/preferences";
import { Screen } from "~/components/screen";
import { ReadingControls } from "~/components/reading-options";
import { RemindersSection } from "~/components/reminders";
import { Button, Card, Eyebrow, H1, Muted, Segmented, T } from "~/components/ui";
import { C } from "~/lib/theme";
import { uiLang, useT } from "~/lib/i18n";
import { useContent } from "~/lib/content";
import { offlineState, removeAllClips, saveAllClips } from "~/lib/clip-cache";
import { setUsageCounting, usageCounting } from "~/lib/usage";
import { SITE } from "~/lib/site";
import { SubscribeForm } from "~/components/subscribe";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Eyebrow>{title}</Eyebrow>
      <Card style={{ gap: 14 }}>{children}</Card>
    </View>
  );
}

function SwitchRow({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View style={{ flex: 1 }}>
        <T bold>{label}</T>
        {hint && <Muted style={{ fontSize: 13 }}>{hint}</Muted>}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: C.burgundy, false: C.line }} thumbColor={C.paper} accessibilityLabel={label} />
    </View>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", paddingVertical: 6 }, pressed && { opacity: 0.6 }]}>
      <T style={{ flex: 1, fontSize: 16 }}>{label}</T>
      <ChevronRight size={18} color={C.faint} />
    </Pressable>
  );
}

const formatBytes = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

function OfflineVoice() {
  const { t, lang } = useT();
  const content = useContent();
  const [state, setState] = useState(() => offlineState(content.clips, content.storyClips));
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [failed, setFailed] = useState(0);
  const complete = state.total > 0 && state.saved === state.total;

  const download = async () => {
    setFailed(0);
    setProgress({ done: 0, total: state.total });
    const n = await saveAllClips(content.clips, (done, total) => setProgress({ done, total }), content.storyClips);
    setProgress(null);
    setFailed(n);
    setState(offlineState(content.clips, content.storyClips));
  };

  return (
    <View style={{ gap: 10 }}>
      <T bold>{lang === "hi" ? "आवाज़ बिना इंटरनेट के" : "Listen without internet"}</T>
      <Muted style={{ fontSize: 14 }}>
        {lang === "hi"
          ? "प्रार्थनाएँ, ध्यान, मार्गदर्शिकाएँ और कथाएँ पहले से ही इस ऐप में हैं। वंदना और कथाओं की आवाज़ भी फ़ोन पर सहेज लें, ताकि सुनना बिना इंटरनेट के चले।"
          : "Prayers, meditation, guides and stories are already in the app. Save the prayer and story narration too, so listening works with no connection."}
      </Muted>
      {progress ? (
        <T style={{ color: C.gold }} accessibilityLiveRegion="polite">
          {t("offline.downloading", { done: progress.done, total: progress.total })}
        </T>
      ) : complete ? (
        <T bold style={{ color: "#4F5E44" }}>
          {t("offline.ready", { size: formatBytes(state.bytes) })}
        </T>
      ) : null}
      {failed > 0 && <T style={{ color: C.error, fontSize: 14 }}>{t("offline.failed", { n: failed })}</T>}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button
          style={{ flex: 1 }}
          label={complete ? t("offline.update") : failed ? t("offline.retry") : t("offline.download")}
          icon={<CloudDownload size={18} color={C.cream} />}
          onPress={() => void download()}
          disabled={Boolean(progress)}
        />
        {state.saved > 0 && !progress && (
          <Button
            variant="secondary"
            label={t("offline.remove")}
            onPress={() => {
              removeAllClips();
              setState(offlineState(content.clips, content.storyClips));
            }}
          />
        )}
      </View>
    </View>
  );
}

export default function Settings() {
  const { t, lang } = useT();
  const prefs = readingPrefs.use();
  const recent = recentPrayers.use();
  const saved = favourites.use();
  const counting = usageCounting.use();
  const open = (path: string) => void WebBrowser.openBrowserAsync(`${SITE}${path}`, { toolbarColor: C.cream, controlsColor: C.burgundy });

  return (
    <Screen>
      <View>
        <H1>{t("settings.title")}</H1>
        <Muted style={{ marginTop: 4 }}>{t("settings.intro")}</Muted>
      </View>

      <Section title={t("settings.language")}>
        <Segmented
          label={t("settings.appLanguage")}
          value={lang}
          onChange={(l) => uiLang.set(l)}
          options={[
            { value: "hi", label: "हिन्दी" },
            { value: "en", label: "English" },
          ]}
        />
      </Section>

      <Section title={t("settings.reading")}>
        <ReadingControls />
      </Section>

      <Section title={t("settings.practice")}>
        <SwitchRow label={t("settings.keepAwake")} hint={t("settings.keepAwakeHint")} value={prefs.keepAwake} onChange={(keepAwake) => readingPrefs.set({ ...prefs, keepAwake })} />
      </Section>

      <Section title={t("remind.section")}>
        <RemindersSection />
      </Section>

      <Section title={t("offline.section")}>
        <OfflineVoice />
      </Section>

      <Section title={t("settings.data")}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <T bold>{t("settings.recent")}</T>
            <Muted style={{ fontSize: 13 }}>{t("settings.recentCount", { n: recent.length })}</Muted>
          </View>
          <Button variant="secondary" label={t("settings.clear")} disabled={!recent.length} onPress={() => recentPrayers.set([])} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <T bold>{t("settings.savedPrayers")}</T>
            <Muted style={{ fontSize: 13 }}>{t("settings.savedCount", { n: saved.length })}</Muted>
          </View>
          <Button
            variant="secondary"
            label={t("settings.removeAll")}
            disabled={!saved.length}
            onPress={() =>
              Alert.alert(t("settings.removeAll"), undefined, [
                { text: t("account.cancel"), style: "cancel" },
                { text: t("settings.removeAll"), style: "destructive", onPress: () => favourites.set([]) },
              ])
            }
          />
        </View>
        <SwitchRow label={t("settings.usage")} hint={t("settings.usageHint")} value={counting} onChange={setUsageCounting} />
        <Muted style={{ fontSize: 13 }}>{t("settings.privacyNote")}</Muted>
      </Section>

      <Section title={t("subscribe.title")}>
        <SubscribeForm />
      </Section>

      <Section title={t("settings.about")}>
        <LinkRow label={t("settings.privacy")} onPress={() => open("/privacy")} />
        <LinkRow label={t("settings.terms")} onPress={() => open("/terms")} />
        <LinkRow label={t("settings.contact")} onPress={() => open("/contact")} />
        <LinkRow label={t("settings.showWelcome")} onPress={() => welcomeDone.set(false)} />
        <Muted style={{ fontSize: 12 }}>WePray {Constants.expoConfig?.version ?? ""}</Muted>
      </Section>
    </Screen>
  );
}
