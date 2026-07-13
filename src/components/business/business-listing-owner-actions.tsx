"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function BusinessListingOwnerActions({ listingId }: { listingId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("business_listings").delete().eq("id", listingId);
    setLoading(false);
    if (deleteError) { setError(deleteError.message); return; }
    router.push("/services/businesses");
    router.refresh();
  };

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Delete this listing?</span>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
          <Button variant="dark" size="sm" loading={loading} onClick={handleDelete} className="!bg-red-500 hover:!bg-red-600">
            Confirm
          </Button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/services/businesses/${listingId}/edit`}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#8B1A6B] hover:underline"
      >
        <Pencil className="w-3.5 h-3.5" /> Edit
      </Link>
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
    </div>
  );
}
