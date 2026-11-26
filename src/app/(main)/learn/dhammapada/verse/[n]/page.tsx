import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VERSES, getChapter, getVerse } from "@/lib/learn/dhammapada";
import { DhpVerseView } from "@/components/learn/dhammapada-views";

export const dynamicParams = false;

export function generateStaticParams() {
  return VERSES.map((v) => ({ n: String(v.n) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const v = getVerse(Number((await params).n));
  if (!v) return {};
  const c = getChapter(v.chapter)!;
  const text = v.hi ? `${v.en} ${v.hi}` : v.en;
  return {
    title: `Dhammapada ${v.n} — ${v.pi[0].replace(/[;,]\s*$/, "")} | ${c.title.en} | WePray`,
    description: text.length > 300 ? `${text.slice(0, 297)}…` : text,
    alternates: { canonical: `/learn/dhammapada/verse/${v.n}` },
    openGraph: { type: "article", siteName: "WePray", title: `Dhammapada ${v.n}`, description: v.en, url: `/learn/dhammapada/verse/${v.n}` },
  };
}

export default async function VersePage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  if (!getVerse(n)) notFound();
  return <DhpVerseView n={n} />;
}
