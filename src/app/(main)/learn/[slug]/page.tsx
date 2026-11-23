import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { GUIDES, getGuide } from "@/lib/learn/guides";
import { GuideSteps } from "@/components/learn/guide-steps";
import { PostureAnimation } from "@/components/visuals/posture-figure";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  return {
    title: `${guide.title} — a beginner's guide | WePray`,
    description: guide.summary,
    alternates: { canonical: `/learn/${guide.slug}` },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();

  return (
    <article className="pb-4">
      <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6D252C] mb-4">
        <ArrowLeft className="h-4 w-4" /> Learn
      </Link>
      <header>
        <div className="flex items-end gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A0701E]">Guide · {guide.minutes} min read</p>
            <h1 className="mt-1 text-[30px] font-bold tracking-tight text-[#2A1A1C] leading-tight">{guide.title}</h1>
            <p lang="hi" className="text-base text-[#7A706B]">{guide.titleHi}</p>
          </div>
          <PostureAnimation id={guide.coverAnimation} decorative className="h-40 w-28 flex-shrink-0" />
        </div>
        {guide.intro.map((p) => (
          <p key={p} className="mt-4 text-[16px] text-[#4A4340] leading-relaxed">{p}</p>
        ))}
      </header>

      <GuideSteps guide={guide} />

      {guide.closing && <p className="mt-6 text-[15px] text-[#4A4340] leading-relaxed">{guide.closing}</p>}

      {guide.review !== "reviewed" && (
        <p className="mt-6 flex gap-2.5 rounded-2xl bg-[#FBF3E2] border border-[#EBD3A3] px-4 py-3 text-xs text-[#6B4A12] leading-relaxed">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          This guide is a draft awaiting review by a Buddhist subject reviewer.
        </p>
      )}
    </article>
  );
}
