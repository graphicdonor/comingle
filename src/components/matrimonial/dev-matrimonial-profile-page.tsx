"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { getDevMatrimonialProfile, type DevMatrimonialProfile } from "@/lib/dev-matrimonial";
import { generateMemberCode } from "@/lib/matrimonial";
import { PhotoCarousel } from "@/components/matrimonial/photo-carousel";
import { DeleteProfileButton } from "@/components/matrimonial/delete-profile-button";
import { MatrimonialProfileFields } from "@/components/matrimonial/matrimonial-profile-fields";

export function DevMatrimonialProfilePageShell() {
  const [profile, setProfile] = useState<DevMatrimonialProfile | null | undefined>(undefined);

  useEffect(() => {
    setProfile(getDevMatrimonialProfile());
  }, []);

  if (profile === undefined) return null;

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <p className="text-sm text-gray-500 mb-3">You haven&apos;t created a matrimonial profile yet.</p>
        <Link href="/services/matrimonial/profile/edit" className="text-sm font-semibold text-[#8B1A6B] hover:underline">
          Create your profile →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden p-4">
      <PhotoCarousel photos={profile.photo_urls} name={profile.full_name} />

      <div className="pt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-900">{profile.full_name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{generateMemberCode(profile.full_name, profile.user_id)} · Last seen just now</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 pt-1">
          <Link href="/services/matrimonial/profile/edit" className="flex items-center gap-1.5 text-xs font-semibold text-[#8B1A6B] hover:underline">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <DeleteProfileButton />
        </div>
      </div>

      <div className="mt-4">
        <MatrimonialProfileFields profile={profile} />
      </div>
    </div>
  );
}
