import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HealthListingCard } from "@/components/health/health-listing-card";
import { HEALTH_DISCLAIMER } from "@/lib/health";
import type { HealthListing } from "@/lib/types";

export default async function HealthPage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("health_listings")
    .select("*")
    .eq("moderation_status", "published")
    .order("created_at", { ascending: false });

  const published = (listings ?? []) as HealthListing[];

  return (
    <div>
      <div className="relative rounded-3xl overflow-hidden mb-5 p-6 text-center bg-gradient-to-br from-emerald-500 via-teal-500 to-teal-600">
        <Stethoscope className="w-6 h-6 text-white/90 mx-auto mb-2" />
        <h2 className="text-white font-bold text-lg">Offer health services?</h2>
        <p className="text-white/85 text-xs mt-1 mb-4">List your clinic, practice, or health service for your community</p>
        <Link
          href="/services/health/register"
          className="inline-block bg-white text-teal-700 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors"
        >
          List a Service
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {published.length} listing{published.length === 1 ? "" : "s"}
      </p>

      {published.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-gray-400">
          No health services listed yet. Be the first to list one!
        </div>
      ) : (
        <div className="space-y-3">
          {published.map((listing) => (
            <HealthListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      <p className="mt-6 text-[11px] text-gray-400 text-center leading-relaxed">{HEALTH_DISCLAIMER}</p>
    </div>
  );
}
