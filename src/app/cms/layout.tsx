import type { Metadata } from "next";
import { CmsShell } from "@/components/cms/cms-shell";

export const metadata: Metadata = {
  title: "CMS · WePray",
  robots: { index: false, follow: false },
};

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F2E8] text-[#2A1A1C]">
      <CmsShell>{children}</CmsShell>
    </div>
  );
}
