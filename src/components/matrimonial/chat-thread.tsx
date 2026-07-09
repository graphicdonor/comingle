"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { formatLastSeen } from "@/lib/matrimonial";
import type { MatrimonialMessage, Profile } from "@/lib/types";

const POLL_INTERVAL_MS = 6000;

interface ChatThreadProps {
  currentUserId: string;
  currentUserAvatar: string | null;
  partner: Profile;
  initialMessages: MatrimonialMessage[];
}

function dateLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(date, today)) return "Today";
  if (sameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export function ChatThread({ currentUserId, currentUserAvatar, partner, initialMessages }: ChatThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Scroll only the message list itself, never the page — scrollIntoView
    // on a child can bubble up and scroll ancestor containers too, which
    // dragged the whole page (including the fixed header) out of place.
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const latest = messages[messages.length - 1];
      let query = supabase
        .from("matrimonial_messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${partner.id}),and(sender_id.eq.${partner.id},receiver_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true });
      if (latest) query = query.gt("created_at", latest.created_at);
      const { data } = await query;
      if (data && data.length > 0) {
        setMessages((prev) => [...prev, ...(data as MatrimonialMessage[])]);
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [messages, currentUserId, partner.id]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content) return;
    setSending(true);
    setError("");
    const { data, error: insertError } = await supabase
      .from("matrimonial_messages")
      .insert({ sender_id: currentUserId, receiver_id: partner.id, content })
      .select()
      .single();
    setSending(false);
    if (insertError) { setError(insertError.message); return; }
    setDraft("");
    if (data) setMessages((prev) => [...prev, data as MatrimonialMessage]);
  };

  const partnerName = partner.full_name || partner.username;

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[400px]">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/services/matrimonial/chat" className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </Link>
        <Avatar src={partner.avatar_url} name={partnerName} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">{partnerName}</p>
          <p className="text-xs text-gray-400 leading-tight">{formatLastSeen(partner.last_active_at)}</p>
        </div>
        <div className="relative flex-shrink-0">
          <button onClick={() => setMenuOpen((v) => !v)} aria-label="More options" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-40">
                <button
                  onClick={() => router.push(`/services/matrimonial/${partner.id}`)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  View Profile
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto bg-white rounded-3xl border border-gray-100 p-4 space-y-1">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400 mt-8">Say hello 👋</p>
        ) : (
          messages.map((m, i) => {
            const mine = m.sender_id === currentUserId;
            const prev = messages[i - 1];
            const showDateDivider = !prev || dateLabel(prev.created_at) !== dateLabel(m.created_at);
            return (
              <div key={m.id}>
                {showDateDivider && (
                  <div className="flex justify-center my-3">
                    <span className="text-[11px] text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{dateLabel(m.created_at)}</span>
                  </div>
                )}
                <div className={cn("flex items-end gap-2 py-1", mine ? "justify-end" : "justify-start")}>
                  {!mine && <Avatar src={partner.avatar_url} name={partnerName} size="sm" className="!w-6 !h-6 flex-shrink-0" />}
                  <div className={cn("max-w-[70%] flex flex-col", mine ? "items-end" : "items-start")}>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2 text-sm",
                        mine ? "bg-[#8B1A6B] text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"
                      )}
                    >
                      {m.content}
                    </div>
                    <span className="text-[10px] text-gray-300 mt-0.5 px-1">{timeLabel(m.created_at)}</span>
                  </div>
                  {mine && <Avatar src={currentUserAvatar} name="You" size="sm" className="!w-6 !h-6 flex-shrink-0" />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      <div className="flex items-center gap-2 mt-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !sending) handleSend(); }}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#8B1A6B] focus:outline-none focus:ring-2 focus:ring-[#8B1A6B]/15"
        />
        <button
          onClick={handleSend}
          disabled={sending || !draft.trim()}
          className="w-11 h-11 rounded-full bg-[#8B1A6B] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-opacity"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
