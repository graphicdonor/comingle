"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEV_MODE } from "@/lib/dev-auth";

// Pages a member must be able to read (or use) before accepting.
const ALWAYS_OPEN = ["/terms", "/privacy", "/contact", "/delete-account"];

/**
 * Members whose profile has no terms_accepted_at (everyone who joined before
 * the Terms were added to signup) must accept them before using the app —
 * Google Play requires Terms acceptance before members can post. New members
 * accept during signup, so this only ever appears once.
 */
export function TermsGate() {
  const pathname = usePathname();
  const router = useRouter();
  const [needsConsent, setNeedsConsent] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (DEV_MODE) return;
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) return;
      const { data: p } = await supabase.from("profiles").select("terms_accepted_at").eq("id", user.id).maybeSingle();
      if (p && !p.terms_accepted_at) {
        setUserId(user.id);
        setNeedsConsent(true);
      }
    });
  }, []);

  if (!needsConsent || ALWAYS_OPEN.some((p) => pathname.startsWith(p))) return null;

  const accept = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await createClient().from("profiles").update({ terms_accepted_at: new Date().toISOString() }).eq("id", userId);
    setSaving(false);
    if (!error) {
      setNeedsConsent(false);
      router.refresh();
    }
  };

  const logout = async () => {
    await createClient().auth.signOut();
    router.push("/onboarding");
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-900/60 px-5">
      <div role="dialog" aria-modal="true" aria-labelledby="terms-gate-title" className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
        <img src="/wepray-logo.svg" alt="WePray" className="mx-auto h-7 w-auto" />
        <h2 id="terms-gate-title" className="mt-5 text-lg font-bold text-gray-900">We&apos;ve updated our terms</h2>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          Please review and accept our updated{" "}
          <Link href="/terms" className="font-semibold text-[#8B1A6B] underline">Terms &amp; Conditions</Link> and{" "}
          <Link href="/privacy" className="font-semibold text-[#8B1A6B] underline">Privacy Policy</Link> to keep using WePray.
        </p>
        <button
          type="button"
          onClick={accept}
          disabled={saving}
          className="mt-6 w-full rounded-full bg-[#1E2952] py-3 text-sm font-semibold text-white hover:bg-[#16203D] disabled:opacity-60"
        >
          {saving ? "Saving…" : "I agree"}
        </button>
        <button type="button" onClick={logout} className="mt-2 w-full rounded-full py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50">
          Log out
        </button>
      </div>
    </div>
  );
}
