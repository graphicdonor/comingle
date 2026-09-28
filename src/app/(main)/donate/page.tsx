import Link from "next/link";
import { ExternalLink, HandHeart, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DONATION_PLATFORMS } from "@/lib/donations";
import { FundraiserCard } from "@/components/donate/fundraiser-card";
import type { Fundraiser } from "@/lib/types";

export default async function DonatePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("fundraisers")
    .select("*, communities(name, slug)")
    .eq("moderation_status", "published")
    .order("created_at", { ascending: false })
    .limit(50);
  const fundraisers = (data ?? []) as Fundraiser[];

  return (
    <div>
      <div className="rounded-3xl overflow-hidden mb-6 p-6 text-center bg-gradient-to-br from-[#E8355A] via-[#C2185B] to-[#8B1A6B]">
        <HandHeart className="w-7 h-7 text-white/90 mx-auto mb-2" />
        <h1 className="text-white font-bold text-lg">Give to your community</h1>
        <p className="text-white/85 text-xs mt-1 mb-4">Support causes shared by members, or donate through trusted platforms</p>
        <Link
          href="/donate/share"
          className="inline-block bg-white text-[#8B1A6B] text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors"
        >
          Share a fundraiser
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-3">Community fundraisers</h2>
        {fundraisers.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-sm text-gray-400">
            No fundraisers shared yet. Know a cause your community should support?{" "}
            <Link href="/donate/share" className="font-semibold text-[#8B1A6B] hover:underline">Share it</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {fundraisers.map((f) => (
              <FundraiserCard key={f.id} fundraiser={f} />
            ))}
          </div>
        )}
      </section>

      {(["India", "Global"] as const).map((region) => (
        <section key={region} className="mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-3">Trusted platforms · {region}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DONATION_PLATFORMS.filter((p) => p.region === region).map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-900">{p.name}</span>
                  <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </div>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">{p.description}</p>
              </a>
            ))}
          </div>
        </section>
      ))}

      <div className="flex gap-3 rounded-2xl bg-amber-50 border border-amber-100 p-4 text-xs text-amber-900 leading-relaxed">
        <ShieldAlert className="h-5 w-5 flex-shrink-0 text-amber-600" />
        <p>
          WePray doesn&apos;t collect or hold any money. Donations happen on each platform&apos;s own website, under its
          own terms. Fundraisers shared by members are reviewed before they appear, but please check a cause for
          yourself before you give.
        </p>
      </div>
    </div>
  );
}
