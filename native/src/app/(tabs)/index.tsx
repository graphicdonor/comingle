import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { router } from "expo-router";
import { ArrowRight, BookText, Flower2, Moon, Search, Sun } from "lucide-react-native";
import { recentPrayers } from "@/lib/practice/preferences";
import { sessionForHour } from "@/lib/practice/sessions";
import { GUIDES } from "@/lib/learn/guides";
import { Screen, IconButton } from "~/components/screen";
import { Button, Card, Eyebrow, H1, H2, Muted, Pill, T } from "~/components/ui";
import { Figure } from "~/components/figure";
import { STORY_ART } from "~/components/story-art";
import { C, F } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { SESSIONS, findPrayer, sessionMinutes, sessionPrayers, useContent, verseFor } from "~/lib/content";

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function Today() {
  const { t, lang } = useT();
  const content = useContent();
  const now = useNow();
  const hour = now.getHours();
  const greeting = hour < 4 ? t("today.greeting.night") : hour < 12 ? t("today.greeting.morning") : hour < 17 ? t("today.greeting.afternoon") : hour < 21 ? t("today.greeting.evening") : t("today.greeting.night");
  const [chosen, setChosen] = useState<"morning" | "evening" | null>(null);
  const sessionId = chosen ?? sessionForHour(hour);
  const session = SESSIONS.find((s) => s.id === sessionId)!;
  const prayers = sessionPrayers(content, session);
  const verse = verseFor(content, now);
  const recent = recentPrayers.use();
  const last = recent[0] ? findPrayer(content, recent[0]) : undefined;
  const guide = GUIDES[0];
  // A different Jātaka tale each day.
  const story = content.stories.length ? content.stories[Math.floor(now.getTime() / 86_400_000 + 3) % content.stories.length] : null;

  return (
    <Screen
      header={
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8 }}>
          <T bold style={{ fontSize: 22, color: C.burgundy }}>
            WePray
          </T>
          <IconButton label={t("search.open")} onPress={() => router.push("/search")}>
            <Search size={22} color={C.ink} />
          </IconButton>
        </View>
      }
    >
      <View accessibilityLabel={t("today.aria.greeting")}>
        <H1>{greeting}</H1>
        <Muted style={{ marginTop: 4 }}>{t("today.tagline")}</Muted>
      </View>

      <Card style={{ backgroundColor: C.burgundyDark, borderColor: C.burgundyDark, gap: 14 }}>
        <View style={{ flexDirection: "row", gap: 8 }} accessibilityRole="radiogroup" accessibilityLabel={t("today.practiceTime")}>
          {(["morning", "evening"] as const).map((id) => {
            const on = id === sessionId;
            const Icon = id === "morning" ? Sun : Moon;
            return (
              <Button
                key={id}
                label={t(id === "morning" ? "today.morning" : "today.evening")}
                icon={<Icon size={16} color={on ? C.burgundy : "#F7F2E8"} />}
                variant={on ? "secondary" : "ghost"}
                labelColor={on ? C.burgundy : C.cream}
                onPress={() => setChosen(id)}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                style={{ paddingVertical: 8, minHeight: 40, borderWidth: on ? 0 : 1, borderColor: "rgba(247,242,232,0.3)" }}
              />
            );
          })}
        </View>
        <View>
          <T bold style={{ fontSize: 24, color: C.cream }}>
            {session.title[lang]}
          </T>
          <T style={{ marginTop: 6, color: "rgba(247,242,232,0.8)", fontSize: 15, lineHeight: 22 }}>{session.description[lang]}</T>
        </View>
        <View style={{ gap: 6 }}>
          {prayers.map((p, i) => (
            <T key={p.slug} style={{ color: "rgba(247,242,232,0.9)", fontSize: 15 }}>
              {i + 1}. {p.title[lang]} <T style={{ color: "rgba(247,242,232,0.6)", fontFamily: F.paliItalic, fontSize: 14 }}>· {p.title.pi}</T>
            </T>
          ))}
        </View>
        <Button label={t("common.begin", { n: sessionMinutes(content, session) })} variant="secondary" onPress={() => router.push(`/practice/session/${session.id}`)} icon={<ArrowRight size={18} color={C.burgundy} />} />
      </Card>

      {last && (
        <Card onPress={() => router.push(`/practice/${last.slug}`)} accessibilityLabel={`${t("today.continue")}: ${last.title[lang]}`} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Eyebrow>{t("today.continue")}</Eyebrow>
            <T bold style={{ fontSize: 17, marginTop: 4 }}>
              {last.title[lang]}
            </T>
            <T style={{ fontFamily: F.paliItalic, color: C.faint, fontSize: 14 }}>{last.title.pi}</T>
          </View>
          <ArrowRight size={20} color={C.burgundy} />
        </Card>
      )}

      <Card style={{ backgroundColor: C.paper, gap: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Eyebrow>{t("today.verse")}</Eyebrow>
          {verse.review === "draft" && <Pill tone="gold">{t("today.draftTranslation")}</Pill>}
        </View>
        <View>
          {verse.pi.map((l) => (
            <T key={l} style={{ fontFamily: F.paliItalic, fontSize: 17, lineHeight: 26, color: C.ink }}>
              {l}
            </T>
          ))}
        </View>
        <T style={{ fontSize: 16, lineHeight: 25, color: C.muted }}>{verse[lang]}</T>
        <T style={{ fontSize: 13, color: C.faint }}>{verse.reference}</T>
      </Card>

      <Card onPress={() => router.push({ pathname: "/meditate/session", params: { practice: "breathing", minutes: "5" } })} style={{ flexDirection: "row", alignItems: "center", gap: 14 }} accessibilityLabel={`${t("today.sit")}, 5 ${t("today.minBreathing")}`}>
        <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: C.tint, alignItems: "center", justifyContent: "center" }}>
          <Flower2 size={24} color={C.burgundy} />
        </View>
        <View style={{ flex: 1 }}>
          <T bold style={{ fontSize: 17 }}>
            {t("today.sit")}
          </T>
          <Muted>5 {t("today.minBreathing")}</Muted>
        </View>
        <ArrowRight size={20} color={C.burgundy} />
      </Card>

      {story && (
        <Card onPress={() => router.push(`/learn/jataka/${story.slug}`)} accessibilityLabel={`${t("jataka.title")}: ${story.title[lang]}`} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          {STORY_ART[story.slug] ? (
            <Image source={STORY_ART[story.slug]} style={{ width: 72, height: 72, borderRadius: 16 }} />
          ) : (
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "#F3E0B8", alignItems: "center", justifyContent: "center" }}>
              <BookText size={24} color={C.burgundy} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Eyebrow>{t("jataka.title")}</Eyebrow>
            <T bold style={{ fontSize: 17, marginTop: 2 }}>
              {story.title[lang]}
            </T>
            <Muted numberOfLines={2} style={{ fontSize: 14 }}>
              {story.summary[lang]}
            </Muted>
          </View>
          <ArrowRight size={20} color={C.burgundy} />
        </Card>
      )}

      <Card onPress={() => router.push(`/learn/${guide.slug}`)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Figure id={guide.cover} height={96} decorative />
        <View style={{ flex: 1 }}>
          <Eyebrow>{t("today.newToPractice")}</Eyebrow>
          <H2 style={{ marginTop: 4 }}>{guide.title[lang]}</H2>
          <Muted numberOfLines={2}>{guide.summary[lang]}</Muted>
        </View>
      </Card>

      <Muted style={{ textAlign: "center", fontSize: 13 }}>{t("today.private")}</Muted>
    </Screen>
  );
}
