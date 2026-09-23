import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EducationListingCard } from "@/components/education/education-listing-card";
import type { EducationListing } from "@/lib/types";

export default async function EducationPage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("education_listings")
    .select("*")
    .eq("moderation_status", "published")
    .order("created_at", { ascending: false });

  const published = (listings ?? []) as EducationListing[];

  return (
    <div>
      <div className="relative rounded-3xl overflow-hidden mb-5 p-6 text-center bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500">
        <GraduationCap className="w-6 h-6 text-white/90 mx-auto mb-2" />
        <h2 className="text-white font-bold text-lg">Teach or tutor?</h2>
        <p className="text-white/85 text-xs mt-1 mb-4">List your tuitions, classes, or courses for your community</p>
        <Link
          href="/services/education/register"
          className="inline-block bg-white text-amber-700 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors"
        >
          Post a Class
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {published.length} listing{published.length === 1 ? "" : "s"}
      </p>

      {published.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-gray-400">
          No classes or courses listed yet. Be the first to post one!
        </div>
      ) : (
        <div className="space-y-3">
          {published.map((listing) => (
            <EducationListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
