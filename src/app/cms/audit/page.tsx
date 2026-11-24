"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { ROLE_LABELS, TYPE_LABELS, type AuditEntry } from "@/lib/cms/model";
import { api, when } from "@/components/cms/api";
import { Problems } from "@/components/cms/ui";

export default function CmsAudit() {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ entries: AuditEntry[] }>("/api/cms/audit").then((r) => setEntries(r.entries)).catch((e) => setError(e.message));
  }, []);

  if (error) return <Problems message={error} problems={[]} />;
  if (!entries) return <Loader2 className="h-6 w-6 animate-spin text-[#6D645D]" aria-label="Loading" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Audit log</h1>
        <p className="text-sm text-[#5B5350]">Every change made in the CMS, most recent first.</p>
      </div>
      <div className="rounded-2xl bg-white border border-[#E7DCC8] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-[#6D645D] border-b border-[#EFE7D8]">
            <tr>
              <th className="px-4 py-2 font-semibold">When</th>
              <th className="px-4 py-2 font-semibold">Who</th>
              <th className="px-4 py-2 font-semibold">Action</th>
              <th className="px-4 py-2 font-semibold">Content</th>
              <th className="px-4 py-2 font-semibold">Detail</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-[#6D645D]">
                  Nothing yet.
                </td>
              </tr>
            )}
            {entries.map((e, i) => (
              <tr key={i} className="border-b border-[#F4EEE4] last:border-0 align-top">
                <td className="px-4 py-2 whitespace-nowrap text-xs">{when(e.at)}</td>
                <td className="px-4 py-2 text-xs">
                  {e.by}
                  <span className="block text-[#6D645D]">{ROLE_LABELS[e.role]}</span>
                </td>
                <td className="px-4 py-2 text-xs font-semibold">{e.action}</td>
                <td className="px-4 py-2 text-xs">
                  {e.type && e.slug ? (
                    <Link href={`/cms/${e.type}/${e.slug}`} className="text-[#6D252C] hover:underline">
                      {TYPE_LABELS[e.type].one}: {e.slug}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-2 text-xs text-[#5B5350] max-w-md">{e.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
