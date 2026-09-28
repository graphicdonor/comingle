import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageSquareHeart } from "lucide-react";
import { FeedbackForm } from "@/components/feedback/feedback-form";

export const metadata: Metadata = {
  title: "Share your feedback — WePray",
  description: "Tell us what you think of WePray and what would make it more useful for your faith community. It takes about 3 minutes.",
  alternates: { canonical: "/survey" },
};

export default function SurveyPage() {
  return (
    <div className="min-h-screen bg-[#fdf7f9] text-[#201D1E]">
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" aria-label="WePray home" className="flex-shrink-0">
            <img src="/wepray-logo.svg" alt="WePray" className="h-7 w-auto" />
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#8B1A6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#741458] transition-colors"
          >
            Open the app <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-8">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B1A6B]/10">
            <MessageSquareHeart className="h-6 w-6 text-[#8B1A6B]" />
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">Help us shape WePray</h1>
          <p className="mt-3 text-gray-600 leading-relaxed">
            We&apos;re building WePray with the faith communities who use it. Tell us what works, what doesn&apos;t, and
            what you&apos;d love to see next. It takes about 3 minutes, and you don&apos;t need an account.
          </p>
        </div>
        <FeedbackForm />
      </main>
    </div>
  );
}
