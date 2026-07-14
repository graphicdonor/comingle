import Link from "next/link";
import { Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { JobListingCard } from "@/components/job/job-listing-card";
import type { JobListing } from "@/lib/types";

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("job_listings")
    .select("*")
    .eq("moderation_status", "published")
    .order("created_at", { ascending: false });

  const published = (listings ?? []) as JobListing[];

  return (
    <div>
      <div className="relative rounded-3xl overflow-hidden mb-5 p-6 text-center bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600">
        <Briefcase className="w-6 h-6 text-white/90 mx-auto mb-2" />
        <h2 className="text-white font-bold text-lg">Hiring?</h2>
        <p className="text-white/85 text-xs mt-1 mb-4">Post a job so community members can find it</p>
        <Link
          href="/services/jobs/register"
          className="inline-block bg-white text-sky-700 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors"
        >
          Post a Job
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {published.length} job{published.length === 1 ? "" : "s"} listed
      </p>

      {published.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-gray-400">
          No jobs listed yet. Be the first to post one!
        </div>
      ) : (
        <div className="space-y-3">
          {published.map((listing) => (
            <JobListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
