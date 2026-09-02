import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { CATEGORIES, type Category } from "@/data/content";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const EASE = [0.16, 1, 0.3, 1] as const;

const ACCENT_TEXT: Record<Category["accent"], string> = { lime: "text-lime", green: "text-green", cyan: "text-cyan" };
const ACCENT_BG: Record<Category["accent"], string> = { lime: "bg-lime", green: "bg-green", cyan: "bg-cyan" };

function seededRand(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  };
}

function generateDots(key: string, count: number) {
  const rand = seededRand(key);
  return Array.from({ length: count }, (_, i) => ({
    x: rand() * 100,
    y: rand() * 100,
    r: 0.6 + rand() * 1.6,
    delay: i * 0.015,
  }));
}

function CategoryScene({ category, dotCount }: { category: Category; dotCount: number }) {
  const dots = useMemo(() => generateDots(category.key, dotCount), [category.key, dotCount]);
  const Icon = category.icon;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-line bg-charcoal">
      {/* No `mode="wait"` — the outgoing and incoming scenes should crossfade
          simultaneously. Waiting for the exit to finish first left a visible
          blank gap on every hover switch. */}
      <AnimatePresence>
        <motion.div
          key={category.key}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div className={`absolute -inset-10 rounded-full opacity-30 blur-3xl ${ACCENT_BG[category.accent]}`} style={{ top: "20%", left: "60%" }} />
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            {dots.map((d, i) => (
              <motion.circle
                key={i}
                cx={`${d.x}%`}
                cy={`${d.y}%`}
                r={d.r}
                className={ACCENT_TEXT[category.accent]}
                fill="currentColor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 0.6, delay: d.delay, ease: EASE }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">Now viewing</span>
            <div className="flex items-end justify-between">
              <span className="font-display text-2xl font-semibold text-bone">{category.label}</span>
              <Icon size={40} strokeWidth={1.25} className={ACCENT_TEXT[category.accent]} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function ExploreSection() {
  const [active, setActive] = useState(0);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const activeCategory = CATEGORIES[active];

  return (
    <section id="discover" className="relative bg-ink py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <SectionLabel>Discover</SectionLabel>
        <h2 className="mt-4 max-w-2xl text-balance font-display text-[clamp(2.4rem,5.5vw,4.5rem)] font-semibold leading-[1.02] tracking-tight text-bone">
          Find something worth showing up for.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:gap-6">
          <ul className="divide-y divide-line border-t border-line" role="list">
            {CATEGORIES.map((category, i) => {
              const Icon = category.icon;
              const isActive = i === active;
              return (
                <li key={category.key}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group flex w-full items-center justify-between gap-4 py-5 text-left"
                    aria-pressed={isActive}
                  >
                    <span className="flex items-center gap-4">
                      <Icon
                        size={18}
                        strokeWidth={1.5}
                        className={`transition-colors duration-300 ${isActive ? ACCENT_TEXT[category.accent] : "text-fog"}`}
                      />
                      <span
                        className={`font-display text-2xl font-semibold tracking-tight transition-colors duration-300 sm:text-3xl ${
                          isActive ? "text-bone" : "text-fog"
                        }`}
                      >
                        {category.label}
                      </span>
                    </span>
                    <motion.span
                      className="hidden max-w-[14rem] text-right text-sm text-mist sm:block"
                      animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 12 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      {category.description}
                    </motion.span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="h-[280px] lg:h-auto lg:min-h-[420px]">
            <CategoryScene category={activeCategory} dotCount={isMobile ? 14 : 26} />
          </div>
        </div>
      </div>
    </section>
  );
}
