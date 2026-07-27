"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, MoreVertical, Play, ThumbsUp, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Post } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { cn, timeAgo } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ModerationStatusNotice } from "@/components/moderation/moderation-status-notice";
import { ImagePreviewModal } from "@/components/post/image-preview-modal";

const KIND_BADGES: Partial<Record<Post["post_type"], { label: string; className: string }>> = {
  matrimonial_profile: { label: "Matrimonial", className: "bg-rose-50 text-rose-600" },
  business_listing: { label: "Business", className: "bg-amber-50 text-amber-700" },
  job_listing: { label: "Job", className: "bg-teal-50 text-teal-700" },
};

function detailHref(post: Post): string | null {
  switch (post.post_type) {
    case "matrimonial_profile":
      return post.matrimonial_profile_id ? `/services/matrimonial/${post.matrimonial_profile_id}` : null;
    case "business_listing":
      return post.business_listing_id ? `/services/businesses/${post.business_listing_id}` : null;
    case "job_listing":
      return post.job_listing_id ? `/services/jobs/${post.job_listing_id}` : null;
    default:
      return null;
  }
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  liked?: boolean;
  canModerate?: boolean;
  /** "card": the original floating rounded card (community/profile pages).
   * "feed": edge-to-edge with full-bleed media, for the home page feed. */
  variant?: "card" | "feed";
}

export function PostCard({ post, currentUserId, liked: initialLiked = false, canModerate = false, variant = "card" }: PostCardProps) {
  const isFeed = variant === "feed";
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleted, setDeleted] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
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
  const kindBadge = KIND_BADGES[post.post_type];
  const href = detailHref(post);

  // Feed-variant media renders as a sibling of the avatar/text row (not
  // nested inside it) so it can bleed to both card edges — nested inside
  // that row, the avatar's own width would still indent its left edge.
  const media = post.image_url ? (
    <button
      type="button"
      onClick={() => setImagePreviewOpen(true)}
      aria-label="View full screen"
      className={cn("block w-full overflow-hidden", isFeed ? "-mx-4 w-[calc(100%+2rem)]" : "mt-3 rounded-xl")}
    >
      <img src={post.image_url} alt={post.title} className="w-full max-h-80 object-cover hover:opacity-95 transition-opacity" />
    </button>
  ) : post.video_url ? (
    <Link
      href={`/reels/${post.id}`}
      className={cn("block relative overflow-hidden bg-black group", isFeed ? "-mx-4 w-[calc(100%+2rem)]" : "mt-3 rounded-xl")}
    >
      {post.video_thumbnail_url && (
        <img src={post.video_thumbnail_url} alt={post.title} className="w-full max-h-80 object-cover opacity-90" />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-black/50 group-hover:bg-black/65 transition-colors flex items-center justify-center">
          <Play className="h-5 w-5 text-white fill-white ml-0.5" />
        </div>
      </div>
    </Link>
  ) : null;

  // Feed-variant title/content also render as a sibling of the avatar row
  // (not nested inside it) — same reasoning as media: nested there, they'd
  // stay indented under the name instead of spanning the full card width.
  const textBlock = (
    <>
      <h3 ref={titleRef} className={cn("font-semibold text-gray-900 break-words", !expanded && "line-clamp-2", isFeed ? "mt-3" : "mt-1.5")}>
        {post.title}
      </h3>
      {post.content && (
        <p ref={contentRef} className={cn("text-sm text-gray-600 mt-1 break-words", !expanded && "line-clamp-3")}>
          {post.content}
        </p>
      )}
      {canExpand && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="text-xs font-semibold text-indigo-600 hover:underline mt-1">
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </>
  );

  const viewDetails = href ? (
    <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E2952] hover:underline">
      View details →
    </Link>
  ) : null;

  const moderationNotice =
    currentUserId === post.author_id ? <ModerationStatusNotice status={post.moderation_status} contentType="post" contentId={post.id} /> : null;

  const actionBar = (
    <div className={cn("flex items-center", isFeed ? "gap-5 pt-3 border-t border-gray-100" : "gap-4")}>
      {isFeed ? (
        <button
          onClick={handleLike}
          className={cn("flex items-center gap-1.5 text-sm font-medium transition-colors", liked ? "text-[#1E2952]" : "text-gray-500 hover:text-[#1E2952]")}
        >
          <ThumbsUp className={cn("h-[18px] w-[18px]", liked && "fill-current")} />
          <span>{likeCount}</span>
        </button>
      ) : (
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
          }`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
          <span>{likeCount}</span>
        </button>
      )}
      <div className={cn("flex items-center gap-1.5 text-gray-500", isFeed ? "text-sm font-medium" : "text-sm")}>
        <MessageCircle className={isFeed ? "h-[18px] w-[18px]" : "h-4 w-4"} />
        <span>{post.comment_count}</span>
      </div>
    </div>
  );

  return (
    <div className={isFeed ? "bg-white p-4" : "bg-white rounded-2xl p-5 hover:shadow-sm transition-shadow"}>
      <div className="flex items-start gap-3">
        {author && (
          <Link href={`/profile/${author.username}`}>
            <Avatar src={author.avatar_url} name={author.username} size="md" />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          {isFeed ? (
            <div>
              {author && (
                <Link href={`/profile/${author.username}`} className="font-semibold text-gray-900 hover:underline text-sm block">
                  {author.full_name || author.username}
                </Link>
              )}
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                {community && (
                  <>
                    <Link href={`/communities/${community.slug}`} className="text-xs text-gray-500 hover:underline">
                      {community.name}
                    </Link>
                    <span className="text-gray-300 text-xs">·</span>
                  </>
                )}
                {kindBadge && (
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", kindBadge.className)}>{kindBadge.label}</span>
                )}
                <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>
              </div>
            </div>
          ) : (
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
              {kindBadge && (
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", kindBadge.className)}>{kindBadge.label}</span>
              )}
              <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>
            </div>
          )}

          {!isFeed && (
            <>
              {textBlock}
              {media}
              {viewDetails && <div className="mt-3">{viewDetails}</div>}
              {moderationNotice && <div className="mt-3">{moderationNotice}</div>}
              <div className="mt-3">{actionBar}</div>
            </>
          )}
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

      {isFeed && (
        <>
          {textBlock}
          {media && <div className="mt-3">{media}</div>}
          {(viewDetails || moderationNotice) && (
            <div className="mt-3 space-y-3">
              {viewDetails}
              {moderationNotice}
            </div>
          )}
          <div className="mt-3">{actionBar}</div>
        </>
      )}

      <AnimatePresence>
        {imagePreviewOpen && post.image_url && (
          <ImagePreviewModal src={post.image_url} alt={post.title} onClose={() => setImagePreviewOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
