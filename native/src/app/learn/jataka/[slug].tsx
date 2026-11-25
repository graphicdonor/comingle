import { useEffect, useRef } from "react";
import { Image, Pressable, ScrollView, Share, View, type ScrollViewInstance } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeepAwake } from "expo-keep-awake";
import { ArrowRight, Info, Pause, Play, Share2, SkipBack, SkipForward, Sparkles, Square } from "lucide-react-native";
import type { JatakaStory } from "@/lib/learn/jataka";
import { IconButton, TopBar } from "~/components/screen";
import { Card, Eyebrow, H1, Muted, Pill, T } from "~/components/ui";
import { Seal } from "~/components/story-card";
import { STORY_ART } from "~/components/story-art";
import { C, F } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { useContent } from "~/lib/content";
import { STORY_SPEEDS, useStoryVoice } from "~/lib/voice";
import { SITE } from "~/lib/site";

function KeepAwake() {
  useKeepAwake();
  return null;
}

export default function StoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { stories } = useContent();
  const story = stories.find((s) => s.slug === slug);
  if (!story) return <TopBar />;
  return <Story key={story.slug} story={story} />;
}

type Voice = ReturnType<typeof useStoryVoice>;

/** Listening controls, kept at the bottom of the screen. */
function ListenBar({ voice, minutes }: { voice: Voice; minutes: number }) {
  const { t } = useT();
  const insets = useSafeAreaInsets();
  const active = voice.status !== "idle";
  const playing = voice.status === "playing";
  return (
    <View style={{ backgroundColor: C.paper, borderTopWidth: 1, borderTopColor: C.line, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 + insets.bottom, gap: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Pressable
          onPress={playing ? voice.pause : voice.play}
          accessibilityRole="button"
          accessibilityLabel={playing ? t("listen.pause") : voice.status === "paused" ? t("listen.resume") : t("listen.play")}
          style={({ pressed }) => [{ width: 52, height: 52, borderRadius: 26, backgroundColor: C.burgundy, alignItems: "center", justifyContent: "center" }, pressed && { opacity: 0.85 }]}
        >
          {playing ? <Pause size={22} color={C.cream} fill={C.cream} /> : <Play size={22} color={C.cream} fill={C.cream} style={{ marginLeft: 3 }} />}
        </Pressable>
        <View style={{ flex: 1, paddingHorizontal: 6 }}>
          <T bold style={{ fontSize: 15 }}>
            {t("listen.title")}
          </T>
          <T style={{ fontSize: 12, color: C.faint }} accessibilityLiveRegion="polite">
            {active ? t("jataka.progress", { i: voice.partNumber, n: voice.partCount }) : t("common.min", { n: minutes })}
          </T>
        </View>
        {active && (
          <>
            <IconButton label={t("listen.previous")} onPress={voice.previous}>
              <SkipBack size={20} color={C.ink} />
            </IconButton>
            <IconButton label={t("listen.next")} onPress={voice.next}>
              <SkipForward size={20} color={C.ink} />
            </IconButton>
            <IconButton label={t("listen.stop")} onPress={voice.stop}>
              <Square size={18} color={C.ink} />
            </IconButton>
          </>
        )}
      </View>
      {active && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }} accessibilityRole="radiogroup" accessibilityLabel={t("listen.speed")}>
          <T style={{ fontSize: 12, color: C.faint }}>{t("listen.speed")}</T>
          {STORY_SPEEDS.map((sp) => {
            const on = voice.speed === sp;
            return (
              <Pressable
                key={sp}
                onPress={() => voice.setSpeed(sp)}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`${t("listen.speed")} ${sp}×`}
                hitSlop={4}
                style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: on ? C.burgundy : C.tint }}
              >
                <T bold style={{ fontSize: 12, color: on ? C.cream : C.muted }}>
                  {sp}×
                </T>
              </Pressable>
            );
          })}
        </View>
      )}
      <T style={{ fontSize: 11, color: C.faint, textAlign: "center" }}>{voice.aiVoice ? t("jataka.aiVoice") : t("jataka.deviceVoice")}</T>
    </View>
  );
}

function Story({ story }: { story: JatakaStory }) {
  const { t, lang } = useT();
  const insets = useSafeAreaInsets();
  const { stories } = useContent();
  const voice = useStoryVoice(story, lang);
  const other = lang === "hi" ? "en" : "hi";
  const next = stories[(stories.findIndex((s) => s.slug === story.slug) + 1) % stories.length];
  const draft = story.review[lang].status !== "reviewed";
  const reading = voice.part?.paragraph ?? null;
  const art = STORY_ART[story.slug];

  // Follow the paragraph being read.
  const scroll = useRef<ScrollViewInstance>(null);
  const textTop = useRef(0);
  const ys = useRef<number[]>([]);
  useEffect(() => {
    if (reading === null) return;
    scroll.current?.scrollTo({ y: Math.max(0, textTop.current + (ys.current[reading] ?? 0) - 120), animated: true });
  }, [reading]);

  return (
    <View style={{ flex: 1, backgroundColor: C.cream, paddingTop: insets.top }}>
      {voice.status === "playing" && <KeepAwake />}
      <TopBar
        title={t("jataka.title")}
        right={
          <IconButton label={t("prayers.share")} onPress={() => Share.share({ message: `${story.title[lang]} (${story.title.pi})\n${SITE}/learn/jataka/${story.slug}` })}>
            <Share2 size={20} color={C.ink} />
          </IconButton>
        }
      />
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 16 }}>
        {art && (
          <View style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: 24, overflow: "hidden" }}>
            <Image
              source={art}
              accessible
              accessibilityRole="image"
              accessibilityLabel={t("jataka.artAlt", { title: story.title[lang] })}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
        )}
        <View style={{ flexDirection: "row", gap: 14, alignItems: "flex-start" }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Eyebrow>{t("jataka.meta", { n: story.number, m: story.minutes })}</Eyebrow>
            <H1>{story.title[lang]}</H1>
            <T style={{ fontSize: 15, color: C.faint }}>
              {story.title[other]} · <T style={{ fontFamily: F.paliItalic, fontSize: 15, color: C.faint }}>{story.title.pi}</T>
            </T>
            <View style={{ marginTop: 6 }}>
              <Pill tone="sage">{story.theme[lang]}</Pill>
            </View>
          </View>
          {!art && <Seal story={story} large />}
        </View>

        <View style={{ gap: 12 }} onLayout={(e) => (textTop.current = e.nativeEvent.layout.y)}>
          {story.paragraphs.map((p, i) => (
            <Pressable
              key={i}
              disabled={voice.status === "idle"}
              onPress={() => voice.playParagraph(i)}
              onLayout={(e) => (ys.current[i] = e.nativeEvent.layout.y)}
              style={{ borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6, marginHorizontal: -10, backgroundColor: reading === i ? "#F6E7C8" : "transparent" }}
            >
              <T style={{ fontSize: 18, lineHeight: lang === "hi" ? 32 : 29, color: C.ink }}>{p[lang]}</T>
            </Pressable>
          ))}
        </View>

        <Card style={{ backgroundColor: C.burgundyDark, borderColor: voice.part?.key === "lesson" ? "#E9BE73" : C.burgundyDark, borderWidth: 2, gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Sparkles size={16} color="#E9BE73" />
            <T bold style={{ fontSize: 12, letterSpacing: 1.2, color: "#E9BE73", textTransform: lang === "en" ? "uppercase" : "none" }}>
              {t("jataka.lesson")}
            </T>
          </View>
          <T style={{ fontSize: 17, lineHeight: 26, color: C.cream }}>{story.lesson[lang]}</T>
        </Card>

        <Muted style={{ fontSize: 13 }}>
          {t("prayers.source")}: {story.source.title}, {story.source.reference}
        </Muted>
        {draft && (
          <View style={{ flexDirection: "row", gap: 10, backgroundColor: "#FBF3E2", borderColor: "#EBD3A3", borderWidth: 1, borderRadius: 16, padding: 12 }}>
            <Info size={16} color="#6B4A12" />
            <T style={{ flex: 1, fontSize: 13, lineHeight: 19, color: "#6B4A12" }}>{t("jataka.draft")}</T>
          </View>
        )}

        {next && next.slug !== story.slug && (
          <Card onPress={() => router.replace(`/learn/jataka/${next.slug}`)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <T bold style={{ fontSize: 12, color: C.gold }}>
                {t("jataka.next")}
              </T>
              <T bold style={{ fontSize: 16 }}>
                {next.title[lang]}
              </T>
            </View>
            <ArrowRight size={20} color={C.burgundy} />
          </Card>
        )}
      </ScrollView>
      <ListenBar voice={voice} minutes={story.minutes} />
    </View>
  );
}
