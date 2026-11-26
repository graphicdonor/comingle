import type { Metadata } from "next";
import { CommentaryIndex } from "@/components/learn/dhammapada-views";

export const metadata: Metadata = {
  title: "Stories behind the Dhammapada verses — Kisā Gotamī, Aṅgulimāla, Paṭācārā | WePray",
  description: "Stories from the Dhammapada Commentary, retold in Hindi and English with narration: why the Buddha spoke each verse. धम्मपद-अट्ठकथा की कथाएँ।",
  alternates: { canonical: "/learn/dhammapada/stories" },
};

export default function CommentaryStoriesPage() {
  return <CommentaryIndex />;
}
