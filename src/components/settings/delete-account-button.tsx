"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { DEV_MODE, clearDevSession } from "@/lib/dev-auth";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    if (DEV_MODE) {
      clearDevSession();
      router.push("/onboarding");
      return;
    }
    const res = await fetch("/api/account/delete", { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoading(false);
      setError(body.error || "Something went wrong deleting your account.");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut().catch(() => {});
    router.push("/onboarding");
    router.refresh();
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="w-full flex items-center gap-3 py-1 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
      >
        <Trash2 className="h-4 w-4" /> Delete Account
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-500">
        This permanently deletes your profile, posts, and community memberships. This can&apos;t be undone.
      </p>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
        <Button variant="dark" size="sm" loading={loading} onClick={handleDelete} className="!bg-red-500 hover:!bg-red-600">
          Confirm delete
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
