import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface ComingSoonProps {
  label: string;
  icon: LucideIcon;
  color: string;
}

export function ComingSoon({ label, icon: Icon, color }: ComingSoonProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm mb-4`}>
        <Icon className="h-7 w-7 text-gray-700" strokeWidth={1.75} />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">{label}</h1>
      <p className="text-sm text-gray-500 mb-6">Coming soon</p>
      <Link
        href="/"
        className="inline-block bg-[#1E2952] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#16203D] transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
