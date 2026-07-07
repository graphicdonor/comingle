"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEV_MODE } from "@/lib/dev-auth";

// In dev mode, use hardcoded community options so the UI works without Supabase
const DEV_COMMUNITIES = [
  { id: "dev-1", name: "Gurujisangat", slug: "gurujisangat", member_count: 248, description: null, cover_url: null },
  { id: "dev-2", name: "Jai Mata Di", slug: "jai-mata-di", member_count: 195, description: null, cover_url: null },
  { id: "dev-3", name: "Radha Swami Ji", slug: "radha-swami-ji", member_count: 312, description: null, cover_url: null },
  { id: "dev-4", name: "Sai Sangat", slug: "sai-sangat", member_count: 178, description: null, cover_url: null },
  { id: "dev-5", name: "Sikh Community", slug: "sikh-community", member_count: 420, description: null, cover_url: null },
  { id: "dev-6", name: "Hindu Samaj", slug: "hindu-samaj", member_count: 390, description: null, cover_url: null },
];

type Community = typeof DEV_COMMUNITIES[0];

export default function SelectCommunitiesPage() {
  const [communities] = useState<Community[]>(DEV_COMMUNITIES);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (!DEV_MODE) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/signup"); return; }
      const memberships = Array.from(selected).map((cid) => ({
        community_id: cid, user_id: user.id, role: "member",
      }));
      if (memberships.length > 0) {
        await supabase.from("community_members").upsert(memberships, { onConflict: "community_id,user_id" });
        for (const cid of selected) {
          await supabase.rpc("increment_member_count", { community_id: cid });
        }
      }
    }

    // In dev mode, just navigate home
    setTimeout(() => { setLoading(false); router.push("/"); }, 400);
  };

  return (
    <div className="w-full max-w-sm min-h-screen bg-[#F7F7F9] flex flex-col">
      <div className="flex items-center gap-3 p-4 pt-6">
        <button
          onClick={() => router.push("/pin")}
          className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center"
        >
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Register</h1>
      </div>

      <div className="flex-1 bg-white rounded-3xl mx-3 shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">
          Please choose any community in which you belongs to
        </h2>
        <p className="text-xs text-gray-400 mb-5">Select one or more communities</p>

        <div className="grid grid-cols-2 gap-3">
          {communities.map((c) => (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={cn(
                "rounded-2xl border-2 p-4 min-h-[90px] flex flex-col items-center justify-center gap-2 transition-all",
                selected.has(c.id)
                  ? "border-[#8B1A6B] bg-[#8B1A6B]/5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                selected.has(c.id) ? "bg-[#8B1A6B]/15 text-[#8B1A6B]" : "bg-gradient-to-br from-pink-100 to-purple-100 text-gray-600"
              )}>
                {c.name.charAt(0)}
              </div>
              <span className={cn(
                "text-xs font-semibold text-center leading-tight",
                selected.has(c.id) ? "text-[#8B1A6B]" : "text-gray-700"
              )}>
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 p-4 pb-8">
        <Button variant="ghost" size="lg" fullWidth onClick={() => router.push("/pin")}>Back</Button>
        <Button variant="dark" size="lg" fullWidth loading={loading} onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </div>
  );
}
