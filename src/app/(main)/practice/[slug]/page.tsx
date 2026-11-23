import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { T } from "@/lib/i18n/use-t";
import { PRAYERS, getPrayer } from "@/lib/practice/prayers";
import { PrayerReader } from "@/components/practice/prayer-reader";

export const dynamicParams = false;

export function generateStaticParams() {
  return PRAYERS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const prayer = getPrayer((await params).slug);
  if (!prayer) return {};
  return {
    title: `${prayer.title.pi} (${prayer.title.en}) — Pali, Hindi, English | WePray`,
    description: prayer.summary.en,
    alternates: { canonical: `/practice/${prayer.slug}` },
  };
}

export default async function PrayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const prayer = getPrayer((await params).slug);
  if (!prayer) notFound();

  return (
    <div>
      <Link href="/practice" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6D252C] mb-4">
        <ArrowLeft className="h-4 w-4" /> <T k="nav.prayers" />
      </Link>
      <PrayerReader prayer={prayer} />
    </div>
  );
}
