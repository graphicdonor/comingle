import Link from "next/link";
import { MapPin, IndianRupee, BedDouble } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { HousingListing } from "@/lib/types";

function formatPrice(listing: HousingListing) {
  if (!listing.price) return null;
  const amount = `₹${listing.price.toLocaleString("en-IN")}`;
  if (listing.listing_type === "For Rent") return `${amount}/${listing.rent_frequency === "Yearly" ? "yr" : "mo"}`;
  return amount;
}

export function HousingListingCard({ listing }: { listing: HousingListing }) {
  const location = [listing.city, listing.state].filter(Boolean).join(", ");
  const price = formatPrice(listing);
  const beds = listing.bedrooms ? `${listing.bedrooms} BHK` : null;

  return (
    <Link
      href={`/services/housing/${listing.id}`}
      className="bg-white rounded-2xl shadow-sm p-4 flex gap-3 hover:shadow-md transition-shadow"
    >
      <Avatar src={listing.photo_urls[0] ?? null} name={listing.title} size="lg" className="rounded-2xl" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 truncate">{listing.title}</p>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
              listing.listing_type === "For Rent" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
            }`}
          >
            {listing.listing_type}
          </span>
        </div>
        {listing.property_type && <p className="text-xs text-gray-500 truncate">{listing.property_type}</p>}
        {location && (
          <p className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        )}
        <div className="flex items-center gap-3 mt-1">
          {price && (
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <IndianRupee className="w-3 h-3 flex-shrink-0" />
              {price}
            </p>
          )}
          {beds && (
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <BedDouble className="w-3 h-3 flex-shrink-0" />
              {beds}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
