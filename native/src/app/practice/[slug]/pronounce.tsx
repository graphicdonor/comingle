import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ArrowLeft, ArrowRight, Snail, Square, Volume2 } from "lucide-react-native";
import { syllabify, tipsFor, TIPS } from "@/lib/practice/pronunciation";
import { paliToDevanagari } from "@/lib/practice/pali-devanagari";
import type { Prayer } from "@/lib/practice/prayers";
import { readingPrefs } from "@/lib/practice/preferences";
import { Screen, TopBar } from "~/components/screen";
import { Button, Card, Eyebrow, H1, Muted, T } from "~/components/ui";
import { C, F } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { findPrayer, useContent } from "~/lib/content";
import { playOnce } from "~/lib/voice";

/** Each distinct Pali line of the prayer (repeats are practised once). */
function practiceLines(prayer: Prayer) {
  const seen = new Set<string>();
  return prayer.sections.flatMap((section, si) =>
    section.lines.flatMap((line, li) => {
      if (seen.has(line.pi)) return [];
      seen.add(line.pi);
      return [{ key: `${si}-${li}`, line }];
    }),
  );
}

export default function Pronounce() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const content = useContent();
  const prayer = findPrayer(content, slug);
  const { t, lang } = useT();
  const prefs = readingPrefs.use();
  const lines = useMemo(() => (prayer ? practiceLines(prayer) : []), [prayer]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState<"model" | "slow" | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const stop = () => {
    stopRef.current?.();
    stopRef.current = null;
    setPlaying(null);
  };
  useEffect(() => () => stopRef.current?.(), []);
  const goTo = (i: number) => {
    stop();
    setIndex(i);
  };

  if (!prayer || !lines.length) return <TopBar />;
  const { key, line } = lines[index];
  const words = syllabify(line.pi);
  const tips = tipsFor(line.pi);
  const src = content.clips[prayer.slug]?.[key]?.pi?.src ?? null;

  const listen = (kind: "model" | "slow") => {
    if (playing === kind) return stop();
    stop();
    setPlaying(kind);
    stopRef.current = playOnce({ src, text: paliToDevanagari(line.pi), lang: "hi", rate: kind === "slow" ? 0.7 : 1, onEnd: () => setPlaying(null) });
  };

  return (
    <Screen header={<TopBar title={prayer.title.pi} />}>
      <View style={{ gap: 4 }}>
        <Eyebrow>{t("pron.eyebrow")}</Eyebrow>
        <H1>{t("pron.title")}</H1>
        <Muted>{t("pron.intro")}</Muted>
      </View>

      <Card style={{ gap: 12 }}>
        <T style={{ fontSize: 13, color: C.faint }} accessibilityLiveRegion="polite">
          {t("pron.lineOf", { i: index + 1, n: lines.length })}
        </T>
        <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 14, rowGap: 6 }} accessibilityLabel={line.pi}>
          {words.map((word, w) => (
            <View key={w} style={{ flexDirection: "row" }}>
              {word.map((s, i) => (
                <T key={i} style={{ fontFamily: s.heavy ? F.paliBold : F.pali, fontSize: 26, lineHeight: 38, color: s.heavy ? C.burgundy : "#4A4340" }}>
                  {s.text}
                  {i < word.length - 1 ? <T style={{ color: C.faint, fontSize: 22 }}>·</T> : null}
                </T>
              ))}
            </View>
          ))}
        </View>
        <T style={{ fontFamily: F.deva, fontSize: 18, color: C.muted }}>{paliToDevanagari(line.pi)}</T>
        <T style={{ fontSize: 15, color: C.muted, fontFamily: prefs.translation === "hi" ? F.deva : F.regular }}>{line[prefs.translation]}</T>
        <Muted style={{ fontSize: 12 }}>{t("pron.heavyHint")}</Muted>
      </Card>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button
          style={{ flex: 1 }}
          label={playing === "model" ? t("pron.stop") : t("pron.listen")}
          variant={playing === "model" ? "primary" : "secondary"}
          icon={playing === "model" ? <Square size={16} color={C.cream} fill={C.cream} /> : <Volume2 size={18} color={C.burgundy} />}
          onPress={() => listen("model")}
        />
        <Button
          style={{ flex: 1 }}
          label={playing === "slow" ? t("pron.stop") : t("pron.slow")}
          variant={playing === "slow" ? "primary" : "secondary"}
          icon={playing === "slow" ? <Square size={16} color={C.cream} fill={C.cream} /> : <Snail size={18} color={C.burgundy} />}
          onPress={() => listen("slow")}
        />
      </View>

      {tips.length > 0 && (
        <Card style={{ backgroundColor: C.paper, gap: 10 }}>
          <T bold style={{ fontSize: 15 }}>
            {t("pron.tips")}
          </T>
          {tips.map((id) => (
            <View key={id} style={{ flexDirection: "row", gap: 12 }}>
              <T style={{ fontFamily: F.paliBold, color: C.burgundy, fontSize: 14, minWidth: 72 }}>{TIPS[id].sample}</T>
              <T style={{ flex: 1, fontSize: 14, lineHeight: 21 }}>{TIPS[id][lang]}</T>
            </View>
          ))}
        </Card>
      )}

      <Muted style={{ fontSize: 12 }}>{t("listen.aiVoiceNote")}</Muted>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button style={{ flex: 1 }} variant="secondary" label={t("pron.previous")} disabled={index === 0} onPress={() => goTo(index - 1)} icon={<ArrowLeft size={18} color={C.burgundy} />} />
        <Button style={{ flex: 1 }} label={t("pron.next")} disabled={index === lines.length - 1} onPress={() => goTo(index + 1)} icon={<ArrowRight size={18} color={C.cream} />} />
      </View>
    </Screen>
  );
}
