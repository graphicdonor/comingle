import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPostDate, sortedPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — WePray",
  description: "Stories, guides and news from WePray, the safe app for faith communities.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: { title: "WePray Blog", description: "Stories, guides and news from WePray, the safe app for faith communities.", url: "/blog", type: "website" },
};

export default function BlogIndexPage() {
  const posts = sortedPosts();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 md:pt-20">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B1A6B]">WePray blog</p>
      <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight">Stories from our communities</h1>
      <p className="mt-4 text-lg text-gray-600">Why we&apos;re building WePray, how it works, and what&apos;s next for faith communities.</p>

      <div className="mt-12 space-y-6">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group block rounded-3xl border border-gray-100 bg-gradient-to-br from-[#fff0f5] via-white to-[#f7f0ff] p-6 sm:p-8 hover:border-[#8B1A6B]/30 hover:shadow-lg hover:shadow-[#8B1A6B]/5 transition-all"
          >
            <p className="text-xs font-semibold text-gray-500">
              {p.category} · {formatPostDate(p.published)} · {p.readingMinutes} min read
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight group-hover:text-[#8B1A6B] transition-colors">{p.title}</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">{p.description}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#8B1A6B]">
              Read the article <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
