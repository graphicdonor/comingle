import { createClient } from "@/lib/supabase/server";
import { Users, Globe, FileText, TrendingUp } from "lucide-react";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import type { Profile } from "@/lib/types";

export const revalidate = 0;

interface ProfileRow extends Profile {
  phone?: string;
  community_count?: number;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch all data in parallel
  const [profilesRes, communitiesRes, postsRes] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("communities").select("id, name, member_count, created_at").order("member_count", { ascending: false }),
    supabase.from("posts").select("id, created_at"),
  ]);

  const profiles = (profilesRes.data ?? []) as ProfileRow[];
  const communities = communitiesRes.data ?? [];
  const posts = postsRes.data ?? [];

  // Per-user community count
  const membershipsRes = await supabase.from("community_members").select("user_id");
  const membershipCounts: Record<string, number> = {};
  (membershipsRes.data ?? []).forEach((m: { user_id: string }) => {
    membershipCounts[m.user_id] = (membershipCounts[m.user_id] ?? 0) + 1;
  });

  const enriched = profiles.map((p) => ({ ...p, community_count: membershipCounts[p.id] ?? 0 }));

  // Stats
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const newToday = profiles.filter((p) => new Date(p.created_at) >= today).length;
  const thisWeek = new Date(); thisWeek.setDate(thisWeek.getDate() - 7);
  const newThisWeek = profiles.filter((p) => new Date(p.created_at) >= thisWeek).length;

  const stats = [
    { label: "Total Users", value: profiles.length, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
    { label: "Communities", value: communities.length, icon: Globe, color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
    { label: "Total Posts", value: posts.length, icon: FileText, color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
    { label: "Joined This Week", value: newThisWeek, icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{newToday} new user{newToday !== 1 ? "s" : ""} joined today</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#1A1D27] border border-white/8 rounded-2xl p-5">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border ${bg} mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Top communities */}
      <div className="bg-[#1A1D27] border border-white/8 rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-bold text-white mb-4">Top Communities</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {communities.slice(0, 6).map((c: any) => (
            <div key={c.id} className="flex items-center gap-3 bg-[#0F1117] rounded-xl px-3 py-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#8B1A6B]/15 flex items-center justify-center text-sm flex-shrink-0">🏘️</div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                <p className="text-[10px] text-gray-500">{c.member_count} members</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users table */}
      <AdminUsersTable users={enriched} />
    </div>
  );
}
