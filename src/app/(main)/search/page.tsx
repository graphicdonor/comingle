import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CommunityCard } from "@/components/community/community-card";
import { PostCard } from "@/components/post/post-card";
import { BusinessListingCard } from "@/components/business/business-listing-card";
import { JobListingCard } from "@/components/job/job-listing-card";
import { EventListingCard } from "@/components/event/event-listing-card";
import { SearchPageField } from "@/components/search/search-page-field";
import { COMMUNITY_SERVICES } from "@/lib/community-services";
import { isCommunityStaff } from "@/lib/community";
import { orConditions, SEARCH_RESULT_LIMIT } from "@/lib/search";
import type { Community, Post, CommunityRole, BusinessListing, JobListing, EventListing } from "@/lib/types";
import { SearchX } from "lucide-react";

function matchesService(label: string, query: string): boolean {
  const q = query.toLowerCase();
  const l = label.toLowerCase();
  return l.includes(q) || q.includes(l);
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().slice(0, 100);

  const matchedServices = query ? COMMUNITY_SERVICES.filter((s) => matchesService(s.label, query)) : [];

  let communities: Community[] = [];
  let posts: Post[] = [];
  let businesses: BusinessListing[] = [];
  let jobs: JobListing[] = [];
  let events: EventListing[] = [];
  let likedPostIds: Set<string> = new Set();
  let roleByCommunityId = new Map<string, CommunityRole>();
  let currentUserId: string | undefined;

  if (query) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    currentUserId = user?.id;

    const [{ data: communityResults }, { data: postResults }, { data: businessResults }, { data: jobResults }, { data: eventResults }, { data: memberOf }] =
      await Promise.all([
        supabase.from("communities").select("*").or(orConditions(query, ["name", "description"])).order("member_count", { ascending: false }).limit(SEARCH_RESULT_LIMIT),
        supabase
          .from("posts")
          .select("*, profiles!posts_author_id_fkey(*), communities(*)")
          .or(orConditions(query, ["title", "content"]))
          .order("created_at", { ascending: false })
          .limit(SEARCH_RESULT_LIMIT),
        supabase.from("business_listings").select("*").or(orConditions(query, ["name", "city", "poc_name"])).order("created_at", { ascending: false }).limit(SEARCH_RESULT_LIMIT),
        supabase.from("job_listings").select("*").or(orConditions(query, ["title", "company_name", "description", "city"])).order("created_at", { ascending: false }).limit(SEARCH_RESULT_LIMIT),
        supabase.from("events").select("*").or(orConditions(query, ["title", "description", "venue_name", "city"])).order("event_date", { ascending: true }).limit(SEARCH_RESULT_LIMIT),
        user ? supabase.from("community_members").select("community_id, role").eq("user_id", user.id) : Promise.resolve({ data: null as { community_id: string; role: string }[] | null }),
      ]);

    communities = (communityResults ?? []) as Community[];
    posts = (postResults as Post[]) ?? [];
    businesses = (businessResults ?? []) as BusinessListing[];
    jobs = (jobResults ?? []) as JobListing[];
    events = (eventResults ?? []) as EventListing[];
    roleByCommunityId = new Map((memberOf ?? []).map((m) => [m.community_id, m.role as CommunityRole]));

    if (user && posts.length > 0) {
      const { data: likes } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", posts.map((p) => p.id));
      likedPostIds = new Set((likes ?? []).map((l) => l.post_id));
    }
  }

  const totalResults = communities.length + posts.length + businesses.length + jobs.length + events.length;

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Search</h1>
        <SearchPageField defaultValue={query} />
      </div>

      {!query && (
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Browse community services</h2>
          <div className="grid grid-cols-4 gap-3">
            {COMMUNITY_SERVICES.map((s) => (
              <Link key={s.label} href={s.href} className="flex flex-col items-center gap-1.5 group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                  <s.icon className="h-6 w-6 text-gray-700" strokeWidth={1.75} />
                </div>
                <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">{s.label}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {query && matchedServices.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Jump to service</h2>
          <div className="flex flex-wrap gap-2">
            {matchedServices.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-300 shadow-sm"
              >
                <s.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {s.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {query && totalResults === 0 && matchedServices.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl">
          <SearchX className="h-8 w-8 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-gray-500 text-sm font-medium">No results for &quot;{query}&quot;</p>
          <p className="text-gray-400 text-xs mt-1">Try a different word, or browse communities instead.</p>
          <Link href="/communities" className="text-[#8B1A6B] font-semibold text-sm mt-3 inline-block hover:underline">
            Browse communities
          </Link>
        </div>
      )}

      {communities.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Communities ({communities.length})</h2>
          <div className="grid grid-cols-2 gap-3">
            {communities.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        </section>
      )}

      {businesses.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Businesses ({businesses.length})</h2>
          <div className="space-y-3">
            {businesses.map((b) => (
              <BusinessListingCard key={b.id} listing={b} />
            ))}
          </div>
        </section>
      )}

      {jobs.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Jobs ({jobs.length})</h2>
          <div className="space-y-3">
            {jobs.map((j) => (
              <JobListingCard key={j.id} listing={j} />
            ))}
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Events ({events.length})</h2>
          <div className="space-y-3">
            {events.map((e) => (
              <EventListingCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Posts ({posts.length})</h2>
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                liked={likedPostIds.has(post.id)}
                canModerate={isCommunityStaff(roleByCommunityId.get(post.community_id))}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
