import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PillButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "outline";
  className?: string;
}

export function PillButton({ children, href, onClick, variant = "solid", className = "" }: PillButtonProps) {
  const base =
    "group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-300";
  const styles =
    variant === "solid"
      ? "bg-bone text-ink hover:bg-lime"
      : "border border-line text-bone hover:border-bone/60 bg-white/[0.02] backdrop-blur-sm";

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`${base} ${styles} ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  );
}
