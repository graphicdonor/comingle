interface SectionLabelProps {
  children: React.ReactNode;
  tone?: "bone" | "lime";
  className?: string;
}

export function SectionLabel({ children, tone = "bone", className = "" }: SectionLabelProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] ${
        tone === "lime" ? "text-lime" : "text-mist"
      } ${className}`}
    >
      <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
      {children}
    </span>
  );
}
