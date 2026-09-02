import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { useIsTouchDevice } from "@/hooks/useMediaQuery";

export function CustomCursor() {
  const isTouch = useIsTouchDevice();
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { damping: 30, stiffness: 400, mass: 0.4 });
  const springY = useSpring(y, { damping: 30, stiffness: 400, mass: 0.4 });

  useEffect(() => {
    if (isTouch || prefersReducedMotion) return;

    document.body.classList.add("cursor-none");

    function onMove(e: PointerEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!active) setActive(true);
    }
    function onOver(e: PointerEvent) {
      const target = e.target as HTMLElement;
      setHovering(!!target.closest("a, button, [data-cursor='interactive']"));
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      document.body.classList.remove("cursor-none");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTouch, prefersReducedMotion]);

  if (isTouch || prefersReducedMotion || !active) return null;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference"
      style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
      aria-hidden="true"
    >
      <motion.div
        className="rounded-full bg-bone"
        animate={{ width: hovering ? 40 : 8, height: hovering ? 40 : 8, opacity: hovering ? 0.9 : 0.7 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  );
}
