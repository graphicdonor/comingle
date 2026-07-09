"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEV_MODE } from "@/lib/dev-auth";
import { DEV_COMMUNITIES } from "@/lib/dev-data";
import type { Community } from "@/lib/types";

export default function SelectCommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>(DEV_MODE ? DEV_COMMUNITIES : []);
  const [fetching, setFetching] = useState(!DEV_MODE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (DEV_MODE) return;
    supabase
      .from("communities")
      .select("*")
      .order("member_count", { ascending: false })
      .then(({ data }) => {
        setCommunities((data ?? []) as Community[]);
        setFetching(false);
      });
  }, []);

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    if (!DEV_MODE) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/signup"); return; }

      const memberships = Array.from(selected).map((cid) => ({
        community_id: cid, user_id: user.id, role: "member",
      }));
      if (memberships.length > 0) {
        const { error: joinError } = await supabase
          .from("community_members")
          .upsert(memberships, { onConflict: "community_id,user_id" });
        if (joinError) {
          setError(joinError.message);
          setLoading(false);
          return;
        }
        for (const cid of selected) {
          await supabase.rpc("increment_member_count", { community_id: cid });
        }
      }
      setLoading(false);
      router.push("/");
      return;
    }

    // Dev bypass — just navigate home
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

      <div className="flex-1 bg-white rounded-3xl mx-3 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-1">
          Please choose any community in which you belongs to
        </h2>
        <p className="text-xs text-gray-400 mb-5">Select one or more communities</p>

        {fetching ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border-2 border-gray-100 p-4 min-h-[90px] animate-pulse bg-gray-50" />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No communities available yet.</p>
        ) : (
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
        )}

        {error && <p className="text-sm text-red-500 text-center mt-4">{error}</p>}
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
