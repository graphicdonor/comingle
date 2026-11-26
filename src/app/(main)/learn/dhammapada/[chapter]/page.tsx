import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CHAPTERS, getChapter } from "@/lib/learn/dhammapada";
import { DhpChapterView } from "@/components/learn/dhammapada-views";

export const dynamicParams = false;

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ chapter: String(c.number) }));
}

export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }): Promise<Metadata> {
  const c = getChapter(Number((await params).chapter));
  if (!c) return {};
  return {
    title: `Dhammapada Chapter ${c.number}: ${c.title.en} (${c.pi}) — verses ${c.from}–${c.to} | WePray`,
    description: c.intro ? `${c.intro.en} ${c.intro.hi}` : `Dhammapada chapter ${c.number}, ${c.pi}: verses ${c.from}–${c.to} in Pali, Hindi and English.`,
    alternates: { canonical: `/learn/dhammapada/${c.number}` },
  };
}

export default async function ChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
  const n = Number((await params).chapter);
  if (!getChapter(n)) notFound();
  return <DhpChapterView n={n} />;
}
