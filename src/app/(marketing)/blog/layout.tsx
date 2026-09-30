import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Header and footer for /blog, matching the landing page's. */
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#201D1E]">
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/" aria-label="WePray home" className="flex-shrink-0">
              <img src="/wepray-logo.svg" alt="WePray" className="h-7 w-auto" />
            </Link>
            <Link href="/blog" className="text-sm font-semibold text-gray-500 hover:text-[#8B1A6B]">Blog</Link>
          </div>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#8B1A6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#741458] transition-colors"
          >
            Open the app <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-gray-100 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <img src="/wepray-logo.svg" alt="WePray" className="h-6 w-auto" />
          <nav className="flex flex-wrap justify-center gap-6">
            <Link href="/" className="hover:text-[#8B1A6B]">Home</Link>
            <Link href="/blog" className="hover:text-[#8B1A6B]">Blog</Link>
            <Link href="/app" className="hover:text-[#8B1A6B]">Open the app</Link>
            <Link href="/survey" className="hover:text-[#8B1A6B]">Share feedback</Link>
            <Link href="/contact" className="hover:text-[#8B1A6B]">Contact</Link>
            <Link href="/privacy" className="hover:text-[#8B1A6B]">Privacy</Link>
          </nav>
          <p>© {new Date().getFullYear()} WePray</p>
        </div>
      </footer>
    </div>
  );
}
