"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Briefcase, CalendarDays, GraduationCap, Heart, Home, MessageCircle, Store, type LucideIcon } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Soft brand-colored blobs drifting behind the hero. Purely decorative. */
export function HeroBlobs() {
  const reduce = useReducedMotion();
  const blobs = [
    { className: "left-[-10%] top-[-20%] h-[28rem] w-[28rem] bg-[#F7A8C8]/40", x: [0, 40, 0], y: [0, 30, 0], duration: 16 },
    { className: "right-[-8%] top-[10%] h-[24rem] w-[24rem] bg-[#8B1A6B]/15", x: [0, -30, 0], y: [0, 40, 0], duration: 19 },
    { className: "left-[30%] bottom-[-25%] h-[22rem] w-[22rem] bg-[#FFD3B5]/50", x: [0, 30, 0], y: [0, -25, 0], duration: 22 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${b.className}`}
          animate={reduce ? undefined : { x: b.x, y: b.y }}
          transition={{ duration: b.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

const ORBIT: { icon: LucideIcon; label: string; className: string; tint: string; delay: number }[] = [
  { icon: Heart, label: "Matrimonial", className: "left-[-6%] top-[12%]", tint: "bg-rose-100 text-rose-500", delay: 0 },
  { icon: Briefcase, label: "Jobs", className: "right-[-8%] top-[6%]", tint: "bg-sky-100 text-sky-600", delay: 0.6 },
  { icon: CalendarDays, label: "Events", className: "left-[-10%] top-[46%]", tint: "bg-lime-100 text-lime-700", delay: 1.2 },
  { icon: Store, label: "Businesses", className: "right-[-10%] top-[40%]", tint: "bg-indigo-100 text-indigo-500", delay: 0.3 },
  { icon: Home, label: "Housing", className: "left-[-4%] bottom-[10%]", tint: "bg-orange-100 text-orange-500", delay: 0.9 },
  { icon: GraduationCap, label: "Education", className: "right-[-5%] bottom-[16%]", tint: "bg-amber-100 text-amber-600", delay: 1.5 },
];

/** The hero phone, floating gently, with community-service chips bobbing
 * around it and a "new reply" bubble popping in. */
export function HeroPhone({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto w-full max-w-[340px] py-6">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 40, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      </motion.div>

      {ORBIT.map((o) => (
        <motion.div
          key={o.label}
          aria-hidden
          className={`absolute ${o.className} hidden sm:flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2 shadow-lg shadow-[#8B1A6B]/10 border border-white`}
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { duration: 0.5, delay: 0.6 + o.delay * 0.4 },
            scale: { duration: 0.5, ease: EASE, delay: 0.6 + o.delay * 0.4 },
            y: { duration: 4 + o.delay, repeat: Infinity, ease: "easeInOut", delay: o.delay },
          }}
        >
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${o.tint}`}>
            <o.icon className="h-4 w-4" />
          </span>
          <span className="text-xs font-semibold text-gray-700">{o.label}</span>
        </motion.div>
      ))}

      <motion.div
        aria-hidden
        className="absolute left-1/2 top-[58%] -translate-x-1/2 flex items-center gap-2 rounded-full bg-[#1E2952] px-3.5 py-2 text-xs font-semibold text-white shadow-xl"
        initial={reduce ? false : { opacity: 0, y: 16, scale: 0.9 }}
        animate={reduce ? { opacity: 1 } : { opacity: [0, 1, 1, 0], y: [16, 0, 0, -8], scale: [0.9, 1, 1, 0.96] }}
        transition={reduce ? undefined : { duration: 5, times: [0, 0.12, 0.8, 1], repeat: Infinity, repeatDelay: 1.5, delay: 2 }}
      >
        <MessageCircle className="h-3.5 w-3.5 text-[#F7A8C8]" /> New reply in your community
      </motion.div>
    </div>
  );
}

/** A small "live" pulse dot. */
export function PulseDot() {
  const reduce = useReducedMotion();
  return (
    <span className="relative flex h-2 w-2">
      {!reduce && <motion.span className="absolute inline-flex h-full w-full rounded-full bg-[#E8355A]" animate={{ scale: [1, 2.2], opacity: [0.6, 0] }} transition={{ duration: 1.6, repeat: Infinity }} />}
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E8355A]" />
    </span>
  );
}
