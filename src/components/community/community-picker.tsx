"use client";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import type { Community } from "@/lib/types";

/** Chip picker for choosing which joined community a piece of content
 * (matrimonial profile, business listing, job listing) publishes to as a
 * community feed post — same chip styling as the regular post composer's
 * community switcher. */
export function CommunityPicker({
  communities,
  value,
  onChange,
  label = "Publish to community feed",
}: {
  communities: Community[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  if (communities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 px-4 py-4 text-center">
        <p className="text-sm text-gray-500 mb-2">Join a community to publish this to its feed.</p>
        <Link href="/communities" className="text-sm font-semibold text-[#8B1A6B] hover:underline">
          Browse communities →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {communities.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={`flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 text-sm font-medium border transition-colors ${
              c.id === value ? "bg-[#1E2952] border-[#1E2952] text-white" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <Avatar src={c.cover_url} name={c.name} size="sm" className="h-6 w-6 text-[10px]" />
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
