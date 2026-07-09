"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, X } from "lucide-react";
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Post image must be under 5MB"); return; }
    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Add a title for your post"); return; }
    setLoading(true);
    setError("");

    let image_url: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${authorId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("post-images").upload(path, imageFile);
      if (uploadErr) { setError(uploadErr.message); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const { error: insertError } = await supabase.from("posts").insert({
      title: title.trim(),
      content: content.trim() || null,
      image_url,
      community_id: communityId,
      author_id: authorId,
    });
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setTitle("");
    setContent("");
    removeImage();
    setOpen(false);
    router.refresh();
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
        maxLength={100}
        required
      />
      <Textarea
        placeholder="What's on your mind? (optional)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />
      {imagePreview && (
        <div className="relative w-full rounded-xl overflow-hidden border border-gray-100">
          <img src={imagePreview} alt="Post attachment preview" className="w-full max-h-56 object-cover" />
          <button
            type="button"
            onClick={removeImage}
            aria-label="Remove image"
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-900/60 text-white flex items-center justify-center hover:bg-gray-900/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Add photo"
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading}>
            Post
          </Button>
        </div>
      </div>
    </form>
  );
}
