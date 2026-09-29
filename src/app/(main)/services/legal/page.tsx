import Link from "next/link";
import { Scale } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LegalListingCard } from "@/components/legal/legal-listing-card";
import { LEGAL_DISCLAIMER } from "@/lib/legal";
import type { LegalListing } from "@/lib/types";

export default async function LegalPage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("legal_listings")
    .select("*")
    .eq("moderation_status", "published")
    .order("created_at", { ascending: false });

  const published = (listings ?? []) as LegalListing[];

  return (
    <div>
      <div className="relative rounded-3xl overflow-hidden mb-5 p-6 text-center bg-gradient-to-br from-violet-500 via-purple-600 to-purple-700">
        <Scale className="w-6 h-6 text-white/90 mx-auto mb-2" />
        <h2 className="text-white font-bold text-lg">Offer legal help?</h2>
        <p className="text-white/85 text-xs mt-1 mb-4">List your legal practice or free legal aid for your community</p>
        <Link
          href="/services/legal/register"
          className="inline-block bg-white text-purple-700 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors"
        >
          List a Service
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {published.length} listing{published.length === 1 ? "" : "s"}
      </p>

      {published.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-gray-400">
          No legal services listed yet. Be the first to list one!
        </div>
      ) : (
        <div className="space-y-3">
          {published.map((listing) => (
            <LegalListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      <p className="mt-6 text-[11px] text-gray-400 text-center leading-relaxed">{LEGAL_DISCLAIMER}</p>
    </div>
  );
}
