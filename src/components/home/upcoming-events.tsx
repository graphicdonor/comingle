import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Video } from "lucide-react";
import { eventDateParts, formatEventTime } from "@/lib/event";
import type { EventListing } from "@/lib/types";

/** Horizontal "Upcoming events" row on the app home page — a little larger
 * than the survey cards below it, with the event photo and a calendar badge. */
export function UpcomingEvents({ events }: { events: EventListing[] }) {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900">Upcoming events</h2>
        {events.length > 0 && (
          <Link href="/services/events" className="text-sm font-semibold text-[#8B1A6B] hover:underline">
            See all
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <Link href="/services/events/register" className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <CalendarDays className="h-6 w-6 text-[#8B1A6B] flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-gray-900">No upcoming events yet</p>
            <p className="text-xs text-gray-500 mt-0.5">Organising a festival, prayer meeting or gathering? Post it for your community.</p>
          </div>
        </Link>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
          {events.map((e) => {
            const { day, month, weekday } = eventDateParts(e.event_date);
            const time = formatEventTime(e.start_time);
            const place = e.is_online ? "Online" : [e.venue_name, e.city].filter(Boolean).join(", ");
            return (
              <Link
                key={e.id}
                href={`/services/events/${e.id}`}
                className="flex-shrink-0 w-64 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-32 bg-lime-50">
                  {e.photo_urls[0] ? (
                    <Image src={e.photo_urls[0]} alt="" fill sizes="256px" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CalendarDays className="h-8 w-8 text-lime-600" />
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 bg-white rounded-xl px-2.5 py-1 text-center min-w-[46px] shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-[#E8355A] leading-none">{month}</p>
                    <p className="text-lg font-extrabold text-gray-900 leading-tight">{day}</p>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm text-gray-900 leading-snug line-clamp-2">{e.title}</p>
                  <p className="mt-1 text-xs font-semibold text-[#8B1A6B]">
                    {weekday}
                    {time ? ` · ${time}` : ""}
                  </p>
                  {place && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      {e.is_online ? <Video className="h-3 w-3 flex-shrink-0" /> : <MapPin className="h-3 w-3 flex-shrink-0" />}
                      <span className="truncate">{place}</span>
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
