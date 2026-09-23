import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EducationPhoto } from "@/components/education/education-photo";
import { EducationListingFields } from "@/components/education/education-listing-fields";
import type { EducationListing } from "@/lib/types";

export default async function EducationListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase.from("education_listings").select("*").eq("id", id).maybeSingle();

  // RLS already enforces visibility (published listings are public, pending/
  // blocked ones only to their owner), so a missing row here means either it
  // doesn't exist or the viewer isn't eligible to see it — both render as 404.
  if (!data) notFound();

  const listing = data as EducationListing;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/services/education" className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900 truncate">{listing.title}</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden p-4">
        <EducationPhoto photos={listing.photo_urls} name={listing.title} />

        <div className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{listing.title}</h2>
              {listing.provider_name && <p className="text-sm text-gray-500">{listing.provider_name}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {listing.service_type && (
              <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{listing.service_type}</span>
            )}
            {listing.subject && (
              <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{listing.subject}</span>
            )}
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
          <EducationListingFields listing={listing} />
        </div>
      </div>
    </div>
  );
}
