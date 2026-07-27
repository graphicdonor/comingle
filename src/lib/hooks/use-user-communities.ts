"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Community } from "@/lib/types";

/** The communities a given user belongs to — used by the matrimonial/
 * business/job publish forms to populate their "share to community" picker,
 * the same membership list the post composer already uses. */
export function useUserCommunities(userId: string | null | undefined) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCommunities([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("community_members")
      .select("communities(*)")
      .eq("user_id", userId)
      .then(({ data }) => {
        setCommunities((data ?? []).map((m) => m.communities).filter(Boolean) as unknown as Community[]);
        setLoading(false);
      });
  }, [userId]);

  return { communities, loading };
}
