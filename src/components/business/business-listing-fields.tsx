import { MapPin, Phone, MessageCircle, Mail, Clock, User } from "lucide-react";
import type { BusinessListing } from "@/lib/types";

function Row({ icon: Icon, label, value, href }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | null; href?: string }) {
  if (!value) return null;
  const content = <span className="text-sm text-gray-900">{value}</span>;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <Icon className="w-4 h-4 text-[#8B1A6B] flex-shrink-0" />
      <span className="text-xs text-gray-400 w-24 flex-shrink-0">{label}</span>
      {href ? <a href={href} className="text-sm text-[#8B1A6B] hover:underline">{value}</a> : content}
    </div>
  );
}

export function BusinessListingFields({ listing }: { listing: BusinessListing }) {
  const address = [listing.address_line1, listing.address_line2, listing.street, listing.landmark, listing.area, listing.city, listing.state, listing.pin_code]
    .filter(Boolean)
    .join(", ");

  const timing = listing.open_days.length > 0
    ? `${listing.open_days.join(", ")}${listing.open_time && listing.close_time ? ` · ${listing.open_time.slice(0, 5)}–${listing.close_time.slice(0, 5)}` : ""}`
    : null;

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
      <div className="mb-4">
        <Row icon={User} label="Contact" value={listing.poc_name} />
        <Row icon={Phone} label="Mobile" value={listing.mobile_number} href={listing.mobile_number ? `tel:${listing.mobile_number}` : undefined} />
        <Row
          icon={MessageCircle}
          label="WhatsApp"
          value={listing.whatsapp_number}
          href={listing.whatsapp_number ? `https://wa.me/${listing.whatsapp_number.replace(/\D/g, "")}` : undefined}
        />
        <Row icon={Mail} label="Email" value={listing.email} href={listing.email ? `mailto:${listing.email}` : undefined} />
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Details</p>
      <div>
        <Row icon={MapPin} label="Address" value={address || null} />
        <Row icon={Clock} label="Timing" value={timing} />
      </div>
    </div>
  );
}
