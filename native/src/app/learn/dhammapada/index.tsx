import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ArrowRight, BookOpen } from "lucide-react-native";
import { CHAPTERS, COMMENTARY_STORIES, DHP_SOURCES, chapterHref, getCommentaryStory, getVerse, parseVerseRef, verseHref, commentaryHref } from "@/lib/learn/dhammapada";
import { dhpBookmarks, dhpHistory, parseItem, type ReadingItem } from "@/lib/learn/dhammapada-reading";
import { Screen, TopBar } from "~/components/screen";
import { Button, Card, Eyebrow, H2, Muted, T } from "~/components/ui";
import { CommentaryCard, usePali } from "~/components/dhammapada";
import { C, F } from "~/lib/theme";
import { useT } from "~/lib/i18n";

function useItemLink() {
  const { lang } = useT();
  return (item: ReadingItem) => {
    const p = parseItem(item);
    if (p.kind === "verse") {
      const v = getVerse(p.n);
      return v ? { href: verseHref(v.n), label: `${lang === "hi" ? "धम्मपद" : "Dhammapada"} ${v.n}`, text: v.pi[0], pali: true } : null;
    }
    const s = getCommentaryStory(p.slug);
    return s ? { href: commentaryHref(s.slug), label: s.title[lang], text: s.summary[lang], pali: false } : null;
  };
}

export default function DhammapadaHome() {
  const { t, lang } = useT();
  const pali = usePali();
  const link = useItemLink();
  const history = dhpHistory.use();
  const saved = dhpBookmarks.use();
  const [query, setQuery] = useState("");
  const target = parseVerseRef(query);
  const last = history[0] ? link(history[0]) : null;
  const savedLinks = saved.map((i) => ({ i, l: link(i) })).filter((x) => x.l);

  return (
    <Screen header={<TopBar title={t("dhp.title")} />}>
      <Card style={{ backgroundColor: C.burgundyDark, borderColor: C.burgundyDark, gap: 8 }}>
        <Eyebrow light>{t("dhp.tagline")}</Eyebrow>
        <T bold style={{ fontSize: 32, color: C.cream }}>
          {t("dhp.title")}
        </T>
        <T style={{ fontSize: 15, lineHeight: 23, color: "rgba(247,242,232,0.85)" }}>{t("dhp.intro")}</T>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            keyboardType="number-pad"
            placeholder={t("dhp.findPlaceholder")}
            placeholderTextColor="rgba(247,242,232,0.5)"
            accessibilityLabel={t("dhp.find")}
            returnKeyType="go"
            onSubmitEditing={() => target && router.push(verseHref(target) as never)}
            style={{ flex: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, color: C.cream, backgroundColor: "rgba(247,242,232,0.1)", fontFamily: F.regular, fontSize: 15 }}
          />
          <Pressable
            disabled={!target}
            onPress={() => target && router.push(verseHref(target) as never)}
            accessibilityRole="button"
            style={{ borderRadius: 999, paddingHorizontal: 18, justifyContent: "center", backgroundColor: "#E9BE73", opacity: target ? 1 : 0.5 }}
          >
            <T bold style={{ color: C.burgundyDark }}>
              {t("dhp.go")}
            </T>
          </Pressable>
        </View>
      </Card>

      {last && (
        <Card onPress={() => router.push(last.href as never)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <BookOpen size={20} color={C.gold} />
          <View style={{ flex: 1 }}>
            <T bold style={{ fontSize: 12, color: C.gold }}>
              {t("dhp.continue")}
            </T>
            <T bold style={{ fontSize: 16 }}>
              {last.label}
            </T>
            <T numberOfLines={1} style={{ fontSize: 14, color: C.faint, fontFamily: last.pali ? F.paliItalic : undefined }}>
              {last.pali ? pali(last.text) : last.text}
            </T>
          </View>
          <ArrowRight size={20} color={C.burgundy} />
        </Card>
      )}

      {savedLinks.length > 0 && (
        <View style={{ gap: 8 }}>
          <H2>{t("dhp.saved")}</H2>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {savedLinks.map(({ i, l }) => (
              <Card key={i} onPress={() => router.push(l!.href as never)} style={{ width: 220, gap: 2 }}>
                <T bold style={{ fontSize: 15 }}>
                  {l!.label}
                </T>
                <T numberOfLines={2} style={{ fontSize: 14, color: C.faint, fontFamily: l!.pali ? F.paliItalic : undefined }}>
                  {l!.pali ? pali(l!.text) : l!.text}
                </T>
              </Card>
            ))}
          </ScrollView>
        </View>
      )}

      <H2>{t("dhp.chapters")}</H2>
      {CHAPTERS.map((c) => (
        <Card key={c.number} onPress={() => router.push(chapterHref(c.number) as never)} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "#F6E7C8", alignItems: "center", justifyContent: "center" }}>
            <T bold style={{ fontSize: 18, color: C.burgundy, fontVariant: ["tabular-nums"] }}>
              {c.number}
            </T>
          </View>
          <View style={{ flex: 1 }}>
            <T bold style={{ fontSize: 16 }}>
              {c.title[lang]}
            </T>
            <T style={{ fontSize: 13, color: C.faint }}>
              <T style={{ fontFamily: F.paliItalic, fontSize: 13, color: C.faint }}>{pali(c.pi)}</T> · {t("dhp.verses", { n: c.to - c.from + 1 })}
            </T>
          </View>
          <ArrowRight size={18} color={C.burgundy} />
        </Card>
      ))}

      <View style={{ gap: 6, marginTop: 8 }}>
        <H2>{t("dhp.stories")}</H2>
        <Muted style={{ fontSize: 14 }}>{t("dhp.storiesIntro")}</Muted>
      </View>
      {COMMENTARY_STORIES.slice(0, 3).map((s) => (
        <CommentaryCard key={s.slug} story={s} />
      ))}
      <Button
        variant="secondary"
        label={`${t("jataka.all")} (${COMMENTARY_STORIES.length})`}
        onPress={() => router.push("/learn/dhammapada/stories")}
        icon={<ArrowRight size={18} color={C.burgundy} />}
      />

      <View style={{ backgroundColor: C.tint, borderRadius: 16, padding: 14, gap: 4 }}>
        <T bold style={{ fontSize: 13 }}>
          {t("dhp.sources")}
        </T>
        <Muted style={{ fontSize: 12 }}>{t("dhp.sourcePali", { title: DHP_SOURCES.pi.title, by: DHP_SOURCES.pi.by, licence: DHP_SOURCES.pi.licence })}</Muted>
        <Muted style={{ fontSize: 12 }}>{t("dhp.sourceEnglish", { by: DHP_SOURCES.en.by, licence: DHP_SOURCES.en.licence })}</Muted>
        <Muted style={{ fontSize: 12 }}>{t("dhp.draftHi")}</Muted>
      </View>
    </Screen>
  );
}
