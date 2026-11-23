import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GUIDES } from "@/lib/learn/guides";
import { PostureFigure } from "@/components/visuals/posture-figure";

export const metadata: Metadata = {
  title: "Learn — how to pray and how to sit | WePray",
  description: "Beginner-friendly guides to Buddhist prayer and comfortable sitting postures.",
  alternates: { canonical: "/learn" },
};

export default function LearnPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-[#2A1A1C]">Learn</h1>
        <p className="mt-1 text-[15px] text-[#5B5350]">Gentle, practical guides for beginning a practice.</p>
      </header>
      <ul className="space-y-3">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/learn/${g.slug}`}
              className="flex items-center gap-4 rounded-3xl bg-white border border-[#E7DCC8] px-4 py-4 hover:border-[#C6A15B] transition-colors"
            >
              <span className="h-28 w-24 rounded-2xl bg-[#F3ECDF] flex items-end justify-center flex-shrink-0 overflow-hidden p-1.5">
                <PostureFigure id={g.cover} decorative still className="h-full max-w-full" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-[#2A1A1C]">{g.title}</p>
                <p lang="hi" className="text-sm text-[#7A706B]">{g.titleHi}</p>
                <p className="mt-2 text-sm text-[#5B5350] leading-relaxed">{g.summary}</p>
                <p className="mt-2 text-xs font-medium text-[#56634A]">{g.minutes} min read</p>
              </div>
              <ArrowRight className="h-5 w-5 text-[#6D252C]/50 flex-shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-xs text-[#8A7F76] leading-relaxed">
        More is on the way: hand positions and etiquette, the Buddha&apos;s life, and introductions to the teachings.
      </p>
    </div>
  );
}
