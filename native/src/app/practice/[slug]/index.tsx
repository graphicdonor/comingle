import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, Share, View, type ScrollViewInstance } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeepAwake } from "expo-keep-awake";
import { Bookmark, Mic, Share2, SlidersHorizontal } from "lucide-react-native";
import { favourites, markPrayerOpened, readingPrefs, toggleFavourite } from "@/lib/practice/preferences";
import { PrayerText } from "~/components/prayer-text";
import { ListenBar } from "~/components/listen-bar";
import { ReadingOptionsSheet } from "~/components/reading-options";
import { IconButton, TopBar } from "~/components/screen";
import { Button, Card, Eyebrow, H1, Muted, T } from "~/components/ui";
import { C, F } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { findPrayer, useContent } from "~/lib/content";
import { usePrayerVoice } from "~/lib/voice";
import { SITE } from "~/lib/site";

function KeepAwake() {
  useKeepAwake();
  return null;
}

export default function PrayerScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const content = useContent();
  const prayer = findPrayer(content, slug);
  const { t } = useT();
  if (!prayer) {
    return (
      <View style={{ flex: 1, backgroundColor: C.cream }}>
        <TopBar />
        <Muted style={{ padding: 24, textAlign: "center" }}>{t("search.none", { q: slug })}</Muted>
      </View>
    );
  }
  return <Reader key={prayer.slug} slug={prayer.slug} />;
}

function Reader({ slug }: { slug: string }) {
  const { t, lang } = useT();
  const insets = useSafeAreaInsets();
  const content = useContent();
  const prayer = findPrayer(content, slug)!;
  const prefs = readingPrefs.use();
  const saved = favourites.use().includes(slug);
  const voice = usePrayerVoice(prayer, prefs, `${prayer.title.pi} · ${prayer.title[lang]}`);
  const [marked, setMarked] = useState<string | null>(null);
  const [options, setOptions] = useState(false);

  useEffect(() => markPrayerOpened(slug), [slug]);

  // Follow the line being read.
  const scroll = useRef<ScrollViewInstance>(null);
  const textTop = useRef(0);
  const ys = useRef(new Map<string, number>());
  const onLineLayout = useCallback((key: string, y: number) => ys.current.set(key, y), []);
  const active = voice.activeLine ?? marked;
  useEffect(() => {
    if (!voice.activeLine) return;
    const [si] = voice.activeLine.split("-");
    const y = textTop.current + (ys.current.get(`s${si}`) ?? 0) + (ys.current.get(voice.activeLine) ?? 0);
    scroll.current?.scrollTo({ y: Math.max(0, y - 140), animated: true });
  }, [voice.activeLine]);

  const onLinePress = useCallback(
    (line: string) => {
      if (voice.status !== "idle") voice.playFromLine(line);
      else setMarked((m) => (m === line ? null : line));
    },
    [voice],
  );

  // Only the translation being shown.
  const draftLangs = prefs.mode === "pali" ? [] : [prefs.translation].filter((l) => prayer.review[l].status === "draft");

  return (
    <View style={{ flex: 1, backgroundColor: C.cream, paddingTop: insets.top }}>
      {voice.status === "playing" && <KeepAwake />}
      <TopBar
        right={
          <>
            <IconButton label={saved ? t("prayers.saved") : t("prayers.save")} active={saved} onPress={() => toggleFavourite(slug)}>
              <Bookmark size={20} color={saved ? C.burgundy : C.ink} fill={saved ? C.burgundy : "transparent"} />
            </IconButton>
            <IconButton label={t("prayers.share")} onPress={() => Share.share({ message: `${prayer.title.pi} · ${prayer.title[lang]}\n${SITE}/practice/${slug}` })}>
              <Share2 size={20} color={C.ink} />
            </IconButton>
            <IconButton label={t("session.options")} onPress={() => setOptions(true)}>
              <SlidersHorizontal size={20} color={C.ink} />
            </IconButton>
          </>
        }
      />
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 18 }}>
        <View style={{ gap: 4 }}>
          <Eyebrow>{prayer.category[lang]}</Eyebrow>
          <H1>{prayer.title[lang]}</H1>
          <T style={{ fontFamily: F.paliItalic, fontSize: 18, color: C.faint }}>{prayer.title.pi}</T>
          <Muted style={{ marginTop: 6 }}>{prayer.summary[lang]}</Muted>
        </View>

        <View onLayout={(e) => (textTop.current = e.nativeEvent.layout.y)}>
          <PrayerText prayer={prayer} prefs={prefs} activeLine={active} onLinePress={onLinePress} onLineLayout={onLineLayout} />
        </View>

        {prayer.notes && <Muted style={{ fontStyle: "italic" }}>{prayer.notes[lang]}</Muted>}

        <Button label={t("pron.open")} variant="secondary" icon={<Mic size={18} color={C.burgundy} />} onPress={() => router.push(`/practice/${slug}/pronounce`)} />

        <Card style={{ backgroundColor: C.paper, gap: 8 }}>
          <Info label={t("prayers.source")} value={`${prayer.source.title} — ${prayer.source.reference}`} />
          <Info label={t("prayers.tradition")} value={prayer.tradition} />
          {prayer.rights && <Info label={t("prayers.rights")} value={[prayer.rights.licence, prayer.rights.translator].filter(Boolean).join(" · ")} />}
          {prayer.review.pali.status === "draft" && <Muted style={{ fontSize: 13 }}>{t("prayers.notice.pali")}</Muted>}
          {prefs.script === "devanagari" && <Muted style={{ fontSize: 13 }}>{t("prayers.notice.devanagari")}</Muted>}
          {draftLangs.map((l) => (
            <Muted key={l} style={{ fontSize: 13 }}>
              {t("prayers.notice.translation", { lang: t(l === "hi" ? "common.lang.hi" : "common.lang.en") })}
            </Muted>
          ))}
        </Card>
      </ScrollView>
      <ListenBar voice={voice} />
      <ReadingOptionsSheet visible={options} onClose={() => setOptions(false)} />
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <T bold style={{ fontSize: 12, color: C.gold, textTransform: "uppercase", letterSpacing: 1 }}>
        {label}
      </T>
      <T style={{ fontSize: 14, color: C.muted }}>{value}</T>
    </View>
  );
}
