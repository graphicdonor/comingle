import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { Hand } from "lucide-react";

interface ChatListItemProps {
  partner: Profile;
  lastMessage: { content: string; created_at: string; isMine: boolean } | null;
}

export function ChatListItem({ partner, lastMessage }: ChatListItemProps) {
  const name = partner.full_name || partner.username;

  return (
    <Link
      href={`/services/matrimonial/chat/${partner.id}`}
      className="flex items-center gap-3 bg-white rounded-2xl p-4 hover:shadow-sm transition-shadow"
    >
      <Avatar src={partner.avatar_url} name={name} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{name}</p>
        <p className="text-xs text-gray-400 truncate flex items-center gap-1">
          {lastMessage ? (
            `${lastMessage.isMine ? "You: " : ""}${lastMessage.content}`
          ) : (
            <>
              Say hello <Hand className="h-3 w-3 flex-shrink-0" strokeWidth={1.75} />
            </>
          )}
        </p>
      </div>
      {lastMessage && <span className="text-xs text-gray-300 flex-shrink-0">{timeAgo(lastMessage.created_at)}</span>}
    </Link>
  );
}
