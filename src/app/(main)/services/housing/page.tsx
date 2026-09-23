import Link from "next/link";
import { Home } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HousingListingCard } from "@/components/housing/housing-listing-card";
import type { HousingListing } from "@/lib/types";

export default async function HousingPage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("housing_listings")
    .select("*")
    .eq("moderation_status", "published")
    .order("created_at", { ascending: false });

  const published = (listings ?? []) as HousingListing[];

  return (
    <div>
      <div className="relative rounded-3xl overflow-hidden mb-5 p-6 text-center bg-gradient-to-br from-orange-500 via-amber-500 to-red-600">
        <Home className="w-6 h-6 text-white/90 mx-auto mb-2" />
        <h2 className="text-white font-bold text-lg">Got a property?</h2>
        <p className="text-white/85 text-xs mt-1 mb-4">List it for sale or rent with your community</p>
        <Link
          href="/services/housing/register"
          className="inline-block bg-white text-orange-700 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors"
        >
          Post a Property
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {published.length} propert{published.length === 1 ? "y" : "ies"} listed
      </p>

      {published.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-gray-400">
          No properties listed yet. Be the first to post one!
        </div>
      ) : (
        <div className="space-y-3">
          {published.map((listing) => (
            <HousingListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
