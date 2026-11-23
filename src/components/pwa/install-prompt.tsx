"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, Download, Plus, Share, X } from "lucide-react";
import { useT } from "@/lib/i18n/use-t";
import { createLocalStore } from "@/lib/practice/local-store";
import { welcomeDone } from "@/lib/practice/preferences";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Dismissal is remembered on the device, so the suggestion appears at most until it's declined. */
const installDismissed = createLocalStore<boolean>("practice:install-dismissed", false, (raw) => raw === true, true);

/**
 * A gentle "install to home screen" suggestion for phone browsers. Calm by
 * design (PRD §2.2): only on the Today screen — never over a prayer, session
 * or meditation — not during the welcome screens, and gone for good once
 * dismissed. Desktop stays a plain website.
 */
export function InstallPrompt() {
  const pathname = usePathname();
  const { t } = useT();
  const dismissed = installDismissed.use();
  const welcomed = welcomeDone.use();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [device] = useState(() => {
    // Check for window, not navigator: Node.js also defines navigator during server rendering.
    if (typeof window === "undefined") return { ios: false, android: false, standalone: false };
    return {
      ios: /iPad|iPhone|iPod/.test(navigator.userAgent),
      android: /Android/.test(navigator.userAgent),
      standalone: window.matchMedia("(display-mode: standalone)").matches,
    };
  });

  useEffect(() => {
    // Chrome/Edge on desktop can also fire beforeinstallprompt, hence the explicit device check.
    if (device.standalone || !device.android) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [device]);

  if (device.standalone || dismissed || !welcomed || pathname !== "/app") return null;
  if (!deferredPrompt && !device.ios) return null; // Not installable here

  const dismiss = () => installDismissed.set(true);
  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") installDismissed.set(true);
    setDeferredPrompt(null);
  };

  return (
    <>
      <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] inset-x-0 z-30 px-4 pointer-events-none">
        <div className="pointer-events-auto max-w-xl mx-auto flex items-center gap-3 rounded-2xl bg-[#FFFCF6] border border-[#E7DCC8] shadow-[0_8px_30px_-12px_rgba(42,26,28,0.35)] px-4 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-72.png" alt="" className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-[#2A1A1C]">{t("install.title")}</p>
            <p className="text-xs text-[#5B5350]">{device.ios ? t("install.ios") : t("install.android")}</p>
          </div>
          <button
            type="button"
            onClick={device.ios ? () => setShowIOSGuide(true) : install}
            className="flex items-center gap-1 rounded-full bg-[#6D252C] px-3.5 py-2 text-xs font-bold text-[#F7F2E8] flex-shrink-0"
          >
            {device.ios ? <Share className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            {device.ios ? t("install.how") : t("install.button")}
          </button>
          <button type="button" onClick={dismiss} aria-label={t("install.dismiss")} className="h-9 w-9 -mr-2 flex items-center justify-center rounded-full text-[#6D645D] flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-[60] flex items-end" onClick={() => setShowIOSGuide(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("install.iosTitle")}
            className="relative w-full rounded-t-3xl bg-[#FFFCF6] p-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#E2D7C3]" />
            <h3 className="mb-4 text-lg font-bold text-[#2A1A1C]">{t("install.iosTitle")}</h3>
            <ol className="space-y-4">
              {(
                [
                  [Share, "install.ios1"],
                  [Plus, "install.ios2"],
                  [Check, "install.ios3"],
                ] as const
              ).map(([Icon, key], i) => (
                <li key={key} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#6D252C] text-xs font-bold text-white">{i + 1}</span>
                  <Icon className="h-5 w-5 flex-shrink-0 text-[#6D645D]" strokeWidth={1.75} />
                  <span className="text-sm text-[#2A1A1C]">{t(key)}</span>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => {
                setShowIOSGuide(false);
                dismiss();
              }}
              className="mt-6 w-full rounded-full bg-[#6D252C] py-3 text-sm font-semibold text-[#F7F2E8]"
            >
              {t("install.gotIt")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
