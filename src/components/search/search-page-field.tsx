"use client";
import { useRouter } from "next/navigation";
import { SearchField } from "@/components/search/search-field";

export function SearchPageField({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();

  return (
    <SearchField
      defaultValue={defaultValue}
      placeholder="Search communities, posts, jobs, events..."
      autoFocus={!defaultValue}
      onSubmit={(value) => {
        router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
      }}
    />
  );
}
