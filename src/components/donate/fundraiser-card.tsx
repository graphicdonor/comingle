import { ExternalLink, HandHeart } from "lucide-react";
import { getPlatform } from "@/lib/donations";
import type { Fundraiser } from "@/lib/types";

export function FundraiserCard({ fundraiser }: { fundraiser: Fundraiser }) {
  const platform = getPlatform(fundraiser.platform);
  return (
    <a
      href={fundraiser.url}
      target="_blank"
      rel="noopener noreferrer nofollow ugc"
      className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {fundraiser.image_url ? (
        // External platform image (Ketto/Milaap/... CDN) — a plain <img> so every
        // platform's image host doesn't need registering with next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={fundraiser.image_url} alt="" className="w-full aspect-[16/9] object-cover bg-gray-100" loading="lazy" />
      ) : (
        <div className="w-full aspect-[16/9] bg-gradient-to-br from-rose-100 to-pink-50 flex items-center justify-center">
          <HandHeart className="h-10 w-10 text-[#E8355A]/60" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span className="rounded-full bg-[#8B1A6B]/10 text-[#8B1A6B] px-2 py-0.5">{platform?.name ?? fundraiser.platform}</span>
          {fundraiser.communities?.name && <span className="text-gray-400 truncate">in {fundraiser.communities.name}</span>}
        </div>
        <h3 className="mt-2 font-bold text-gray-900 leading-snug line-clamp-2">{fundraiser.title}</h3>
        {fundraiser.note && <p className="mt-1.5 text-sm text-gray-600 line-clamp-3">{fundraiser.note}</p>}
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#E8355A]">
          Donate on {platform?.name ?? "the platform"} <ExternalLink className="h-3.5 w-3.5" />
        </span>
      </div>
    </a>
  );
}
