import { Calendar, Clock, MapPin, Heart, IndianRupee, GraduationCap, Briefcase, UserPlus, Ruler, Users, Cake } from "lucide-react";
import { calculateAge } from "@/lib/matrimonial";

interface MatrimonialProfileFieldsData {
  date_of_birth: string | null;
  time_of_birth: string | null;
  place_of_birth: string | null;
  city: string | null;
  height: string | null;
  mangalik_dosh: boolean;
  income_range: string | null;
  marital_status: string | null;
  education: string | null;
  employment_status: string | null;
  created_by: string | null;
  about_me: string | null;
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <Icon className="w-4 h-4 text-[#8B1A6B] flex-shrink-0" />
      <span className="text-xs text-gray-400 w-28 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}

export function MatrimonialProfileFields({ profile, communityName }: { profile: MatrimonialProfileFieldsData; communityName?: string | null }) {
  const dob = profile.date_of_birth
    ? new Date(profile.date_of_birth).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;
  const age = calculateAge(profile.date_of_birth);

  return (
    <div>
      {profile.about_me && (
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{profile.about_me}</p>
      )}

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Personal Information</p>
      <div>
        <Row icon={Cake} label="Age" value={age !== null ? `${age} Years` : null} />
        <Row icon={Ruler} label="Height" value={profile.height} />
        <Row icon={Calendar} label="Date of Birth" value={dob} />
        <Row icon={Clock} label="Time of Birth" value={profile.time_of_birth} />
        <Row icon={MapPin} label="Place of Birth" value={profile.place_of_birth} />
        <Row icon={MapPin} label="City living in" value={profile.city} />
        <Row icon={Heart} label="Mangalik Dosh" value={profile.mangalik_dosh ? "Yes" : "No"} />
        <Row icon={IndianRupee} label="Income" value={profile.income_range} />
        <Row icon={Heart} label="Marital Status" value={profile.marital_status} />
        <Row icon={GraduationCap} label="Education" value={profile.education} />
        <Row icon={Briefcase} label="Employment" value={profile.employment_status} />
        <Row icon={Users} label="Community" value={communityName ?? null} />
        <Row icon={UserPlus} label="Profile Created by" value={profile.created_by} />
      </div>
    </div>
  );
}
