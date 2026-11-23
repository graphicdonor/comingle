import type { Metadata } from "next";
import { LearnIndex } from "@/components/learn/learn-views";

export const metadata: Metadata = {
  title: "Learn — how to pray and how to sit | WePray",
  description: "Beginner-friendly guides to Buddhist prayer and comfortable sitting postures, in Hindi and English.",
  alternates: { canonical: "/learn" },
};

export default function LearnPage() {
  return <LearnIndex />;
}
