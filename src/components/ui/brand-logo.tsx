import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showTagline?: boolean;
  withBackdrop?: boolean;
}

const sizeMap = {
  sm: { com: "text-2xl", ingle: "text-2xl", tagline: "text-xs" },
  md: { com: "text-4xl", ingle: "text-4xl", tagline: "text-sm" },
  lg: { com: "text-5xl", ingle: "text-5xl", tagline: "text-base" },
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
      <div className={cn("font-black tracking-tight leading-none", s.com)}>
        <span style={{ color: "#8B1A6B" }}>COM</span>
        <span
          style={{
            color: "#2A5C27",
            fontStyle: "italic",
            fontFamily: "'Georgia', serif",
            fontWeight: 700,
          }}
        >
          ingle
        </span>
      </div>
      {showTagline && (
        <span className={cn("font-medium mt-0.5", s.tagline)} style={{ color: "#2A5C27" }}>
          Uniting Communities
        </span>
      )}
    </div>
  );
}
