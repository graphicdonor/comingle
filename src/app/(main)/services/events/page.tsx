import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EventListingCard } from "@/components/event/event-listing-card";
import type { EventListing } from "@/lib/types";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("moderation_status", "published")
    .order("event_date", { ascending: true });

  const published = (events ?? []) as EventListing[];

  return (
    <div>
      <div className="relative rounded-3xl overflow-hidden mb-5 p-6 text-center bg-gradient-to-br from-lime-500 via-green-500 to-green-700">
        <PartyPopper className="w-6 h-6 text-white/90 mx-auto mb-2" />
        <h2 className="text-white font-bold text-lg">Hosting something?</h2>
        <p className="text-white/85 text-xs mt-1 mb-4">List your event so nearby members can join</p>
        <Link
          href="/services/events/register"
          className="inline-block bg-white text-green-700 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors"
        >
          Register an Event
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {published.length} event{published.length === 1 ? "" : "s"} listed
      </p>

      {published.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-gray-400">
          No events listed yet. Be the first to register yours!
        </div>
      ) : (
        <div className="space-y-3">
          {published.map((event) => (
            <EventListingCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
