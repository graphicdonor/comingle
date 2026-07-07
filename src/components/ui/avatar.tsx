import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

const colorMap = ["bg-[#8B1A6B]", "bg-[#1E2952]", "bg-[#E8355A]", "bg-[#2A5C27]", "bg-orange-500", "bg-teal-600"];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colorMap[Math.abs(hash) % colorMap.length];
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizeClass = sizeMap[size];
  const color = getColor(name);

  if (src) {
    return (
      <div className={cn("relative rounded-full overflow-hidden flex-shrink-0", sizeClass, className)}>
        <Image src={src} alt={name} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div className={cn("rounded-full flex items-center justify-center font-bold text-white flex-shrink-0", sizeClass, color, className)}>
      {getInitials(name)}
    </div>
  );
}
