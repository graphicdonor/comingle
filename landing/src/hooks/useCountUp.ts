import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

/** Animates a number from 0 to `value` once `start` becomes true. Used for
 * every large stat in the page so numbers feel like they're arriving rather
 * than sitting static — skipped entirely under reduced motion. */
export function useCountUp(value: number, start: boolean, duration = 1.8) {
  const [display, setDisplay] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!start || hasRun.current || prefersReducedMotion) return;
    hasRun.current = true;

    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [start, value, duration, prefersReducedMotion]);

  // Derived during render rather than written to state in an effect —
  // there's nothing to animate under reduced motion, so the value should
  // just be correct immediately.
  if (prefersReducedMotion) return start ? value : 0;
  return display;
}
