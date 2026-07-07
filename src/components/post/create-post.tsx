"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface CreatePostProps {
  communityId: string;
  authorId: string;
}

export function CreatePost({ communityId, authorId }: CreatePostProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("posts").insert({
      title: title.trim(),
      content: content.trim() || null,
      community_id: communityId,
      author_id: authorId,
    });
    setLoading(false);
    if (!error) {
      setTitle("");
      setContent("");
      setOpen(false);
      router.refresh();
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left text-gray-400 hover:border-indigo-300 hover:text-gray-600 transition-colors"
      >
        Write something in this community...
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-indigo-200 p-5 space-y-3">
      <Input
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder="What's on your mind? (optional)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={loading}>
          Post
        </Button>
      </div>
    </form>
  );
}
