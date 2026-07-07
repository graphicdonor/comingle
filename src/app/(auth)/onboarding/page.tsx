import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  return (
    <div className="w-full max-w-sm flex flex-col items-center">
      <BrandLogo size="lg" className="mb-8" />

      {/* Illustration placeholder — replace with your actual SVG/image */}
      <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-pink-50 via-purple-50 to-green-50 flex items-center justify-center mb-0 overflow-hidden shadow-sm border border-gray-100">
        <svg viewBox="0 0 200 200" className="w-56 h-56" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Simplified community illustration */}
          <circle cx="100" cy="70" r="22" fill="#8B1A6B" opacity="0.8"/>
          <circle cx="55"  cy="90" r="17" fill="#E8355A" opacity="0.7"/>
          <circle cx="145" cy="90" r="17" fill="#2A5C27" opacity="0.7"/>
          <circle cx="75"  cy="115" r="15" fill="#F59E0B" opacity="0.7"/>
          <circle cx="125" cy="115" r="15" fill="#6366F1" opacity="0.7"/>
          <circle cx="35"  cy="120" r="13" fill="#EC4899" opacity="0.6"/>
          <circle cx="165" cy="120" r="13" fill="#14B8A6" opacity="0.6"/>
          <circle cx="100" cy="130" r="14" fill="#F97316" opacity="0.6"/>
          {/* Hearts */}
          <text x="88" y="50" fontSize="16" opacity="0.7">💜</text>
          <text x="108" y="50" fontSize="14" opacity="0.7">💙</text>
          <text x="55" y="75" fontSize="12" opacity="0.6">💚</text>
          {/* People icons */}
          <circle cx="100" cy="68" r="10" fill="#fff" opacity="0.3"/>
          <circle cx="55" cy="88" r="8" fill="#fff" opacity="0.3"/>
          <circle cx="145" cy="88" r="8" fill="#fff" opacity="0.3"/>
          {/* Ground / plants */}
          <ellipse cx="100" cy="155" rx="65" ry="12" fill="#2A5C27" opacity="0.15"/>
          <rect x="85" y="140" width="6" height="20" rx="3" fill="#2A5C27" opacity="0.5"/>
          <rect x="109" y="143" width="6" height="17" rx="3" fill="#2A5C27" opacity="0.5"/>
        </svg>
      </div>

      {/* Bottom sheet style card */}
      <div className="w-full bg-white rounded-t-3xl shadow-xl pt-3 pb-8 px-6 mt-auto -mb-4 relative">
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
          Connect with your<br />community
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Join communities that matter to you — from spiritual groups to neighbourhood networks.
        </p>
        <div className="flex gap-3">
          <Button variant="dark" size="lg" fullWidth>
            <Link href="/signup" className="w-full">Sign up</Link>
          </Button>
          <Button variant="ghost" size="lg" fullWidth>
            <Link href="/login" className="w-full">Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
