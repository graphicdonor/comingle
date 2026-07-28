"use client";
import { useState } from "react";
import { Flag, X } from "lucide-react";
import type { ReportReason } from "@/lib/types";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam or scam" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "misinformation", label: "Misinformation" },
  { value: "other", label: "Something else" },
];

interface ReportPostModalProps {
  postId: string;
  onClose: () => void;
}

/** A report never hides the post itself — it queues it for a human
 * moderator to review (see enqueue_post_report_for_review), same as an AI
 * hold. This just tells the reporter that plainly instead of implying
 * their report took the post down. */
export function ReportPostModal({ postId, onClose }: ReportPostModalProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/moderation/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, reason, details: details.trim() || undefined }),
    });
    const body = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(body.error || "Something went wrong submitting your report.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Flag className="h-4 w-4 text-red-500" /> Report Post
          </h2>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-700 font-medium mb-1">Thanks for letting us know.</p>
            <p className="text-xs text-gray-500 mb-5">
              A moderator will review this post. It stays visible in the meantime — reporting doesn&apos;t remove it on its own.
            </p>
            <button onClick={onClose} className="w-full py-2.5 rounded-full bg-[#1E2952] text-white text-sm font-semibold hover:bg-[#16203D] transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">Why are you reporting this post?</p>
            <div className="flex flex-col gap-2 mb-4">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    reason === r.value ? "border-[#8B1A6B] bg-[#8B1A6B]/5 text-[#8B1A6B]" : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add any details that might help a moderator (optional)"
              rows={3}
              maxLength={500}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#8B1A6B] mb-4"
            />
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="w-full py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-colors"
            >
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
