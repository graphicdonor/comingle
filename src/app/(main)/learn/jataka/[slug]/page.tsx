import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { STORIES, getStory, storyArt } from "@/lib/learn/jataka";
import { StoryView } from "@/components/learn/jataka-views";

export const dynamicParams = false;

export function generateStaticParams() {
  return STORIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const story = getStory((await params).slug);
  if (!story) return {};
  const art = storyArt(story.slug);
  return {
    title: `${story.title.en} (${story.title.hi}) — ${story.title.pi}, Jātaka ${story.number} | WePray`,
    description: `${story.summary.en} ${story.summary.hi}`,
    alternates: { canonical: `/learn/jataka/${story.slug}` },
    openGraph: {
      type: "article",
      siteName: "WePray",
      title: `${story.title.en} (${story.title.hi}) — Jātaka ${story.number}`,
      description: story.summary.en,
      url: `/learn/jataka/${story.slug}`,
      ...(art && { images: [{ url: art, width: 960, height: 960, alt: story.title.en }] }),
    },
  };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getStory(slug)) notFound();
  return <StoryView slug={slug} />;
}
