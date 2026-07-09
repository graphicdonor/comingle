"use client";

import { memo, useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FloatingNavItem } from "./types";
import type { IconMotionBundle } from "./hooks/usePhysicsChain";
import { BUBBLE_SIZE } from "./constants";
import { cn } from "@/lib/utils";

interface FloatingNavIconProps {
  item: FloatingNavItem;
  bundle: IconMotionBundle;
  zIndex: number;
  isActive: boolean;
  prefersReducedMotion: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onClick: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

function FloatingNavIconInner({
  item,
  bundle,
  zIndex,
  isActive,
  prefersReducedMotion,
  onPointerDown,
  onClick,
  onFocus,
  onBlur,
}: FloatingNavIconProps) {
  const Icon = item.icon;
  const [ripples, setRipples] = useState<number[]>([]);
  const rippleIdRef = useRef(0);
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  const handleClick = useCallback(() => {
    const id = rippleIdRef.current++;
    setRipples((prev) => [...prev, id]);
    onClick();
  }, [onClick]);

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r !== id));
  }, []);

  // The glow shadow below is a per-item dynamic color, so it has to be an
  // inline `style.boxShadow` — which means a class-based `focus-visible:ring`
  // would lose the specificity fight and silently never render. Folding the
  // ring into the same inline value (gated on the native :focus-visible
  // match, so it still only shows for keyboard focus, not mouse clicks) is
  // what actually makes it visible.
  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLButtonElement>) => {
      setIsFocusVisible(e.target.matches(":focus-visible"));
      onFocus();
    },
    [onFocus]
  );
  const handleBlur = useCallback(() => {
    setIsFocusVisible(false);
    onBlur();
  }, [onBlur]);

  return (
    <motion.div
      // Outer layer: pure physics. Position/rotate/scale/opacity all come
      // from the shared RAF loop (see usePhysicsChain) via bound MotionValues,
      // never from React state — that's what keeps this GPU-accelerated and
      // re-render-free while dragging.
      style={{
        position: "fixed",
        left: -BUBBLE_SIZE / 2,
        top: -BUBBLE_SIZE / 2,
        x: bundle.x,
        y: bundle.y,
        rotate: bundle.rotate,
        scale: bundle.scale,
        opacity: bundle.opacity,
        zIndex,
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
    >
      {isActive && (
        <motion.span
          aria-hidden
          className="absolute inset-[-6px] rounded-full"
          style={{ boxShadow: `0 0 0 2px ${item.color.to}` }}
          animate={prefersReducedMotion ? { opacity: 0.7 } : { opacity: [0.7, 0, 0.7], scale: [1, 1.18, 1] }}
          transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Inner layer: immediate gesture feedback (hover/tap/focus). Kept on
          a separate element from the outer physics layer so a hover "lift"
          composes with, rather than fights, the physics-driven transform. */}
      <motion.button
        type="button"
        aria-label={item.label}
        aria-pressed={isActive}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.15, y: -4 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className={cn("relative flex items-center justify-center rounded-full", "border border-white/40 backdrop-blur-md", "focus-visible:outline-none")}
        style={{
          width: BUBBLE_SIZE,
          height: BUBBLE_SIZE,
          background: `linear-gradient(135deg, ${item.color.from}e6, ${item.color.to}f2)`,
          boxShadow: [
            `0 8px 24px -6px ${item.color.to}99`,
            `0 2px 8px -2px ${item.color.to}66`,
            isFocusVisible ? `0 0 0 3px white, 0 0 0 6px ${item.color.to}` : null,
          ]
            .filter(Boolean)
            .join(", "),
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-40"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.55), transparent 55%)" }}
        />
        <Icon className="relative h-6 w-6 text-white drop-shadow-sm" strokeWidth={2.25} />

        <AnimatePresence>
          {ripples.map((id) => (
            <motion.span
              key={id}
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full bg-white"
              initial={{ opacity: 0.45, scale: 0.4 }}
              animate={{ opacity: 0, scale: 1.9 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              onAnimationComplete={() => removeRipple(id)}
            />
          ))}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

export const FloatingNavIcon = memo(FloatingNavIconInner);
