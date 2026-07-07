import { Navbar } from "@/components/layout/navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-16 pb-24 min-h-screen bg-gray-50">
        <div className="max-w-xl mx-auto px-4 py-6">{children}</div>
      </main>
    </>
  );
}
