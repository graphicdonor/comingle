import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SESSIONS, getSession, sessionPrayers } from "@/lib/practice/sessions";
import { SessionPlayer } from "@/components/practice/session-player";

export const dynamicParams = false;

export function generateStaticParams() {
  return SESSIONS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const session = getSession((await params).id);
  return session ? { title: `${session.title.en} — WePray`, robots: { index: false } } : {};
}

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = getSession((await params).id);
  if (!session) notFound();
  return <SessionPlayer session={session} prayers={sessionPrayers(session)} />;
}
