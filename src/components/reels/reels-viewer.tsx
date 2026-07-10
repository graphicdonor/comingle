"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Volume2, VolumeX, X } from "lucide-react";
import type { Post } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface ReelsViewerProps {
  posts: Post[];
  startIndex: number;
  currentUserId: string;
  likedPostIds: string[];
}

interface LikeState {
  liked: boolean;
  count: number;
}

export function ReelsViewer({ posts, startIndex, currentUserId, likedPostIds }: ReelsViewerProps) {
  const router = useRouter();
  const supabase = createClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [likes, setLikes] = useState<Record<string, LikeState>>(() =>
    Object.fromEntries(posts.map((p) => [p.id, { liked: likedPostIds.includes(p.id), count: p.like_count }]))
  );

  // Jump straight to the tapped video before first paint — no visible
  // scroll animation from the top of the list down to it.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = startIndex * el.clientHeight;
  }, [startIndex]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setActiveIndex(index);
            setProgress(0);
          }
        }
      },
      { threshold: [0, 0.6, 1] }
    );
    for (const el of itemRefs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeIndex) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [activeIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const el = containerRef.current;
      if (!el) return;
      if (e.key === "ArrowDown") el.scrollBy({ top: el.clientHeight, behavior: "smooth" });
      else if (e.key === "ArrowUp") el.scrollBy({ top: -el.clientHeight, behavior: "smooth" });
      else if (e.key === "Escape") router.back();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const toggleLike = async (postId: string) => {
    const current = likes[postId];
    const next = { liked: !current.liked, count: current.count + (current.liked ? -1 : 1) };
    setLikes((prev) => ({ ...prev, [postId]: next }));
    if (current.liked) {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", currentUserId);
      await supabase.rpc("decrement_like_count", { post_id: postId });
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: currentUserId });
      await supabase.rpc("increment_like_count", { post_id: postId });
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black">
      <button
        onClick={() => router.back()}
        aria-label="Close"
        className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
      <button
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory overscroll-y-contain"
      >
        {posts.map((post, index) => {
          const like = likes[post.id];
          const author = post.profiles;
          const community = post.communities;
          const isActive = index === activeIndex;
          return (
            <div
              key={post.id}
              ref={(el) => { itemRefs.current[index] = el; }}
              data-index={index}
              className="h-full w-full snap-start relative flex items-center justify-center"
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20 z-10">
                  <div className="h-full bg-white transition-[width]" style={{ width: `${progress * 100}%` }} />
                </div>
              )}
              <video
                ref={(el) => { videoRefs.current[index] = el; }}
                src={post.video_url ?? undefined}
                poster={post.video_thumbnail_url ?? undefined}
                className="h-full w-full object-contain"
                loop
                playsInline
                muted={muted}
                onTimeUpdate={(e) => {
                  if (!isActive) return;
                  const v = e.currentTarget;
                  if (v.duration) setProgress(v.currentTime / v.duration);
                }}
              />

              <div className="absolute bottom-0 left-0 right-16 p-4 pb-8 bg-gradient-to-t from-black/70 to-transparent text-white">
                {author && (
                  <Link href={`/profile/${author.username}`} className="flex items-center gap-2 mb-2">
                    <Avatar src={author.avatar_url} name={author.username} size="sm" />
                    <span className="font-semibold text-sm">{author.full_name || author.username}</span>
                  </Link>
                )}
                {community && (
                  <Link
                    href={`/communities/${community.slug}`}
                    className="inline-block text-xs font-medium bg-white/15 px-2 py-0.5 rounded-full mb-2"
                  >
                    {community.name}
                  </Link>
                )}
                <p className="text-sm font-medium line-clamp-2">{post.title}</p>
              </div>

              <div className="absolute bottom-8 right-3 flex flex-col items-center gap-4">
                <button
                  onClick={() => toggleLike(post.id)}
                  className="flex flex-col items-center gap-1 text-white"
                  aria-label={like.liked ? "Unlike" : "Like"}
                >
                  <div className={cn("w-11 h-11 rounded-full bg-black/40 flex items-center justify-center", like.liked && "text-red-500")}>
                    <Heart className={cn("h-5 w-5", like.liked && "fill-current")} />
                  </div>
                  <span className="text-xs font-semibold">{like.count}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
