"use client";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { MapPin, Calendar, Users, Pencil } from "lucide-react";
import Link from "next/link";
import { getDevProfile } from "@/lib/dev-auth";
import { DEV_COMMUNITIES } from "@/lib/dev-data";

const JOINED_COMMUNITIES = DEV_COMMUNITIES.slice(0, 2);

export function DevProfilePageShell({ username }: { username: string }) {
  const [profile, setProfile] = useState<ReturnType<typeof getDevProfile>>(null);
  const [isOwn, setIsOwn] = useState(false);

  useEffect(() => {
    const p = getDevProfile();
    setProfile(p);
    setIsOwn(p?.username === username);
  }, [username]);

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm p-10 text-center text-gray-400 text-sm">
          Profile not found.
        </div>
      </div>
    );
  }

  const name = profile.full_name || profile.username;

  return (
    <div className="max-w-xl mx-auto">
      {/* Header card */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-5">
        <div className="h-28 bg-gradient-to-r from-[#8B1A6B]/30 via-purple-100 to-[#2A5C27]/20 relative">
          {isOwn && (
            <Link
              href="/profile/edit"
              className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm hover:bg-white transition-all"
            >
              <Pencil className="w-3 h-3" />
              Edit Profile
            </Link>
          )}
        </div>

        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <Avatar src={profile.avatar_url} name={name} size="xl" className="ring-4 ring-white shadow-md" />
            <div className="flex gap-4 text-center pt-2">
              <div>
                <p className="text-lg font-bold text-gray-900">0</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Posts</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{JOINED_COMMUNITIES.length}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Communities</p>
              </div>
            </div>
          </div>

          <h1 className="text-xl font-bold text-gray-900 leading-tight">{name}</h1>
          <p className="text-sm text-[#8B1A6B] font-medium mb-2">@{profile.username}</p>

          {profile.bio && <p className="text-sm text-gray-600 mb-3 leading-relaxed">{profile.bio}</p>}

          <div className="flex flex-wrap gap-2">
            {(profile.city || profile.state) && (
              <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                <MapPin className="h-3 w-3 text-[#8B1A6B]" />
                {[profile.city, profile.state].filter(Boolean).join(", ")}
              </span>
            )}
            {profile.gender && (
              <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full capitalize">
                {profile.gender}
              </span>
            )}
            {profile.date_of_birth && (
              <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                <Calendar className="h-3 w-3" />
                {new Date(profile.date_of_birth).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Communities */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#8B1A6B]" />
            Communities
            <span className="text-sm font-normal text-gray-400">({JOINED_COMMUNITIES.length})</span>
          </h2>
          <Link href="/communities" className="text-xs text-[#8B1A6B] font-semibold hover:underline">Browse →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {JOINED_COMMUNITIES.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B1A6B]/15 to-purple-100 flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-[#8B1A6B]" strokeWidth={1.75} />
              </div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{c.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.member_count.toLocaleString()} members</p>
            </div>
          ))}
        </div>
      </section>

      {/* Posts */}
      <section>
        <h2 className="text-base font-bold text-gray-900 mb-3">Posts <span className="text-sm font-normal text-gray-400">(0)</span></h2>
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-gray-400">
          No posts yet.
        </div>
      </section>
    </div>
  );
}
