import Link from "next/link";
import { MapPin, Calendar, Video } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { EventListing } from "@/lib/types";

export function EventListingCard({ event }: { event: EventListing }) {
  const location = event.is_online ? "Online" : [event.venue_name, event.city].filter(Boolean).join(", ");
  const when = new Date(event.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Link
      href={`/services/events/${event.id}`}
      className="bg-white rounded-2xl shadow-sm p-4 flex gap-3 hover:shadow-md transition-shadow"
    >
      <Avatar src={event.photo_urls[0] ?? null} name={event.title} size="lg" className="rounded-2xl" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{event.title}</p>
        {event.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {event.categories.slice(0, 2).map((cat) => (
              <span key={cat} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {cat}
              </span>
            ))}
          </div>
        )}
        <p className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          {when}
          {event.start_time ? ` · ${event.start_time.slice(0, 5)}` : ""}
        </p>
        {location && (
          <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            {event.is_online ? <Video className="w-3 h-3 flex-shrink-0" /> : <MapPin className="w-3 h-3 flex-shrink-0" />}
            <span className="truncate">{location}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
