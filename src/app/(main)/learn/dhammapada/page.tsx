import type { Metadata } from "next";
import { DhpHome } from "@/components/learn/dhammapada-views";

export const metadata: Metadata = {
  title: "Dhammapada in Pali, Hindi and English — all 423 verses | WePray",
  description:
    "Read the Dhammapada, the Buddha's teaching in 423 verses and 26 chapters: Pali text with Hindi and English translation, meaning and reflection for every verse, and the stories behind the verses. धम्मपद हिन्दी अर्थ सहित।",
  alternates: { canonical: "/learn/dhammapada" },
  keywords: ["Dhammapada", "Dhammapada Hindi", "धम्मपद", "धम्मपद हिन्दी", "Dhammapada Pali", "Buddha verses", "Dhammapada commentary stories"],
};

export default function DhammapadaPage() {
  return <DhpHome />;
}
