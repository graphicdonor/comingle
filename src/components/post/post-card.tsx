"use client";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Post } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { cn, timeAgo } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  liked?: boolean;
}

export function PostCard({ post, currentUserId, liked: initialLiked = false }: PostCardProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // Measured once against the initial (clamped) layout — whether text
    // actually overflowed its clamp, not a guess based on character count.
    const isClamped = (el: HTMLElement | null) => !!el && el.scrollHeight > el.clientHeight + 1;
    setCanExpand(isClamped(titleRef.current) || isClamped(contentRef.current));
  }, [post.title, post.content]);

  const handleLike = async () => {
    if (!currentUserId) return;
    if (liked) {
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", currentUserId);
      await supabase.rpc("decrement_like_count", { post_id: post.id });
      setLikeCount((c) => c - 1);
      setLiked(false);
    } else {
      await supabase.from("post_likes").insert({ post_id: post.id, user_id: currentUserId });
      await supabase.rpc("increment_like_count", { post_id: post.id });
      setLikeCount((c) => c + 1);
      setLiked(true);
    }
  };

  const author = post.profiles;
  const community = post.communities;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        {author && (
          <Link href={`/profile/${author.username}`}>
            <Avatar src={author.avatar_url} name={author.username} size="md" />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {author && (
              <Link href={`/profile/${author.username}`} className="font-semibold text-gray-900 hover:underline text-sm">
                {author.full_name || author.username}
              </Link>
            )}
            {community && (
              <>
                <span className="text-gray-400 text-xs">in</span>
                <Link href={`/communities/${community.slug}`} className="text-xs text-indigo-600 hover:underline font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                  {community.name}
                </Link>
              </>
            )}
            <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>
          </div>

          <h3
            ref={titleRef}
            className={cn("font-semibold text-gray-900 mt-1.5 break-words", !expanded && "line-clamp-2")}
          >
            {post.title}
          </h3>
          {post.content && (
            <p
              ref={contentRef}
              className={cn("text-sm text-gray-600 mt-1 break-words", !expanded && "line-clamp-3")}
            >
              {post.content}
            </p>
          )}
          {canExpand && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-xs font-semibold text-indigo-600 hover:underline mt-1"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
          {post.image_url && (
            <div className="mt-3 rounded-xl overflow-hidden">
              <img src={post.image_url} alt={post.title} className="w-full max-h-80 object-cover" />
            </div>
          )}

          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </button>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comment_count}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
