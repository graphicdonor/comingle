"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CreatePost } from "@/components/post/create-post";
import type { Community } from "@/lib/types";

interface CreatePostComposerProps {
  communities: Community[];
  authorId: string;
}

export function CreatePostComposer({ communities, authorId }: CreatePostComposerProps) {
  const [communityId, setCommunityId] = useState(communities[0].id);
  const router = useRouter();
  const selected = communities.find((c) => c.id === communityId) ?? communities[0];

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center"
        >
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Create Post</h1>
      </div>

      {communities.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 -mx-1 px-1">
          {communities.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCommunityId(c.id)}
              className={`flex items-center gap-2 flex-shrink-0 rounded-full pl-1.5 pr-3 py-1.5 text-sm font-medium border transition-colors ${
                c.id === communityId
                  ? "bg-[#1E2952] border-[#1E2952] text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <Avatar src={c.cover_url} name={c.name} size="sm" className="h-6 w-6 text-[10px]" />
              {c.name}
            </button>
          ))}
        </div>
      )}

      <CreatePost
        key={communityId}
        communityId={communityId}
        authorId={authorId}
        defaultOpen
        onPosted={() => {
          router.push(`/communities/${selected.slug}`);
          router.refresh();
        }}
      />
    </div>
  );
}
