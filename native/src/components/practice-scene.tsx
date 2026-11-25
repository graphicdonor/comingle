import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View, type ImageSourcePropType } from "react-native";
import Svg, { Path } from "react-native-svg";
import { SCENE, type SceneVariant } from "@/lib/practice/practice-scene";

// The animated picture at the top of Today's practice card: at morning the
// sun rises from behind the hills, rays turn, mist drifts and birds cross
// the sky; at evening the moon comes out, stars twinkle, the lamps flicker
// and incense smoke rises. Motion stops when the screen isn't showing
// (`active`) and isn't used at all when the phone asks for reduced motion.

const IMG: Record<string, ImageSourcePropType> = {
  morning: require("../../assets/practice/morning.webp"),
  evening: require("../../assets/practice/evening.webp"),
  hills: require("../../assets/practice/hills.webp"),
  sun: require("../../assets/practice/sun.webp"),
  rays: require("../../assets/practice/rays.webp"),
  mist: require("../../assets/practice/mist.webp"),
  moon: require("../../assets/practice/moon.webp"),
  glow: require("../../assets/practice/glow.webp"),
  smoke: require("../../assets/practice/smoke.webp"),
};

const native = { useNativeDriver: true } as const;
const ease = Easing.inOut(Easing.sin);

function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

/** 0 → 1 → 0, forever. */
const pingPong = (v: Animated.Value, duration: number, delay = 0) =>
  Animated.loop(
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(v, { toValue: 1, duration, easing: ease, ...native }),
      Animated.timing(v, { toValue: 0, duration, easing: ease, ...native }),
    ]),
  );

/** 0 → 1, then again from 0, forever. */
const repeat = (v: Animated.Value, duration: number, delay = 0, easing = Easing.linear) =>
  Animated.loop(Animated.sequence([Animated.delay(delay), Animated.timing(v, { toValue: 1, duration, easing, ...native }), Animated.timing(v, { toValue: 0, duration: 0, ...native })]));

function Bird({ size }: { size: number }) {
  return (
    <Svg width={size} height={size / 2} viewBox="0 0 20 10">
      <Path d="M1 6 Q5 1 10 6 Q15 1 19 6" stroke="#5B3A2E" strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function PracticeScene({ variant, active }: { variant: SceneVariant; active: boolean }) {
  const reduce = useReduceMotion();
  const [width, setWidth] = useState(0);
  const [v] = useState(() => ({
    show: new Animated.Value(variant === "morning" ? 1 : 0),
    zoom: new Animated.Value(0),
    sun: new Animated.Value(1),
    spin: new Animated.Value(0),
    mist: new Animated.Value(0),
    birds: new Animated.Value(0),
    moon: new Animated.Value(1),
    float: new Animated.Value(0),
    flames: SCENE.flames.map(() => new Animated.Value(0.5)),
    stars: SCENE.stars.map(() => new Animated.Value(1)),
    smoke: [new Animated.Value(0), new Animated.Value(0)],
  }));
  const morning = variant === "morning";

  // Cross-fade between morning and evening; the sun rises (or the moon comes
  // out) each time its scene is chosen.
  useEffect(() => {
    if (reduce) {
      v.show.setValue(morning ? 1 : 0);
      v.sun.setValue(1);
      v.moon.setValue(1);
      return;
    }
    Animated.timing(v.show, { toValue: morning ? 1 : 0, duration: 700, easing: ease, ...native }).start();
    const intro = morning ? v.sun : v.moon;
    intro.setValue(0);
    const a = Animated.timing(intro, { toValue: 1, duration: morning ? 4200 : 2400, delay: 250, easing: Easing.out(Easing.cubic), ...native });
    a.start();
    return () => a.stop();
  }, [morning, reduce, v]);

  // Gentle, continuous motion for the scene on show.
  useEffect(() => {
    if (!active || reduce) {
      v.smoke.forEach((s) => s.setValue(0));
      v.birds.setValue(0);
      return;
    }
    const loops = [
      pingPong(v.zoom, 20000),
      ...(morning
        ? [repeat(v.spin, 120000), pingPong(v.mist, 9000), repeat(v.birds, 15000, 2500, Easing.inOut(Easing.quad))]
        : [
            pingPong(v.float, 4000),
            ...v.flames.map((f, i) =>
              Animated.loop(
                Animated.sequence([
                  Animated.timing(f, { toValue: 1, duration: 260 + i * 70, ...native }),
                  Animated.timing(f, { toValue: 0.35, duration: 340 + ((i * 53) % 160), ...native }),
                  Animated.timing(f, { toValue: 0.8, duration: 220 + i * 40, ...native }),
                  Animated.timing(f, { toValue: 0.5, duration: 400, ...native }),
                ]),
              ),
            ),
            ...v.stars.map((s, i) => pingPong(s, 1600 + ((i * 377) % 1600), (i * 431) % 2000)),
            ...v.smoke.map((s, i) => repeat(s, 5200, i * 2600, Easing.out(Easing.quad))),
          ]),
    ];
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [active, reduce, morning, v]);

  const k = width / SCENE.width;
  const at = (x: number, y: number, w: number, h: number) => ({ position: "absolute" as const, left: x * k, top: y * k, width: w * k, height: h * k });
  const { sun, rays, hills, mist, birds, moon, glow, incense } = SCENE;

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      {width > 0 && (
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: v.zoom.interpolate({ inputRange: [0, 1], outputRange: [1, 1.045] }) }] }]}>
          {/* Morning */}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: v.show }]}>
            <Animated.Image source={IMG.morning} style={at(0, 0, SCENE.width, SCENE.height)} />
            <Animated.Image
              source={IMG.rays}
              style={[
                at(sun.x - rays.size / 2, sun.to - rays.size / 2, rays.size, rays.size),
                {
                  opacity: v.sun.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, 0.32] }),
                  transform: [{ rotate: v.spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }],
                },
              ]}
            />
            <Animated.Image
              source={IMG.sun}
              style={[
                at(sun.x - sun.size / 2, sun.to - sun.size / 2, sun.size, sun.size),
                { transform: [{ translateY: v.sun.interpolate({ inputRange: [0, 1], outputRange: [(sun.from - sun.to) * k, 0] }) }] },
              ]}
            />
            <Animated.Image source={IMG.hills} style={at(hills.x, hills.y, hills.w, hills.h)} />
            <Animated.Image
              source={IMG.mist}
              style={[
                at(mist.x, mist.y, mist.w, mist.h),
                {
                  opacity: v.mist.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.8] }),
                  transform: [{ translateX: v.mist.interpolate({ inputRange: [0, 1], outputRange: [-30 * k, 50 * k] }) }],
                },
              ]}
            />
            <Animated.View
              style={[
                { position: "absolute", left: birds.x * k, top: birds.y * k, flexDirection: "row", gap: 10 * k, alignItems: "flex-end" },
                {
                  opacity: v.birds.interpolate({ inputRange: [0, 0.12, 0.85, 1], outputRange: [0, 0.9, 0.9, 0] }),
                  transform: [
                    { translateX: v.birds.interpolate({ inputRange: [0, 1], outputRange: [0, (birds.to - birds.x) * k] }) },
                    { translateY: v.birds.interpolate({ inputRange: [0, 1], outputRange: [0, -birds.rise * k] }) },
                  ],
                },
              ]}
            >
              <Bird size={44 * k} />
              <View style={{ marginBottom: 22 * k }}>
                <Bird size={34 * k} />
              </View>
              <Bird size={28 * k} />
            </Animated.View>
          </Animated.View>

          {/* Evening */}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: v.show.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
            <Animated.Image source={IMG.evening} style={at(0, 0, SCENE.width, SCENE.height)} />
            {SCENE.stars.map(([x, y, s], i) => (
              <Animated.View
                key={i}
                style={[
                  at(x - s / 2, y - s / 2, s, s),
                  { borderRadius: 99, backgroundColor: "#FFF4D6", opacity: v.stars[i].interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.95] }) },
                ]}
              />
            ))}
            <Animated.Image
              source={IMG.moon}
              style={[
                at(moon.x - moon.w / 2, moon.y - moon.h / 2, moon.w, moon.h),
                {
                  opacity: v.moon,
                  transform: [
                    { translateY: v.moon.interpolate({ inputRange: [0, 1], outputRange: [18 * k, 0] }) },
                    { translateY: v.float.interpolate({ inputRange: [0, 1], outputRange: [0, -6 * k] }) },
                  ],
                },
              ]}
            />
            {SCENE.flames.map(([x, y], i) => (
              <Animated.Image
                key={i}
                source={IMG.glow}
                style={[
                  at(x - glow / 2, y - glow / 2, glow, glow),
                  {
                    opacity: v.flames[i].interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }),
                    transform: [{ scale: v.flames[i].interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }) }],
                  },
                ]}
              />
            ))}
            {v.smoke.map((s, i) => (
              <Animated.Image
                key={i}
                source={IMG.smoke}
                style={[
                  at(incense.x - incense.w / 2, incense.y - incense.h, incense.w, incense.h),
                  {
                    opacity: s.interpolate({ inputRange: [0, 0.2, 0.7, 1], outputRange: [0, 0.75, 0.35, 0] }),
                    transform: [
                      { translateY: s.interpolate({ inputRange: [0, 1], outputRange: [10 * k, -70 * k] }) },
                      { translateX: s.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 8 * k, -6 * k] }) },
                      { scaleX: s.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.4] }) },
                    ],
                  },
                ]}
              />
            ))}
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}
