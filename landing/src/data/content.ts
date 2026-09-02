import {
  BookOpen,
  Coins,
  HandHeart,
  HeartPulse,
  Leaf,
  MapPin,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

export const BRAND = "Nearby";

export const NAV_LINKS = [
  { label: "Discover", href: "#discover" },
  { label: "Communities", href: "#live" },
  { label: "Events", href: "#how-it-works" },
  { label: "Impact", href: "#impact" },
];

export const HERO_METRICS = [
  { label: "ACTIVE MEMBERS", value: 1284 },
  { label: "COMMUNITY PROJECTS", value: 48 },
  { label: "VOLUNTEERS TODAY", value: 126 },
  { label: "EVENTS THIS WEEK", value: 32 },
];

export interface Category {
  key: string;
  label: string;
  icon: LucideIcon;
  description: string;
  accent: "lime" | "green" | "cyan";
}

export const CATEGORIES: Category[] = [
  { key: "volunteer", label: "Volunteer", icon: HandHeart, description: "Give a few hours where they're needed most.", accent: "lime" },
  { key: "events", label: "Events", icon: Sparkles, description: "Local gatherings built around a shared cause.", accent: "cyan" },
  { key: "environment", label: "Environment", icon: Leaf, description: "Clean-ups, gardens, and neighborhood green space.", accent: "green" },
  { key: "education", label: "Education", icon: BookOpen, description: "Mentoring, tutoring, and shared skills.", accent: "cyan" },
  { key: "health", label: "Health", icon: HeartPulse, description: "Support for wellbeing, close to home.", accent: "lime" },
  { key: "local-support", label: "Local Support", icon: MapPin, description: "Everyday help for neighbors who need it.", accent: "green" },
  { key: "skills", label: "Skills", icon: Users, description: "Teach something. Learn something. Trade time.", accent: "cyan" },
  { key: "donation", label: "Donation", icon: Coins, description: "Resources that go directly to your community.", accent: "lime" },
];

export const LIVE_METRICS = [
  { label: "VOLUNTEER OPPORTUNITIES", value: 12 },
  { label: "EVENTS TODAY", value: 7 },
  { label: "PEOPLE HELPING", value: 23 },
];

export interface ImpactStat {
  value: number;
  label: string;
  suffix?: string;
}

export const IMPACT_STATS: ImpactStat[] = [
  { value: 12840, label: "HOURS GIVEN" },
  { value: 3420, label: "PEOPLE HELPED" },
  { value: 684, label: "PROJECTS COMPLETED" },
];

export interface Story {
  name: string;
  location: string;
  quote: string;
  action: string;
  palette: [string, string];
}

export const STORIES: Story[] = [
  {
    name: "Maya R.",
    location: "Portside District",
    quote: "An hour of my time turned into a week of meals for families nearby.",
    action: "Community kitchen volunteer",
    palette: ["#c9ff4d", "#101214"],
  },
  {
    name: "Daniel O.",
    location: "Elm Grove",
    quote: "I taught one kid to read. Now I run a Saturday class for twelve.",
    action: "Literacy mentor",
    palette: ["#6fe3ff", "#101214"],
  },
  {
    name: "Priya K.",
    location: "Northbank",
    quote: "We turned an empty lot into a garden the whole block shows up for.",
    action: "Neighborhood garden lead",
    palette: ["#8ef0b0", "#101214"],
  },
];

export const STEPS = [
  { index: "01", title: "Discover", copy: "Find causes, events, and people around you." },
  { index: "02", title: "Join", copy: "Choose something meaningful and get involved." },
  { index: "03", title: "Contribute", copy: "Give your time, skills, resources, or support." },
  { index: "04", title: "Impact", copy: "See the difference your contribution creates." },
];

export const FOOTER_LINKS = {
  Explore: [
    { label: "Discover", href: "#discover" },
    { label: "Communities", href: "#live" },
    { label: "Events", href: "#how-it-works" },
    { label: "Impact", href: "#impact" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};
