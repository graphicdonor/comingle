"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { DEV_MODE, getDevProfile } from "@/lib/dev-auth";
import type { Profile } from "@/lib/types";
import Link from "next/link";

interface HomeGreetingProps {
  serverProfile: Profile | null;
  serverUserId?: string;
}

export function HomeGreeting({ serverProfile, serverUserId }: HomeGreetingProps) {
  const [devProfile, setDevProfile] = useState<{ full_name: string; username: string; avatar_url: string | null } | null>(null);

  useEffect(() => {
    if (DEV_MODE) {
      const p = getDevProfile();
      if (p?.username) {
        setDevProfile({ full_name: p.full_name, username: p.username, avatar_url: p.avatar_url });
      }
    }
  }, []);

  const profile = devProfile ?? serverProfile;
  const name = profile?.full_name || profile?.username || null;
  const isLoggedIn = !!profile || !!serverUserId;

  return (
    <div className="home-header-bg rounded-3xl p-5 mb-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          {isLoggedIn && name ? (
            <>
              <p className="text-xs text-gray-500 font-medium">Hi, {name}</p>
              <h1 className="text-lg font-bold text-gray-900">You are welcome to Comingle</h1>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-500 font-medium">Welcome to</p>
              <h1 className="text-xl font-bold">
                <span style={{ color: "#8B1A6B" }}>COM</span>
                <span style={{ color: "#2A5C27", fontStyle: "italic" }}>ingle</span>
              </h1>
            </>
          )}
        </div>
        {profile && (
          <Link href={`/profile/${profile.username}`}>
            <Avatar src={profile.avatar_url} name={name || "U"} size="md" className="ring-2 ring-white shadow" />
          </Link>
        )}
        {!profile && !serverUserId && (
          <Link href="/signup" className="text-xs font-semibold bg-[#1E2952] text-white px-3 py-1.5 rounded-full hover:bg-[#16203D] transition-colors">
            Join free
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2.5 border border-white shadow-sm">
        <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Try searching Community services..."
          className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400"
          readOnly
        />
      </div>
    </div>
  );
}
