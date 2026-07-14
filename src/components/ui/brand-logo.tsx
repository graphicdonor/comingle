import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showTagline?: boolean;
  withBackdrop?: boolean;
}

// The logo file is 839×205 (~4.09:1) — widths below keep that ratio rather
// than fixing a height, so the mark never looks squashed or stretched.
const sizeMap = {
  sm: { width: 132, tagline: "text-xs" },
  md: { width: 176, tagline: "text-sm" },
  lg: { width: 224, tagline: "text-base" },
};

export function BrandLogo({ size = "md", className, showTagline = true, withBackdrop = false }: BrandLogoProps) {
  const s = sizeMap[size];
  return (
    <div
      className={cn(
        "flex flex-col items-center",
        // Auth screens render this directly on the community illustration
        // background — a translucent backdrop keeps the wordmark legible
        // over busy artwork instead of fighting it with a page-wide scrim.
        withBackdrop && "bg-white/75 backdrop-blur-md rounded-3xl px-6 py-3 shadow-sm",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/comingle-logo.svg" alt="Comingle" width={s.width} height={Math.round((s.width * 205) / 839)} />
      {showTagline && (
        <span className={cn("font-medium mt-0.5", s.tagline)} style={{ color: "#2A5C27" }}>
          Uniting Communities
        </span>
      )}
    </div>
  );
}
