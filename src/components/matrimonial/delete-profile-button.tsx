"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { DEV_MODE } from "@/lib/dev-auth";
import { clearDevMatrimonialProfile } from "@/lib/dev-matrimonial";

export function DeleteProfileButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    if (DEV_MODE) {
      clearDevMatrimonialProfile();
      router.push("/services/matrimonial");
      return;
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { error: deleteError } = await supabase.from("matrimonial_profiles").delete().eq("user_id", user.id);
    setLoading(false);
    if (deleteError) { setError(deleteError.message); return; }
    router.push("/services/matrimonial");
    router.refresh();
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" /> Delete Profile
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Delete your matrimonial profile?</span>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
        <Button variant="dark" size="sm" loading={loading} onClick={handleDelete} className="!bg-red-500 hover:!bg-red-600">
          Confirm
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
