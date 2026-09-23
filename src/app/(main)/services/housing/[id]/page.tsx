import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HousingPhoto } from "@/components/housing/housing-photo";
import { HousingListingFields } from "@/components/housing/housing-listing-fields";
import type { HousingListing } from "@/lib/types";

export default async function HousingListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase.from("housing_listings").select("*").eq("id", id).maybeSingle();

  // RLS already enforces visibility (published listings are public, pending/
  // blocked ones only to their owner), so a missing row here means either it
  // doesn't exist or the viewer isn't eligible to see it — both render as 404.
  if (!data) notFound();

  const listing = data as HousingListing;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/services/housing" className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900 truncate">{listing.title}</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden p-4">
        <HousingPhoto photos={listing.photo_urls} name={listing.title} />

        <div className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900">{listing.title}</h2>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                listing.listing_type === "For Rent" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
              }`}
            >
              {listing.listing_type}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {listing.property_type && (
              <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{listing.property_type}</span>
            )}
            {listing.amenities.map((a) => (
              <span key={a} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                {a}
              </span>
            ))}
          </div>
          {listing.moderation_status !== "published" && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-3">
              {listing.moderation_status === "pending_review"
                ? "This listing is awaiting review — only you can see it right now."
                : "This listing didn't pass review and isn't visible to others."}
            </p>
          )}
        </div>

        <div className="mt-4">
          <HousingListingFields listing={listing} />
        </div>
      </div>
    </div>
  );
}
