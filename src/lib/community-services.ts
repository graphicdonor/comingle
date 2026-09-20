import { Heart, Stethoscope, GraduationCap, Home, Store, Scale, Briefcase, PartyPopper, type LucideIcon } from "lucide-react";

export interface CommunityService {
  icon: LucideIcon;
  label: string;
  href: string;
  color: string;
}

export const COMMUNITY_SERVICES: CommunityService[] = [
  { icon: Heart, label: "Matrimonial", href: "/services/matrimonial", color: "from-pink-100 to-rose-100" },
  { icon: Stethoscope, label: "Health Care", href: "/services/health", color: "from-green-100 to-teal-100" },
  { icon: GraduationCap, label: "Education", href: "/services/education", color: "from-yellow-100 to-amber-100" },
  { icon: Home, label: "Housing", href: "/services/housing", color: "from-orange-100 to-red-100" },
  { icon: Store, label: "Businesses", href: "/services/businesses", color: "from-blue-100 to-indigo-100" },
  { icon: Scale, label: "Legal Aid", href: "/services/legal", color: "from-purple-100 to-violet-100" },
  { icon: Briefcase, label: "Jobs", href: "/services/jobs", color: "from-cyan-100 to-sky-100" },
  { icon: PartyPopper, label: "Events", href: "/services/events", color: "from-lime-100 to-green-100" },
];
