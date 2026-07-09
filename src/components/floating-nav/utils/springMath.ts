import type { SpringConfig } from "../types";

/**
 * One semi-implicit Euler step of a damped spring (F = -k·x - c·v).
 * Called every animation frame per axis, per bubble — kept branch-free
 * and allocation-free so N bubbles × 2 axes stays cheap at 60fps.
 */
export function springStep(
  current: number,
  velocity: number,
  target: number,
  config: SpringConfig,
  dt: number
): { position: number; velocity: number } {
  const acceleration = ((target - current) * config.stiffness - velocity * config.damping) / config.mass;
  const nextVelocity = velocity + acceleration * dt;
  const nextPosition = current + nextVelocity * dt;
  return { position: nextPosition, velocity: nextVelocity };
}

/** Clamps a frame delta so a backgrounded tab / dropped frame can't cause a physics jump. */
export function clampDt(rawDtMs: number, maxMs = 48): number {
  return Math.min(Math.max(rawDtMs, 0), maxMs) / 1000;
}
