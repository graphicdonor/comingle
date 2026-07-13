import Link from "next/link";
import { Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BusinessListingCard } from "@/components/business/business-listing-card";
import type { BusinessListing } from "@/lib/types";

export default async function BusinessesPage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("business_listings")
    .select("*")
    .eq("moderation_status", "published")
    .order("created_at", { ascending: false });

  const published = (listings ?? []) as BusinessListing[];

  return (
    <div>
      <div className="relative rounded-3xl overflow-hidden mb-5 p-6 text-center bg-gradient-to-br from-blue-500 via-indigo-500 to-indigo-700">
        <Store className="w-6 h-6 text-white/90 mx-auto mb-2" />
        <h2 className="text-white font-bold text-lg">Own a business?</h2>
        <p className="text-white/85 text-xs mt-1 mb-4">Register it so nearby members can find you</p>
        <Link
          href="/services/businesses/register"
          className="inline-block bg-white text-indigo-700 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors"
        >
          Register your Business
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {published.length} business{published.length === 1 ? "" : "es"} listed
      </p>

      {published.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-gray-400">
          No businesses listed yet. Be the first to register yours!
        </div>
      ) : (
        <div className="space-y-3">
          {published.map((listing) => (
            <BusinessListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
