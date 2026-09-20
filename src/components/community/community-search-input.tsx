"use client";
import { useRouter } from "next/navigation";
import { SearchField } from "@/components/search/search-field";

export function CommunitySearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();

  return (
    <SearchField
      defaultValue={defaultValue}
      placeholder="Search communities..."
      className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 border border-gray-200 mb-5 shadow-sm"
      onSubmit={(value) => {
        router.push(value ? `/communities?q=${encodeURIComponent(value)}` : "/communities");
      }}
    />
  );
}
