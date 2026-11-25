import type { Metadata } from "next";
import { JatakaIndex } from "@/components/learn/jataka-views";
import { STORIES } from "@/lib/learn/jataka";

export const metadata: Metadata = {
  title: "Jātaka tales: stories of the Buddha's past lives in Hindi and English | WePray",
  description: `${STORIES.length} Jātaka stories retold simply in Hindi and English: the Hare in the Moon, the Banyan Deer, the Monkey and the Crocodile and more, each with its lesson. जातक कथाएँ हिन्दी में।`,
  alternates: { canonical: "/learn/jataka" },
};

export default function JatakaPage() {
  return <JatakaIndex />;
}
