import type { Point } from "../types";

/**
 * Fans icons out along an arc rather than a full circle, so the menu never
 * spills off-screen. The arc's center direction adapts to which quadrant
 * the dock currently sits in — e.g. a bottom-right dock fans up-and-left.
 */
export function computeRadialOffsets(
  count: number,
  dock: Point,
  viewport: { width: number; height: number },
  radius: number
): Point[] {
  if (count === 0) return [];

  const isLeft = dock.x < viewport.width * 0.33;
  const isRight = dock.x > viewport.width * 0.67;
  const isTop = dock.y < viewport.height * 0.33;
  const isBottom = dock.y > viewport.height * 0.67;

  let centerDeg = 90; // default: straight up, like a FAB speed-dial
  if (isBottom && isLeft) centerDeg = 45;
  else if (isBottom && isRight) centerDeg = 135;
  else if (isBottom) centerDeg = 90;
  else if (isTop && isLeft) centerDeg = -45;
  else if (isTop && isRight) centerDeg = -135;
  else if (isTop) centerDeg = -90;
  else if (isLeft) centerDeg = 0;
  else if (isRight) centerDeg = 180;

  const spanDeg = Math.min(150, 40 + count * 22);
  const startDeg = centerDeg - spanDeg / 2;
  const stepDeg = count > 1 ? spanDeg / (count - 1) : 0;

  return Array.from({ length: count }, (_, i) => {
    const deg = count > 1 ? startDeg + stepDeg * i : centerDeg;
    const rad = (deg * Math.PI) / 180;
    // Screen y grows downward, so a positive (visually upward) offset needs a negated sin.
    return { x: Math.cos(rad) * radius, y: -Math.sin(rad) * radius };
  });
}
