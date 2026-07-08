"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { DEV_MODE, getDevProfile, clearDevSession } from "@/lib/dev-auth";
import { createClient } from "@/lib/supabase/client";

interface SettingsProfile {
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<SettingsProfile | null>(null);

  useEffect(() => {
    if (DEV_MODE) {
      const p = getDevProfile();
      if (!p) { router.push("/signup"); return; }
      setProfile({ username: p.username, full_name: p.full_name, avatar_url: p.avatar_url });
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      const { data: p } = await supabase
        .from("profiles").select("username, full_name, avatar_url").eq("id", data.user.id).single();
      if (!p) { router.push("/signup-details"); return; }
      setProfile(p);
    });
  }, []);

  const handleLogout = async () => {
    if (DEV_MODE) {
      clearDevSession();
      router.push("/onboarding");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/onboarding");
    router.refresh();
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Settings</h1>

      {/* Account */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account</p>
        {profile && (
          <Link href="/profile/edit" className="flex items-center gap-3 -mx-1 px-1 py-1 rounded-xl hover:bg-gray-50 transition-colors">
            <Avatar src={profile.avatar_url} name={profile.full_name || profile.username} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{profile.full_name || profile.username}</p>
              <p className="text-xs text-gray-400 truncate">@{profile.username}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </Link>
        )}
      </div>

      {/* Legal */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Legal</p>
        <Link href="/terms" className="flex items-center justify-between py-2.5 text-sm text-gray-700 hover:text-gray-900">
          Terms & Conditions <ChevronRight className="h-4 w-4 text-gray-300" />
        </Link>
        <Link href="/privacy" className="flex items-center justify-between py-2.5 text-sm text-gray-700 hover:text-gray-900">
          Privacy Policy <ChevronRight className="h-4 w-4 text-gray-300" />
        </Link>
      </div>

      {/* Session */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 py-1 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );
}
