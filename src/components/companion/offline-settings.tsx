"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, CloudDownload, RefreshCw, Trash2 } from "lucide-react";
import { useT } from "@/lib/i18n/use-t";
import { downloadOfflinePack, formatBytes, offlinePack, offlineSupported, removeOfflinePack } from "@/lib/practice/offline";

type Status = { state: "idle" } | { state: "saving"; done: number; total: number } | { state: "failed"; count: number };

/** "Use without internet" section in Settings (PRD §7.13). */
export function OfflineSettings() {
  const { t, lang } = useT();
  const pack = offlinePack.use();
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [supported, setSupported] = useState(true);
  const [usage, setUsage] = useState<number | null>(null);

  // Capabilities and storage usage are only known in the browser.
  useEffect(() => {
    let cancelled = false;
    const ok = offlineSupported();
    navigator.storage
      ?.estimate?.()
      .then((e) => !cancelled && setUsage(e.usage ?? null))
      .catch(() => {});
    if (!ok) queueMicrotask(() => !cancelled && setSupported(false));
    return () => {
      cancelled = true;
    };
  }, [pack]);

  async function download() {
    setStatus({ state: "saving", done: 0, total: 1 });
    try {
      const result = await downloadOfflinePack((done, total) => setStatus({ state: "saving", done, total }));
      setStatus(result.failed.length ? { state: "failed", count: result.failed.length } : { state: "idle" });
    } catch {
      setStatus({ state: "failed", count: 1 });
    }
  }

  async function remove() {
    await removeOfflinePack().catch(() => offlinePack.set(null));
  }

  const saving = status.state === "saving";
  const savedDate = pack ? new Date(pack.savedAt).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" }) : null;

  return (
    <div className="rounded-3xl bg-white border border-[#E7DCC8] p-5">
      <div className="flex items-start gap-3">
        <span className="h-10 w-10 rounded-2xl bg-[#EEF0E8] flex items-center justify-center flex-shrink-0">
          {pack ? <CheckCircle2 className="h-5 w-5 text-[#56634A]" /> : <CloudDownload className="h-5 w-5 text-[#56634A]" />}
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-[#2A1A1C]">{t("offline.heading")}</p>
          <p className="text-sm text-[#5B5350] leading-relaxed">
            {pack ? t("offline.ready", { size: formatBytes(pack.bytes) }) : t("offline.desc")}
          </p>
          {pack && savedDate && <p className="text-xs text-[#6D645D] mt-0.5">{t("offline.savedOn", { date: savedDate })}</p>}
        </div>
      </div>

      {!supported ? (
        <p className="mt-4 text-sm text-[#7A2A24]">{t("offline.unsupported")}</p>
      ) : saving ? (
        <div className="mt-4" aria-live="polite">
          <div className="h-2 rounded-full bg-[#EFE7D8] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#6D252C] transition-[width] duration-300"
              style={{ width: `${Math.round((status.done / Math.max(1, status.total)) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#6E6560]">{t("offline.downloading", { done: status.done, total: status.total })}</p>
        </div>
      ) : (
        <>
          {status.state === "failed" && <p className="mt-4 text-sm text-[#7A2A24]">{t("offline.failed", { n: status.count })}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {pack ? (
              <>
                <button
                  type="button"
                  onClick={download}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#6D252C]/25 px-4 py-2 text-sm font-semibold text-[#6D252C]"
                >
                  <RefreshCw className="h-4 w-4" /> {status.state === "failed" ? t("offline.retry") : t("offline.update")}
                </button>
                <button
                  type="button"
                  onClick={remove}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#6D252C]/25 px-4 py-2 text-sm font-semibold text-[#6D252C]"
                >
                  <Trash2 className="h-4 w-4" /> {t("offline.remove")}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={download}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#6D252C] px-5 py-2.5 text-sm font-bold text-[#F7F2E8]"
              >
                <CloudDownload className="h-4 w-4" /> {status.state === "failed" ? t("offline.retry") : t("offline.download")}
              </button>
            )}
          </div>
        </>
      )}

      {usage !== null && usage > 0 && <p className="mt-4 text-xs text-[#6D645D]">{t("offline.storage", { size: formatBytes(usage) })}</p>}
    </div>
  );
}

/** Small "Available offline" label, shown once the pack is saved. */
export function OfflineBadge() {
  const { t } = useT();
  const pack = offlinePack.use();
  if (!pack) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF0E8] px-2.5 py-1 text-[11px] font-semibold text-[#56634A]">
      <CheckCircle2 className="h-3.5 w-3.5" /> {t("offline.badge")}
    </span>
  );
}
