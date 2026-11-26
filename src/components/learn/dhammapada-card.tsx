"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n/use-t";

// The Dhammapada's card on the Learn page. Kept apart from dhammapada-views
// so the Learn page doesn't load the whole Dhammapada.

export function DhammapadaSection() {
  const { t, lang } = useT();
  return (
    <section aria-labelledby="dhp-learn">
      <Link href="/learn/dhammapada" className="block overflow-hidden rounded-3xl bg-[#3A1418] px-5 py-5 text-[#F7F2E8] transition-transform hover:-translate-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E9BE73]">{t("dhp.tagline")}</p>
        <h2 id="dhp-learn" className="mt-1 text-2xl font-bold">{t("dhp.title")}</h2>
        <p lang={lang} className="mt-1.5 line-clamp-3 text-[15px] leading-relaxed text-[#F7F2E8]/80">{t("dhp.intro")}</p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#E9BE73] px-4 py-2 text-sm font-bold text-[#3A1418]">
          {t("dhp.open")} <ArrowRight className="h-4 w-4" />
        </p>
      </Link>
    </section>
  );
}
