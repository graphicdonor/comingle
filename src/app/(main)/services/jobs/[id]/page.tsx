import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { JobPhotoCarousel } from "@/components/job/job-photo-carousel";
import { JobListingFields } from "@/components/job/job-listing-fields";
import { JobListingOwnerActions } from "@/components/job/job-listing-owner-actions";
import type { JobListing } from "@/lib/types";

export default async function JobListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data }, { data: { user } }] = await Promise.all([
    supabase.from("job_listings").select("*").eq("id", id).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  // RLS already enforces visibility (published listings are public, pending/
  // blocked ones only to their owner), so a missing row here means either it
  // doesn't exist or the viewer isn't eligible to see it — both render as 404.
  if (!data) notFound();

  const listing = data as JobListing;
  const isOwner = user?.id === listing.owner_id;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/services/jobs" className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900 truncate">{listing.title}</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden p-4">
        <JobPhotoCarousel photos={listing.photo_urls} name={listing.company_name || listing.title} />

        <div className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{listing.title}</h2>
              {listing.company_name && <p className="text-sm text-gray-500">{listing.company_name}</p>}
            </div>
            {isOwner && <JobListingOwnerActions listingId={listing.id} />}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {listing.job_type && (
              <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{listing.job_type}</span>
            )}
            {listing.categories.map((cat) => (
              <span key={cat} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                {cat}
              </span>
            ))}
          </div>
          {listing.moderation_status !== "published" && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-3">
              {listing.moderation_status === "pending_review"
                ? "This job posting is awaiting review — only you can see it right now."
                : "This job posting didn't pass review and isn't visible to others."}
            </p>
          )}
        </div>

        <div className="mt-4">
          <JobListingFields listing={listing} />
        </div>
      </div>
    </div>
  );
}
