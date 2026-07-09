"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { FloatingNavItem } from "./types";
import { usePhysicsChain } from "./hooks/usePhysicsChain";
import { useDockPosition } from "./hooks/useDockPosition";
import { useIsClient } from "./hooks/useIsClient";
import { FloatingNavIcon } from "./FloatingNavIcon";
import { DEFAULT_ITEMS } from "./constants";

export interface FloatingNavProps {
  items?: FloatingNavItem[];
  activeId?: string;
  onActiveChange?: (id: string) => void;
  storageKey?: string;
  className?: string;
}

/**
 * Floating, draggable, dockable navigation cluster — see
 * src/components/floating-nav/README for the interaction model. All motion
 * is driven by usePhysicsChain's single RAF loop; this component owns only
 * the interaction *meaning* (what a tap on bubble i does in the current mode).
 */
export function FloatingNav({ items = DEFAULT_ITEMS, activeId, onActiveChange, storageKey = "floating-nav:dock", className }: FloatingNavProps) {
  const isClient = useIsClient();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [dock, setDock] = useDockPosition(storageKey);
  const { bundles, mode, handlePointerDown, consumeWasDragging, toggleExpand, collapse, prefersReducedMotion } = usePhysicsChain({
    count: items.length,
    dock,
    onDockChange: setDock,
  });

  useEffect(() => {
    if (mode !== "expanded") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") collapse();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, collapse]);

  const handleIconClick = useCallback(
    (index: number, item: FloatingNavItem) => {
      if (consumeWasDragging()) return;
      if (mode === "expanded") {
        onActiveChange?.(item.id);
        item.onSelect?.();
        collapse();
      } else if (index === 0) {
        toggleExpand();
      }
    },
    [consumeWasDragging, mode, onActiveChange, collapse, toggleExpand]
  );

  if (!isClient || !dock) return null;

  return (
    <>
      {mode === "expanded" && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[490] bg-black/10 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={collapse}
        />
      )}

      {/* z-index starts well above the app's fixed header (z-50) and drawer
          (z-60) — this cluster is a top-level, user-repositionable control
          and must stay on top no matter where on screen it's dragged. */}
      <nav aria-label="Main navigation" className={className}>
        {items.map((item, index) => (
          <FloatingNavIcon
            key={item.id}
            item={item}
            bundle={bundles[index]}
            zIndex={focusedIndex === index ? 1000 : 500 + (items.length - index)}
            isActive={activeId === item.id}
            prefersReducedMotion={prefersReducedMotion}
            onPointerDown={handlePointerDown}
            onClick={() => handleIconClick(index, item)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex((prev) => (prev === index ? null : prev))}
          />
        ))}
      </nav>
    </>
  );
}
