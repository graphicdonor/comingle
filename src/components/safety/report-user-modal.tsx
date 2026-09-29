"use client";
import { useState } from "react";
import { Flag, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { USER_REPORT_REASONS, reportUser, type UserReportReason } from "@/lib/safety";

/** Report a person, or one of their comments (commentId). Same look as ReportPostModal. */
export function ReportUserModal({
  me,
  reportedUserId,
  commentId,
  onClose,
}: {
  me: string;
  reportedUserId: string;
  commentId?: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<UserReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await reportUser(createClient(), { me, reportedUserId, reason, details, commentId });
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong submitting your report.");
    } finally {
      setSubmitting(false);
    }
  };

  const title = commentId ? "Report comment" : "Report user";

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Flag className="h-4 w-4 text-red-500" /> {title}
          </h2>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
            <X className="h-4 w-4" />
          </button>
        </div>
        {submitted ? (
          <div className="text-center py-4">
            <p className="font-semibold text-gray-900">Thanks for telling us</p>
            <p className="mt-1 text-sm text-gray-500">Our team will review this report.</p>
            <button onClick={onClose} className="mt-5 rounded-full bg-[#1E2952] px-6 py-2.5 text-sm font-semibold text-white">Done</button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">What&apos;s the problem?</p>
            <div className="space-y-2">
              {USER_REPORT_REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={`w-full text-left rounded-xl border px-4 py-2.5 text-sm transition-colors ${reason === r.value ? "border-[#8B1A6B] bg-[#8B1A6B]/5 text-gray-900" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Add details (optional)"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#8B1A6B]"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="button"
              onClick={submit}
              disabled={!reason || submitting}
              className="w-full rounded-full bg-red-500 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Submit report"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
