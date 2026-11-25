import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeepAwake } from "expo-keep-awake";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle } from "react-native-svg";
import { Pause, Play, X } from "lucide-react-native";
import { readingPrefs } from "@/lib/practice/preferences";
import { Button, Muted, T } from "~/components/ui";
import { IconButton } from "~/components/screen";
import { Animation } from "~/components/figure";
import { C, F } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { useContent } from "~/lib/content";
import { ringBell } from "~/lib/bell";
import { CHANNEL } from "~/lib/notifications";

function KeepAwake() {
  useKeepAwake();
  return null;
}

const RING = 260;
const STROKE = 6;
const R = (RING - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

/** If the app is in the background when time is up, a notification marks the end. */
async function scheduleEnd(seconds: number, title: string, body: string): Promise<string | null> {
  try {
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return null;
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(1, Math.round(seconds)), channelId: CHANNEL },
    });
  } catch {
    return null;
  }
}

export default function MeditationTimer() {
  const params = useLocalSearchParams<{ practice: string; minutes: string; guide?: string }>();
  const { t, lang } = useT();
  const insets = useSafeAreaInsets();
  const content = useContent();
  const prefs = readingPrefs.use();
  const practice = content.meditations.find((m) => m.id === params.practice) ?? content.meditations[0];
  const total = Math.max(1, Number(params.minutes) || 10) * 60;
  const guide = params.guide === "1";

  const [left, setLeft] = useState(total);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const endAt = useRef(0);
  const remainingAtPause = useRef(total);
  const endNotice = useRef<string | null>(null);

  const cancelNotice = () => {
    if (endNotice.current) void Notifications.cancelScheduledNotificationAsync(endNotice.current);
    endNotice.current = null;
  };
  const armNotice = (seconds: number) => {
    cancelNotice();
    void scheduleEnd(seconds, t("meditate.complete"), t("meditate.completeHint")).then((id) => (endNotice.current = id));
  };

  // Start: bell, and the end notice.
  useEffect(() => {
    endAt.current = Date.now() + total * 1000;
    ringBell();
    armNotice(total);
    return cancelNotice;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Count from the clock, so time stays right even if the app was in the background.
  useEffect(() => {
    if (paused || done) return;
    const tick = () => {
      const remaining = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        setDone(true);
        cancelNotice();
        ringBell();
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [paused, done]);

  const togglePause = () => {
    if (paused) {
      endAt.current = Date.now() + remainingAtPause.current * 1000;
      armNotice(remainingAtPause.current);
      setPaused(false);
    } else {
      remainingAtPause.current = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      cancelNotice();
      setPaused(true);
    }
  };

  // Breathing guide: in 4 s, out 6 s.
  const [scale] = useState(() => new Animated.Value(0.6));
  const [phase, setPhase] = useState<"in" | "out">("in");
  useEffect(() => {
    if (!guide || paused || done) return;
    let live = true;
    const cycle = () => {
      if (!live) return;
      setPhase("in");
      Animated.timing(scale, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }).start(({ finished }) => {
        if (!finished || !live) return;
        setPhase("out");
        Animated.timing(scale, { toValue: 0.6, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }).start(({ finished: f }) => f && cycle());
      });
    };
    cycle();
    return () => {
      live = false;
      scale.stopAnimation();
    };
  }, [guide, paused, done, scale]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const progress = 1 - left / total;

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: C.burgundyDark, paddingTop: insets.top, paddingBottom: insets.bottom + 24, paddingHorizontal: 24, alignItems: "center", justifyContent: "center", gap: 18 }}>
        <StatusBar style="light" />
        <View style={{ backgroundColor: C.cream, borderRadius: 28, padding: 12 }}>
          <Animation id="breathe" height={200} decorative />
        </View>
        <T bold style={{ fontSize: 26, color: C.cream }} accessibilityRole="header">
          {t("meditate.complete")}
        </T>
        <T style={{ color: "rgba(247,242,232,0.8)", fontSize: 16, textAlign: "center", lineHeight: 24 }}>{t("meditate.completeHint")}</T>
        <Button label={t("meditate.again")} variant="secondary" onPress={() => {
            endAt.current = Date.now() + total * 1000;
            setLeft(total);
            setPaused(false);
            setDone(false);
            ringBell();
            armNotice(total);
          }} style={{ alignSelf: "stretch" }} />
        <Button label={t("common.backToToday")} variant="ghost" onPress={() => router.replace("/")} style={{ alignSelf: "stretch" }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.burgundyDark, paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}>
      <StatusBar style="light" />
      {prefs.keepAwake && <KeepAwake />}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: 8 }}>
        <IconButton label={t("common.endSession")} onPress={() => router.back()}>
          <X size={24} color={C.cream} />
        </IconButton>
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 28, paddingHorizontal: 24 }}>
        <View style={{ alignItems: "center", gap: 4 }}>
          <T bold style={{ color: C.cream, fontSize: 22 }}>
            {practice.title[lang]}
          </T>
          <T style={{ color: "rgba(247,242,232,0.65)", fontFamily: F.paliItalic, fontSize: 16 }}>{practice.pali}</T>
        </View>

        <View style={{ width: RING, height: RING, alignItems: "center", justifyContent: "center" }} accessible accessibilityRole="timer" accessibilityLabel={`${mm}:${ss}`}>
          <Svg width={RING} height={RING} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
            <Circle cx={RING / 2} cy={RING / 2} r={R} stroke="rgba(247,242,232,0.15)" strokeWidth={STROKE} fill="none" />
            <Circle cx={RING / 2} cy={RING / 2} r={R} stroke="#E9BE73" strokeWidth={STROKE} fill="none" strokeDasharray={`${CIRC}`} strokeDashoffset={CIRC * (1 - progress)} strokeLinecap="round" />
          </Svg>
          {guide && <Animated.View style={{ position: "absolute", width: RING - 50, height: RING - 50, borderRadius: RING, backgroundColor: "rgba(233,190,115,0.14)", transform: [{ scale }] }} />}
          <T bold style={{ color: C.cream, fontSize: 56, fontVariant: ["tabular-nums"] }}>
            {mm}:{ss}
          </T>
          <T style={{ color: "rgba(247,242,232,0.7)", fontSize: 15 }} accessibilityLiveRegion="polite">
            {paused ? t("meditate.paused") : guide ? t(phase === "in" ? "meditate.in" : "meditate.out") : " "}
          </T>
        </View>

        <Button
          label={paused ? t("meditate.resume") : t("meditate.pause")}
          variant="secondary"
          onPress={togglePause}
          icon={paused ? <Play size={18} color={C.burgundy} fill={C.burgundy} /> : <Pause size={18} color={C.burgundy} fill={C.burgundy} />}
          style={{ minWidth: 180 }}
        />
        <Muted style={{ color: "rgba(247,242,232,0.6)", textAlign: "center", fontSize: 14 }}>{practice.steps[0][lang]}</Muted>
      </View>
    </View>
  );
}
