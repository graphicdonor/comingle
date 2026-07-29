import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EventPhotoCarousel } from "@/components/event/event-photo-carousel";
import { EventListingFields } from "@/components/event/event-listing-fields";
import { EventListingOwnerActions } from "@/components/event/event-listing-owner-actions";
import type { EventListing } from "@/lib/types";

export default async function EventListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data }, { data: { user } }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  // RLS already enforces visibility (published events are public, pending/
  // blocked ones only to their organizer), so a missing row here means
  // either it doesn't exist or the viewer isn't eligible to see it — both
  // render as 404.
  if (!data) notFound();

  const event = data as EventListing;
  const isOwner = user?.id === event.organizer_id;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/services/events" className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900 truncate">{event.title}</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden p-4">
        <EventPhotoCarousel photos={event.photo_urls} name={event.title} />

        <div className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900">{event.title}</h2>
            {isOwner && <EventListingOwnerActions eventId={event.id} />}
          </div>
          {event.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {event.categories.map((cat) => (
                <span key={cat} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                  {cat}
                </span>
              ))}
            </div>
          )}
          {event.moderation_status !== "published" && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-3">
              {event.moderation_status === "pending_review"
                ? "This event is awaiting review — only you can see it right now."
                : "This event didn't pass review and isn't visible to others."}
            </p>
          )}
        </div>

        <div className="mt-4">
          <EventListingFields event={event} />
        </div>
      </div>
    </div>
  );
}
