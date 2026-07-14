import Link from "next/link";
import { MapPin, Briefcase, IndianRupee } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { JobListing } from "@/lib/types";

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => n.toLocaleString("en-IN");
  if (min && max) return `₹${fmt(min)} – ₹${fmt(max)}/mo`;
  return `₹${fmt((min ?? max)!)}/mo`;
}

export function JobListingCard({ listing }: { listing: JobListing }) {
  const location = listing.is_remote ? "Remote" : [listing.city, listing.state].filter(Boolean).join(", ");
  const salary = formatSalary(listing.salary_min, listing.salary_max);

  return (
    <Link
      href={`/services/jobs/${listing.id}`}
      className="bg-white rounded-2xl shadow-sm p-4 flex gap-3 hover:shadow-md transition-shadow"
    >
      <Avatar src={listing.photo_urls[0] ?? null} name={listing.company_name || listing.title} size="lg" className="rounded-2xl" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{listing.title}</p>
        {listing.company_name && <p className="text-xs text-gray-500 truncate">{listing.company_name}</p>}
        <div className="flex flex-wrap gap-1 mt-1">
          {listing.job_type && (
            <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{listing.job_type}</span>
          )}
          {listing.categories.slice(0, 2).map((cat) => (
            <span key={cat} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {cat}
            </span>
          ))}
        </div>
        {location && (
          <p className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        )}
        {salary && (
          <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <IndianRupee className="w-3 h-3 flex-shrink-0" />
            {salary}
          </p>
        )}
        {!listing.company_name && !location && !salary && (
          <p className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
            <Briefcase className="w-3 h-3 flex-shrink-0" />
            {listing.job_type || "Opening"}
          </p>
        )}
      </div>
    </Link>
  );
}
