import { Bell } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEV_MODE } from "@/lib/dev-auth";
import { NotificationRow } from "@/components/notifications/notification-row";
import type { Notification } from "@/lib/types";

export default async function NotificationsPage() {
  let notifications: Notification[] = [];

  // DEV_MODE has no real backend/second user to notify from, same as the
  // matrimonial invites/chat — this page just shows its empty state there.
  if (!DEV_MODE) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data } = await supabase
      .from("notifications")
      .select("*, actor:profiles!actor_id(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    notifications = (data ?? []) as Notification[];

    const unreadIds = notifications.filter((n) => !n.read_at).map((n) => n.id);
    if (unreadIds.length > 0) {
      await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", unreadIds);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <Bell className="h-5 w-5 text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationRow key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}
