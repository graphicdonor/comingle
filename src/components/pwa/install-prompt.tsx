"use client";
import { useEffect, useState } from "react";
import { X, Download, Share, Plus, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
      return;
    }

    // Previously dismissed
    if (sessionStorage.getItem("pwa-dismissed")) {
      setDismissed(true);
      return;
    }

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Android / Chrome — capture beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa-dismissed", "1");
  };

  if (isStandalone || dismissed) return null;
  if (!deferredPrompt && !isIOS) return null; // Not installable

  return (
    <>
      {/* Android / Chrome install banner */}
      {deferredPrompt && (
        <div className="fixed bottom-20 left-3 right-3 z-50 animate-in slide-in-from-bottom-4">
          <div className="bg-[#1E2952] rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
            <img src="/icons/icon-72.png" alt="Comingle" className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Install Comingle</p>
              <p className="text-blue-200 text-xs">Add to home screen for offline access</p>
            </div>
            <button
              onClick={handleInstall}
              className="flex items-center gap-1 bg-white text-[#1E2952] px-3 py-1.5 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <Download className="w-3 h-3" />
              Install
            </button>
            <button onClick={handleDismiss} className="text-blue-200 hover:text-white flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS guide — tap to open */}
      {isIOS && !deferredPrompt && (
        <>
          <div className="fixed bottom-20 left-3 right-3 z-50 animate-in slide-in-from-bottom-4">
            <div className="bg-[#1E2952] rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
              <img src="/icons/icon-72.png" alt="Comingle" className="w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">Install Comingle</p>
                <p className="text-blue-200 text-xs">Add to your home screen</p>
              </div>
              <button
                onClick={() => setShowIOSGuide(true)}
                className="flex items-center gap-1 bg-white text-[#1E2952] px-3 py-1.5 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <Share className="w-3 h-3" />
                How?
              </button>
              <button onClick={handleDismiss} className="text-blue-200 hover:text-white flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* iOS step-by-step modal */}
          {showIOSGuide && (
            <div className="fixed inset-0 z-[60] flex items-end" onClick={() => setShowIOSGuide(false)}>
              <div className="absolute inset-0 bg-black/50" />
              <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10" onClick={(e) => e.stopPropagation()}>
                <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />
                <h3 className="font-bold text-gray-900 text-lg mb-4">Add Comingle to Home Screen</h3>
                <div className="space-y-4">
                  {[
                    { step: "1", icon: Share, text: 'Tap the Share button at the bottom of Safari' },
                    { step: "2", icon: Plus, text: 'Scroll down and tap "Add to Home Screen"' },
                    { step: "3", icon: Check, text: 'Tap "Add" in the top-right corner' },
                  ].map(({ step, icon: StepIcon, text }) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#8B1A6B] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {step}
                      </div>
                      <div className="flex items-center gap-2">
                        <StepIcon className="h-5 w-5 text-gray-500 flex-shrink-0" strokeWidth={1.75} />
                        <span className="text-sm text-gray-700">{text}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setShowIOSGuide(false); handleDismiss(); }}
                  className="mt-6 w-full py-3 bg-[#1E2952] text-white rounded-full font-semibold text-sm"
                >
                  Got it
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
