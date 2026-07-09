"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type { Point } from "../types";
import { EDGE_MARGIN } from "../constants";

function clampToViewport(point: Point): Point {
  const { innerWidth, innerHeight } = window;
  return {
    x: Math.min(Math.max(point.x, EDGE_MARGIN), innerWidth - EDGE_MARGIN),
    y: Math.min(Math.max(point.y, EDGE_MARGIN), innerHeight - EDGE_MARGIN),
  };
}

const subscribeNever = () => () => {};

function readRawStorage(storageKey: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null; // Blocked/unavailable (private mode) — caller falls back to a default.
  }
}

/**
 * Persisted, viewport-clamped dock position.
 *
 * The initial value comes from useSyncExternalStore rather than an
 * effect + setState: reading localStorage is a genuine external-store
 * read (server and client legitimately disagree until hydration), which
 * is exactly the case that hook exists for — and it sidesteps this
 * project's react-hooks/set-state-in-effect rule entirely. Later updates
 * (drag end) go through plain useState since those originate from a real
 * event handler, not an effect.
 */
export function useDockPosition(storageKey: string) {
  const storedRaw = useSyncExternalStore(subscribeNever, () => readRawStorage(storageKey), () => null);
  const [override, setOverride] = useState<Point | null>(null);

  const position = useMemo<Point | null>(() => {
    if (override) return override;
    if (storedRaw) {
      try {
        return clampToViewport(JSON.parse(storedRaw) as Point);
      } catch {
        // Corrupt stored value — fall through to a fresh default below.
      }
    }
    if (typeof window === "undefined") return null;
    return clampToViewport({ x: window.innerWidth / 2, y: window.innerHeight - 96 });
  }, [override, storedRaw]);

  const setPosition = useCallback(
    (next: Point) => {
      const clamped = clampToViewport(next);
      setOverride(clamped);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(clamped));
      } catch {
        // Storage full/blocked — position still works for the rest of this session.
      }
    },
    [storageKey]
  );

  return [position, setPosition] as const;
}
