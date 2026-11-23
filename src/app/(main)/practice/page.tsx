import type { Metadata } from "next";
import Link from "next/link";
import { Sun, Moon, Play } from "lucide-react";
import { PRAYERS } from "@/lib/practice/prayers";
import { SESSIONS, sessionMinutes } from "@/lib/practice/sessions";
import { PrayerList } from "@/components/practice/prayer-list";
import { SessionCardTitle } from "@/components/practice/session-card-title";
import { T } from "@/lib/i18n/use-t";
import { OfflineBadge } from "@/components/companion/offline-settings";

export const metadata: Metadata = {
  title: "Prayers — Buddhist prayers in Pali, Hindi and English | WePray",
  description: "Read traditional Buddhist prayers in Pali with Hindi and English translations: Buddha Vandanā, Tisaraṇa, Pañcasīla, the Triple Gem and Mettā.",
  alternates: { canonical: "/practice" },
};

export default function PracticePage() {
  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-[#2A1A1C]"><T k="prayers.title" /></h1>
        <p className="mt-1 text-[15px] text-[#5B5350] leading-relaxed">
          <T k="prayers.intro" />
        </p>
        <div className="mt-2">
          <OfflineBadge />
        </div>
      </header>

      <section aria-labelledby="sessions-heading">
        <h2 id="sessions-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-[#885F19] mb-3">
          <T k="prayers.sessions" />
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {SESSIONS.map((s) => {
            const Icon = s.id === "morning" ? Sun : Moon;
            return (
              <Link
                key={s.id}
                href={`/practice/session/${s.id}`}
                className="rounded-3xl bg-[#6D252C] text-[#F7F2E8] px-4 py-4 hover:bg-[#5E1F25] transition-colors"
              >
                <Icon className="h-5 w-5 text-[#E9BE73]" strokeWidth={1.8} />
                <SessionCardTitle id={s.id} />
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#F7F2E8]/90">
                  <Play className="h-3 w-3 fill-current" /> <T k="prayers.sessionMeta" vars={{ n: sessionMinutes(s), k: s.prayerSlugs.length }} />
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="all-heading">
        <h2 id="all-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-[#885F19] mb-3">
          <T k="prayers.all" />
        </h2>
        <PrayerList prayers={PRAYERS} />
      </section>
    </div>
  );
}
