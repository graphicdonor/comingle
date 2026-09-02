import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { STEPS } from "@/data/content";

/** useTransform's input range is handed straight to the browser's Web
 * Animations API in this Framer Motion version, which throws (uncaught,
 * unmounting the whole tree — there's no error boundary) if an offset falls
 * outside [0,1] or the sequence isn't strictly increasing. Padding the first
 * step's range below 0 or the last step's above 1 does exactly that, so
 * every breakpoint gets clamped and de-duplicated before use. */
function clampBreakpoints(values: number[]): number[] {
  const clamped = values.map((v) => Math.min(1, Math.max(0, v)));
  for (let i = 1; i < clamped.length; i++) {
    if (clamped[i] <= clamped[i - 1]) clamped[i] = Math.min(1, clamped[i - 1] + 0.0001);
  }
  return clamped;
}

function StepItem({
  step,
  range,
  progress,
}: {
  step: (typeof STEPS)[number];
  range: [number, number];
  progress: MotionValue<number>;
}) {
  const opacityInput = clampBreakpoints([range[0] - 0.08, range[0], range[1], range[1] + 0.08]);
  const colorInput = clampBreakpoints([range[0] - 0.02, range[0]]);
  const opacity = useTransform(progress, opacityInput, [0.3, 1, 1, 0.3]);
  const numberColor = useTransform(progress, colorInput, ["#5c6167", "#c9ff4d"]);

  return (
    <motion.div style={{ opacity }} className="flex flex-1 flex-col gap-3 lg:items-center lg:text-center">
      <motion.span style={{ color: numberColor }} className="font-mono text-sm tracking-[0.1em]">
        {step.index}
      </motion.span>
      <h3 className="font-display text-2xl font-semibold tracking-tight text-bone sm:text-3xl">{step.title}</h3>
      <p className="max-w-[16rem] text-sm text-mist">{step.copy}</p>
    </motion.div>
  );
}

export function HowItWorks() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start start", "end end"] });

  const lineScale = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);
  const stepCount = STEPS.length;
  const ranges: [number, number][] = STEPS.map((_, i) => [i / stepCount, (i + 1) / stepCount]);

  return (
    <section id="how-it-works" ref={wrapperRef} className="relative h-[260vh] bg-ink">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center px-5 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-4 max-w-xl text-balance font-display text-[clamp(2.2rem,5vw,3.8rem)] font-semibold leading-[1.02] tracking-tight text-bone">
            Small steps, connected.
          </h2>

          <div className="relative mt-16 flex flex-col gap-10 lg:mt-24 lg:flex-row lg:gap-6">
            <div className="absolute left-[7px] top-0 h-full w-px bg-line lg:left-0 lg:top-[10px] lg:h-px lg:w-full">
              <motion.div
                className="h-full w-px origin-top bg-lime lg:h-px lg:w-full lg:origin-left"
                style={{ scaleY: lineScale, scaleX: lineScale }}
              />
            </div>

            {STEPS.map((step, i) => (
              <div key={step.index} className="pl-6 lg:pl-0">
                <StepItem step={step} range={ranges[i]} progress={scrollYProgress} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
