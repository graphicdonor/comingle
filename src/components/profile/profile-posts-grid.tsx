"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Heart, Play, FileText } from "lucide-react";
import type { Post } from "@/lib/types";
import { ImagePreviewModal } from "@/components/post/image-preview-modal";

/** Instagram-style thumbnail grid for a profile's posts. There's no
 * single-post permalink page in this app, so each tile opens the closest
 * honest destination: the image full-screen, the video's reel viewer, or —
 * for a text-only post, which has no media to show — the community feed
 * it was actually posted in. */
export function ProfilePostsGrid({ posts }: { posts: Post[] }) {
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post) => {
          if (post.image_url) {
            return (
              <button
                key={post.id}
                type="button"
                onClick={() => setPreviewPost(post)}
                aria-label="View full screen"
                className="relative aspect-square overflow-hidden bg-gray-100 group"
              >
                <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                <LikeOverlay count={post.like_count} />
              </button>
            );
          }
          if (post.video_url) {
            return (
              <Link key={post.id} href={`/reels/${post.id}`} className="relative aspect-square overflow-hidden bg-black group">
                {post.video_thumbnail_url && (
                  <img src={post.video_thumbnail_url} alt={post.title} className="w-full h-full object-cover opacity-90" />
                )}
                <Play className="absolute top-1.5 right-1.5 h-4 w-4 text-white fill-white drop-shadow" />
                <LikeOverlay count={post.like_count} />
              </Link>
            );
          }
          const communitySlug = post.communities?.slug;
          return (
            <Link
              key={post.id}
              href={communitySlug ? `/communities/${communitySlug}` : "#"}
              className="relative aspect-square overflow-hidden bg-[#1E2952] p-2.5 flex flex-col group"
            >
              <FileText className="h-3.5 w-3.5 text-white/60 flex-shrink-0" />
              <p className="text-white text-xs font-medium leading-snug line-clamp-4 mt-1.5">{post.title}</p>
              <LikeOverlay count={post.like_count} />
            </Link>
          );
        })}
      </div>

      <AnimatePresence>
        {previewPost?.image_url && (
          <ImagePreviewModal src={previewPost.image_url} alt={previewPost.title} onClose={() => setPreviewPost(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

function LikeOverlay({ count }: { count: number }) {
  return (
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-end justify-start p-1.5 opacity-0 group-hover:opacity-100">
      <span className="flex items-center gap-1 text-white text-xs font-semibold">
        <Heart className="h-3.5 w-3.5 fill-white" />
        {count}
      </span>
    </div>
  );
}
