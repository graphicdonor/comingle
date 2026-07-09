"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface ShortlistButtonProps {
  targetUserId: string;
  initialShortlisted: boolean;
}

export function ShortlistButton({ targetUserId, initialShortlisted }: ShortlistButtonProps) {
  const [shortlisted, setShortlisted] = useState(initialShortlisted);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    setLoading(true);
    try {
      if (shortlisted) {
        await supabase.from("matrimonial_shortlist").delete().eq("user_id", user.id).eq("shortlisted_user_id", targetUserId);
      } else {
        await supabase.from("matrimonial_shortlist").insert({ user_id: user.id, shortlisted_user_id: targetUserId });
      }
      setShortlisted((s) => !s);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
      className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center flex-shrink-0 disabled:opacity-60 transition-transform active:scale-95"
    >
      <Star className={cn("w-4 h-4", shortlisted ? "fill-amber-400 text-amber-400" : "text-gray-400")} />
    </button>
  );
}
