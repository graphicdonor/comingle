import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobListingEditForm } from "@/components/job/job-listing-edit-form";
import type { JobListing } from "@/lib/types";

export default async function EditJobListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("job_listings").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  const listing = data as JobListing;
  if (listing.owner_id !== user.id) redirect(`/services/jobs/${id}`);

  return <JobListingEditForm listing={listing} />;
}
