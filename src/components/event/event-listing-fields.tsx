import { MapPin, Phone, MessageCircle, Mail, Calendar, Clock, Video, Link as LinkIcon, User } from "lucide-react";
import type { EventListing } from "@/lib/types";

function Row({ icon: Icon, label, value, href }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | null; href?: string }) {
  if (!value) return null;
  const content = <span className="text-sm text-gray-900">{value}</span>;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <Icon className="w-4 h-4 text-[#8B1A6B] flex-shrink-0" />
      <span className="text-xs text-gray-400 w-24 flex-shrink-0">{label}</span>
      {href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="text-sm text-[#8B1A6B] hover:underline truncate">{value}</a> : content}
    </div>
  );
}

export function EventListingFields({ event }: { event: EventListing }) {
  const when = new Date(event.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const time = [event.start_time?.slice(0, 5), event.end_time?.slice(0, 5)].filter(Boolean).join(" – ");
  const venue = [event.venue_name, event.address, event.city, event.state].filter(Boolean).join(", ");

  return (
    <div>
      {event.description && <p className="text-sm text-gray-600 leading-relaxed mb-4">{event.description}</p>}

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">When &amp; Where</p>
      <div className="mb-4">
        <Row icon={Calendar} label="Date" value={when} />
        <Row icon={Clock} label="Time" value={time || null} />
        {event.is_online ? (
          <Row icon={Video} label="Online" value={event.online_link || "Link shared on registration"} href={event.online_link || undefined} />
        ) : (
          <Row icon={MapPin} label="Venue" value={venue || null} />
        )}
        <Row icon={LinkIcon} label="Register" value={event.registration_link} href={event.registration_link || undefined} />
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
      <div>
        <Row icon={User} label="Organizer" value={event.poc_name} />
        <Row icon={Phone} label="Mobile" value={event.mobile_number} href={event.mobile_number ? `tel:${event.mobile_number}` : undefined} />
        <Row
          icon={MessageCircle}
          label="WhatsApp"
          value={event.whatsapp_number}
          href={event.whatsapp_number ? `https://wa.me/${event.whatsapp_number.replace(/\D/g, "")}` : undefined}
        />
        <Row icon={Mail} label="Email" value={event.email} href={event.email ? `mailto:${event.email}` : undefined} />
      </div>
    </div>
  );
}
