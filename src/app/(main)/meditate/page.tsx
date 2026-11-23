import type { Metadata } from "next";
import { MEDITATIONS, MEDITATION_DURATIONS, type MeditationPractice } from "@/lib/practice/meditations";
import { MeditationTimer } from "@/components/practice/meditation-timer";

export const metadata: Metadata = {
  title: "Meditate — mindful breathing and loving-kindness | WePray",
  description: "A calm meditation timer with simple guidance for mindful breathing (Ānāpānasati) and loving-kindness (Mettā).",
  alternates: { canonical: "/meditate" },
};

export default async function MeditatePage({ searchParams }: { searchParams: Promise<{ practice?: string; minutes?: string }> }) {
  const { practice, minutes } = await searchParams;
  const practiceId = MEDITATIONS.some((m) => m.id === practice) ? (practice as MeditationPractice["id"]) : "breathing";
  const mins = Number(minutes);
  const initialMinutes = (MEDITATION_DURATIONS as readonly number[]).includes(mins) ? mins : 5;

  return <MeditationTimer initialPractice={practiceId} initialMinutes={initialMinutes} />;
}
