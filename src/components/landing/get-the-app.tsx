"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Share } from "lucide-react";

/** Set to the Play Store listing URL once the Android app is published —
 * until then the badge renders as a non-clickable "Coming soon". */
const PLAY_STORE_URL: string | null = null;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function PlayLogo() {
  return (
    <svg viewBox="0 0 24 26" className="h-6 w-6" aria-hidden>
      <path d="M1.2.6 13.4 13 1.2 25.4A1.9 1.9 0 0 1 .5 24V2c0-.6.3-1.1.7-1.4Z" fill="#00D7FE" />
      <path d="m17.6 8.8-4.2 4.2L1.2.6c.4-.3 1-.4 1.6-.1l14.8 8.3Z" fill="#00F076" />
      <path d="M17.6 17.2 2.8 25.5c-.6.3-1.2.2-1.6-.1L13.4 13l4.2 4.2Z" fill="#FF3A44" />
      <path d="M22.3 11.4c1.2.7 1.2 2.5 0 3.2l-4.7 2.6-4.2-4.2 4.2-4.2 4.7 2.6Z" fill="#FFD109" />
    </svg>
  );
}

export function GooglePlayBadge({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const base =
    tone === "dark"
      ? "bg-[#111] text-white border-[#111]"
      : "bg-white/10 text-white border-white/30";
  const inner = (
    <>
      <PlayLogo />
      <span className="flex flex-col leading-tight text-left">
        <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">{PLAY_STORE_URL ? "Get it on" : "Coming soon on"}</span>
        <span className="text-base font-semibold -mt-0.5">Google Play</span>
      </span>
    </>
  );
  const className = `inline-flex items-center gap-2.5 rounded-xl border px-4 py-2 ${base}`;
  return PLAY_STORE_URL ? (
    <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className={`${className} hover:opacity-90 transition-opacity`}>
      {inner}
    </a>
  ) : (
    <span className={`${className} cursor-default opacity-90`} aria-label="WePray on Google Play, coming soon">
      {inner}
    </span>
  );
}

/** Installs the web app (PWA). Uses the browser's install prompt where it's
 * offered; on iOS shows the Share → Add to Home Screen steps; anywhere else
 * just opens the app. Always renders the same markup so server and client
 * agree — the platform is only checked on click. */
export function InstallWebAppButton({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
      return;
    }
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      setShowIOSSteps((v) => !v);
      return;
    }
    router.push("/app");
  };

  const base =
    tone === "dark"
      ? "bg-white text-[#1E2952] border-[#1E2952]/20 hover:border-[#1E2952]/40"
      : "bg-white/10 text-white border-white/30 hover:bg-white/20";

  return (
    <div className="inline-flex flex-col">
      <button type="button" onClick={handleClick} className={`inline-flex items-center gap-2.5 rounded-xl border px-4 py-2 transition-colors ${base}`}>
        <Download className="h-6 w-6" />
        <span className="flex flex-col leading-tight text-left">
          <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">Install the</span>
          <span className="text-base font-semibold -mt-0.5">Web app</span>
        </span>
      </button>
      {showIOSSteps && (
        <p className={`mt-2 max-w-[16rem] text-xs leading-relaxed ${tone === "dark" ? "text-gray-600" : "text-white/80"}`}>
          In Safari, tap <Share className="inline h-3.5 w-3.5 -mt-0.5" /> Share, then{" "}
          <Plus className="inline h-3.5 w-3.5 -mt-0.5" /> Add to Home Screen.
        </p>
      )}
    </div>
  );
}
