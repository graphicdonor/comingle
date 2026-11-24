import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { T } from "@/lib/i18n/use-t";
import { PRAYERS, getPrayer } from "@/lib/practice/prayers";
import { PronunciationTrainer } from "@/components/practice/pronunciation-trainer";

export const dynamicParams = false;

export function generateStaticParams() {
  return PRAYERS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const prayer = getPrayer((await params).slug);
  if (!prayer) return {};
  return {
    title: `Pronunciation practice: ${prayer.title.pi} | WePray`,
    description: `Learn to pronounce ${prayer.title.pi} (${prayer.title.en}) line by line: listen, record yourself and compare.`,
    alternates: { canonical: `/practice/${prayer.slug}/pronounce` },
  };
}

export default async function PronouncePage({ params }: { params: Promise<{ slug: string }> }) {
  const prayer = getPrayer((await params).slug);
  if (!prayer) notFound();

  return (
    <div className="pb-6">
      <Link href={`/practice/${prayer.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6D252C] mb-4">
        <ArrowLeft className="h-4 w-4" /> <span className="font-pali">{prayer.title.pi}</span>
      </Link>
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#885F19] mb-1">
          <T k="pron.eyebrow" />
        </p>
        <h1 className="text-[26px] font-bold leading-tight text-[#2A1A1C]">
          <T k="pron.title" />
        </h1>
        <p className="mt-2 text-sm text-[#5B5350] leading-relaxed">
          <T k="pron.intro" />
        </p>
      </header>
      <PronunciationTrainer prayer={prayer} />
    </div>
  );
}
