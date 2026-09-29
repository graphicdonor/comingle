"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CONTACT_MESSAGE_MAX, CONTACT_MESSAGE_MIN, CONTACT_TOPICS, type ContactTopic } from "@/lib/contact";

export function ContactForm({ initialTopic }: { initialTopic?: ContactTopic }) {
  const [topic, setTopic] = useState<ContactTopic | "">(initialTopic ?? "");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!topic) return setError("Please choose what your message is about.");
    if (message.trim().length < CONTACT_MESSAGE_MIN) return setError("Please write a little more so we can help.");
    if (replyTo.trim().length < 5) return setError("Please add an email or phone number so we can reply.");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, message, name, replyTo, website }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) return setError(body.error ?? "Something went wrong. Please try again.");
      setSent(true);
    } catch {
      setError("Couldn't send your message. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-sm p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-[#2A5C27] mx-auto" strokeWidth={1.5} />
        <h1 className="mt-4 text-lg font-bold text-gray-900">Message sent</h1>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">Thank you. Our team reads every message and will reply to {replyTo.trim()}.</p>
        <Link href="/settings" className="mt-6 inline-block text-sm font-semibold text-[#8B1A6B] hover:underline">
          Back to Settings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8B1A6B]/10">
          <Mail className="h-5 w-5 text-[#8B1A6B]" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Contact us</h1>
          <p className="text-xs text-gray-500">Questions, privacy requests and concerns reach our team here.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-3xl shadow-sm p-6 space-y-5">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">What is this about?</p>
          <div className="flex flex-wrap gap-2">
            {CONTACT_TOPICS.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={topic === t.id}
                onClick={() => setTopic(t.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                  topic === t.id ? "bg-[#1E2952] text-white border-[#1E2952]" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          id="message"
          label="Your message"
          rows={6}
          maxLength={CONTACT_MESSAGE_MAX}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you need. For a data request, say what you'd like us to do (for example, send you a copy of your data)."
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <Input id="name" label="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          <Input id="replyTo" label="Email or phone to reply to" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} maxLength={200} />
        </div>
        {/* Honeypot — hidden from people, tempting to bots. */}
        <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />

        {error && <p role="alert" className="text-xs text-red-500">{error}</p>}

        <Button type="submit" fullWidth loading={loading}>
          Send message
        </Button>
        <p className="text-[11px] text-center text-gray-400">
          We use your details only to reply to you. See our <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </form>
    </div>
  );
}
