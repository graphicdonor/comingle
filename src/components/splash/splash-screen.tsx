"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/use-t";
import { SPLASH_LAYERS } from "@/lib/splash";

const EASE = [0.16, 1, 0.3, 1] as const;
/** When the splash starts fading, measured from the start of page load. */
const HOLD_MS = 2700;
/** Minimum time it stays after JavaScript wakes up, so a slow load never cuts it off abruptly. */
const MIN_AFTER_HYDRATION_MS = 500;
const FADE_MS = 600;
const REDUCED_HOLD_MS = 600;
/** Once the artwork is ready, let the sunrise play this long before fading. */
const PLAY_AFTER_READY_MS = 2100;
/** Never keep someone waiting longer than this, however slow the connection. */
const MAX_MS = 6000;

type SplashWindow = Window & { __splashReadyAt?: number };

/**
 * Inline script, run while the HTML is parsed (before the app's JavaScript):
 * marks the artwork ready once every layer has fully downloaded, or at once
 * if they're cached. Until then CSS keeps the scene hidden and paused.
 */
const WAIT_FOR_ART = `(function(){var root=document.documentElement;try{
var imgs=document.querySelectorAll(".sp-layer"),left=0;
function ready(){window.__splashReadyAt=performance.now();root.dataset.splash="ready";window.dispatchEvent(new Event("splash-art-ready"));}
function tick(){if(--left===0)ready();}
for(var i=0;i<imgs.length;i++){if(!imgs[i].complete){left++;imgs[i].addEventListener("load",tick);imgs[i].addEventListener("error",tick);}}
if(left===0)ready();
}catch(e){root.dataset.splash="ready";}})();`;

const delay = (s: number) => ({ animationDelay: `${s}s` });

/**
 * Dawn over the hills: the pre-dawn sky warms, the sun rises from behind the
 * hills as its rays turn slowly, the hills settle in at different speeds for
 * depth, mist drifts, and a meditator sits on the nearest hill facing the
 * sunrise. The name and tagline appear in the sky above. Calm rather than
 * flashy (PRD §2.2), skippable with a tap, a still frame for reduced motion.
 *
 * The animation is pure CSS ("Splash" in globals.css), so it begins as soon
 * as the stylesheet loads, before JavaScript; the layers are preloaded from
 * the root layout. JavaScript only times the fade-out, counted from the start
 * of page load. Shown once per full page load, visible on both server and
 * client render so nothing flashes during hydration.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "done">("visible");
  const [skipped, setSkipped] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { t, lang } = useT();
  // The splash is app chrome: not on the public marketing pages.
  const pathname = usePathname();
  const isLanding = pathname === "/" || pathname === "/survey" || pathname === "/blog" || pathname.startsWith("/blog/");

  useEffect(() => {
    // Every render keeps the same JSX shape; only the timing depends on
    // client-only values, and setState stays in timer callbacks.
    if (prefersReducedMotion) {
      const timer = setTimeout(() => setPhase("done"), REDUCED_HOLD_MS);
      return () => clearTimeout(timer);
    }
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      // Fade out at HOLD_MS after page load, but give the sunrise time to play
      // once the artwork is ready, and never stay longer than MAX_MS overall.
      const now = performance.now();
      const readyAt = (window as SplashWindow).__splashReadyAt;
      const target = readyAt === undefined ? MAX_MS : Math.min(Math.max(HOLD_MS, readyAt + PLAY_AFTER_READY_MS), MAX_MS);
      timer = setTimeout(() => setPhase("done"), Math.max(target - now, MIN_AFTER_HYDRATION_MS));
    };
    schedule();
    // If the art is still arriving, reschedule the moment it's ready.
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
  const fadeSeconds = skipped ? 0.22 : prefersReducedMotion ? 0.15 : FADE_MS / 1000;

  // "Learn the Dhamma. Practise … Live …" → three phrases, one per line.
  const phrases = t("today.tagline")
    .split(lang === "hi" ? /(?<=।)\s+/ : /(?<=\.)\s+/)
    .filter(Boolean);

  return (
    <AnimatePresence>
      {phase !== "done" && !isLanding && (
        <motion.div
          key="splash"
          className="splash-root fixed inset-0 z-[999] overflow-hidden bg-[#F7F2E8]"
          initial={false}
          exit={{ opacity: 0, scale: 1.04, transition: { duration: fadeSeconds, ease: EASE } }}
          onClick={skip}
          aria-hidden="true"
        >
          {/* The artwork keeps its 2:3 shape and covers the screen; on tall
              phones only the outer sky at the sides is trimmed. */}
          <div className="absolute left-1/2 top-1/2 aspect-[2/3] w-[max(100vw,66.667vh)] -translate-x-1/2 -translate-y-1/2">
            {SPLASH_LAYERS.map((layer, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={layer.src}
                src={layer.src}
                alt=""
                draggable={false}
                decoding="async"
                fetchPriority={i === 0 || i === SPLASH_LAYERS.length - 1 ? "high" : "auto"}
                className={`sp-layer absolute inset-0 h-full w-full select-none ${layer.className}`}
              />
            ))}
            {/* Marks the artwork ready once fully downloaded (see WAIT_FOR_ART). */}
            <script dangerouslySetInnerHTML={{ __html: WAIT_FOR_ART }} />
          </div>

          {/* Name and tagline in the open sky above the sunrise */}
          <div className="absolute inset-x-0 top-[13%] flex flex-col items-center px-6 text-center">
            <p className="text-[44px] font-bold tracking-tight text-[#6D252C] drop-shadow-[0_1px_8px_rgba(247,242,232,0.8)]">
              {"WePray".split("").map((ch, i) => (
                <span key={i} className="splash-letter" style={delay(0.45 + i * 0.06)}>
                  {ch}
                </span>
              ))}
            </p>
            {/* Keyed by position so switching to Hindi on hydration swaps the
                words without restarting the animation. */}
            <div lang={lang} className="mt-2 flex flex-col items-center gap-0.5">
              {phrases.map((phrase, i) => (
                <p key={i} className="splash-phrase text-[15px] font-medium text-[#4A3A36]" style={delay(0.95 + i * 0.22)}>
                  {phrase}
                </p>
              ))}
            </div>
          </div>

          {/* Quiet loading line, over the near hill */}
          <div className="absolute inset-x-0 bottom-[calc(7%+env(safe-area-inset-bottom))] flex justify-center">
            <div className="h-[2px] w-24 overflow-hidden rounded-full bg-[#F7F2E8]/20">
              <div className="splash-progress h-full rounded-full bg-[#F7F2E8]/80" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
