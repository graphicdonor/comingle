"use client";

import { useState } from "react";
import { FloatingNav, DEFAULT_ITEMS } from "@/components/floating-nav";

const STORAGE_KEY = "floating-nav:dock:demo";

export default function FloatingNavDemoPage() {
  const [activeId, setActiveId] = useState("home");

  const activeItem = DEFAULT_ITEMS.find((item) => item.id === activeId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden">
      <div className="max-w-lg mx-auto px-6 py-10">
        <p className="text-xs font-semibold tracking-widest text-white/40 uppercase mb-2">Floating Nav — Demo</p>
        <h1 className="text-2xl font-bold mb-4">Active: {activeItem?.label ?? "—"}</h1>

        <ul className="space-y-2 text-sm text-white/60 mb-8">
          <li>• Drag the stack from anywhere — icons separate and trail behind like a snake.</li>
          <li>• Drop it anywhere on screen — it docks there and remembers it on reload.</li>
          <li>• Tap the top bubble (without dragging) to fan out the radial menu.</li>
          <li>• Tap any spread-out bubble to select it; tap outside or press Esc to close.</li>
          <li>• Leave it untouched — it breathes gently while idle.</li>
        </ul>

        <button
          type="button"
          onClick={() => {
            window.localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
          }}
          className="text-xs font-semibold px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
        >
          Reset dock position
        </button>
      </div>

      <FloatingNav items={DEFAULT_ITEMS} activeId={activeId} onActiveChange={setActiveId} storageKey={STORAGE_KEY} />
    </div>
  );
}
