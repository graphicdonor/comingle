import Link from "next/link";
import { MapPin, IndianRupee, GraduationCap, Video } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { EducationListing } from "@/lib/types";

function formatFee(listing: EducationListing) {
  if (!listing.fee) return null;
  const amount = `₹${listing.fee.toLocaleString("en-IN")}`;
  return listing.fee_period ? `${amount} / ${listing.fee_period.toLowerCase()}` : amount;
}

export function EducationListingCard({ listing }: { listing: EducationListing }) {
  const location = listing.mode === "Online" ? "Online" : [listing.city, listing.state].filter(Boolean).join(", ");
  const fee = formatFee(listing);

  return (
    <Link
      href={`/services/education/${listing.id}`}
      className="bg-white rounded-2xl shadow-sm p-4 flex gap-3 hover:shadow-md transition-shadow"
    >
      <Avatar src={listing.photo_urls[0] ?? null} name={listing.title} size="lg" className="rounded-2xl" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 truncate">{listing.title}</p>
          {listing.service_type && (
            <span className="text-[10px] font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex-shrink-0">
              {listing.service_type}
            </span>
          )}
        </div>
        {listing.provider_name && <p className="text-xs text-gray-500 truncate">{listing.provider_name}</p>}
        {listing.subject && <p className="text-xs text-gray-400 mt-0.5">{listing.subject}</p>}
        {location && (
          <p className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
            {listing.mode === "Online" ? <Video className="w-3 h-3 flex-shrink-0" /> : <MapPin className="w-3 h-3 flex-shrink-0" />}
            <span className="truncate">{location}</span>
          </p>
        )}
        <div className="flex items-center gap-3 mt-1">
          {fee && (
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <IndianRupee className="w-3 h-3 flex-shrink-0" />
              {fee}
            </p>
          )}
          {listing.level && (
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <GraduationCap className="w-3 h-3 flex-shrink-0" />
              {listing.level}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
