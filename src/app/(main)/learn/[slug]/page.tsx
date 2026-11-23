import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "@/lib/learn/guides";
import { GuideView } from "@/components/learn/learn-views";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  return {
    title: `${guide.title.en} (${guide.title.hi}) — a beginner's guide | WePray`,
    description: guide.summary.en,
    alternates: { canonical: `/learn/${guide.slug}` },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getGuide(slug)) notFound();
  return <GuideView slug={slug} />;
}
