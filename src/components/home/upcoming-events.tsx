import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Tag, Video } from "lucide-react";
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
        <div className="flex gap-3.5 overflow-x-auto py-1.5 -mx-4 px-4">
          {events.map((e) => {
            const { day, month } = eventDateParts(e.event_date);
            const time = formatEventTime(e.start_time);
            const place = e.is_online ? "Online" : e.city || e.venue_name;
            const tagLine = [e.categories[0], time].filter(Boolean).join(" · ");
            return (
              <Link
                key={e.id}
                href={`/services/events/${e.id}`}
                className="flex-shrink-0 w-72 bg-white rounded-3xl p-2.5 shadow-[0_4px_16px_rgba(139,26,107,0.08)] hover:shadow-[0_6px_20px_rgba(139,26,107,0.14)] transition-shadow"
              >
                <div className="relative h-40 rounded-[18px] overflow-hidden bg-lime-50 shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
                  {e.photo_urls[0] ? (
                    <Image src={e.photo_urls[0]} alt="" fill sizes="288px" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CalendarDays className="h-9 w-9 text-lime-600" />
                    </div>
                  )}
                </div>
                <div className="flex pt-3.5 pb-1.5 px-1">
                  <div className="w-14 flex-shrink-0 text-center text-[#8B1A6B]">
                    <p className="text-[15px] font-medium tracking-wider leading-none mt-0.5">{month.toUpperCase()}</p>
                    <p className="text-[32px] font-extrabold leading-9">{day}</p>
                  </div>
                  <div className="w-px bg-[#E5D3DF] mx-2.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    {place && (
                      <p className="flex items-center gap-1 text-xs text-gray-500">
                        {e.is_online ? <Video className="h-3.5 w-3.5 flex-shrink-0" /> : <MapPin className="h-3.5 w-3.5 flex-shrink-0" />}
                        <span className="truncate">{place}</span>
                      </p>
                    )}
                    <p className="font-extrabold text-base text-gray-900 leading-5 line-clamp-2">{e.title}</p>
                    {e.description && <p className="text-xs text-gray-500 leading-4 line-clamp-2">{e.description}</p>}
                    {tagLine && (
                      <p className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-gray-500">
                        <Tag className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{tagLine}</span>
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
