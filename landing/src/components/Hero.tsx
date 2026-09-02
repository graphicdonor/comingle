import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useRef } from "react";
import { NetworkCanvas } from "@/components/shared/NetworkCanvas";
import { PillButton } from "@/components/shared/PillButton";
import { useCountUp } from "@/hooks/useCountUp";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { HERO_METRICS } from "@/data/content";

const EASE = [0.16, 1, 0.3, 1] as const;

const HEADLINE_LINES = ["Together,", "we make", "a difference."];

function MetricChip({ label, value, delay, className }: { label: string; value: number; delay: number; className: string }) {
  const display = useCountUp(value, true, 1.6 + delay);
  return (
    <motion.div
      className={`absolute hidden flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-mist sm:flex ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 1.6 + delay }}
    >
      <span className="text-base font-semibold tracking-normal text-bone">{display.toLocaleString()}</span>
      <span>{label}</span>
    </motion.div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const networkY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentBlur = useTransform(scrollYProgress, [0, 0.7], [0, 8]);
  const contentFilter = useTransform(contentBlur, (v) => `blur(${v}px)`);

  return (
    <section id="top" ref={sectionRef} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink">
      <motion.div
        className="absolute inset-0"
        style={{ y: networkY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: EASE }}
      >
        <NetworkCanvas
          className="h-full w-full"
          density={isMobile ? 34 : 100}
          hubRatio={0.14}
          interactive={!isMobile}
          connectDistance={isMobile ? 110 : 160}
        />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-ink/40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />

      <motion.div className="relative z-10 flex h-full flex-col justify-between px-5 pb-8 pt-28 sm:px-8 sm:pb-10 sm:pt-32 lg:px-12" style={{ opacity: contentOpacity, filter: contentFilter }}>
        <div className="flex items-start justify-between">
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-mist backdrop-blur-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-lime"
              animate={prefersReducedMotion ? {} : { opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            Community Live
          </motion.div>

          <MetricChip label="Active Members" value={HERO_METRICS[0].value} delay={0.1} className="right-0 top-0 items-end text-right" />
        </div>

        <div className="relative">
          <MetricChip label="Community Projects" value={HERO_METRICS[1].value} delay={0.2} className="-top-24 right-0 items-end text-right lg:right-4" />
          <MetricChip label="Volunteers Today" value={HERO_METRICS[2].value} delay={0.3} className="-top-44 right-0 items-end text-right lg:right-24" />

          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-lime">
            Community Network · Live
          </p>

          <h1 className="mt-4 font-display text-[clamp(3.2rem,10vw,8.5rem)] font-semibold leading-[0.95] tracking-tight text-bone">
            {HEADLINE_LINES.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className={`inline-block ${i === 2 ? "text-lime" : ""}`}
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, ease: EASE, delay: 0.15 * i + 0.1 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="mt-6 max-w-md text-balance text-base text-mist sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.7 }}
          >
            Find meaningful ways to help, connect with people around you, and turn small actions into lasting community impact.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.9 }}
          >
            <PillButton href="#discover">Explore the community</PillButton>
            <PillButton href="#how-it-works" variant="outline">
              See how it works <ArrowUpRight size={15} />
            </PillButton>
          </motion.div>

          <MetricChip label="Events This Week" value={HERO_METRICS[3].value} delay={0.4} className="left-0 top-full mt-6 hidden lg:flex" />
        </div>

        <motion.div
          className="flex items-center gap-2 self-center font-mono text-[10px] uppercase tracking-[0.2em] text-mist"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          Scroll to explore
          <motion.span
            animate={prefersReducedMotion ? {} : { y: [0, 4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={14} />
          </motion.span>
        </motion.div>
      </motion.div>
    </section>
  );
}
