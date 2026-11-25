import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, View, type StyleProp, type ViewStyle } from "react-native";
import { useIsFocused } from "expo-router";
import { useT } from "~/lib/i18n";
import { ANIMATIONS, IMAGES, LABELS, ratio, type Frame } from "./illustrations";
import { T } from "./ui";
import { C } from "~/lib/theme";

function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

/** Cross-fades through aligned frames; still when motion is reduced or the screen isn't shown. */
function Frames({ frames, fade, label, height, style }: { frames: Frame[]; fade: number; label?: string; height: number; style?: StyleProp<ViewStyle> }) {
  const { lang } = useT();
  const reduce = useReduceMotion();
  const focused = useIsFocused();
  const [index, setIndex] = useState(0);
  const [opacity] = useState(() => frames.map((_, i) => new Animated.Value(i === 0 ? 1 : 0)));
  const animate = frames.length > 1 && !reduce && focused;

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => {
      const next = (index + 1) % frames.length;
      Animated.parallel([
        Animated.timing(opacity[index], { toValue: 0, duration: fade, useNativeDriver: true }),
        Animated.timing(opacity[next], { toValue: 1, duration: fade, useNativeDriver: true }),
      ]).start();
      setIndex(next);
    }, frames[index].hold);
    return () => clearTimeout(timer);
  }, [animate, index, frames, fade, opacity]);

  const width = height * ratio(frames[0].image);
  const caption = frames[index].caption;
  return (
    <View style={[{ alignItems: "center" }, style]} accessible={Boolean(label)} accessibilityRole={label ? "image" : undefined} accessibilityLabel={label}>
      <View style={{ width, height }}>
        {frames.map((f, i) => (
          <Animated.Image key={`${f.image}-${i}`} source={IMAGES[f.image]} resizeMode="contain" style={{ position: "absolute", width, height, opacity: opacity[i] }} />
        ))}
      </View>
      {caption && (
        <T style={{ marginTop: 6, fontSize: 13, color: C.faint }} accessibilityLiveRegion="polite">
          {caption[lang]}
        </T>
      )}
    </View>
  );
}

export function Figure({ id, height = 200, decorative, style }: { id: string; height?: number; decorative?: boolean; style?: StyleProp<ViewStyle> }) {
  const { lang } = useT();
  const frames: Frame[] = id === "burmese" ? ANIMATIONS.breathe.frames : [{ image: id, hold: 0 }];
  return <Frames frames={frames} fade={ANIMATIONS.breathe.fade} label={decorative ? undefined : LABELS[id]?.[lang]} height={height} style={style} />;
}

export function Animation({ id, height = 220, decorative, style }: { id: string; height?: number; decorative?: boolean; style?: StyleProp<ViewStyle> }) {
  const { lang } = useT();
  const a = ANIMATIONS[id];
  if (!a) return null;
  return <Frames frames={a.frames} fade={a.fade} label={decorative ? undefined : a.label[lang]} height={height} style={style} />;
}
