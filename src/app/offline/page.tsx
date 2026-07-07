"use client";
export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#F7F7F9] flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-6xl">📡</div>

      <div className="mb-2 font-black text-3xl tracking-tight">
        <span style={{ color: "#8B1A6B" }}>COM</span>
        <span style={{ color: "#2A5C27", fontStyle: "italic", fontFamily: "Georgia, serif" }}>ingle</span>
      </div>
      <p className="text-sm text-[#2A5C27] font-medium mb-8">Uniting Communities</p>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 max-w-sm w-full">
        <h1 className="text-xl font-bold text-gray-900 mb-2">You&apos;re offline</h1>
        <p className="text-sm text-gray-500 mb-6">
          It looks like you lost your internet connection. Check your network and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 bg-[#1E2952] text-white rounded-full font-semibold text-sm hover:bg-[#16203D] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
