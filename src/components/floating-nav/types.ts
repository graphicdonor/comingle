import type { LucideIcon } from "lucide-react";

export interface FloatingNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Gradient stops for the bubble background — a single hue, light to deep. */
  color: { from: string; to: string };
  onSelect?: () => void;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * idle       — collapsed stack, resting at the dock position (breathing loop).
 * dragging   — lead bubble follows the pointer; followers chain behind it.
 * expanded   — radial menu fanned out around the dock position.
 */
export type FloatingNavMode = "idle" | "dragging" | "expanded";

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}
