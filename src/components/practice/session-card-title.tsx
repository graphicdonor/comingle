"use client";
import { getSession, type PracticeSession } from "@/lib/practice/sessions";
import { useT } from "@/lib/i18n/use-t";

/** Session name in the interface language, with the other language beneath. */
export function SessionCardTitle({ id }: { id: PracticeSession["id"] }) {
  const { lang } = useT();
  const session = getSession(id);
  if (!session) return null;
  const other = lang === "hi" ? "en" : "hi";
  return (
    <>
      <p lang={lang} className="mt-3 font-bold leading-tight">{session.title[lang]}</p>
      <p lang={other} className="text-xs text-[#F7F2E8]/70">{session.title[other]}</p>
    </>
  );
}
