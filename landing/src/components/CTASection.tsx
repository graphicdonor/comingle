import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NetworkCanvas } from "@/components/shared/NetworkCanvas";
import { PillButton } from "@/components/shared/PillButton";
import { useInView } from "@/hooks/useInView";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CTASection() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <section id="join" ref={ref} className="relative flex h-[100svh] min-h-[600px] w-full items-center justify-center overflow-hidden bg-ink">
      <NetworkCanvas
        className="absolute inset-0 h-full w-full"
        density={isMobile ? 50 : 150}
        hubRatio={0.18}
        interactive={!isMobile}
        connectDistance={isMobile ? 120 : 190}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/70" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-24 text-center sm:pt-28">
        <motion.h2
          className="text-balance font-display text-[clamp(2.8rem,8vw,6.5rem)] font-semibold leading-[0.98] tracking-tight text-bone"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EASE }}
        >
          Your community
          <br />
          is waiting.
        </motion.h2>
        <motion.p
          className="mx-auto mt-6 max-w-sm text-lg text-mist"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        >
          Start with one small action.
        </motion.p>
        <motion.div
          className="mt-10 flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
        >
          <PillButton href="#top">
            Join the community <ArrowUpRight size={16} />
          </PillButton>
        </motion.div>
      </div>
    </section>
  );
}
