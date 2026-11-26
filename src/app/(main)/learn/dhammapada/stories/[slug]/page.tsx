import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMMENTARY_STORIES, commentaryArt, getCommentaryStory } from "@/lib/learn/dhammapada";
import { CommentaryStoryView } from "@/components/learn/dhammapada-views";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMMENTARY_STORIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = getCommentaryStory((await params).slug);
  if (!s) return {};
  const art = commentaryArt(s.slug);
  return {
    title: `${s.title.en} (${s.title.hi}) — Dhammapada ${s.verses.join(", ")} story | WePray`,
    description: `${s.summary.en} ${s.summary.hi}`,
    alternates: { canonical: `/learn/dhammapada/stories/${s.slug}` },
    openGraph: {
      type: "article",
      siteName: "WePray",
      title: `${s.title.en} — the story of Dhammapada ${s.verses.join(", ")}`,
      description: s.summary.en,
      url: `/learn/dhammapada/stories/${s.slug}`,
      ...(art && { images: [{ url: art, width: 960, height: 960, alt: s.title.en }] }),
    },
  };
}

export default async function CommentaryStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getCommentaryStory(slug)) notFound();
  return <CommentaryStoryView slug={slug} />;
}
