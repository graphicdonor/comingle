import { Image, View } from "react-native";
import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import type { JatakaStory } from "@/lib/learn/jataka";
import { C, F } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { Card, Muted, T } from "./ui";
import { STORY_ART } from "./story-art";

/** The story's painting, or its Jātaka number in a small seal when it has none. */
export function Thumb({ story }: { story: JatakaStory }) {
  const art = STORY_ART[story.slug];
  if (!art) return <Seal story={story} />;
  return <Image source={art} accessibilityIgnoresInvertColors style={{ width: 84, height: 84, borderRadius: 18 }} />;
}

/** The story's Jātaka number in a small seal. */
export function Seal({ story, large }: { story: JatakaStory; large?: boolean }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: large ? 84 : 64, height: large ? 84 : 76, borderRadius: 18, backgroundColor: "#F3E0B8", alignItems: "center", justifyContent: "center" }}
    >
      <T bold style={{ fontSize: 9, letterSpacing: 1.2, color: C.gold }}>
        JĀTAKA
      </T>
      <T bold style={{ fontSize: large ? 28 : 22, color: C.burgundy, fontVariant: ["tabular-nums"] }}>
        {story.number}
      </T>
    </View>
  );
}

export function StoryCard({ story }: { story: JatakaStory }) {
  const { t, lang } = useT();
  const other = lang === "hi" ? "en" : "hi";
  return (
    <Card
      onPress={() => router.push(`/learn/jataka/${story.slug}`)}
      accessibilityLabel={`${story.title[lang]}, Jātaka ${story.number}. ${story.summary[lang]}`}
      style={{ flexDirection: "row", gap: 14, alignItems: "center" }}
    >
      <Thumb story={story} />
      <View style={{ flex: 1, gap: 2 }}>
        <T bold style={{ fontSize: 12, color: C.gold }}>
          {story.theme[lang]}
        </T>
        <T bold style={{ fontSize: 17, lineHeight: 23 }}>
          {story.title[lang]}
        </T>
        <T style={{ fontSize: 13, color: C.faint }}>
          {story.title[other]} · <T style={{ fontFamily: F.paliItalic, fontSize: 13, color: C.faint }}>{story.title.pi}</T>
        </T>
        <Muted numberOfLines={2} style={{ fontSize: 14, marginTop: 4 }}>
          {story.summary[lang]}
        </Muted>
        <T style={{ fontSize: 12, color: "#56634A", marginTop: 2 }}>{t("common.minRead", { n: story.minutes })}</T>
      </View>
      <ArrowRight size={20} color={C.burgundy} />
    </Card>
  );
}
