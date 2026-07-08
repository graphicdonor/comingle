import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Notifications</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
          <Bell className="h-5 w-5 text-gray-300" />
        </div>
        <p className="text-sm text-gray-400">No notifications yet.</p>
      </div>
    </div>
  );
}
