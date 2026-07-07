"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft } from "lucide-react";

export default function CreateCommunityPage() {
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const slugify = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/signup"); return; }

    const slug = slugify(form.name.trim());
    if (slug.length < 3) { setError("Community name must be at least 3 characters"); return; }

    setLoading(true);
    const { data, error: insertError } = await supabase.from("communities")
      .insert({ name: form.name.trim(), slug, description: form.description.trim() || null, creator_id: user.id, member_count: 1 })
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
