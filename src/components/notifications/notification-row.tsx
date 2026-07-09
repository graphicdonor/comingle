import { Avatar } from "@/components/ui/avatar";
import { cn, timeAgo } from "@/lib/utils";
import type { Notification } from "@/lib/types";

interface NotificationRowProps {
  notification: Notification;
}

function messageFor(notification: Notification, name: string): string {
  if (notification.type === "matrimonial_message") {
    return notification.count > 1
      ? `${name} sent you ${notification.count} new messages`
      : `${name} sent you a new message`;
  }
  return `New activity from ${name}`;
}

export function NotificationRow({ notification }: NotificationRowProps) {
  const unread = !notification.read_at;
  const name = notification.actor?.full_name || notification.actor?.username || "Someone";

  return (
    // Plain <a>, not next/link — this points into /services/matrimonial,
    // where soft navigation has an intermittent commit bug (see chat-thread
    // and matrimonial-nav-tabs, which use the same workaround).
    <a
      href={notification.link}
      className={cn(
        "flex items-center gap-3 p-3 rounded-2xl border transition-colors",
        unread ? "bg-[#8B1A6B]/5 border-[#8B1A6B]/10" : "bg-white border-gray-100"
      )}
    >
      <Avatar src={notification.actor?.avatar_url ?? null} name={name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm leading-snug", unread ? "font-semibold text-gray-900" : "text-gray-600")}>
          {messageFor(notification, name)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(notification.created_at)}</p>
      </div>
      {unread && <span className="w-2 h-2 rounded-full bg-[#8B1A6B] flex-shrink-0" aria-label="Unread" />}
    </a>
  );
}
