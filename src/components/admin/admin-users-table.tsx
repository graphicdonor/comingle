"use client";
import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, Users, MapPin, Calendar, Filter } from "lucide-react";
import type { Profile } from "@/lib/types";

interface UserRow extends Profile {
  phone?: string;
  community_count?: number;
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  if (src) return <img src={src} alt={name} className="w-8 h-8 rounded-full object-cover" />;
  return (
    <div className="w-8 h-8 rounded-full bg-[#8B1A6B]/20 text-[#8B1A6B] flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

type SortKey = "created_at" | "full_name" | "community_count";

export function AdminUsersTable({ users }: { users: UserRow[] }) {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const PER_PAGE = 20;

  const genders = useMemo(() => {
    const g = new Set(users.map((u) => u.gender).filter(Boolean) as string[]);
    return ["all", ...Array.from(g)];
  }, [users]);

  const filtered = useMemo(() => {
    let list = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          u.city?.toLowerCase().includes(q) ||
          u.state?.toLowerCase().includes(q)
      );
    }
    if (genderFilter !== "all") list = list.filter((u) => u.gender === genderFilter);
    list = [...list].sort((a, b) => {
      let av: any = a[sortKey] ?? "";
      let bv: any = b[sortKey] ?? "";
      if (sortKey === "community_count") { av = a.community_count ?? 0; bv = b.community_count ?? 0; }
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [users, search, genderFilter, sortKey, sortDir]);

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const pageUsers = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === "asc" ? <ChevronUp className="w-3 h-3 ml-1 inline" /> : <ChevronDown className="w-3 h-3 ml-1 inline" />
    ) : (
      <ChevronDown className="w-3 h-3 ml-1 inline opacity-30" />
    );

  return (
    <div className="bg-[#1A1D27] border border-white/8 rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-white/8 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#8B1A6B]" />
            All Users
            <span className="text-xs font-normal text-gray-500">({filtered.length} of {users.length})</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search users…"
              className="w-full bg-[#0F1117] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#8B1A6B]/50"
            />
          </div>
          {/* Gender filter */}
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
            <select
              value={genderFilter}
              onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
              className="bg-[#0F1117] border border-white/10 rounded-xl pl-7 pr-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#8B1A6B]/50 appearance-none cursor-pointer"
            >
              {genders.map((g) => (
                <option key={g} value={g} className="bg-[#1A1D27]">
                  {g === "all" ? "All genders" : g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/8 text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-semibold">
                <button onClick={() => toggleSort("full_name")} className="flex items-center hover:text-white transition-colors">
                  User <SortIcon k="full_name" />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Location</th>
              <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Gender</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">DOB</th>
              <th className="text-left px-4 py-3 font-semibold">
                <button onClick={() => toggleSort("community_count")} className="flex items-center hover:text-white transition-colors">
                  Communities <SortIcon k="community_count" />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-semibold">
                <button onClick={() => toggleSort("created_at")} className="flex items-center hover:text-white transition-colors">
                  Joined <SortIcon k="created_at" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/4">
            {pageUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              pageUsers.map((user) => (
                <>
                  <tr
                    key={user.id}
                    onClick={() => setExpanded(expanded === user.id ? null : user.id)}
                    className="hover:bg-white/3 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatar_url} name={user.full_name || user.username} />
                        <div>
                          <p className="font-semibold text-white leading-tight">{user.full_name || "—"}</p>
                          <p className="text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {user.city || user.state ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#8B1A6B]" />
                          {[user.city, user.state].filter(Boolean).join(", ")}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {user.gender ? (
                        <span className="px-2 py-0.5 rounded-full bg-white/8 text-gray-300 capitalize">{user.gender}</span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                      {user.date_of_birth
                        ? new Date(user.date_of_birth).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-300">
                        <Users className="w-3 h-3 text-[#8B1A6B]" />
                        {user.community_count ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                  </tr>
                  {/* Expanded row */}
                  {expanded === user.id && (
                    <tr key={user.id + "-exp"} className="bg-[#0F1117]/60">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                          <Detail label="Full name" value={user.full_name} />
                          <Detail label="Username" value={`@${user.username}`} />
                          <Detail label="Gender" value={user.gender} />
                          <Detail label="Date of birth" value={user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null} />
                          <Detail label="City" value={user.city} />
                          <Detail label="State" value={user.state} />
                          <Detail label="Communities joined" value={String(user.community_count ?? 0)} />
                          <Detail label="User ID" value={user.id.slice(0, 8) + "…"} mono />
                        </div>
                      </td>
                    </tr>
                  )}
                </>
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

function Detail({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div className="bg-[#1A1D27] rounded-xl px-3 py-2.5">
      <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-white font-medium truncate ${mono ? "font-mono text-[11px]" : ""}`}>
        {value || <span className="text-gray-600">—</span>}
      </p>
    </div>
  );
}
