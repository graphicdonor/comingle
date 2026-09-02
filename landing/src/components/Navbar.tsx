import { AnimatePresence, motion, useMotionValueEvent, useScroll, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BRAND, NAV_LINKS } from "@/data/content";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Navbar() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (value) => {
    setSolid(value > 40);
  });

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
      >
        <div
          className="mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-full px-5 py-3 transition-[background-color,backdrop-filter,border-color] duration-500 sm:mt-4 sm:px-6"
          style={{
            backgroundColor: solid ? "rgba(10, 11, 13, 0.72)" : "rgba(10, 11, 13, 0)",
            backdropFilter: solid ? "blur(16px)" : "blur(0px)",
            border: solid ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0)",
          }}
        >
          <a href="#top" className="font-display text-sm font-semibold tracking-tight text-bone">
            {BRAND}
          </a>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-mist transition-colors hover:text-bone"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href="#join"
            className="hidden items-center gap-1.5 rounded-full bg-bone px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-lime md:inline-flex"
          >
            Join Community
          </a>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-bone md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-center bg-ink px-8 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.4, ease: EASE }}
          >
            <nav className="flex flex-col gap-6" aria-label="Mobile">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-display text-4xl font-semibold tracking-tight text-bone"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.06 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
            <motion.a
              href="#join"
              onClick={() => setMenuOpen(false)}
              className="mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-bone px-6 py-3 text-sm font-semibold text-ink"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
            >
              Join Community <ArrowUpRight size={16} />
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
