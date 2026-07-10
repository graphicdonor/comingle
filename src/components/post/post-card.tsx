"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, MoreVertical, Play, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Post } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { cn, timeAgo } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ModerationStatusNotice } from "@/components/moderation/moderation-status-notice";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  liked?: boolean;
  canModerate?: boolean;
}

export function PostCard({ post, currentUserId, liked: initialLiked = false, canModerate = false }: PostCardProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleted, setDeleted] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const canDelete = currentUserId === post.author_id || canModerate;

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

  const handleDeletePost = async () => {
    setDeleting(true);
    setDeleteError("");
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    setDeleting(false);
    if (error) { setDeleteError(error.message); return; }
    setDeleted(true);
    router.refresh();
  };

  if (deleted) return null;

  const author = post.profiles;
  const community = post.communities;

  return (
    <div className="bg-white rounded-2xl p-5 hover:shadow-sm transition-shadow">
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
          {post.video_url && (
            <Link href={`/reels/${post.id}`} className="mt-3 relative block rounded-xl overflow-hidden bg-black group">
              {post.video_thumbnail_url && (
                <img src={post.video_thumbnail_url} alt={post.title} className="w-full max-h-80 object-cover opacity-90" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black/50 group-hover:bg-black/65 transition-colors flex items-center justify-center">
                  <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                </div>
              </div>
            </Link>
          )}

          {currentUserId === post.author_id && (
            <div className="mt-3">
              <ModerationStatusNotice status={post.moderation_status} contentType="post" contentId={post.id} />
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

        {canDelete && (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Post options"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => { setMenuOpen(false); setConfirmingDelete(false); }} />
                <div className="absolute right-0 top-9 z-20 bg-white rounded-xl shadow-lg py-1 w-48">
                  {!confirmingDelete ? (
                    <button
                      onClick={() => setConfirmingDelete(true)}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete Post
                    </button>
                  ) : (
                    <div className="px-4 py-2.5 space-y-2">
                      <p className="text-xs text-gray-500">Delete this post?</p>
                      {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setConfirmingDelete(false)}
                          className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeletePost}
                          disabled={deleting}
                          className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-full px-3 py-1 disabled:opacity-50"
                        >
                          {deleting ? "Deleting…" : "Confirm"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
