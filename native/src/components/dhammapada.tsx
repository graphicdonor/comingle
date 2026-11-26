import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { ArrowRight, Bookmark, BookmarkCheck, Info } from "lucide-react-native";
import { commentaryHref, type CommentaryStory } from "@/lib/learn/dhammapada";
import { dhpBookmarks, toggleBookmark, type ReadingItem } from "@/lib/learn/dhammapada-reading";
import { readingPrefs } from "@/lib/practice/preferences";
import { paliToDevanagari } from "@/lib/practice/pali-devanagari";
import { Card, Eyebrow, H2, Muted, T } from "./ui";
import { C, F } from "~/lib/theme";
import { useT } from "~/lib/i18n";

// Shared pieces for the Dhammapada screens (app/learn/dhammapada).

/** Pali in the reader's chosen script. */
export function usePali() {
  const prefs = readingPrefs.use();
  return (line: string) => (prefs.script === "devanagari" ? paliToDevanagari(line) : line);
}

export function BookmarkButton({ item }: { item: ReadingItem }) {
  const { t } = useT();
  const saved = dhpBookmarks.use().includes(item);
  const Icon = saved ? BookmarkCheck : Bookmark;
  return (
    <Pressable
      onPress={() => toggleBookmark(item)}
      accessibilityRole="button"
      accessibilityState={{ selected: saved }}
      accessibilityLabel={saved ? t("dhp.unsave") : t("dhp.save")}
      hitSlop={6}
      style={({ pressed }) => [
        { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: saved ? C.burgundy : C.tint },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Icon size={16} color={saved ? C.cream : C.burgundy} />
      <T bold style={{ fontSize: 14, color: saved ? C.cream : C.burgundy }}>
        {saved ? t("dhp.unsave") : t("dhp.save")}
      </T>
    </Pressable>
  );
}

export function DraftNote({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, backgroundColor: "#FBF3E2", borderColor: "#EBD3A3", borderWidth: 1, borderRadius: 16, padding: 12 }}>
      <Info size={16} color="#6B4A12" />
      <T style={{ flex: 1, fontSize: 13, lineHeight: 19, color: "#6B4A12" }}>{text}</T>
    </View>
  );
}

/** A commentary story's verse number in a small seal. */
export function StorySeal({ story, large }: { story: CommentaryStory; large?: boolean }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: large ? 84 : 64, height: large ? 84 : 76, borderRadius: 18, backgroundColor: "#E2DAEE", alignItems: "center", justifyContent: "center" }}
    >
      <T bold style={{ fontSize: 9, letterSpacing: 1.2, color: "#6B5490" }}>
        DHP
      </T>
      <T bold style={{ fontSize: large ? 28 : 22, color: "#45305F", fontVariant: ["tabular-nums"] }}>
        {story.verses[0]}
      </T>
    </View>
  );
}

export function CommentaryCard({ story }: { story: CommentaryStory }) {
  const { t, lang } = useT();
  return (
    <Card onPress={() => router.push(commentaryHref(story.slug) as never)} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
      <StorySeal story={story} />
      <View style={{ flex: 1, gap: 3 }}>
        <T bold style={{ fontSize: 12, color: C.gold }}>
          {story.theme[lang]}
        </T>
        <H2>{story.title[lang]}</H2>
        <T style={{ fontSize: 13, color: C.faint }}>
          <T style={{ fontFamily: F.paliItalic, fontSize: 13, color: C.faint }}>{story.title.pi}</T> · {t("dhp.storyMeta", { v: story.verses.join(", "), m: story.minutes })}
        </T>
        <Muted numberOfLines={2} style={{ fontSize: 14 }}>
          {story.summary[lang]}
        </Muted>
      </View>
      <ArrowRight size={20} color={C.burgundy} />
    </Card>
  );
}

/** The Dhammapada's card on the Learn tab. */
export function DhammapadaCard() {
  const { t } = useT();
  return (
    <Card onPress={() => router.push("/learn/dhammapada")} style={{ backgroundColor: C.burgundyDark, borderColor: C.burgundyDark, gap: 6 }}>
      <Eyebrow light>{t("dhp.tagline")}</Eyebrow>
      <T bold style={{ fontSize: 26, color: C.cream }}>
        {t("dhp.title")}
      </T>
      <T numberOfLines={3} style={{ fontSize: 15, lineHeight: 22, color: "rgba(247,242,232,0.8)" }}>
        {t("dhp.intro")}
      </T>
      <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, marginTop: 6, backgroundColor: "#E9BE73", borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9 }}>
        <T bold style={{ fontSize: 14, color: C.burgundyDark }}>
          {t("dhp.open")}
        </T>
        <ArrowRight size={16} color={C.burgundyDark} />
      </View>
    </Card>
  );
}
