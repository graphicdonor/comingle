import { motion, useReducedMotion } from "framer-motion";
import { NetworkCanvas } from "@/components/shared/NetworkCanvas";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { useCountUp } from "@/hooks/useCountUp";
import { useInView } from "@/hooks/useInView";
import { IMPACT_STATS } from "@/data/content";

const EASE = [0.16, 1, 0.3, 1] as const;

function ImpactStat({ value, label, delay, inView }: { value: number; label: string; delay: number; inView: boolean }) {
  const display = useCountUp(value, inView, 2);
  return (
    <div className="relative">
      <motion.div
        className="h-px w-full origin-left bg-line"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, ease: EASE, delay }}
      />
      <motion.p
        className="mt-6 font-display text-[clamp(3rem,7vw,5.5rem)] font-semibold leading-none tracking-tight text-bone"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: EASE, delay: delay + 0.1 }}
      >
        {display.toLocaleString()}
      </motion.p>
      <motion.p
        className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mist"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: EASE, delay: delay + 0.3 }}
      >
        {label}
      </motion.p>
    </div>
  );
}

export function ImpactSection() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="impact" className="relative overflow-hidden bg-ink py-28 sm:py-36">
      <NetworkCanvas
        className="absolute inset-0 h-full w-full opacity-25"
        density={36}
        hubRatio={0.08}
        interactive={false}
        paused={!!prefersReducedMotion}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <SectionLabel>Impact</SectionLabel>
        <h2 className="mt-4 max-w-2xl text-balance font-display text-[clamp(2.4rem,5.5vw,4.5rem)] font-semibold leading-[1.02] tracking-tight text-bone">
          Your time becomes impact.
        </h2>

        <div ref={ref} className="mt-20 grid grid-cols-1 gap-14 sm:grid-cols-3 sm:gap-10">
          {IMPACT_STATS.map((stat, i) => (
            <ImpactStat key={stat.label} value={stat.value} label={stat.label} delay={i * 0.15} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
