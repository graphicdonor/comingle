"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface JoinButtonProps {
  communityId: string;
  isMember: boolean;
}

export function JoinButton({ communityId, isMember: initialIsMember }: JoinButtonProps) {
  const [isMember, setIsMember] = useState(initialIsMember);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      if (isMember) {
        await supabase
          .from("community_members")
          .delete()
          .eq("community_id", communityId)
          .eq("user_id", user.id);
        await supabase.rpc("decrement_member_count", { community_id: communityId });
        setIsMember(false);
      } else {
        await supabase.from("community_members").insert({
          community_id: communityId,
          user_id: user.id,
          role: "member",
        });
        await supabase.rpc("increment_member_count", { community_id: communityId });
        setIsMember(true);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isMember ? "ghost" : "dark"}
      size="sm"
      loading={loading}
      onClick={handleClick}
    >
      {isMember ? "Leave" : "Join Community"}
    </Button>
  );
}
