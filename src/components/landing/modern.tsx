"use client";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion, useScroll, useSpring } from "framer-motion";
import {
  Bell,
  Briefcase,
  CalendarDays,
  GraduationCap,
  HandHeart,
  Heart,
  Home,
  MapPin,
  Menu,
  Newspaper,
  PlusCircle,
  Scale,
  Search,
  Stethoscope,
  Store,
  Tag,
  User,
  type LucideIcon,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Thin brand-colored bar along the top edge that fills as you scroll. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-[#E8355A] via-[#C2185B] to-[#8B1A6B]"
      style={{ scaleX }}
    />
  );
}

/** An endlessly scrolling row of items (duplicated once so the loop is seamless). */
export function Marquee({ children, duration = 30, reverse = false }: { children: React.ReactNode; duration?: number; reverse?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <motion.div
        className="flex w-max gap-3"
        animate={reduce ? undefined : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        <div className="flex gap-3">{children}</div>
        <div className="flex gap-3" aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/** Counts from 0 up to `to` the first time it scrolls into view. */
export function CountUp({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, { duration: 1.4, ease: EASE, onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, to]);

  return (
    <span ref={ref}>
      {prefix}
      {reduce ? to : value}
      {suffix}
    </span>
  );
}

const MOCK_SERVICES: { icon: LucideIcon; label: string; bg: string; fg: string }[] = [
  { icon: Heart, label: "Matrimonial", bg: "bg-rose-100", fg: "text-rose-500" },
  { icon: Stethoscope, label: "Health", bg: "bg-emerald-100", fg: "text-emerald-600" },
  { icon: GraduationCap, label: "Education", bg: "bg-amber-100", fg: "text-amber-600" },
  { icon: Home, label: "Housing", bg: "bg-orange-100", fg: "text-orange-500" },
  { icon: Store, label: "Business", bg: "bg-indigo-100", fg: "text-indigo-500" },
  { icon: Scale, label: "Legal", bg: "bg-violet-100", fg: "text-violet-600" },
  { icon: Briefcase, label: "Jobs", bg: "bg-sky-100", fg: "text-sky-600" },
  { icon: CalendarDays, label: "Events", bg: "bg-lime-100", fg: "text-lime-700" },
];

const MOCK_TABS: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: Home, label: "Home", active: true },
  { icon: Newspaper, label: "Feed" },
  { icon: PlusCircle, label: "Post" },
  { icon: HandHeart, label: "Donate" },
  { icon: User, label: "Profile" },
];

/**
 * An illustrative, code-drawn version of the app's home screen for the hero
 * phone — mirrors the real layout (services grid, Upcoming events, bottom
 * bar with Post in the centre) without using any real member's data.
 */
export function AppMock() {
  const reduce = useReducedMotion();
  const item = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE, delay: 0.5 + i * 0.12 },
  });

  return (
    <div className="relative mx-auto w-full max-w-[270px] rounded-[2.4rem] border-[9px] border-[#1E2952] bg-[#1E2952] shadow-2xl shadow-[#8B1A6B]/25">
      <div className="overflow-hidden rounded-[1.8rem] bg-white text-[#201D1E]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-3.5 pt-3 pb-2 bg-gray-50">
          <Menu className="h-3.5 w-3.5 text-gray-500" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/wepray-logo.svg" alt="" className="h-3.5 w-auto" />
          <Bell className="h-3.5 w-3.5 text-gray-500" />
        </div>

        <div className="px-3 pt-2.5 pb-3 space-y-3">
          <motion.div {...item(0)} className="rounded-2xl bg-gradient-to-br from-[#ffe4f0] via-[#fff5f0] to-white p-2.5">
            <p className="text-[8px] text-gray-500">Hi, Priya</p>
            <p className="text-[10px] font-bold">You are welcome to WePray</p>
            <div className="mt-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[7px] text-gray-400">
              <Search className="h-2.5 w-2.5" /> Try searching Community services…
            </div>
          </motion.div>

          <motion.div {...item(1)}>
            <p className="text-[9px] font-bold mb-1.5">Community services</p>
            <div className="grid grid-cols-4 gap-x-1.5 gap-y-2">
              {MOCK_SERVICES.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-0.5">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.bg}`}>
                    <s.icon className={`h-3.5 w-3.5 ${s.fg}`} />
                  </span>
                  <span className="text-[6.5px] text-gray-500">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...item(2)}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[9px] font-bold">Upcoming events</p>
              <p className="text-[7px] font-semibold text-[#8B1A6B]">See all</p>
            </div>
            <div className="flex gap-2 overflow-hidden">
              {[
                { m: "NOV", d: "1", title: "Festival celebration", place: "Community hall", tag: "Religious · 6:30 PM", tone: "from-amber-300 via-orange-400 to-rose-500" },
                { m: "NOV", d: "15", title: "Charity day", place: "Online", tag: "Charity · 9:00 AM", tone: "from-emerald-300 via-teal-400 to-sky-500" },
              ].map((e) => (
                <div key={e.title} className="w-[150px] flex-shrink-0 overflow-hidden rounded-xl bg-gray-50">
                  <div className={`h-12 bg-gradient-to-br ${e.tone}`} />
                  <div className="flex p-1.5">
                    <div className="w-7 text-center text-[#8B1A6B]">
                      <p className="text-[6px] tracking-wider">{e.m}</p>
                      <p className="text-[13px] font-extrabold leading-none">{e.d}</p>
                    </div>
                    <div className="w-px bg-[#E5D3DF] mx-1" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-0.5 text-[6px] text-gray-400">
                        <MapPin className="h-2 w-2" /> {e.place}
                      </p>
                      <p className="text-[8px] font-extrabold truncate">{e.title}</p>
                      <p className="flex items-center gap-0.5 text-[6px] text-gray-500">
                        <Tag className="h-2 w-2" /> {e.tag}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...item(3)} className="rounded-xl bg-gradient-to-br from-[#E8355A] to-[#8B1A6B] p-2 text-white">
            <p className="flex items-center gap-1 text-[8px] font-bold">
              <HandHeart className="h-3 w-3" /> Give to your community
            </p>
            <p className="text-[6.5px] text-white/80 mt-0.5">Community fundraisers and 12 trusted platforms</p>
          </motion.div>
        </div>

        {/* Bottom bar — Post in the centre, as in the app */}
        <div className="flex border-t border-gray-100 bg-white">
          {MOCK_TABS.map((t) => (
            <div key={t.label} className="relative flex flex-1 flex-col items-center gap-0.5 pt-1.5 pb-2">
              {t.active && <span className="absolute top-0 h-[2px] w-5 bg-gray-900" />}
              <t.icon className={`h-3.5 w-3.5 ${t.active ? "text-gray-900" : "text-gray-400"}`} />
              <span className={`text-[6.5px] ${t.active ? "font-semibold text-gray-900" : "text-gray-400"}`}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Donation platform names drifting gently around a heart — the "Give with trust" graphic. */
export function PlatformCloud({ names }: { names: string[] }) {
  const reduce = useReducedMotion();
  // Two rings of chips spaced evenly around the heart (inner ring offset by
  // half a step so neighbours never line up), kept clear of the centre.
  const ringSize = Math.ceil(names.length / 2);
  const positions = names.map((_, i) => {
    const outer = i % 2 === 1;
    const step = (2 * Math.PI) / ringSize;
    const angle = Math.floor(i / 2) * step + (outer ? step / 2 : 0) - Math.PI / 2;
    const r = outer ? 45 : 36;
    // Rounded: Math.cos/sin can differ in the last digits between the server and
    // the browser, which would otherwise cause a hydration mismatch.
    return { left: `${(50 + r * Math.cos(angle)).toFixed(2)}%`, top: `${(50 + r * Math.sin(angle)).toFixed(2)}%` };
  });
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      <motion.div
        className="absolute inset-[34%] flex items-center justify-center rounded-full bg-gradient-to-br from-[#E8355A] to-[#8B1A6B] shadow-2xl shadow-[#E8355A]/30"
        animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <HandHeart className="h-1/3 w-1/3 text-white" />
      </motion.div>
      {!reduce && (
        <motion.div
          aria-hidden
          className="absolute inset-[27%] rounded-full border-2 border-dashed border-[#E8355A]/25"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
      )}
      {names.map((name, i) => (
        <motion.span
          key={name}
          style={positions[i]}
          className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-md shadow-[#8B1A6B]/10 border border-gray-100`}
          initial={reduce ? false : { opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          animate={reduce ? undefined : { y: [0, i % 2 ? -7 : 7, 0] }}
          transition={{
            opacity: { duration: 0.4, delay: i * 0.06 },
            scale: { duration: 0.4, delay: i * 0.06 },
            y: { duration: 3.5 + (i % 4) * 0.6, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {name}
        </motion.span>
      ))}
    </div>
  );
}

const AI_CHECKS = ["Words and tone", "Photos and video", "English, Hindi and Hinglish", "Community guidelines"];

/** Animated walk-through of the pre-publish AI moderation check: a sample
 * post is scanned, each check ticks off in turn, then it's approved. Loops
 * while in view; reduced-motion users see the finished state. */
export function AiModerationDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0); // 0 = scanning, 1..4 = checks done, 5 = approved

  useEffect(() => {
    if (reduce) { setStep(AI_CHECKS.length + 1); return; }
    if (!inView) return;
    const id = setInterval(() => setStep((s) => (s >= AI_CHECKS.length + 3 ? 0 : s + 1)), 700);
    return () => clearInterval(id);
  }, [inView, reduce]);

  const shown = Math.min(step, AI_CHECKS.length + 1);
  const approved = shown > AI_CHECKS.length;

  return (
    <div ref={ref} className="relative rounded-3xl bg-white shadow-xl shadow-[#8B1A6B]/10 ring-1 ring-[#8B1A6B]/10 p-5 sm:p-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8B1A6B]">
        <span className="inline-flex h-6 items-center rounded-full bg-[#8B1A6B]/10 px-2.5">AI safety check</span>
        <span className="text-gray-400 normal-case tracking-normal font-medium">runs before anyone sees your post</span>
      </div>

      {/* Sample post being scanned */}
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-900">Diwali celebration this Sunday 🪔</p>
        <p className="mt-1 text-sm text-gray-600">Sabhi families welcome hain! Sweets, prayers and a little music at the community hall.</p>
        <div className="mt-3 h-20 rounded-xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400" />
        {!approved && !reduce && (
          <motion.div
            aria-hidden
            className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-[#8B1A6B]/15 to-transparent"
            initial={{ top: "-20%" }}
            animate={{ top: ["-20%", "100%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      <ul className="mt-4 space-y-2">
        {AI_CHECKS.map((label, i) => {
          const done = shown > i;
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold transition-colors duration-300 ${
                  done ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-300"
                }`}
              >
                ✓
              </span>
              <span className={`transition-colors duration-300 ${done ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
            </li>
          );
        })}
      </ul>

      <div
        className={`mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-500 ${
          approved ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-400"
        }`}
        aria-live="polite"
      >
        {approved ? "Approved: now visible to your community" : "Checking…"}
      </div>
      <p className="mt-3 text-xs text-gray-400">
        Anything unclear is held for a person to review. Anything harmful is stopped, and you can appeal.
      </p>
    </div>
  );
}
