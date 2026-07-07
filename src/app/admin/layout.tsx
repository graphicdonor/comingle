import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = { title: "Admin Panel" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F1117] text-white">
      <AdminNav />
      <main className="pt-14 max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
