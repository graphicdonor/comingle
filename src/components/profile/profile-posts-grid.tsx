import Link from "next/link";
import { Heart, Play, FileText } from "lucide-react";
import type { Post } from "@/lib/types";

/** Instagram-style thumbnail grid for a profile's posts. Every tile opens
 * the same post viewer (see profile/[username]/posts/[postId]), scrolled to
 * that post, so tapping any post — image, video, or text-only — continues
 * into the rest of this profile's posts rather than jumping to an
 * unrelated destination per media type. */
export function ProfilePostsGrid({ posts, username }: { posts: Post[]; username: string }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => {
        const href = `/profile/${username}/posts/${post.id}`;
        if (post.image_url) {
          return (
            <Link key={post.id} href={href} className="relative aspect-square overflow-hidden bg-gray-100 group">
              <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
              <LikeOverlay count={post.like_count} />
            </Link>
          );
        }
        if (post.video_url) {
          return (
            <Link key={post.id} href={href} className="relative aspect-square overflow-hidden bg-black group">
              {post.video_thumbnail_url && (
                <img src={post.video_thumbnail_url} alt={post.title} className="w-full h-full object-cover opacity-90" />
              )}
              <Play className="absolute top-1.5 right-1.5 h-4 w-4 text-white fill-white drop-shadow" />
              <LikeOverlay count={post.like_count} />
            </Link>
          );
        }
        return (
          <Link key={post.id} href={href} className="relative aspect-square overflow-hidden bg-[#1E2952] p-2.5 flex flex-col group">
            <FileText className="h-3.5 w-3.5 text-white/60 flex-shrink-0" />
            <p className="text-white text-xs font-medium leading-snug line-clamp-4 mt-1.5">{post.title}</p>
            <LikeOverlay count={post.like_count} />
          </Link>
        );
      })}
    </div>
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
