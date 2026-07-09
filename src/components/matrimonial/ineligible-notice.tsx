import { HeartOff } from "lucide-react";

export function IneligibleNotice() {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
        <HeartOff className="h-5 w-5 text-gray-300" />
      </div>
      <h2 className="font-bold text-gray-900 mb-1">Matrimonial service isn&apos;t available for your profile</h2>
      <p className="text-sm text-gray-500 max-w-xs mx-auto">
        This service is currently only available to profiles with Male or Female set as their gender.
      </p>
    </div>
  );
}
