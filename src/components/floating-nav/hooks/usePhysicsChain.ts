"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motionValue, useAnimationFrame, useReducedMotion, type MotionValue } from "framer-motion";
import type { FloatingNavMode, Point } from "../types";
import { springStep, clampDt } from "../utils/springMath";
import { computeRadialOffsets } from "../utils/radialLayout";
import {
  CHAIN_SPRING,
  DRAG_THRESHOLD,
  EDGE_MARGIN,
  IDLE_FLOAT_AMPLITUDE_Y,
  IDLE_FLOAT_PERIOD_MS,
  IDLE_STACK_OFFSET,
  RADIAL_RADIUS,
  STAGGER_MS,
} from "../constants";

export interface IconMotionBundle {
  x: MotionValue<number>;
  y: MotionValue<number>;
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  opacity: MotionValue<number>;
}

interface UsePhysicsChainArgs {
  count: number;
  dock: Point | null;
  onDockChange: (next: Point) => void;
}

/** Per-mode resting scale/opacity for bubble index `i` — full-strength up front, softly receding behind it while idle so the stack reads as a deck, not one dot. */
function restingAppearance(mode: FloatingNavMode, index: number) {
  if (mode === "idle") {
    return { scale: Math.max(0.55, 1 - index * 0.12), opacity: Math.max(0.45, 1 - index * 0.16) };
  }
  return { scale: 1, opacity: 1 };
}

function clampPointToViewport(point: Point, viewport: { width: number; height: number }): Point {
  if (viewport.width === 0 || viewport.height === 0) return point;
  return {
    x: Math.min(Math.max(point.x, EDGE_MARGIN), viewport.width - EDGE_MARGIN),
    y: Math.min(Math.max(point.y, EDGE_MARGIN), viewport.height - EDGE_MARGIN),
  };
}

/**
 * Drives every bubble's x / y / rotate / scale / opacity from a single
 * requestAnimationFrame loop using hand-rolled damped-spring integration
 * (see utils/springMath). One loop — rather than one Framer Motion
 * `useSpring` chain per icon — keeps this safe to use with a variable
 * `count` (Rules of Hooks forbids a variable number of `useSpring` calls)
 * and keeps all N bubbles' physics in one cheap, allocation-free pass.
 */
export function usePhysicsChain({ count, dock, onDockChange }: UsePhysicsChainArgs) {
  const prefersReducedMotion = useReducedMotion();

  // Lazy useState initializer, not useRef: the factory must run exactly
  // once (MotionValue identity has to stay stable for child components),
  // and unlike useRef its argument, useState's function form is guaranteed
  // not to re-run on later renders.
  const [bundles] = useState<IconMotionBundle[]>(() =>
    Array.from({ length: count }, () => ({
      x: motionValue(0),
      y: motionValue(0),
      rotate: motionValue(0),
      scale: motionValue(1),
      opacity: motionValue(1),
    }))
  );

  const velocityRef = useRef(Array.from({ length: count }, () => ({ x: 0, y: 0 })));
  const scaleOpacityVelocityRef = useRef(Array.from({ length: count }, () => ({ scale: 0, opacity: 0 })));

  const [mode, setMode] = useState<FloatingNavMode>("idle");
  const modeRef = useRef<FloatingNavMode>("idle");
  const previousModeRef = useRef<FloatingNavMode>("idle");
  const modeChangedAtRef = useRef(0);
  // Framer Motion's useAnimationFrame reports `time` relative to its own
  // first tick, not performance.now() — stamping modeChangedAtRef with
  // performance.now() and later diffing it against that `time` mixes two
  // different clocks. The gap between navigation start and this hook's
  // first frame is negligible on localhost but can be seconds on a real
  // network, which is exactly what made this only surface after deploy.
  // Tracking the RAF loop's own latest `time` keeps both sides on one clock.
  const latestFrameTimeRef = useRef(0);

  const setModeSafe = useCallback((next: FloatingNavMode) => {
    if (modeRef.current === next) return;
    previousModeRef.current = modeRef.current;
    modeRef.current = next;
    modeChangedAtRef.current = latestFrameTimeRef.current;
    setMode(next);
  }, []);

  const hasPlacedRef = useRef(false);
  const dockRef = useRef<Point>(dock ?? { x: 0, y: 0 });
  useEffect(() => {
    if (!dock) return;
    dockRef.current = dock;
    if (!hasPlacedRef.current) {
      // First real position we get (post-mount) — snap bubbles there
      // instantly instead of springing in from the coordinate origin.
      bundles.forEach((b) => {
        b.x.set(dock.x);
        b.y.set(dock.y);
      });
      hasPlacedRef.current = true;
    }
  }, [dock, bundles]);

  const dragPointerRef = useRef<Point>({ x: 0, y: 0 });
  const dragStartRef = useRef<Point>({ x: 0, y: 0 });
  const hasExceededThresholdRef = useRef(false);
  const wasDraggingRef = useRef(false);

  const viewportRef = useRef({ width: 0, height: 0 });
  useEffect(() => {
    const readViewport = () => {
      viewportRef.current = { width: window.innerWidth, height: window.innerHeight };
    };
    readViewport();
    window.addEventListener("resize", readViewport);
    return () => window.removeEventListener("resize", readViewport);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      dragPointerRef.current = { x: e.clientX, y: e.clientY };
      hasExceededThresholdRef.current = false;

      // Defined inline (not as top-level useCallbacks) so add/remove can
      // reference the exact same closures without any self-reference or
      // stale-listener bookkeeping — this pair only ever lives for the
      // duration of one drag gesture.
      const onMove = (moveEvent: PointerEvent) => {
        dragPointerRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
        if (!hasExceededThresholdRef.current) {
          const dx = moveEvent.clientX - dragStartRef.current.x;
          const dy = moveEvent.clientY - dragStartRef.current.y;
          if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
            hasExceededThresholdRef.current = true;
            wasDraggingRef.current = true;
            setModeSafe("dragging");
          }
        }
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        if (hasExceededThresholdRef.current) {
          onDockChange({ x: bundles[0].x.get(), y: bundles[0].y.get() });
          setModeSafe("idle");
        }
        // Cleared a tick later so the click that follows this pointerup
        // (browsers fire click after pointerup on the same target) still
        // sees `true` and suppresses itself.
        setTimeout(() => {
          wasDraggingRef.current = false;
        }, 0);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [bundles, onDockChange, setModeSafe]
  );

  const consumeWasDragging = useCallback(() => wasDraggingRef.current, []);

  const toggleExpand = useCallback(() => {
    setModeSafe(modeRef.current === "expanded" ? "idle" : "expanded");
  }, [setModeSafe]);

  const collapse = useCallback(() => {
    setModeSafe("idle");
  }, [setModeSafe]);

  useAnimationFrame((time, delta) => {
    latestFrameTimeRef.current = time;
    if (!hasPlacedRef.current) return;
    const dt = clampDt(delta);
    const currentMode = modeRef.current;
    const involvesExpanded = currentMode === "expanded" || previousModeRef.current === "expanded";
    const elapsedSinceModeChange = time - modeChangedAtRef.current;
    const isClosingFromExpanded = currentMode !== "expanded" && previousModeRef.current === "expanded";

    const dock = clampPointToViewport(dockRef.current, viewportRef.current);
    const radialOffsets = involvesExpanded ? computeRadialOffsets(count, dock, viewportRef.current, RADIAL_RADIUS) : null;

    for (let i = 0; i < count; i++) {
      const bundle = bundles[i];
      const vel = velocityRef.current[i];
      const soVel = scaleOpacityVelocityRef.current[i];

      // Stagger: while entering/leaving the radial layout, bubble i doesn't
      // start moving toward its new target until its own turn in the queue —
      // reversed order on the way back in, so the menu folds the way it opened.
      const staggerSlot = isClosingFromExpanded ? count - 1 - i : i;
      const staggerActive = !involvesExpanded || elapsedSinceModeChange >= staggerSlot * STAGGER_MS;
      const effectiveMode = staggerActive ? currentMode : previousModeRef.current;

      let targetX: number;
      let targetY: number;

      if (effectiveMode === "dragging") {
        if (i === 0) {
          targetX = dragPointerRef.current.x;
          targetY = dragPointerRef.current.y;
        } else {
          targetX = bundles[i - 1].x.get();
          targetY = bundles[i - 1].y.get();
        }
      } else if (effectiveMode === "expanded") {
        const offset = radialOffsets?.[i] ?? { x: 0, y: 0 };
        targetX = dock.x + offset.x;
        targetY = dock.y + offset.y;
      } else {
        // Idle: gently bob, with a small constant per-index offset so the
        // resting cluster reads as a fanned deck rather than a single dot.
        const floatY = prefersReducedMotion ? 0 : Math.sin((time / IDLE_FLOAT_PERIOD_MS) * Math.PI * 2) * IDLE_FLOAT_AMPLITUDE_Y;
        if (i === 0) {
          targetX = dock.x;
          targetY = dock.y + floatY;
        } else {
          targetX = bundles[i - 1].x.get() + IDLE_STACK_OFFSET * 0.6;
          targetY = bundles[i - 1].y.get() + IDLE_STACK_OFFSET;
        }
      }

      if (prefersReducedMotion) {
        bundle.x.set(targetX);
        bundle.y.set(targetY);
        vel.x = 0;
        vel.y = 0;
      } else {
        const stepX = springStep(bundle.x.get(), vel.x, targetX, CHAIN_SPRING, dt);
        const stepY = springStep(bundle.y.get(), vel.y, targetY, CHAIN_SPRING, dt);
        vel.x = stepX.velocity;
        vel.y = stepY.velocity;
        bundle.x.set(stepX.position);
        bundle.y.set(stepY.position);
      }

      // Velocity-driven wobble/lean — smoothed toward a capped target
      // rather than run through a second full spring, since that would
      // mostly add noise here rather than read as more "alive."
      const rotateTarget = prefersReducedMotion ? 0 : Math.max(-16, Math.min(16, vel.x * 0.05));
      bundle.rotate.set(bundle.rotate.get() + (rotateTarget - bundle.rotate.get()) * 0.15);

      const appearance = restingAppearance(effectiveMode, i);
      const scaleStep = springStep(bundle.scale.get(), soVel.scale, appearance.scale, CHAIN_SPRING, dt);
      const opacityStep = springStep(bundle.opacity.get(), soVel.opacity, appearance.opacity, CHAIN_SPRING, dt);
      soVel.scale = scaleStep.velocity;
      soVel.opacity = opacityStep.velocity;
      bundle.scale.set(scaleStep.position);
      bundle.opacity.set(opacityStep.position);
    }
  });

  return {
    bundles,
    mode,
    handlePointerDown,
    consumeWasDragging,
    toggleExpand,
    collapse,
    prefersReducedMotion: Boolean(prefersReducedMotion),
  };
}
