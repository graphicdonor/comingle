"use client";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The app's standard popup for limits, blocked actions and errors — use it
 * instead of inline error text or window.alert when the user needs to
 * stop and acknowledge something. Mirrored in the native app
 * (src/components/Dialog.tsx) with the same options shape.
 *
 *   const dialog = useDialog();
 *   dialog.show({ variant: "warning", title: "…", message: "…", primary: { label: "…", href: "/…" } });
 */
export type DialogVariant = "info" | "warning" | "error" | "success";

export interface DialogAction {
  label: string;
  /** Navigate here when pressed (closes the dialog first). */
  href?: string;
  onClick?: () => void;
}

export interface DialogOptions {
  variant?: DialogVariant;
  title: string;
  message: string;
  /** Defaults to a plain "OK". */
  primary?: DialogAction;
  /** Optional second, quieter button (e.g. "Cancel", "Not now"). */
  secondary?: DialogAction;
}

const VARIANTS: Record<DialogVariant, { icon: LucideIcon; ring: string; iconColor: string }> = {
  info: { icon: Info, ring: "bg-[#1E2952]/10", iconColor: "text-[#1E2952]" },
  warning: { icon: AlertTriangle, ring: "bg-amber-100", iconColor: "text-amber-600" },
  error: { icon: XCircle, ring: "bg-red-100", iconColor: "text-red-600" },
  success: { icon: CheckCircle2, ring: "bg-emerald-100", iconColor: "text-emerald-600" },
};

const DialogContext = createContext<{ show: (options: DialogOptions) => void } | null>(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used inside <DialogProvider>");
  return ctx;
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<DialogOptions | null>(null);
  const router = useRouter();
  const titleId = useId();
  const messageId = useId();
  const primaryRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOptions(null), []);
  const show = useCallback((o: DialogOptions) => setOptions(o), []);

  useEffect(() => {
    if (!options) return;
    primaryRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [options, close]);

  const run = (action?: DialogAction) => {
    close();
    action?.onClick?.();
    if (action?.href) router.push(action.href);
  };

  const variant = VARIANTS[options?.variant ?? "info"];
  const Icon = variant.icon;

  return (
    <DialogContext.Provider value={{ show }}>
      {children}
      {options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-gray-900/50" onClick={close} aria-hidden />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={messageId}
            className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl"
          >
            <span className={cn("mx-auto flex h-12 w-12 items-center justify-center rounded-full", variant.ring)}>
              <Icon className={cn("h-6 w-6", variant.iconColor)} />
            </span>
            <h2 id={titleId} className="mt-4 text-lg font-bold text-gray-900">{options.title}</h2>
            <p id={messageId} className="mt-2 text-sm text-gray-600 leading-relaxed">{options.message}</p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                ref={primaryRef}
                type="button"
                onClick={() => run(options.primary)}
                className="w-full rounded-full bg-[#1E2952] py-3 text-sm font-semibold text-white hover:bg-[#16203D] transition-colors"
              >
                {options.primary?.label ?? "OK"}
              </button>
              {options.secondary && (
                <button
                  type="button"
                  onClick={() => run(options.secondary)}
                  className="w-full rounded-full py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {options.secondary.label}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
