"use client";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import type { Post } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  liked?: boolean;
}

export function PostCard({ post, currentUserId, liked: initialLiked = false }: PostCardProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const supabase = createClient();

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

          <h3 className="font-semibold text-gray-900 mt-1.5">{post.title}</h3>
          {post.content && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-3">{post.content}</p>
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
