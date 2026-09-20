"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;
const HOLD_MS = 1100;
const FADE_MS = 400;

/**
 * Shown once per full page load (mounted in the root layout, which persists
 * across client-side navigations — it never remounts on a <Link> click, only
 * on a hard refresh or first visit). Starts visible on both the server and
 * client render so there's no flash of unsplashed content while React
 * hydrates; a mount-time effect then times its own dismissal.
 *
 * The background color intentionally matches manifest.ts's
 * background_color/theme_color (#8B1A6B) exactly — that's the color Android
 * paints for the native OS-level splash before any JS runs, so this overlay
 * continues it seamlessly instead of flashing a different shade underneath.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "hiding" | "done">("visible");
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // framer-motion's useReducedMotion() reads the media query synchronously
    // (not via its own effect), so on the client it's already resolved by
    // this component's first hydration render — but the server always
    // renders with it unresolved. Branching the JSX itself on that value
    // (e.g. returning null early for reduced motion) makes the client's
    // first render disagree with the server-rendered markup, and React's
    // hydration-mismatch recovery for a whole-subtree conditional like that
    // leaves this component in a broken state where the effect below never
    // reliably commits. Keeping every render's JSX shape identical (always
    // the same conditional-on-`phase` structure, `phase` always starting at
    // "visible") avoids the mismatch entirely; reduced motion instead just
    // collapses the hold/fade durations to ~0 here; both setState calls stay
    // inside the setTimeout callback, not synchronous in the effect body.
    const hold = prefersReducedMotion ? 0 : HOLD_MS;
    const fade = prefersReducedMotion ? 0 : FADE_MS;
    const hideTimer = setTimeout(() => setPhase("hiding"), hold);
    const doneTimer = setTimeout(() => setPhase("done"), hold + fade);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(doneTimer);
    };
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#8B1A6B]"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "hiding" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : FADE_MS / 1000, ease: EASE }}
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
          >
            <Image src="/icons/icon-192.png" alt="" width={88} height={88} priority className="rounded-3xl shadow-lg" />
          </motion.div>

          <motion.h1
            className="mt-5 text-2xl font-bold tracking-tight text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
          >
            Comingle
          </motion.h1>

          <motion.p
            className="mt-1 text-xs font-medium tracking-wide text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.45 }}
          >
            Uniting Communities
          </motion.p>

          <motion.div
            className="mt-8 flex gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-white/80"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
