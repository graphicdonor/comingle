import { useEffect, useRef } from "react";
import { Pressable, ScrollView, Share, View, type ScrollViewInstance } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeepAwake } from "expo-keep-awake";
import { ArrowRight, MessageCircleQuestion, Share2, Sparkles } from "lucide-react-native";
import { COMMENTARY_STORIES, commentaryHref, getCommentaryStory, getVerse, verseHref, type CommentaryStory } from "@/lib/learn/dhammapada";
import { markRead, storyItem } from "@/lib/learn/dhammapada-reading";
import { IconButton, TopBar } from "~/components/screen";
import { Card, Eyebrow, H1, Muted, Pill, T } from "~/components/ui";
import { BookmarkButton, DraftNote, StorySeal, usePali } from "~/components/dhammapada";
import { StoryListenBar } from "~/components/story-listen-bar";
import { C, F } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { useStoryVoice } from "~/lib/voice";
import { SITE } from "~/lib/site";

function KeepAwake() {
  useKeepAwake();
  return null;
}

export default function CommentaryStoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const story = getCommentaryStory(slug);
  if (!story) return <TopBar />;
  return <Story key={story.slug} story={story} />;
}

function Story({ story }: { story: CommentaryStory }) {
  const { t, lang } = useT();
  const insets = useSafeAreaInsets();
  const pali = usePali();
  const voice = useStoryVoice(story, lang);
  const other = lang === "hi" ? "en" : "hi";
  const next = COMMENTARY_STORIES[(COMMENTARY_STORIES.indexOf(story) + 1) % COMMENTARY_STORIES.length];
  const reading = voice.part?.paragraph ?? null;
  useEffect(() => markRead(storyItem(story.slug)), [story.slug]);

  const scroll = useRef<ScrollViewInstance>(null);
  const textTop = useRef(0);
  const ys = useRef<number[]>([]);
  useEffect(() => {
    if (reading === null) return;
    scroll.current?.scrollTo({ y: Math.max(0, textTop.current + (ys.current[reading] ?? 0) - 120), animated: true });
  }, [reading]);

  const goldLabel = { fontSize: 12, letterSpacing: 1.2, color: "#E9BE73", textTransform: lang === "en" ? "uppercase" : "none" } as const;

  return (
    <View style={{ flex: 1, backgroundColor: C.cream, paddingTop: insets.top }}>
      {voice.status === "playing" && <KeepAwake />}
      <TopBar
        title={t("dhp.stories")}
        right={
          <IconButton label={t("dhp.share")} onPress={() => Share.share({ message: `${story.title[lang]} (${story.title.pi})\n${SITE}${commentaryHref(story.slug)}` })}>
            <Share2 size={20} color={C.ink} />
          </IconButton>
        }
      />
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 16 }}>
        <View style={{ flexDirection: "row", gap: 14, alignItems: "flex-start" }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Eyebrow>{t("dhp.storyMeta", { v: story.verses.join(", "), m: story.minutes })}</Eyebrow>
            <H1>{story.title[lang]}</H1>
            <T style={{ fontSize: 15, color: C.faint }}>
              {story.title[other]} · <T style={{ fontFamily: F.paliItalic, fontSize: 15, color: C.faint }}>{story.title.pi}</T>
            </T>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
              <Pill>{t("dhp.storyBadge")}</Pill>
              <Pill tone="sage">{story.theme[lang]}</Pill>
            </View>
          </View>
          <StorySeal story={story} large />
        </View>
        <View style={{ flexDirection: "row" }}>
          <BookmarkButton item={storyItem(story.slug)} />
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

        {story.verses.map((n) => {
          const v = getVerse(n)!;
          return (
            <Card key={n} onPress={() => router.push(verseHref(n) as never)} style={{ gap: 6 }}>
              <Eyebrow>
                {t("dhp.spoke")} · {t("dhp.verseRef", { n })}
              </Eyebrow>
              {v.pi.map((l) => (
                <T key={l} style={{ fontFamily: F.paliItalic, fontSize: 16, lineHeight: 24, color: C.ink }}>
                  {pali(l)}
                </T>
              ))}
              <T style={{ fontSize: 15, lineHeight: 23, color: C.muted }}>{lang === "hi" && v.hi ? v.hi : v.en}</T>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <T bold style={{ fontSize: 14, color: C.burgundy }}>
                  {t("dhp.readVerse", { n })}
                </T>
                <ArrowRight size={16} color={C.burgundy} />
              </View>
            </Card>
          );
        })}

        <Card style={{ backgroundColor: C.burgundyDark, borderColor: voice.part?.key === "lesson" ? "#E9BE73" : C.burgundyDark, borderWidth: 2, gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Sparkles size={16} color="#E9BE73" />
            <T bold style={goldLabel}>
              {t("jataka.lesson")}
            </T>
          </View>
          <T style={{ fontSize: 17, lineHeight: 26, color: C.cream }}>{story.lesson[lang]}</T>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
            <MessageCircleQuestion size={16} color="#E9BE73" />
            <T bold style={goldLabel}>
              {t("dhp.reflect")}
            </T>
          </View>
          <T style={{ fontSize: 16, lineHeight: 25, color: C.cream, fontStyle: lang === "en" ? "italic" : "normal" }}>{story.reflection[lang]}</T>
        </Card>

        <Muted style={{ fontSize: 13 }}>{t("dhp.storyLabel")}</Muted>
        <Muted style={{ fontSize: 13 }}>
          {t("prayers.source")}: {story.source.title}. {story.source.reference}.
        </Muted>
        {story.review[lang].status !== "reviewed" && <DraftNote text={t("dhp.storyDraft")} />}

        {next && next.slug !== story.slug && (
          <Card onPress={() => router.replace(commentaryHref(next.slug) as never)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <T bold style={{ fontSize: 12, color: C.gold }}>
                {t("dhp.nextStory")}
              </T>
              <T bold style={{ fontSize: 16 }}>
                {next.title[lang]}
              </T>
            </View>
            <ArrowRight size={20} color={C.burgundy} />
          </Card>
        )}
      </ScrollView>
      <StoryListenBar voice={voice} minutes={story.minutes} />
    </View>
  );
}
