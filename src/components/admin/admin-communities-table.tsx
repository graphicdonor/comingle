"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronUp, ChevronDown, Globe, Users, Calendar, Trash2 } from "lucide-react";
import type { Community } from "@/lib/types";

interface CommunityRow extends Community {
  creator_username?: string;
}

type SortKey = "created_at" | "name" | "member_count";
type SortValue = string | number;

export function AdminCommunitiesTable({ communities }: { communities: CommunityRow[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("member_count");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [actingId, setActingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const PER_PAGE = 20;

  const deleteCommunity = async (id: string) => {
    setActingId(id);
    const res = await fetch(`/api/admin/communities/${id}`, { method: "DELETE" });
    setActingId(null);
    setConfirmDeleteId(null);
    if (res.ok) router.refresh();
  };

  const filtered = useMemo(() => {
    let list = communities;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.creator_username?.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      const av: SortValue = a[sortKey];
      const bv: SortValue = b[sortKey];
      const an = typeof av === "string" ? av.toLowerCase() : av;
      const bn = typeof bv === "string" ? bv.toLowerCase() : bv;
      if (an < bn) return sortDir === "asc" ? -1 : 1;
      if (an > bn) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [communities, search, sortKey, sortDir]);

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const pageCommunities = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  const sortIcon = (k: SortKey) =>
    sortKey === k ? (
      sortDir === "asc" ? <ChevronUp className="w-3 h-3 ml-1 inline" /> : <ChevronDown className="w-3 h-3 ml-1 inline" />
    ) : (
      <ChevronDown className="w-3 h-3 ml-1 inline opacity-30" />
    );

  return (
    <div className="bg-[#1A1D27] rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-white/8 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#8B1A6B]" />
          All Communities
          <span className="text-xs font-normal text-gray-500">({filtered.length} of {communities.length})</span>
        </h2>
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search communities…"
            className="w-full bg-[#0F1117] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#8B1A6B]/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/8 text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-semibold">
                <button onClick={() => toggleSort("name")} className="flex items-center hover:text-white transition-colors">
                  Community {sortIcon("name")}
                </button>
              </th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Creator</th>
              <th className="text-left px-4 py-3 font-semibold">
                <button onClick={() => toggleSort("member_count")} className="flex items-center hover:text-white transition-colors">
                  Members {sortIcon("member_count")}
                </button>
              </th>
              <th className="text-left px-4 py-3 font-semibold">
                <button onClick={() => toggleSort("created_at")} className="flex items-center hover:text-white transition-colors">
                  Created {sortIcon("created_at")}
                </button>
              </th>
              <th className="text-left px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/4">
            {pageCommunities.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  No communities found.
                </td>
              </tr>
            ) : (
              pageCommunities.map((c) => (
                <tr key={c.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white leading-tight">{c.name}</p>
                    <p className="text-gray-500">/{c.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                    {c.creator_username ? `@${c.creator_username}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-gray-300">
                      <Users className="w-3 h-3 text-[#8B1A6B]" />
                      {c.member_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {confirmDeleteId === c.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Delete?</span>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded-lg bg-white/6 hover:bg-white/10 text-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={actingId === c.id}
                          onClick={() => deleteCommunity(c.id)}
                          className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold transition-colors disabled:opacity-50"
                        >
                          Confirm
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={actingId === c.id}
                        onClick={() => setConfirmDeleteId(c.id)}
                        title="Delete community"
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/6 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="px-4 py-3 border-t border-white/8 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg bg-white/6 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
            >
              ←
            </button>
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                  page === p ? "bg-[#8B1A6B] text-white" : "bg-white/6 hover:bg-white/10 text-gray-300"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-white/6 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
