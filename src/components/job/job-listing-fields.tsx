import { MapPin, Phone, MessageCircle, Mail, Link as LinkIcon, User, Briefcase, IndianRupee } from "lucide-react";
import type { JobListing } from "@/lib/types";

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

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => n.toLocaleString("en-IN");
  if (min && max) return `₹${fmt(min)} – ₹${fmt(max)} per month`;
  return `₹${fmt((min ?? max)!)} per month`;
}

export function JobListingFields({ listing }: { listing: JobListing }) {
  const location = listing.is_remote ? "Remote" : [listing.city, listing.state].filter(Boolean).join(", ");
  const salary = formatSalary(listing.salary_min, listing.salary_max);

  return (
    <div>
      {listing.description && (
        <p className="text-sm text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">{listing.description}</p>
      )}

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
        <Row icon={LinkIcon} label="Apply" value={listing.application_link} href={listing.application_link ?? undefined} />
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Details</p>
      <div>
        <Row icon={Briefcase} label="Job Type" value={listing.job_type} />
        <Row icon={MapPin} label="Location" value={location || null} />
        <Row icon={IndianRupee} label="Salary" value={salary} />
      </div>
    </div>
  );
}
