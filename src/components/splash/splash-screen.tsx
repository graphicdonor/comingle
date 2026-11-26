"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { useT } from "@/lib/i18n/use-t";
import { LOTUS, LOTUS_PADS, LOTUS_PETALS, LOTUS_SPECKS, LOTUS_Y, lotusSrc } from "@/lib/splash";

/** Minimum time it stays after JavaScript wakes up, so it never vanishes abruptly. */
const MIN_AFTER_HYDRATION_MS = 500;
const REDUCED_HOLD_MS = 700;
/** If the artwork still hasn't arrived by now (slow connection), skip the splash. */
const GIVE_UP_MS = 2600;
/** Never keep someone waiting longer than this. */
const MAX_MS = 7500;

type SplashWindow = Window & { __splashReadyAt?: number };

/**
 * Inline script, run while the HTML is parsed (before the app's JavaScript):
 * marks the artwork ready once every image has fully downloaded, or at once
 * if they're cached. Until then CSS keeps the scene hidden and paused.
 */
const WAIT_FOR_ART = `(function(){var root=document.documentElement;try{
var imgs=document.querySelectorAll(".lp-img"),left=0;
function ready(){window.__splashReadyAt=performance.now();root.dataset.splash="ready";window.dispatchEvent(new Event("splash-art-ready"));}
function tick(){if(--left===0)ready();}
for(var i=0;i<imgs.length;i++){if(!imgs[i].complete){left++;imgs[i].addEventListener("load",tick);imgs[i].addEventListener("error",tick);}}
if(left===0)ready();
}catch(e){root.dataset.splash="ready";}})();`;

/** Inline CSS variables (custom properties aren't in CSSProperties). */
const vars = (v: Record<string, string | number>) => v as CSSProperties;
const s = (n: number) => `${n}s`;

/** Aspect ratios (width ÷ height) of the petal images. */
const PETAL_ASPECT = { "petal-outer": 346 / 560, "petal-inner": 230 / 420 } as Record<string, number>;

/**
 * The lotus portal: dark water at night, a bud rises and ripples spread,
 * three rings of petals unfold in turn, the golden centre lights up in a
 * burst of light, then the flower turns away as the Dharma wheel spins out
 * of it with the name beneath, and the camera dives through the wheel into
 * the app. Skippable with a tap; a still frame for reduced motion.
 *
 * The motion is pure CSS ("Lotus splash" in globals.css), timed from
 * LOTUS in lib/splash.ts (shared with the Android app), so it starts the
 * moment the artwork is ready, before JavaScript. JavaScript only times the
 * dive. Shown once per full page load, on both server and client render so
 * nothing flashes during hydration.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "done">("visible");
  const [skipped, setSkipped] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { t, lang } = useT();
  // The splash is app chrome: not on the public marketing pages, nor in the
  // staff tools (CMS and admin).
  const pathname = usePathname();
  const isLanding =
    pathname === "/" ||
    pathname === "/survey" ||
    pathname === "/unsubscribe" ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/cms") ||
    pathname.startsWith("/admin");

  useEffect(() => {
    if (prefersReducedMotion) {
      const timer = setTimeout(() => setPhase("done"), REDUCED_HOLD_MS);
      return () => clearTimeout(timer);
    }
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      // Dive in once the whole bloom has played; if the artwork is still on
      // its way, wait a little and then let the reader in without it.
      const now = performance.now();
      const readyAt = (window as SplashWindow).__splashReadyAt;
      const target = readyAt === undefined ? GIVE_UP_MS : Math.min(readyAt + LOTUS.total * 1000, MAX_MS);
      timer = setTimeout(() => setPhase("done"), Math.max(target - now, MIN_AFTER_HYDRATION_MS));
    };
    schedule();
    const onReady = () => {
      clearTimeout(timer);
      schedule();
    };
    window.addEventListener("splash-art-ready", onReady);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("splash-art-ready", onReady);
    };
  }, [prefersReducedMotion]);

  const skip = () => {
    setSkipped(true);
    setPhase("done");
  };
  const dive = skipped ? 0.3 : prefersReducedMotion ? 0.15 : LOTUS.dive;

  // "Learn the Dhamma. Practise … Live …" → one phrase per line.
  const phrases = t("today.tagline")
    .split(lang === "hi" ? /(?<=।)\s+/ : /(?<=\.)\s+/)
    .filter(Boolean);

  return (
    <AnimatePresence>
      {phase !== "done" && !isLanding && (
        <motion.div
          key="splash"
          className="splash-root fixed inset-0 z-[999] overflow-hidden bg-[#04101A]"
          initial={false}
          exit={{ opacity: 0, transition: { duration: dive * 0.45, delay: dive * 0.55, ease: "easeOut" } }}
          onClick={skip}
          aria-hidden="true"
        >
          {/* While the artwork arrives: one slow breathing point of light. */}
          <div className="lp-wait absolute left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFE3A8]" style={{ top: `${LOTUS_Y * 100}%` }} />

          <motion.div
            className="lp-stage absolute inset-0"
            style={{ transformOrigin: `50% ${LOTUS_Y * 100}%` }}
            initial={false}
            exit={{ scale: 9, rotate: 30, transition: { duration: dive, ease: [0.7, 0, 0.84, 0] } }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lotusSrc("water")} alt="" draggable={false} fetchPriority="high" className="lp-img lp-water absolute inset-0 h-full w-full object-cover" />

            {LOTUS_PADS.map((pad, i) => (
              <div
                key={pad.img}
                className="lp-pad absolute"
                style={vars({ left: `${pad.x * 100}%`, top: `${pad.y * 100}%`, width: `calc(var(--L) * ${pad.w})`, "--turn": `${pad.turn}deg`, "--d": s(0.2 + i * 0.25) })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lotusSrc(pad.img)} alt="" draggable={false} className="lp-img w-full" />
              </div>
            ))}

            {/* The flower, all positioned from its centre. */}
            <div className="lp-lotus absolute left-1/2" style={{ top: `${LOTUS_Y * 100}%` }}>
              <div className="lp-glow" style={vars({ "--d": s(LOTUS.bud.rise) })} />

              {LOTUS.ripples.map((at) => (
                <div key={at} className="lp-ripple" style={vars({ "--d": s(at), "--for": s(LOTUS.rippleFor) })} />
              ))}

              <div className="lp-bud" style={vars({ "--d": s(LOTUS.bud.rise), "--for": s(LOTUS.bud.riseFor), width: `calc(var(--L) * ${LOTUS.bud.w})` })}>
                <div className="lp-bud-burst" style={vars({ "--d": s(LOTUS.bud.burst), "--for": s(LOTUS.bud.burstFor) })}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lotusSrc("bud")} alt="" draggable={false} className="lp-img w-full" />
                </div>
              </div>

              <div className="lp-flower" style={vars({ "--d": s(LOTUS.turn.at), "--for": s(LOTUS.turn.for) })}>
                {LOTUS_PETALS.map((p) => (
                  <div
                    key={p.key}
                    className="lp-petal"
                    style={vars({
                      height: `calc(var(--L) * ${p.length})`,
                      width: `calc(var(--L) * ${p.length * PETAL_ASPECT[p.img]})`,
                      "--a": `${p.angle}deg`,
                    })}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lotusSrc(p.img)}
                      alt=""
                      draggable={false}
                      className="lp-img lp-open h-full w-full"
                      style={vars({ "--d": s(p.delay), "--for": s(LOTUS.petalFor), filter: p.dim < 1 ? `brightness(${p.dim})` : "none" })}
                    />
                  </div>
                ))}
                <div className="lp-centre" style={vars({ "--d": s(LOTUS.centre.at), "--for": s(LOTUS.centre.for), width: `calc(var(--L) * ${LOTUS.centre.w})` })}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lotusSrc("centre")} alt="" draggable={false} className="lp-img w-full" />
                </div>
              </div>

              <div className="lp-burst" style={vars({ "--d": s(LOTUS.burst.at), "--for": s(LOTUS.burst.for) })} />
              {LOTUS_SPECKS.map((sp, i) => {
                const rad = (sp.angle * Math.PI) / 180;
                return (
                  <div
                    key={i}
                    className="lp-speck"
                    style={vars({
                      width: sp.size,
                      height: sp.size,
                      "--x": (Math.cos(rad) * sp.distance).toFixed(3),
                      "--y": (Math.sin(rad) * sp.distance).toFixed(3),
                      "--d": s(sp.delay),
                    })}
                  />
                );
              })}

              <div className="lp-wheel" style={vars({ "--d": s(LOTUS.wheel.at), "--for": s(LOTUS.wheel.for), width: `calc(var(--L) * ${LOTUS.wheel.w})` })}>
                <div className="lp-wheel-glow" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lotusSrc("wheel")} alt="" draggable={false} className="lp-img lp-spin relative w-full" />
              </div>
            </div>

            {/* Name and tagline beneath the wheel */}
            <div className="absolute inset-x-0 flex flex-col items-center px-6 text-center" style={{ top: `calc(${LOTUS_Y * 100}% + var(--L) * 0.4)` }}>
              <p className="text-[44px] font-bold tracking-tight text-[#F7F2E8] [text-shadow:0_0_24px_rgba(255,206,120,0.55)]">
                {"WePray".split("").map((ch, i) => (
                  <span key={i} className="splash-letter" style={{ animationDelay: s(LOTUS.name.at + i * 0.06) }}>
                    {ch}
                  </span>
                ))}
              </p>
              {/* Keyed by position so switching to Hindi on hydration swaps the
                  words without restarting the animation. */}
              <div lang={lang} className="mt-1.5 flex flex-col items-center gap-0.5">
                {phrases.map((phrase, i) => (
                  <p key={i} className="splash-phrase text-[15px] font-medium text-[#F7F2E8]/75" style={{ animationDelay: s(LOTUS.tagline.at + i * 0.18) }}>
                    {phrase}
                  </p>
                ))}
              </div>
            </div>
            {/* Marks the artwork ready once fully downloaded (see WAIT_FOR_ART). */}
            <script dangerouslySetInnerHTML={{ __html: WAIT_FOR_ART }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
