"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prayer } from "@/lib/practice/prayers";
import { favourites, readingPrefs } from "@/lib/practice/preferences";
import { useT } from "@/lib/i18n/use-t";

export function PrayerList({ prayers }: { prayers: Prayer[] }) {
  const favs = favourites.use();
  const { translation } = readingPrefs.use();
  const [filter, setFilter] = useState<string>("all");
  const { t, lang: ui } = useT();

  // Filters are derived from the catalogue, so new categories (and, once
  // there is more than one, traditions) appear without code changes.
  const categories = Array.from(new Map(prayers.map((p) => [p.category.en, p.category])).values());
  const filters: { id: string; label: string }[] = [
    { id: "all", label: t("prayers.filterAll", { n: prayers.length }) },
    { id: "saved", label: t("prayers.filterSaved", { n: favs.length }) },
    ...categories.map((c) => ({ id: `cat:${c.en}`, label: c[ui] })),
  ];

  const shown =
    filter === "saved"
      ? prayers.filter((p) => favs.includes(p.slug))
      : filter.startsWith("cat:")
        ? prayers.filter((p) => `cat:${p.category.en}` === filter)
        : prayers;

  return (
    <div>
      <div role="group" aria-label={t("prayers.filters")} className="-mx-4 px-4 mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold border transition-colors whitespace-nowrap",
              filter === f.id ? "bg-[#6D252C] text-white border-[#6D252C]" : "bg-white text-[#6D252C] border-[#6D252C]/25",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-[#6E6560] rounded-2xl bg-white border border-[#E7DCC8] px-4 py-6 text-center">
          {t("prayers.emptySaved")}
        </p>
      ) : (
        <ul className="space-y-3">
          {shown.map((p, i) => (
            <motion.li
              key={p.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/practice/${p.slug}`}
                className="flex items-center gap-3 rounded-2xl bg-white border border-[#E7DCC8] px-4 py-3.5 hover:border-[#C6A15B] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-pali text-lg font-semibold text-[#3A1418] truncate">
                      {p.title.pi}
                    </h3>
                    {favs.includes(p.slug) && <Heart aria-label={t("prayers.saved")} className="h-3.5 w-3.5 text-[#6D252C] fill-current flex-shrink-0" />}
                  </div>
                  <p lang={translation} className="text-sm text-[#4A4340]">
                    {p.title[translation]}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {p.category[ui]} · {t("common.min", { n: p.durationMinutes })} · {p.audio ? t("prayers.audio") : t("prayers.text")}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 flex-shrink-0" />
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
