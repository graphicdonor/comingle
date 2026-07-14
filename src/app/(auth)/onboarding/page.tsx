import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  return (
    // Fixed to the viewport (rather than flowing inside the parent layout's
    // centered flex box) so the card below can be pinned flush to the
    // bottom edge of the screen instead of just centering as a block with
    // the parent — which left a growing gap under the card on taller
    // screens.
    <div className="fixed inset-0 flex flex-col items-center px-4">
      <div className="flex-1 w-full max-w-sm flex items-center justify-center min-h-0">
        <BrandLogo size="lg" withBackdrop />
      </div>

      {/* Bottom sheet style card */}
      <div className="w-full max-w-sm bg-white rounded-t-3xl shadow-xl pt-3 pb-8 px-6 relative">
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
          Connect with your<br />community
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Join communities that matter to you — from spiritual groups to neighbourhood networks.
        </p>
        <div className="flex gap-3">
          <Link
            href="/signup"
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 select-none w-full px-8 py-4 text-base",
              "bg-[#1E2952] text-white hover:bg-[#16203D] active:scale-[0.98] shadow-sm"
            )}
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 select-none w-full px-8 py-4 text-base",
              "bg-transparent text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-50 active:scale-[0.98]"
            )}
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
