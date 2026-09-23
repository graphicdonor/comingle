import { MapPin, Phone, MessageCircle, Mail, User, GraduationCap, IndianRupee, BookOpen, Video } from "lucide-react";
import type { EducationListing } from "@/lib/types";

function Row({ icon: Icon, label, value, href }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | null; href?: string }) {
  if (!value) return null;
  const content = <span className="text-sm text-gray-900">{value}</span>;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <Icon className="w-4 h-4 text-[#8B1A6B] flex-shrink-0" />
      <span className="text-xs text-gray-400 w-24 flex-shrink-0">{label}</span>
      {href ? <a href={href} className="text-sm text-[#8B1A6B] hover:underline truncate">{value}</a> : content}
    </div>
  );
}

function formatFee(listing: EducationListing) {
  if (!listing.fee) return null;
  const amount = `₹${listing.fee.toLocaleString("en-IN")}`;
  return listing.fee_period ? `${amount} / ${listing.fee_period.toLowerCase()}` : amount;
}

export function EducationListingFields({ listing }: { listing: EducationListing }) {
  const location = [listing.address_line1, listing.city, listing.state].filter(Boolean).join(", ");
  const fee = formatFee(listing);

  return (
    <div>
      {listing.description && (
        <p className="text-sm text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">{listing.description}</p>
      )}

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Details</p>
      <div className="mb-4">
        <Row icon={BookOpen} label="Subject" value={listing.subject} />
        <Row icon={GraduationCap} label="Level" value={listing.level} />
        <Row icon={Video} label="Mode" value={listing.mode} />
        <Row icon={MapPin} label="Location" value={listing.mode === "Online" ? null : location || null} />
        <Row icon={IndianRupee} label="Fee" value={fee} />
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
      <div>
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
    </div>
  );
}
