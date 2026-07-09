import { Home, Users, MessageCircle, Calendar, User, Settings } from "lucide-react";
import type { FloatingNavItem, SpringConfig } from "./types";

/** Bubble diameter in px — comfortably above the 48px minimum touch target. */
export const BUBBLE_SIZE = 56;

/** How far (px) the pointer has to travel before a press counts as a drag rather than a tap. */
export const DRAG_THRESHOLD = 6;

/** Radial layout radius, measured from the dock center to each spread-out bubble. */
export const RADIAL_RADIUS = 96;

/** Per-icon delay (ms) used for the expand/collapse stagger. */
export const STAGGER_MS = 45;

/** Idle "breathing" loop — slow drift, never fully still. */
export const IDLE_FLOAT_AMPLITUDE_Y = 5;
export const IDLE_FLOAT_AMPLITUDE_ROTATE = 2.2;
export const IDLE_FLOAT_PERIOD_MS = 3600;

/** Rest offset between stacked icons while idle, so the "deck" reads as a stack, not one dot. */
export const IDLE_STACK_OFFSET = 5;

/** Chain-follow spring — deliberately underdamped for a touch of overshoot ("alive", not linear). */
export const CHAIN_SPRING: SpringConfig = { stiffness: 210, damping: 19, mass: 1 };

/** Snappier spring used to ease mode transitions (idle <-> expanded) into place. */
export const SETTLE_SPRING: SpringConfig = { stiffness: 300, damping: 26, mass: 0.9 };

/** Clamp so the dock can never drift fully off-screen. */
export const EDGE_MARGIN = BUBBLE_SIZE / 2 + 8;

export const DEFAULT_ITEMS: FloatingNavItem[] = [
  { id: "home", label: "Home", icon: Home, color: { from: "#60A5FA", to: "#2563EB" } },
  { id: "community", label: "Community", icon: Users, color: { from: "#C084FC", to: "#7E22CE" } },
  { id: "chat", label: "Chat", icon: MessageCircle, color: { from: "#4ADE80", to: "#15803D" } },
  { id: "events", label: "Events", icon: Calendar, color: { from: "#FB923C", to: "#C2410C" } },
  { id: "profile", label: "Profile", icon: User, color: { from: "#F472B6", to: "#BE185D" } },
  { id: "settings", label: "Settings", icon: Settings, color: { from: "#22D3EE", to: "#0E7490" } },
];
