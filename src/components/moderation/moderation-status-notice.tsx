"use client";
import { useState } from "react";
import { Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ModerationStatus } from "@/lib/types";
import type { ContentType } from "@/lib/moderation";

interface ModerationStatusNoticeProps {
  status: ModerationStatus;
  contentType: ContentType;
  contentId: string;
}

/**
 * Shown only to the content's own author (RLS means non-published rows
 * are invisible to anyone else anyway, but the caller still gates on
 * currentUserId === author before rendering this at all). Looks up the
 * relevant moderation_logs row lazily, only when the author opens the
 * appeal form, rather than on every render of every post in a feed.
 */
export function ModerationStatusNotice({ status, contentType, contentId }: ModerationStatusNoticeProps) {
  const [appealing, setAppealing] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (status === "published") return null;

  const handleAppeal = async () => {
    if (!reason.trim()) { setError("Tell us why you think this should be reconsidered."); return; }
    setSubmitting(true);
    setError("");

    const supabase = createClient();
    const { data: log } = await supabase
      .from("moderation_logs")
      .select("id")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!log) {
      setSubmitting(false);
      setError("Couldn't find the review record for this — try again shortly.");
      return;
    }

    const res = await fetch("/api/moderation/appeals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logId: log.id, reason: reason.trim() }),
    });
    const body = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) { setError(body.error || "Couldn't submit your appeal."); return; }
    setSubmitted(true);
  };

  return (
    <div
      className={cn(
        "rounded-xl px-3 py-2.5 text-xs",
        status === "blocked" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
      )}
    >
      <div className="flex items-center gap-1.5 font-medium">
        {status === "blocked" ? <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" /> : <Clock className="h-3.5 w-3.5 flex-shrink-0" />}
        {status === "blocked"
          ? "This doesn't meet community guidelines — only visible to you."
          : "Awaiting review — only visible to you until approved."}
      </div>

      {status === "blocked" && !submitted && (
        <div className="mt-2">
          {!appealing ? (
            <button type="button" onClick={() => setAppealing(true)} className="font-semibold underline">
              Appeal this decision
            </button>
          ) : (
            <div className="space-y-2 mt-1">
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why should this be reconsidered?"
                rows={3}
              />
              {error && <p className="text-red-600">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setAppealing(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" loading={submitting} onClick={handleAppeal}>
                  Submit appeal
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      {submitted && <p className="mt-1.5 font-medium">Appeal submitted — you&apos;ll be notified of the outcome.</p>}
    </div>
  );
}
