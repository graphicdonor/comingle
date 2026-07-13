import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { BusinessListing } from "@/lib/types";

export function BusinessListingCard({ listing }: { listing: BusinessListing }) {
  const location = [listing.area, listing.city].filter(Boolean).join(", ");

  return (
    <Link
      href={`/services/businesses/${listing.id}`}
      className="bg-white rounded-2xl shadow-sm p-4 flex gap-3 hover:shadow-md transition-shadow"
    >
      <Avatar src={listing.photo_urls[0] ?? null} name={listing.name} size="lg" className="rounded-2xl" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{listing.name}</p>
        {listing.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {listing.categories.slice(0, 2).map((cat) => (
              <span key={cat} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {cat}
              </span>
            ))}
          </div>
        )}
        {location && (
          <p className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        )}
        {listing.mobile_number && (
          <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <Phone className="w-3 h-3 flex-shrink-0" />
            {listing.mobile_number}
          </p>
        )}
        {listing.open_days.length > 0 && (
          <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <Clock className="w-3 h-3 flex-shrink-0" />
            {listing.open_days.join(", ")}
            {listing.open_time && listing.close_time ? ` · ${listing.open_time.slice(0, 5)}–${listing.close_time.slice(0, 5)}` : ""}
          </p>
        )}
      </div>
    </Link>
  );
}
