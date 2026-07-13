"use client";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function AccountDisabledPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F7F7F9] flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex items-center justify-center">
        <ShieldAlert className="h-16 w-16 text-gray-400" strokeWidth={1.5} />
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-8 max-w-sm w-full">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Account deactivated</h1>
        <p className="text-sm text-gray-500 mb-6">
          Your account has been deactivated by an administrator. If you believe this is a mistake, please contact support.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="w-full py-3 bg-[#1E2952] text-white rounded-full font-semibold text-sm hover:bg-[#16203D] transition-colors"
        >
          Back to login
        </button>
      </div>
    </div>
  );
}
