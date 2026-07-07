import Link from "next/link";
import { Users } from "lucide-react";
import type { Community } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface CommunityCardProps {
  community: Community;
  isMember?: boolean;
}

export function CommunityCard({ community, isMember }: CommunityCardProps) {
  return (
    <Link href={`/communities/${community.slug}`} className="block">
      <div className={cn(
        "bg-white rounded-2xl border-2 p-4 hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-center text-center gap-2",
        isMember ? "border-[#8B1A6B]/30" : "border-gray-100"
      )}>
        <Avatar src={community.cover_url} name={community.name} size="lg" />
        <div className="min-w-0 w-full">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{community.name}</h3>
          {community.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{community.description}</p>
          )}
          <div className="flex items-center justify-center gap-1 mt-1.5 text-xs text-gray-400">
            <Users className="h-3 w-3" />
            <span>{community.member_count.toLocaleString()}</span>
          </div>
        </div>
        {isMember && (
          <span className="text-[10px] bg-[#8B1A6B]/10 text-[#8B1A6B] px-2 py-0.5 rounded-full font-semibold">
            Joined
          </span>
        )}
      </div>
    </Link>
  );
}
