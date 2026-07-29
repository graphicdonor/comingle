import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventListingEditForm } from "@/components/event/event-listing-edit-form";
import type { EventListing } from "@/lib/types";

export default async function EditEventListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  const event = data as EventListing;
  if (event.organizer_id !== user.id) redirect(`/services/events/${id}`);

  return <EventListingEditForm event={event} />;
}
