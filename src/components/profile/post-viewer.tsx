"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { Post, CommunityRole } from "@/lib/types";
import { PostCard } from "@/components/post/post-card";
import { isCommunityStaff } from "@/lib/community";

interface PostViewerProps {
  posts: Post[];
  startIndex: number;
  currentUserId?: string;
  likedPostIds: string[];
  roleByCommunityId: Map<string, CommunityRole>;
}

/** Full-screen viewer opened from the profile posts grid — scrolled to the
 * tapped post on load, with the rest of the profile's posts right below it
 * so browsing "continues" instead of dead-ending on a single post. Reuses
 * PostCard wholesale, so likes/comments/delete all just work here too. */
export function PostViewer({ posts, startIndex, currentUserId, likedPostIds, roleByCommunityId }: PostViewerProps) {
  const router = useRouter();
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current[startIndex]?.scrollIntoView({ block: "start" });
  }, [startIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const likedSet = new Set(likedPostIds);

  return (
    <div className="fixed inset-0 z-[999] bg-gray-50 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center">
        <button
          onClick={() => router.back()}
          aria-label="Close"
          className="w-9 h-9 -ml-1.5 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-3">
        {posts.map((post, index) => (
          <div key={post.id} ref={(el) => { itemRefs.current[index] = el; }}>
            <PostCard
              post={post}
              currentUserId={currentUserId}
              liked={likedSet.has(post.id)}
              canModerate={isCommunityStaff(roleByCommunityId.get(post.community_id))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
