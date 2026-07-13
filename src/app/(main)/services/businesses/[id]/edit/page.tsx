import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BusinessListingEditForm } from "@/components/business/business-listing-edit-form";
import type { BusinessListing } from "@/lib/types";

export default async function EditBusinessListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("business_listings").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  const listing = data as BusinessListing;
  if (listing.owner_id !== user.id) redirect(`/services/businesses/${id}`);

  return <BusinessListingEditForm listing={listing} />;
}
