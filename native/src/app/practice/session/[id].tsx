import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, View, type ScrollViewInstance } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeepAwake } from "expo-keep-awake";
import { ArrowLeft, ArrowRight, Check, SlidersHorizontal } from "lucide-react-native";
import { markPrayerOpened, readingPrefs } from "@/lib/practice/preferences";
import type { Prayer } from "@/lib/practice/prayers";
import { PrayerText } from "~/components/prayer-text";
import { ListenBar } from "~/components/listen-bar";
import { ReadingOptionsSheet } from "~/components/reading-options";
import { IconButton, TopBar } from "~/components/screen";
import { Button, Eyebrow, H1, Muted, T } from "~/components/ui";
import { Animation } from "~/components/figure";
import { C, F } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { SESSIONS, sessionPrayers, useContent } from "~/lib/content";
import { usePrayerVoice } from "~/lib/voice";

function KeepAwake() {
  useKeepAwake();
  return null;
}

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useT();
  const content = useContent();
  const session = SESSIONS.find((s) => s.id === id);
  const prayers = session ? sessionPrayers(content, session) : [];
  const prefs = readingPrefs.use();
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [options, setOptions] = useState(false);
  const insets = useSafeAreaInsets();

  if (!session || !prayers.length) return <TopBar />;

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: C.cream, paddingTop: insets.top, paddingBottom: insets.bottom + 20, paddingHorizontal: 24, justifyContent: "center", alignItems: "center", gap: 20 }}>
        <Animation id="bow" height={220} />
        <T bold style={{ fontSize: 24, textAlign: "center", lineHeight: 32 }} accessibilityRole="header">
          {t("session.complete")}
        </T>
        <T style={{ fontFamily: F.paliItalic, fontSize: 18, color: C.faint }}>Sabbe sattā bhavantu sukhitattā</T>
        <Button label={t("common.backToToday")} onPress={() => router.replace("/")} style={{ alignSelf: "stretch" }} />
      </View>
    );
  }

  const prayer = prayers[index];
  const last = index === prayers.length - 1;
  return (
    <View style={{ flex: 1, backgroundColor: C.cream, paddingTop: insets.top }}>
      {prefs.keepAwake && <KeepAwake />}
      <TopBar
        title={`${session.title[lang]} · ${t("session.progress", { i: index + 1, n: prayers.length })}`}
        right={
          <IconButton label={t("session.options")} onPress={() => setOptions(true)}>
            <SlidersHorizontal size={20} color={C.ink} />
          </IconButton>
        }
      />
      <View style={{ flexDirection: "row", gap: 6, paddingHorizontal: 20, paddingTop: 10 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {prayers.map((p, i) => (
          <View key={p.slug} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= index ? C.burgundy : C.line }} />
        ))}
      </View>
      <SessionPrayer key={prayer.slug} prayer={prayer} />
      <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 + insets.bottom, backgroundColor: C.paper }}>
        <Button style={{ flex: 1 }} variant="secondary" label={t("session.back")} disabled={index === 0} onPress={() => setIndex(index - 1)} icon={<ArrowLeft size={18} color={C.burgundy} />} />
        <Button
          style={{ flex: 2 }}
          label={last ? t("session.finish") : `${t("session.next")} ${prayers[index + 1].title[lang]}`}
          onPress={() => (last ? setDone(true) : setIndex(index + 1))}
          icon={last ? <Check size={18} color={C.cream} /> : <ArrowRight size={18} color={C.cream} />}
          numberOfLines={1}
        />
      </View>
      <ReadingOptionsSheet visible={options} onClose={() => setOptions(false)} />
    </View>
  );
}

function SessionPrayer({ prayer }: { prayer: Prayer }) {
  const { t, lang } = useT();
  const prefs = readingPrefs.use();
  const voice = usePrayerVoice(prayer, prefs, `${prayer.title.pi} · ${prayer.title[lang]}`);
  const [marked, setMarked] = useState<string | null>(null);
  const scroll = useRef<ScrollViewInstance>(null);
  const textTop = useRef(0);
  const ys = useRef(new Map<string, number>());
  const onLineLayout = useCallback((key: string, y: number) => ys.current.set(key, y), []);

  useEffect(() => markPrayerOpened(prayer.slug), [prayer.slug]);
  useEffect(() => {
    if (!voice.activeLine) return;
    const [si] = voice.activeLine.split("-");
    const y = textTop.current + (ys.current.get(`s${si}`) ?? 0) + (ys.current.get(voice.activeLine) ?? 0);
    scroll.current?.scrollTo({ y: Math.max(0, y - 140), animated: true });
  }, [voice.activeLine]);

  return (
    <>
      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View style={{ gap: 4 }}>
          <Eyebrow>{prayer.category[lang]}</Eyebrow>
          <H1>{prayer.title[lang]}</H1>
          <T style={{ fontFamily: F.paliItalic, fontSize: 18, color: C.faint }}>{prayer.title.pi}</T>
        </View>
        <Muted style={{ fontSize: 13 }}>{t("session.tapLine")}</Muted>
        <View onLayout={(e) => (textTop.current = e.nativeEvent.layout.y)}>
          <PrayerText
            prayer={prayer}
            prefs={prefs}
            activeLine={voice.activeLine ?? marked}
            onLinePress={(line) => (voice.status !== "idle" ? voice.playFromLine(line) : setMarked((m) => (m === line ? null : line)))}
            onLineLayout={onLineLayout}
          />
        </View>
      </ScrollView>
      <ListenBar voice={voice} compact />
    </>
  );
}
