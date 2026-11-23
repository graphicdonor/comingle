"use client";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#F7F2E8] flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex items-center justify-center">
        <WifiOff className="h-16 w-16 text-gray-400" strokeWidth={1.5} />
      </div>

      <div className="mb-2 font-bold text-3xl tracking-tight text-[#6D252C]">WePray</div>
      <p className="text-sm text-[#7A706B] font-medium mb-8">Buddhist Spiritual Companion</p>

      <div className="bg-white rounded-3xl shadow-sm p-8 max-w-sm w-full">
        <h1 className="text-xl font-bold text-gray-900 mb-2">You&apos;re offline</h1>
        <p className="text-sm text-gray-500 mb-6">
          It looks like you lost your internet connection. Check your network and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 bg-[#6D252C] text-[#F7F2E8] rounded-full font-semibold text-sm hover:bg-[#5E1F25] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
