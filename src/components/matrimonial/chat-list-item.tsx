import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";
import type { Profile } from "@/lib/types";

interface ChatListItemProps {
  partner: Profile;
  lastMessage: { content: string; created_at: string; isMine: boolean } | null;
}

export function ChatListItem({ partner, lastMessage }: ChatListItemProps) {
  const name = partner.full_name || partner.username;

  return (
    <Link
      href={`/services/matrimonial/chat/${partner.id}`}
      className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
    >
      <Avatar src={partner.avatar_url} name={name} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{name}</p>
        <p className="text-xs text-gray-400 truncate">
          {lastMessage ? `${lastMessage.isMine ? "You: " : ""}${lastMessage.content}` : "Say hello 👋"}
        </p>
      </div>
      {lastMessage && <span className="text-xs text-gray-300 flex-shrink-0">{timeAgo(lastMessage.created_at)}</span>}
    </Link>
  );
}
