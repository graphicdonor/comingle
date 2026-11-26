"use client";
import { useSyncExternalStore } from "react";
import { createLocalStore } from "./local-store";
import { PRAYERS } from "./prayers";
import { SESSIONS } from "./sessions";
import { GUIDES } from "@/lib/learn/guides";
import { STORIES } from "@/lib/learn/jataka";
import { storyClipUrls } from "@/lib/learn/use-story-voice";
import manifest from "@/components/visuals/illustrations.json";
import { LOTUS_ART, SPLASH_LAYERS, lotusSrc } from "@/lib/splash";
import audioManifest from "@/lib/cms/clip-manifest.json";

// "Use without internet" (PRD §7.13). The service worker (public/sw.js)
// saves every practice page, the build assets they load, and the
// illustrations into one cache. This module lists what to save, talks to the
// service worker, and remembers the result on the device.

export interface OfflinePack {
  savedAt: string;
  bytes: number;
  files: number;
}

export const offlinePack = createLocalStore<OfflinePack | null>("practice:offline-pack", null, (raw) => {
  const r = raw as Partial<OfflinePack> | null;
  return r && typeof r.savedAt === "string" && typeof r.bytes === "number" ? { savedAt: r.savedAt, bytes: r.bytes, files: r.files ?? 0 } : null;
});

/** Every page and image the practice experience needs. */
export function offlineUrls(): string[] {
  return [
    "/app",
    "/practice",
    ...PRAYERS.map((p) => `/practice/${p.slug}`),
    ...PRAYERS.map((p) => `/practice/${p.slug}/pronounce`),
    ...SESSIONS.map((s) => `/practice/session/${s.id}`),
    "/meditate",
    "/learn",
    ...GUIDES.map((g) => `/learn/${g.slug}`),
    "/learn/jataka",
    ...STORIES.map((s) => `/learn/jataka/${s.slug}`),
    "/preferences",
    "/offline",
    ...Object.values(manifest).map((m) => m.src),
    ...SPLASH_LAYERS.map((l) => l.src),
    ...LOTUS_ART.map(lotusSrc),
    // "Listen" voice clips for every prayer line.
    ...Object.values(audioManifest as Record<string, Record<string, Record<string, { src: string }>>>).flatMap((lines) =>
      Object.values(lines).flatMap((clips) => Object.values(clips).map((c) => c.src)),
    ),
    // Narrated Jātaka tales.
    ...storyClipUrls(),
    "/icons/icon-192.png",
    "/favicon.svg",
  ];
}

export function offlineSupported(): boolean {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator && typeof caches !== "undefined";
}

async function activeWorker(): Promise<ServiceWorker> {
  const reg = await navigator.serviceWorker.ready;
  if (!reg.active) throw new Error("No active service worker");
  return reg.active;
}

export interface DownloadResult {
  bytes: number;
  files: number;
  failed: string[];
}

export async function downloadOfflinePack(onProgress: (done: number, total: number) => void): Promise<DownloadResult> {
  // Ask the browser not to evict the saved pack under storage pressure.
  navigator.storage?.persist?.().catch(() => {});
  const worker = await activeWorker();
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (e: MessageEvent) => {
      if (e.data?.type === "progress") onProgress(e.data.done, e.data.total);
      if (e.data?.type === "done") {
        const result: DownloadResult = { bytes: e.data.bytes, files: e.data.files, failed: e.data.failed };
        if (result.failed.length === 0) {
          offlinePack.set({ savedAt: new Date().toISOString(), bytes: result.bytes, files: result.files });
        }
        resolve(result);
      }
    };
    worker.postMessage({ type: "OFFLINE_DOWNLOAD", urls: offlineUrls() }, [channel.port2]);
  });
}

export async function removeOfflinePack(): Promise<void> {
  const worker = await activeWorker();
  await new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => resolve();
    worker.postMessage({ type: "OFFLINE_REMOVE" }, [channel.port2]);
  });
  offlinePack.set(null);
}

export function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// ── Connection status ────────────────────────────────────────────────────
function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

/** True while the browser reports a connection (always true during server render). */
export function useOnline(): boolean {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
}
