import { redirect } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DEV_MODE } from "@/lib/dev-auth";
import { generateMemberCode, formatLastSeen } from "@/lib/matrimonial";
import { PhotoCarousel } from "@/components/matrimonial/photo-carousel";
import { DeleteProfileButton } from "@/components/matrimonial/delete-profile-button";
import { MatrimonialProfileFields } from "@/components/matrimonial/matrimonial-profile-fields";
import { DevMatrimonialProfilePageShell } from "@/components/matrimonial/dev-matrimonial-profile-page";

export default async function MyMatrimonialProfilePage() {
  if (DEV_MODE) return <DevMatrimonialProfilePageShell />;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: myProfile }, { data: firstMembership }] = await Promise.all([
    supabase.from("matrimonial_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("last_active_at").eq("id", user.id).single(),
    supabase.from("community_members").select("communities(name)").eq("user_id", user.id).limit(1).maybeSingle(),
  ]);

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <p className="text-sm text-gray-500 mb-3">You haven&apos;t created a matrimonial profile yet.</p>
        <Link href="/services/matrimonial/profile/edit" className="text-sm font-semibold text-[#8B1A6B] hover:underline">
          Create your profile →
        </Link>
      </div>
    );
  }

  const communityName = (firstMembership?.communities as unknown as { name: string } | null)?.name ?? null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-4">
      <PhotoCarousel photos={profile.photo_urls} name={profile.full_name} />

      <div className="pt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-900">{profile.full_name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {generateMemberCode(profile.full_name, profile.user_id)} · {formatLastSeen(myProfile?.last_active_at)}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 pt-1">
          <Link href="/services/matrimonial/profile/edit" className="flex items-center gap-1.5 text-xs font-semibold text-[#8B1A6B] hover:underline">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <DeleteProfileButton />
        </div>
      </div>

      <div className="mt-4">
        <MatrimonialProfileFields profile={profile} communityName={communityName} />
      </div>
    </div>
  );
}
