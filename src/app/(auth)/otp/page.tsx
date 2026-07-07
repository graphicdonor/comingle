"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PinInput } from "@/components/ui/pin-input";
import { BrandLogo } from "@/components/ui/brand-logo";
import { DEV_MODE, DEV_OTP, getDevProfile, setDevCookie } from "@/lib/dev-auth";
import Link from "next/link";

export default function OtpPage() {
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [otpType, setOtpType] = useState<"signup" | "login">("signup");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setPhone(sessionStorage.getItem("otp_phone") || "");
    setOtpType((sessionStorage.getItem("otp_type") as "signup" | "login") || "signup");

    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  const nextRouteAfterVerify = (hasProfile: boolean): string => {
    // Signup always goes to profile creation
    if (otpType === "signup") return "/signup-details";
    // Login: if profile complete go home, else create profile first
    return hasProfile ? "/" : "/signup-details";
  };

  const handleVerify = async () => {
    if (otp.length < (DEV_MODE ? 4 : 6)) return;
    setError("");
    setLoading(true);

    // ── Dev bypass ──────────────────────────────────────────────
    if (DEV_MODE) {
      if (otp !== DEV_OTP) {
        setError(`Invalid OTP. Use ${DEV_OTP} in dev mode.`);
        setLoading(false);
        return;
      }
      const devProfile = getDevProfile();
      const hasProfile = !!(devProfile?.username);
      setDevCookie();
      setTimeout(() => {
        setLoading(false);
        router.push(nextRouteAfterVerify(hasProfile));
      }, 600);
      return;
    }

    // ── Real Supabase verification ───────────────────────────────
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    setLoading(false);
    if (error) { setError(error.message); return; }

    const { data: profile } = await supabase
      .from("profiles").select("username").eq("id", data.user!.id).single();
    router.push(nextRouteAfterVerify(!!profile?.username));
  };

  const handleResend = async () => {
    setCountdown(60);
    setCanResend(false);
    setOtp("");
    if (!DEV_MODE) {
      await supabase.auth.signInWithOtp({ phone });
    }
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const maskedPhone = phone
    ? phone.slice(0, -4).replace(/\d/g, "*") + phone.slice(-4)
    : "+91 XXXXX XXXXX";

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-6">
      <BrandLogo size="md" className="mt-4" />

      <div className="relative w-64 h-56">
        <img
          src="/community-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain opacity-60"
        />
        <img
          src="/community-hero.png"
          alt="Community"
          className="absolute inset-0 w-full h-full object-contain drop-shadow-md"
        />
      </div>

      <div className="w-full bg-white rounded-3xl shadow-lg border border-gray-100 p-7">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          We have sent a {DEV_MODE ? 4 : 6} digit OTP to
        </h2>
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="font-bold text-[#8B1A6B] text-base">{maskedPhone}</span>
          <Link
            href={otpType === "signup" ? "/signup" : "/login"}
            className="text-[#E8355A] text-sm font-semibold hover:underline"
          >
            Edit Number?
          </Link>
        </div>

        {DEV_MODE && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 text-center">
            🔧 Dev mode — enter <strong>{DEV_OTP}</strong> to verify
          </div>
        )}

        <PinInput value={otp} onChange={setOtp} length={DEV_MODE ? 4 : 6} disabled={loading} />

        {error && <p className="text-sm text-red-500 text-center mt-3">{error}</p>}

        <Button
          variant="dark"
          size="lg"
          fullWidth
          loading={loading}
          disabled={otp.length < (DEV_MODE ? 4 : 6)}
          onClick={handleVerify}
          className="mt-6"
        >
          Verify
        </Button>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handleResend}
            disabled={!canResend}
            className="text-sm text-gray-500 disabled:opacity-40 hover:text-gray-700 transition-colors"
          >
            Resend OTP
          </button>
          {!canResend && (
            <span className="text-sm font-semibold" style={{ color: "#E8355A" }}>
              {String(Math.floor(countdown / 60)).padStart(2, "0")}:
              {String(countdown % 60).padStart(2, "0")}
            </span>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          By signing up you agree to our{" "}
          <span className="underline cursor-pointer">Terms of Service</span> and{" "}
          <span className="underline cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
