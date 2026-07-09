import Link from "next/link";
import Image from "next/image";
import { calculateAge, generateMemberCode, formatLastSeen } from "@/lib/matrimonial";
import { InviteButton, type InviteRelationship } from "@/components/matrimonial/invite-button";
import { ShortlistButton } from "@/components/matrimonial/shortlist-button";
import type { MatrimonialProfile } from "@/lib/types";

interface MatrimonialProfileCardProps {
  profile: MatrimonialProfile;
  communityName: string | null;
  lastActiveAt: string | null;
  hasOwnProfile: boolean;
  relationship: InviteRelationship;
  isShortlisted: boolean;
}

export function MatrimonialProfileCard({
  profile,
  communityName,
  lastActiveAt,
  hasOwnProfile,
  relationship,
  isShortlisted,
}: MatrimonialProfileCardProps) {
  const age = calculateAge(profile.date_of_birth);
  const stats = [profile.height, profile.city, communityName, age !== null ? `${age} Yrs` : null, profile.education]
    .filter(Boolean)
    .join(" · ");
  const photo = profile.photo_urls[0] ?? null;
  const initial = profile.full_name.charAt(0).toUpperCase();

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-sm aspect-[3/4] bg-gray-100">
      <Link href={`/services/matrimonial/${profile.user_id}`} className="absolute inset-0">
        {photo ? (
          <Image src={photo} alt={profile.full_name} fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#8B1A6B]/25 to-purple-100">
            <span className="text-6xl font-bold text-white/80">{initial}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      </Link>

      <div className="absolute top-3 right-3">
        <ShortlistButton targetUserId={profile.user_id} initialShortlisted={isShortlisted} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
        <Link href={`/services/matrimonial/${profile.user_id}`}>
          <h3 className="text-white font-bold text-lg leading-tight">
            {profile.full_name}{age !== null && <span className="font-normal text-white/80">, {age}</span>}
          </h3>
          <p className="text-white/70 text-xs mt-0.5">
            {generateMemberCode(profile.full_name, profile.user_id)} · {formatLastSeen(lastActiveAt)}
          </p>
          {stats && <p className="text-white/90 text-xs mt-1">{stats}</p>}
        </Link>
        <InviteButton targetUserId={profile.user_id} hasOwnProfile={hasOwnProfile} relationship={relationship} fullWidth />
      </div>
    </div>
  );
}
