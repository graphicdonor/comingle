import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, View, useWindowDimensions, type ImageSourcePropType } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { LOTUS, LOTUS_PADS, LOTUS_PETALS, LOTUS_SPECKS, type LotusArt } from "@/lib/splash";
import { useT } from "~/lib/i18n";
import { fontFor } from "~/lib/theme";

// The lotus portal, played once as the app opens (the website's splash, the
// same timeline from lib/splash.ts): dark water, a bud rises and ripples
// spread, three rings of petals unfold, the golden centre lights up in a
// burst, the flower turns away as the Dharma wheel spins out of it with the
// name beneath, and the camera dives through the wheel into the app. A tap
// dives in at once; with reduced motion it shows the last frame briefly.
// Everything runs on the native driver from one clock.

const IMG: Record<LotusArt, ImageSourcePropType> = {
  water: require("../../assets/splash/water.webp"),
  bud: require("../../assets/splash/bud.webp"),
  "petal-outer": require("../../assets/splash/petal-outer.webp"),
  "petal-inner": require("../../assets/splash/petal-inner.webp"),
  centre: require("../../assets/splash/centre.webp"),
  wheel: require("../../assets/splash/wheel.webp"),
  "pad-1": require("../../assets/splash/pad-1.webp"),
  "pad-2": require("../../assets/splash/pad-2.webp"),
  "pad-3": require("../../assets/splash/pad-3.webp"),
};
/** Width ÷ height of each picture. */
const ASPECT: Record<LotusArt, number> = {
  water: 2 / 3,
  bud: 384 / 520,
  "petal-outer": 346 / 560,
  "petal-inner": 230 / 420,
  centre: 460 / 443,
  wheel: 760 / 746,
  "pad-1": 360 / 309,
  "pad-2": 360 / 316,
  "pad-3": 360 / 309,
};
/** Every picture on screen, to know when they've all loaded. */
const IMAGE_COUNT = 1 + LOTUS_PADS.length + 1 + LOTUS_PETALS.length + 1 + 1;
/** On the phone the flower opens in the middle, where the launch screen's bud sits. */
const CENTRE_Y = 0.47;

const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
const overshoot = Easing.bezier(0.2, 1.25, 0.4, 1);
const pop = Easing.bezier(0.3, 1.6, 0.5, 1);
const native = { useNativeDriver: true } as const;

/** A value that moves from `from` to `to` between `at` and `at + dur` seconds. */
function seg(t: Animated.Value, at: number, dur: number, from: number, to: number, easing: (v: number) => number = (v) => v) {
  return t.interpolate({ inputRange: [at, at + dur], outputRange: [from, to], easing, extrapolate: "clamp" });
}
function segDeg(t: Animated.Value, at: number, dur: number, from: number, to: number, easing?: (v: number) => number) {
  return t.interpolate({ inputRange: [at, at + dur], outputRange: [`${from}deg`, `${to}deg`], easing, extrapolate: "clamp" });
}

function Glow({ id, size, colors }: { id: string; size: number; colors: [string, number][] }) {
  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          {colors.map(([c, o], i) => (
            <Stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={c} stopOpacity={o} />
          ))}
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
    </Svg>
  );
}

export function LotusSplash({ onDone }: { onDone: () => void }) {
  const { width: w, height: h } = useWindowDimensions();
  const { t: tr, lang } = useT();
  const L = Math.min(w * 0.86, h * 0.52);
  const cx = w / 2;
  const cy = h * CENTRE_Y;

  const [{ t, dive, fade, loop, spin }] = useState(() => ({
    /** The clock, in seconds of the timeline. */
    t: new Animated.Value(0),
    dive: new Animated.Value(0),
    fade: new Animated.Value(1),
    loop: new Animated.Value(0),
    spin: new Animated.Value(0),
  }));
  const loaded = useRef(0);
  const [started, setStarted] = useState(false);
  const diving = useRef(false);

  const diveIn = () => {
    if (diving.current) return;
    diving.current = true;
    t.stopAnimation();
    Animated.timing(dive, { toValue: 1, duration: LOTUS.dive * 1000, easing: Easing.bezier(0.7, 0, 0.84, 0), ...native }).start(() => onDone());
  };

  // Start once every picture has loaded (they're on the phone, so it's quick).
  const onLoad = () => {
    if (++loaded.current === IMAGE_COUNT) setStarted(true);
  };
  useEffect(() => {
    const fallback = setTimeout(() => setStarted(true), 900);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    const loops = [
      Animated.loop(Animated.sequence([Animated.timing(loop, { toValue: 1, duration: 3500, easing: Easing.inOut(Easing.sin), ...native }), Animated.timing(loop, { toValue: 0, duration: 3500, easing: Easing.inOut(Easing.sin), ...native })])),
      Animated.loop(Animated.timing(spin, { toValue: 1, duration: 26000, easing: Easing.linear, ...native })),
    ];
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        t.setValue(LOTUS.total);
        setTimeout(() => Animated.timing(fade, { toValue: 0, duration: 250, ...native }).start(() => onDone()), 800);
        return;
      }
      loops.forEach((l) => l.start());
      Animated.timing(t, { toValue: LOTUS.total, duration: LOTUS.total * 1000, easing: Easing.linear, ...native }).start(({ finished }) => finished && diveIn());
    });
    return () => {
      cancelled = true;
      loops.forEach((l) => l.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  const phrases = tr("today.tagline")
    .split(lang === "hi" ? /(?<=।)\s+/ : /(?<=\.)\s+/)
    .filter(Boolean);

  const a = useMemo(() => {
    const { bud, centre, burst, turn, wheel } = LOTUS;
    const budH = L * bud.w / ASPECT.bud;
    return {
      water: { opacity: seg(t, 0, 1.8, 0, 1), transform: [{ scale: seg(t, 0, 1.8, 1.18, 1, outExpo) }] },
      glow: { opacity: seg(t, bud.rise, 1.2, 0, 1) },
      // The bud is already showing on the launch screen, so it only grows.
      budRise: { transform: [{ translateY: seg(t, bud.rise, bud.riseFor, budH * 0.05, 0, outExpo) }, { scale: seg(t, bud.rise, bud.riseFor, 0.7, 1, outExpo) }] },
      budBurst: { opacity: seg(t, bud.burst, bud.burstFor, 1, 0, Easing.in(Easing.quad)), transform: [{ scale: seg(t, bud.burst, bud.burstFor, 1, 1.4) }] },
      flower: {
        opacity: seg(t, turn.at, turn.for, 1, 0, Easing.in(Easing.quad)),
        transform: [{ rotate: segDeg(t, turn.at, turn.for, 0, 75, Easing.in(Easing.quad)) }, { scale: seg(t, turn.at, turn.for, 1, 1.18) }],
      },
      centre: {
        opacity: seg(t, centre.at, centre.for * 0.4, 0, 1),
        transform: [{ scale: seg(t, centre.at, centre.for, 0, 1, pop) }, { rotate: segDeg(t, centre.at, centre.for, -90, 0, outExpo) }],
      },
      burst: {
        opacity: t.interpolate({ inputRange: [burst.at, burst.at + burst.for * 0.18, burst.at + burst.for], outputRange: [0, 1, 0], extrapolate: "clamp" }),
        transform: [{ scale: seg(t, burst.at, burst.for, 0.15, 2.8, outExpo) }],
      },
      wheel: {
        opacity: seg(t, wheel.at, wheel.for * 0.5, 0, 1),
        transform: [{ scale: seg(t, wheel.at, wheel.for, 0.2, 1, outExpo) }, { rotate: segDeg(t, wheel.at, wheel.for, -240, 0, outExpo) }],
      },
      spin: { transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] },
      pulse: { opacity: seg(loop, 0, 1, 0.65, 1), transform: [{ scale: seg(loop, 0, 1, 0.94, 1.06) }] },
      name: { opacity: seg(t, LOTUS.name.at, 0.6, 0, 1), transform: [{ translateY: seg(t, LOTUS.name.at, 0.6, 14, 0, outExpo) }] },
      stage: {
        transform: [{ scale: seg(dive, 0, 1, 1, 9) }, { rotate: segDeg(dive, 0, 1, 0, 30) }],
      },
      root: { opacity: Animated.multiply(fade, dive.interpolate({ inputRange: [0, 0.55, 1], outputRange: [1, 1, 0] })) },
    };
  }, [t, dive, fade, loop, spin, L]);

  // The water keeps its 2:3 shape and covers the screen.
  const waterW = Math.max(w, h * ASPECT.water);
  const waterH = waterW / ASPECT.water;
  const flowerBox = { left: 0, top: 0, width: w, height: h, transformOrigin: [cx, cy, 0] } as const;
  const centred = (size: number, aspect = 1) => ({ position: "absolute" as const, width: size, height: size / aspect, left: cx - size / 2, top: cy - size / aspect / 2 });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, a.root]}>
      <StatusBar style="light" />
      <Pressable style={StyleSheet.absoluteFill} onPress={diveIn} accessibilityLabel="Skip">
        <Animated.View style={[styles.box, flowerBox, a.stage, { opacity: started ? 1 : 0 }]}>
          <Animated.Image source={IMG.water} onLoad={onLoad} style={[{ position: "absolute", width: waterW, height: waterH, left: (w - waterW) / 2, top: (h - waterH) / 2 }, a.water]} />

          {LOTUS_PADS.map((pad, i) => {
            const pw = L * pad.w;
            const d = 0.2 + i * 0.25;
            return (
              <Animated.Image
                key={pad.img}
                source={IMG[pad.img]}
                onLoad={onLoad}
                style={{
                  position: "absolute",
                  width: pw,
                  height: pw / ASPECT[pad.img],
                  left: pad.x * w - pw / 2,
                  top: pad.y * h - pw / ASPECT[pad.img] / 2,
                  opacity: seg(t, d, 1.4, 0, 1),
                  transform: [{ rotate: loop.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${pad.turn}deg`] }) }, { translateX: seg(loop, 0, 1, 0, pw * 0.02) }, { translateY: seg(loop, 0, 1, 0, -pw * 0.03) }],
                }}
              />
            );
          })}

          <Animated.View style={[centred(L * 1.3), a.glow]} pointerEvents="none">
            <Glow id="glow" size={L * 1.3} colors={[["#FFC4AA", 0.42], ["#F08296", 0.16], ["#F08296", 0]]} />
          </Animated.View>

          {LOTUS.ripples.map((at) => (
            <Animated.View
              key={at}
              style={[
                centred(L),
                styles.ripple,
                { borderRadius: L / 2, opacity: seg(t, at, LOTUS.rippleFor, 0.9, 0), transform: [{ scale: seg(t, at, LOTUS.rippleFor, 0.08, 2.3, Easing.bezier(0.2, 0.7, 0.3, 1)) }] },
              ]}
            />
          ))}

          <Animated.View style={[centred(L * LOTUS.bud.w, ASPECT.bud), { top: cy - (L * LOTUS.bud.w) / ASPECT.bud * 0.55 }, a.budRise]}>
            <Animated.Image source={IMG.bud} onLoad={onLoad} style={[styles.fill, a.budBurst]} />
          </Animated.View>

          <Animated.View style={[styles.box, flowerBox, a.flower]} pointerEvents="none">
            {LOTUS_PETALS.map((p) => {
              const ph = L * p.length;
              const pw = ph * ASPECT[p.img];
              return (
                <View key={p.key} style={{ position: "absolute", width: pw, height: ph, left: cx - pw / 2, top: cy - ph, transformOrigin: "50% 100%", transform: [{ rotate: `${p.angle}deg` }] }}>
                  <Animated.Image
                    source={IMG[p.img]}
                    onLoad={onLoad}
                    style={[
                      styles.fill,
                      {
                        transformOrigin: "50% 100%",
                        opacity: seg(t, p.delay, LOTUS.petalFor * 0.25, 0, p.dim),
                        transform: [
                          { perspective: 600 },
                          { rotateX: segDeg(t, p.delay, LOTUS.petalFor, -88, 0, overshoot) },
                          { scale: seg(t, p.delay, LOTUS.petalFor, 0.35, 1, overshoot) },
                        ],
                      },
                    ]}
                  />
                </View>
              );
            })}
            <Animated.Image source={IMG.centre} onLoad={onLoad} style={[centred(L * LOTUS.centre.w, ASPECT.centre), a.centre]} />
          </Animated.View>

          <Animated.View style={[centred(L), a.burst]} pointerEvents="none">
            <Glow id="burst" size={L} colors={[["#FFF6D6", 1], ["#FFD682", 0.7], ["#FFAA78", 0.25], ["#FFAA78", 0]]} />
          </Animated.View>

          {LOTUS_SPECKS.map((sp, i) => {
            const rad = (sp.angle * Math.PI) / 180;
            return (
              <Animated.View
                key={i}
                style={[
                  styles.speck,
                  {
                    width: sp.size,
                    height: sp.size,
                    borderRadius: sp.size / 2,
                    left: cx - sp.size / 2,
                    top: cy - sp.size / 2,
                    opacity: t.interpolate({ inputRange: [sp.delay, sp.delay + 0.19, sp.delay + 1.6], outputRange: [0, 1, 0], extrapolate: "clamp" }),
                    transform: [
                      { translateX: seg(t, sp.delay, 1.6, 0, Math.cos(rad) * sp.distance * L, outExpo) },
                      { translateY: seg(t, sp.delay, 1.6, 0, Math.sin(rad) * sp.distance * L - L * 0.3, outExpo) },
                    ],
                  },
                ]}
              />
            );
          })}

          <Animated.View style={[centred(L * LOTUS.wheel.w, ASPECT.wheel), a.wheel]}>
            <Animated.View style={[{ position: "absolute", left: -L * LOTUS.wheel.w * 0.35, top: -L * LOTUS.wheel.w * 0.35 }, a.pulse]} pointerEvents="none">
              <Glow id="wheel" size={L * LOTUS.wheel.w * 1.7} colors={[["#FFD278", 0.5], ["#FFB45A", 0.18], ["#FFB45A", 0]]} />
            </Animated.View>
            <Animated.Image source={IMG.wheel} onLoad={onLoad} style={[styles.fill, a.spin]} />
          </Animated.View>

          <View style={[styles.words, { top: cy + L * 0.4 }]} pointerEvents="none">
            <Animated.Text style={[styles.name, a.name]}>WePray</Animated.Text>
            {phrases.map((phrase, i) => {
              const at = LOTUS.tagline.at + i * 0.18;
              return (
                <Animated.Text
                  key={i}
                  style={[styles.phrase, fontFor(phrase), { opacity: seg(t, at, 0.6, 0, 1), transform: [{ translateY: seg(t, at, 0.6, 8, 0, outExpo) }] }]}
                >
                  {phrase}
                </Animated.Text>
              );
            })}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: "#04101A", zIndex: 100, elevation: 100 },
  box: { position: "absolute" },
  fill: { width: "100%", height: "100%" },
  ripple: { borderWidth: 1.5, borderColor: "rgba(255, 228, 186, 0.6)" },
  speck: { position: "absolute", backgroundColor: "#FFF1C9" },
  words: { position: "absolute", left: 0, right: 0, alignItems: "center", paddingHorizontal: 24 },
  name: { fontFamily: "Figtree_700Bold", fontSize: 44, color: "#F7F2E8", letterSpacing: -0.8, textShadowColor: "rgba(255, 206, 120, 0.55)", textShadowRadius: 18 },
  phrase: { marginTop: 3, fontSize: 15, color: "rgba(247, 242, 232, 0.78)" },
});
