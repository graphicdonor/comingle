"use client";
import { useEffect, useState } from "react";
import { Check, CloudOff, Laptop, Loader2, RefreshCw, Smartphone } from "lucide-react";
import { useT } from "@/lib/i18n/use-t";
import { deleteAccount, signInWithGoogle, signOut, useAccount } from "@/lib/practice/sync";

export function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  );
}

/** Optional Google sign-in to sync saved prayers and settings across devices. */
export function AccountSection() {
  const { t } = useT();
  const account = useAccount();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // /auth/callback returns here with ?auth=error if Google sign-in didn't complete.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "error") {
      queueMicrotask(() => setMessage(t("account.signInFailed")));
      params.delete("auth");
      const rest = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (rest ? `?${rest}` : ""));
    }
  }, [t]);

  if (!account.ready) {
    return <div className="h-40 rounded-3xl bg-[#EFE7D8] animate-pulse" aria-hidden />;
  }

  if (!account.user) {
    return (
      <div className="rounded-3xl bg-white border border-[#E7DCC8] p-5">
        <p className="font-semibold text-[#2A1A1C]">{t("account.title")}</p>
        <p className="mt-1 text-sm text-[#5B5350] leading-relaxed">{t("account.intro")}</p>
        <ul className="mt-4 space-y-2">
          {(["account.benefit.saved", "account.benefit.recent", "account.benefit.settings"] as const).map((k) => (
            <li key={k} className="flex gap-2.5 text-sm text-[#2A1A1C]">
              <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#56634A]" /> {t(k)}
            </li>
          ))}
        </ul>
        {message && <p role="alert" className="mt-4 text-sm text-[#7A2A24]">{message}</p>}
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setMessage(null);
            const error = await signInWithGoogle();
            if (error) {
              setBusy(false);
              setMessage(t("account.signInFailed"));
            }
          }}
          className="mt-5 w-full flex items-center justify-center gap-3 rounded-full border border-[#D8CFC1] bg-white px-4 py-3 text-[15px] font-semibold text-[#2A1A1C] hover:bg-[#FFFCF6] disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin text-[#6D645D]" /> : <GoogleLogo />}
          {t("account.google")}
        </button>
        <p className="mt-3 flex items-start gap-2 text-xs text-[#6D645D] leading-relaxed">
          <Smartphone className="h-4 w-4 flex-shrink-0" /> {t("account.optional")}
        </p>
      </div>
    );
  }

  const { user, status } = account;
  const statusText =
    status === "syncing" ? t("account.status.syncing")
    : status === "synced" ? t("account.status.synced")
    : status === "error" ? t("account.status.error")
    : "";
  const StatusIcon = status === "syncing" ? RefreshCw : status === "synced" ? Check : CloudOff;

  return (
    <div className="rounded-3xl bg-white border border-[#E7DCC8] p-5">
      <div className="flex items-center gap-3">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-12 w-12 rounded-full object-cover bg-[#EFE7D8]" />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6D252C] text-lg font-bold text-[#F7F2E8]">
            {(user.name || user.email || "?").charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-[#2A1A1C] truncate">{user.name || user.email}</p>
          {user.name && user.email && <p className="text-sm text-[#6D645D] truncate">{user.email}</p>}
        </div>
      </div>

      {statusText && (
        <p aria-live="polite" className={`mt-4 flex items-center gap-2 text-sm ${status === "error" ? "text-[#7A2A24]" : "text-[#56634A]"}`}>
          <StatusIcon className={`h-4 w-4 flex-shrink-0 ${status === "syncing" ? "animate-spin" : ""}`} /> {statusText}
        </p>
      )}
      {status === "synced" && (
        <p className="mt-1 flex items-center gap-2 text-xs text-[#6D645D]">
          <Laptop className="h-3.5 w-3.5" /> {t("account.everywhere")}
        </p>
      )}

      {confirmDelete ? (
        <div role="alertdialog" aria-label={t("account.deleteTitle")} className="mt-5 rounded-2xl bg-[#FBEDEA] border border-[#EDC9C2] p-4">
          <p className="font-semibold text-[#7A2A24]">{t("account.deleteTitle")}</p>
          <p className="mt-1 text-sm text-[#7A2A24] leading-relaxed">{t("account.deleteBody")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const ok = await deleteAccount();
                setBusy(false);
                setConfirmDelete(false);
                setMessage(ok ? t("account.deleted") : t("account.deleteFailed"));
              }}
              className="rounded-full bg-[#7A2A24] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {t("account.deleteConfirm")}
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full border border-[#7A2A24]/30 px-4 py-2 text-sm font-semibold text-[#7A2A24]">
              {t("account.cancel")}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-full border border-[#6D252C]/25 px-4 py-2 text-sm font-semibold text-[#6D252C]"
          >
            {t("account.signOut")}
          </button>
          <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-full px-4 py-2 text-sm font-semibold text-[#7A2A24] hover:bg-[#FBEDEA]">
            {t("account.delete")}
          </button>
        </div>
      )}
      {message && <p role="status" className="mt-3 text-sm text-[#5B5350]">{message}</p>}
      <p className="mt-4 text-xs text-[#6D645D] leading-relaxed">{t("account.signedOutKeeps")}</p>
    </div>
  );
}
