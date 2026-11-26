import { useEffect } from "react";
import { Share, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowRight, ChevronLeft, ChevronRight, Lightbulb, MessageCircleQuestion, ScrollText, Share2 } from "lucide-react-native";
import { DHP_SOURCES, chapterHref, commentaryHref, getChapter, getVerse, storyForVerse, verseHref } from "@/lib/learn/dhammapada";
import { markRead, verseItem } from "@/lib/learn/dhammapada-reading";
import { readingPrefs } from "@/lib/practice/preferences";
import { IconButton, Screen, TopBar } from "~/components/screen";
import { Card, Eyebrow, Muted, T } from "~/components/ui";
import { BookmarkButton, DraftNote, usePali } from "~/components/dhammapada";
import { C, F, readingSize } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { SITE } from "~/lib/site";

const label = { fontSize: 12, letterSpacing: 1.1, color: C.gold } as const;

export default function VerseScreen() {
  const { n: param } = useLocalSearchParams<{ n: string }>();
  const n = Number(param);
  const { t, lang } = useT();
  const pali = usePali();
  const size = readingSize(readingPrefs.use().size);
  const verse = getVerse(n);
  useEffect(() => {
    if (verse) markRead(verseItem(verse.n));
  }, [verse]);
  if (!verse) return <TopBar />;
  const chapter = getChapter(verse.chapter)!;
  const prev = getVerse(n - 1);
  const next = getVerse(n + 1);
  const story = storyForVerse(n);
  const enCredit = verse.enWith ? `${t("dhp.englishBy")} · ${t("dhp.withVerse", { n: verse.enWith.find((x) => x !== n)! })}` : t("dhp.englishBy");
  const translations = [
    { key: "hi" as const, label: t("dhp.hindi"), text: verse.hi, credit: null as string | null, draft: true },
    { key: "en" as const, label: t("dhp.english"), text: verse.en, credit: enCredit, draft: false },
  ].sort((a, b) => Number(b.key === lang) - Number(a.key === lang));
  const share = () => {
    const text = lang === "hi" && verse.hi ? verse.hi : verse.en;
    void Share.share({ message: `${verse.pi.join("\n")}\n\n${text}\n\n${t("dhp.verseRef", { n })}\n${SITE}${verseHref(n)}` });
  };

  return (
    <Screen
      header={
        <TopBar
          title={`${t("dhp.chapter", { n: chapter.number })} · ${chapter.title[lang]}`}
          right={
            <IconButton label={t("dhp.share")} onPress={share}>
              <Share2 size={20} color={C.ink} />
            </IconButton>
          }
        />
      }
    >
      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
        <View>
          <Eyebrow>{t("dhp.title")}</Eyebrow>
          <T bold style={{ fontSize: 32, color: C.ink }}>
            {t("dhp.verse", { n })}
          </T>
        </View>
        <BookmarkButton item={verseItem(n)} />
      </View>

      <Card style={{ backgroundColor: C.burgundyDark, borderColor: C.burgundyDark, gap: 8, paddingVertical: 22 }}>
        <T bold style={{ ...label, color: "#E9BE73" }}>
          {t("dhp.pali").toUpperCase()}
        </T>
        {verse.pi.map((line) => (
          <T key={line} style={{ fontFamily: F.pali, fontSize: size.pali, lineHeight: size.pali * 1.5, color: C.cream }}>
            {pali(line)}
          </T>
        ))}
      </Card>

      {translations.map((tr) => (
        <Card key={tr.key} style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <T bold style={label}>
              {lang === "en" ? tr.label.toUpperCase() : tr.label}
            </T>
            {tr.text && tr.draft && (
              <View style={{ backgroundColor: "#FBF3E2", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                <T style={{ fontSize: 11, color: "#6B4A12" }}>{t("dhp.draft")}</T>
              </View>
            )}
          </View>
          {tr.text ? (
            <T style={{ fontSize: size.translation + 1, lineHeight: (size.translation + 1) * (tr.key === "hi" ? 1.75 : 1.55), color: C.ink }}>{tr.text}</T>
          ) : (
            <Muted>{t("dhp.notYet")}</Muted>
          )}
          {tr.credit && <Muted style={{ fontSize: 12 }}>{tr.credit}</Muted>}
        </Card>
      ))}

      {verse.explanation && (
        <View style={{ backgroundColor: C.tint, borderRadius: 24, padding: 18, gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Lightbulb size={16} color="#56634A" />
            <T bold style={{ ...label, color: "#56634A" }}>
              {lang === "en" ? t("dhp.meaning").toUpperCase() : t("dhp.meaning")}
            </T>
          </View>
          <T style={{ fontSize: 16, lineHeight: lang === "hi" ? 28 : 25, color: C.ink }}>{verse.explanation[lang]}</T>
          {verse.reflection && (
            <View style={{ borderTopWidth: 1, borderTopColor: "#E2D5BE", paddingTop: 12, marginTop: 4, gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <MessageCircleQuestion size={16} color="#56634A" />
                <T bold style={{ ...label, color: "#56634A" }}>
                  {lang === "en" ? t("dhp.reflect").toUpperCase() : t("dhp.reflect")}
                </T>
              </View>
              <T style={{ fontSize: 17, lineHeight: lang === "hi" ? 29 : 26, color: C.ink, fontStyle: lang === "en" ? "italic" : "normal" }}>{verse.reflection[lang]}</T>
            </View>
          )}
          <Muted style={{ fontSize: 11 }}>{t("dhp.editorial")}</Muted>
        </View>
      )}

      {story && (
        <Card onPress={() => router.push(commentaryHref(story.slug) as never)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <ScrollText size={20} color={C.gold} />
          <View style={{ flex: 1 }}>
            <T bold style={{ fontSize: 12, color: C.gold }}>
              {t("dhp.story")}
            </T>
            <T bold style={{ fontSize: 16 }}>
              {story.title[lang]}
            </T>
          </View>
          <ArrowRight size={20} color={C.burgundy} />
        </Card>
      )}

      <View style={{ gap: 2 }}>
        <Muted style={{ fontSize: 12 }}>{t("dhp.sourcePali", { title: DHP_SOURCES.pi.title, by: DHP_SOURCES.pi.by, licence: DHP_SOURCES.pi.licence })}</Muted>
        <Muted style={{ fontSize: 12 }}>{t("dhp.sourceEnglish", { by: DHP_SOURCES.en.by, licence: DHP_SOURCES.en.licence })}</Muted>
      </View>
      {verse.hi && <DraftNote text={t("dhp.draftHi")} />}

      <View style={{ flexDirection: "row", gap: 10 }}>
        {prev ? (
          <Card onPress={() => router.replace(verseHref(prev.n) as never)} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <ChevronLeft size={20} color={C.burgundy} />
            <View>
              <T style={{ fontSize: 12, color: C.gold }}>{t("dhp.prev")}</T>
              <T bold style={{ fontSize: 15 }}>
                {t("dhp.verse", { n: prev.n })}
              </T>
            </View>
          </Card>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {next && (
          <Card onPress={() => router.replace(verseHref(next.n) as never)} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
            <View style={{ alignItems: "flex-end" }}>
              <T style={{ fontSize: 12, color: C.gold }}>{t("dhp.next")}</T>
              <T bold style={{ fontSize: 15 }}>
                {t("dhp.verse", { n: next.n })}
              </T>
            </View>
            <ChevronRight size={20} color={C.burgundy} />
          </Card>
        )}
      </View>
      <Card onPress={() => router.replace(chapterHref(chapter.number) as never)} style={{ alignItems: "center" }}>
        <T bold style={{ color: C.burgundy }}>
          {t("dhp.chapter", { n: chapter.number })} · {chapter.title[lang]}
        </T>
      </Card>
    </Screen>
  );
}
