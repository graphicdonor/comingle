import { cn } from "@/lib/utils";

const SUB_TABS = [
  { href: "/services/matrimonial/invites", label: "Interests" },
  { href: "/services/matrimonial/chat", label: "Chats" },
];

// Plain <a> tags — see matrimonial-nav-tabs.tsx for why this section avoids
// next/link soft navigation.
export function ActivitiesSubTabs({ active }: { active: "invites" | "chat" }) {
  return (
    <div className="flex items-center gap-4 mb-4 border-b border-gray-100">
      {SUB_TABS.map((tab) => {
        const isActive = tab.href.endsWith(active);
        return (
          <a
            key={tab.href}
            href={tab.href}
            className={cn(
              "text-sm font-semibold pb-2.5 border-b-2 transition-colors",
              isActive ? "text-[#8B1A6B] border-[#8B1A6B]" : "text-gray-400 border-transparent hover:text-gray-600"
            )}
          >
            {tab.label}
          </a>
        );
      })}
    </div>
  );
}
