"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, Camera } from "lucide-react";

export default function CreateCommunityPage() {
  const [form, setForm] = useState({ name: "", description: "" });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const slugify = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Community picture must be under 5MB"); return; }
    setError("");
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/signup"); return; }

    const slug = slugify(form.name.trim());
    if (slug.length < 3) { setError("Community name must be at least 3 characters"); return; }

    setLoading(true);

    let cover_url: string | null = null;
    if (coverFile) {
      const ext = coverFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("community-covers").upload(path, coverFile);
      if (uploadErr) { setError(uploadErr.message); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("community-covers").getPublicUrl(path);
      cover_url = urlData.publicUrl;
    }

    const { data, error: insertError } = await supabase.from("communities")
      .insert({ name: form.name.trim(), slug, description: form.description.trim() || null, cover_url, creator_id: user.id, member_count: 1 })
      .select().single();

    if (insertError) { setError(insertError.message); setLoading(false); return; }

    await supabase.from("community_members").insert({ community_id: data.id, user_id: user.id, role: "admin" });

    router.push(`/communities/${slug}`);
    router.refresh();
  };

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center"
        >
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Create Community</h1>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm text-gray-500 mb-5">Build a space around a shared interest, identity, or purpose.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-[#8B1A6B] font-medium hover:underline"
            >
              {coverPreview ? "Change picture" : "Add community picture"}
            </button>
          </div>
          <Input
            label="Community Name *"
            placeholder="e.g. Gurujisangat"
            value={form.name}
            onChange={set("name")}
            required
          />
          {form.name && (
            <p className="text-xs text-gray-400">
              URL: /communities/<span className="text-[#8B1A6B] font-medium">{slugify(form.name)}</span>
            </p>
          )}
          <Textarea
            label="Description"
            placeholder="What is this community about?"
            value={form.description}
            onChange={set("description")}
            rows={4}
          />
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" size="lg" fullWidth onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="dark" size="lg" fullWidth loading={loading}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
