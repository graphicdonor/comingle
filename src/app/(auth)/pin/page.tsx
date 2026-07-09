"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PinInput } from "@/components/ui/pin-input";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Avatar } from "@/components/ui/avatar";
import { DEV_MODE, getDevProfile, getDevUser, setDevProfile } from "@/lib/dev-auth";
import { hashPin } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export default function PinPage() {
  const [pin, setPin] = useState("");
  const [profile, setProfile] = useState<Partial<Profile> | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (DEV_MODE) {
      setProfile(getDevProfile());
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/signup"); return; }
      supabase.from("profiles").select("*").eq("id", data.user.id).single()
        .then(({ data: p, error }) => {
          if (error) { console.error("Failed to load profile:", error.message); return; }
          setProfile(p as Profile);
        });
    });
  }, []);

  const handleCreate = async () => {
    if (pin.length < 4) return;
    setLoading(true);
    setError("");

    if (DEV_MODE) {
      const devUser = getDevUser();
      const pin_hash = await hashPin(pin, devUser?.id ?? "dev");
      setDevProfile({ pin_hash });
      setTimeout(() => { setLoading(false); setDone(true); }, 400);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); router.push("/signup"); return; }
    const pin_hash = await hashPin(pin, user.id);
    const { error } = await supabase.from("profiles").update({ pin_hash }).eq("id", user.id);
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
  };

  const name = profile?.full_name || profile?.username || "User";

  return (
    <div className="w-full max-w-sm flex flex-col items-center py-8 px-4">
      <BrandLogo size="md" className="mb-8" withBackdrop />

      {profile && (
        <Avatar src={profile.avatar_url} name={name} size="xl" className="mb-4 ring-4 ring-white shadow-md" />
      )}

      <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome, {name}</h2>

      <div className="w-full bg-white rounded-3xl shadow-lg p-7 mt-4">
        {!done ? (
          <>
            <p className="text-center text-sm text-gray-500 mb-6">Create 4 digit PIN for future login</p>
            <p className="text-sm font-medium text-gray-700 mb-3 text-center">Create 4 digit PIN</p>
            <PinInput value={pin} onChange={setPin} length={4} disabled={loading} />
            {error && <p className="text-xs text-red-500 text-center mt-3">{error}</p>}
            <Button
              variant="dark" size="lg" fullWidth loading={loading}
              disabled={pin.length < 4} onClick={handleCreate} className="mt-6"
            >
              Create PIN
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center py-2">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4 shadow-md relative">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-300 animate-ping" />
            </div>
            <p className="text-sm font-medium text-gray-700 mt-2">Login pin created Successfully</p>
            <Button variant="dark" size="lg" fullWidth onClick={() => router.push("/select-communities")} className="mt-6">
              Next
            </Button>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        By signing up you agree to our{" "}
        <span className="underline cursor-pointer">Terms of Service</span> and{" "}
        <span className="underline cursor-pointer">Privacy Policy</span>
      </p>
    </div>
  );
}
