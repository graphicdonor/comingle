"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import type { Community } from "@/lib/types";

interface CommunitySettingsFormProps {
  community: Community;
}

export function CommunitySettingsForm({ community }: CommunitySettingsFormProps) {
  const [form, setForm] = useState({ name: community.name, description: community.description ?? "" });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(community.cover_url);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: "name" | "description") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setSaveError("Community picture must be under 5MB"); return; }
    setSaveError("");
    setSaved(false);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    if (form.name.trim().length < 3) { setSaveError("Community name must be at least 3 characters"); return; }
    setSaving(true);

    if (form.description.trim()) {
      const precheck = await fetch("/api/moderation/precheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: "community_description", text: form.description.trim(), contextLink: `/communities/${community.slug}` }),
      }).then((r) => r.json());
      if (precheck.decision && precheck.decision !== "allow") { setSaving(false); setSaveError(precheck.message); return; }
    }

    let cover_url = community.cover_url;
    if (coverFile) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSaveError("Session expired — please sign in again"); setSaving(false); return; }
      const ext = coverFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("community-covers").upload(path, coverFile);
      if (uploadErr) { setSaveError(uploadErr.message); setSaving(false); return; }
      const { data: urlData } = supabase.storage.from("community-covers").getPublicUrl(path);
      cover_url = urlData.publicUrl;

      const coverPrecheck = await fetch("/api/moderation/precheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: "community_cover", imageUrl: cover_url, contextLink: `/communities/${community.slug}` }),
      }).then((r) => r.json());
      if (coverPrecheck.decision && coverPrecheck.decision !== "allow") { setSaving(false); setSaveError(coverPrecheck.message); return; }
    }

    // Same reasoning as handleDelete: RLS blocks show up as zero affected
    // rows, not an error, so .select() is what actually lets us tell a
    // silently-blocked update apart from a real save.
    const { data, error: updateError } = await supabase
      .from("communities")
      .update({ name: form.name.trim(), description: form.description.trim() || null, cover_url })
      .eq("id", community.id)
      .select();

    setSaving(false);
    if (updateError) { setSaveError(updateError.message); return; }
    if (!data || data.length === 0) { setSaveError("You don't have permission to edit this community."); return; }
    setCoverFile(null);
    setSaved(true);
    router.refresh();
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    // RLS silently affects zero rows rather than raising an error when a
    // delete is blocked — .select() forces PostgREST to return the deleted
    // row(s), so an empty result reliably distinguishes "blocked by policy"
    // from "actually deleted," which a bare error check cannot.
    const { data, error } = await supabase.from("communities").delete().eq("id", community.id).select();
    setDeleting(false);
    if (error) { setDeleteError(error.message); return; }
    if (!data || data.length === 0) { setDeleteError("You don't have permission to delete this community."); return; }
    router.push("/communities");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 space-y-4">
        <div className="flex flex-col items-center gap-2 pb-1">
          <div className="relative">
            <Avatar src={coverPreview} name={form.name || "Community"} size="xl" className="ring-4 ring-gray-100" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#8B1A6B] rounded-full flex items-center justify-center shadow-md hover:bg-[#7a1760] transition-colors"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
          </div>
          <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-[#8B1A6B] font-medium hover:underline">
            Change picture
          </button>
        </div>

        <Input label="Community Name *" value={form.name} onChange={set("name")} required />
        <p className="text-xs text-gray-400 -mt-2">
          URL stays <span className="font-medium text-gray-500">/communities/{community.slug}</span> even if you rename it.
        </p>
        <Textarea label="Description" value={form.description} onChange={set("description")} rows={4} />

        {saveError && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{saveError}</p>}
        {saved && <p className="text-sm text-[#2A5C27] bg-green-50 rounded-xl px-4 py-2">Saved.</p>}

        <Button type="submit" size="lg" fullWidth loading={saving}>
          Save Changes
        </Button>
      </form>

      <div className="bg-white rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-red-500" />
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">Danger Zone</p>
        </div>

        {!confirmingDelete ? (
          <>
            <p className="text-sm text-gray-500">
              Deleting this community permanently removes it, all of its posts, and every membership. This can&apos;t be undone.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingDelete(true)}
              className="!text-red-500 !border-red-200"
            >
              Delete Community
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Type <span className="font-bold">{community.name}</span> to confirm you want to permanently delete this community.
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={community.name}
              autoFocus
            />
            {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setConfirmingDelete(false); setDeleteConfirmText(""); setDeleteError(""); }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                loading={deleting}
                disabled={deleteConfirmText !== community.name}
                onClick={handleDelete}
                className="!bg-red-500 hover:!bg-red-600"
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
