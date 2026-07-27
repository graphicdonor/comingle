"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Send, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";
import type { Comment } from "@/lib/types";
import { ModerationStatusNotice } from "@/components/moderation/moderation-status-notice";

interface PostCommentsProps {
  postId: string;
  currentUserId?: string;
  canModerate?: boolean;
  /** Lets the parent PostCard keep its own displayed comment_count in sync
   * without refetching the whole post. */
  onCountChange: (delta: number) => void;
}

export function PostComments({ postId, currentUserId, canModerate = false, onCountChange }: PostCommentsProps) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pendingNotice, setPendingNotice] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("comments")
      .select("*, profiles!comments_author_id_fkey(*)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setComments((data as Comment[]) ?? []));
  }, [postId]);

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    setPendingNotice("");

    const res = await fetch("/api/moderation/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content: text.trim() }),
    });
    const body = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(body.error || "Something went wrong posting your comment.");
      return;
    }

    setText("");
    setComments((prev) => [...(prev ?? []), body.comment as Comment]);
    if (body.decision === "allow") onCountChange(1);
    else setPendingNotice(body.message);
  };

  const handleDelete = async (comment: Comment) => {
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("comments").delete().eq("id", comment.id);
    if (deleteError) return;
    setComments((prev) => (prev ?? []).filter((c) => c.id !== comment.id));
    if (comment.moderation_status === "published") {
      await supabase.rpc("decrement_comment_count", { post_id: postId });
      onCountChange(-1);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
      {comments === null ? (
        <p className="text-xs text-gray-400">Loading comments…</p>
      ) : (
        comments.map((comment) => {
          const canDeleteThis = currentUserId === comment.author_id || canModerate;
          const author = comment.profiles;
          return (
            <div key={comment.id} className="flex items-start gap-2.5 group">
              {author && (
                <Link href={`/profile/${author.username}`} className="flex-shrink-0">
                  <Avatar src={author.avatar_url} name={author.username} size="sm" />
                </Link>
              )}
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-2xl px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    {author && (
                      <Link href={`/profile/${author.username}`} className="text-xs font-semibold text-gray-900 hover:underline">
                        {author.full_name || author.username}
                      </Link>
                    )}
                    <span className="text-[10px] text-gray-400">{timeAgo(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 break-words mt-0.5">{comment.content}</p>
                </div>
                {currentUserId === comment.author_id && comment.moderation_status !== "published" && (
                  <div className="mt-1.5">
                    <ModerationStatusNotice status={comment.moderation_status} contentType="comment" contentId={comment.id} />
                  </div>
                )}
              </div>
              {canDeleteThis && (
                <button
                  onClick={() => handleDelete(comment)}
                  aria-label="Delete comment"
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })
      )}

      {currentUserId && (
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => { setText(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="Write a comment…"
            className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#8B1A6B] focus:bg-white transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            aria-label="Post comment"
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-[#1E2952] text-white disabled:opacity-40 hover:bg-[#16203D] transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {pendingNotice && <p className="text-xs text-amber-600">{pendingNotice}</p>}
    </div>
  );
}
