"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { BrandLogo } from "@/components/ui/brand-logo";
import { DEV_MODE, DEV_PHONE, DEV_OTP, setDevUser } from "@/lib/dev-auth";
import { GoogleButton } from "@/components/ui/google-button";
import Link from "next/link";
import { Wrench } from "lucide-react";

export default function SignupPage() {
  const [phone, setPhone] = useState("");
  const [dialCode, setDialCode] = useState("+91");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone.length < 8) { setError("Enter a valid phone number"); return; }
    setLoading(true);

    const fullPhone = `${dialCode}${phone}`;

    // Dev bypass
    if (DEV_MODE && phone === DEV_PHONE) {
      setDevUser(phone, fullPhone);
      sessionStorage.setItem("otp_phone", fullPhone);
      sessionStorage.setItem("otp_type", "signup");
      setLoading(false);
      router.push("/otp");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      sessionStorage.setItem("otp_phone", fullPhone);
      sessionStorage.setItem("otp_type", "signup");
      router.push("/otp");
    }
  };

  return (
    // Fixed to the viewport, same bottom-sheet treatment as /onboarding —
    // the logo takes the remaining flex space above the card instead of the
    // whole block centering together, so the card sits flush at the bottom.
    <div className="fixed inset-0 flex flex-col items-center px-4">
      <div className="flex-1 w-full max-w-sm flex items-center justify-center min-h-0">
        <BrandLogo size="md" withBackdrop />
      </div>

      <div className="w-full max-w-sm bg-white rounded-t-3xl shadow-xl pt-3 pb-8 px-6 relative">
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-6" />
        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Sign up with mobile number</h2>
        <p className="text-sm text-gray-500 text-center mb-6">You will receive a 6 digit code to verify your mobile number</p>

        {DEV_MODE && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 flex items-center gap-2">
            <Wrench className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
            <span>Dev mode: use <strong>{DEV_PHONE}</strong> → OTP <strong>{DEV_OTP}</strong></span>
          </div>
        )}

        <form onSubmit={handleSendOtp} className="space-y-5">
          <PhoneInput
            value={phone}
            onChange={(p, d) => { setPhone(p); setDialCode(d); }}
            error={error}
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-[#1E2952] rounded" defaultChecked />
            <span className="text-sm text-gray-600">Remember Me</span>
          </label>

          <Button type="submit" variant="dark" size="lg" fullWidth loading={loading}>
            Send OTP
          </Button>
        </form>

        <div className="flex items-center gap-3 mt-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="mt-4">
          <GoogleButton mode="signup" />
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[#E8355A] font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
