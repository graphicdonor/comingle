"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Video as VideoIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { readVideoMetadata, MAX_POST_VIDEO_SECONDS, MAX_POST_VIDEO_BYTES } from "@/lib/video";
import { uploadMedia } from "@/lib/media";

interface CreatePostProps {
  communityId: string;
  defaultOpen?: boolean;
  onPosted?: () => void;
}

type Media =
  | { type: "image"; file: File; previewUrl: string }
  | { type: "video"; file: File; previewUrl: string; thumbnailBlob: Blob };

export function CreatePost({ communityId, defaultOpen = false, onPosted }: CreatePostProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<Media | null>(null);
  const [mediaError, setMediaError] = useState("");
  const [processingVideo, setProcessingVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const clearMediaInputs = () => {
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const removeMedia = () => {
    if (media) URL.revokeObjectURL(media.previewUrl);
    setMedia(null);
    setMediaError("");
    clearMediaInputs();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMediaError("Post image must be under 5MB"); clearMediaInputs(); return; }
    setMediaError("");
    setMedia({ type: "image", file, previewUrl: URL.createObjectURL(file) });
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_POST_VIDEO_BYTES) {
      setMediaError(`Video must be under ${Math.round(MAX_POST_VIDEO_BYTES / (1024 * 1024))}MB`);
      clearMediaInputs();
      return;
    }
    setMediaError("");
    setProcessingVideo(true);
    try {
      const { duration, thumbnailBlob } = await readVideoMetadata(file);
      if (duration > MAX_POST_VIDEO_SECONDS + 0.5) {
        setMediaError(`Video must be ${MAX_POST_VIDEO_SECONDS} seconds or under (this one is ${Math.round(duration)}s)`);
        clearMediaInputs();
        return;
      }
      setMedia({ type: "video", file, previewUrl: URL.createObjectURL(file), thumbnailBlob });
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : "Couldn't process this video.");
      clearMediaInputs();
    } finally {
      setProcessingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Add a title for your post"); return; }
    setLoading(true);
    setError("");

    let imageUrl: string | null = null;
    let videoUrl: string | null = null;
    let videoThumbnailUrl: string | null = null;

    try {
      if (media?.type === "image") {
        imageUrl = await uploadMedia(media.file, "post-image");
      } else if (media?.type === "video") {
        [videoUrl, videoThumbnailUrl] = await Promise.all([
          uploadMedia(media.file, "post-video"),
          uploadMedia(media.thumbnailBlob, "post-image"),
        ]);
      }
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/moderation/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        communityId,
        title: title.trim(),
        content: content.trim() || null,
        imageUrl,
        videoUrl,
        videoThumbnailUrl,
      }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(body.error || "Something went wrong posting this.");
      return;
    }
    setTitle("");
    setContent("");
    removeMedia();
    if (onPosted) {
      onPosted();
      return;
    }
    setOpen(false);
    setStatusMessage(body.message);
    router.refresh();
  };

  if (!open) {
    return (
      <div className="space-y-2">
        {statusMessage && <p className="text-sm text-gray-600 bg-white rounded-2xl px-4 py-3">{statusMessage}</p>}
        <button
          onClick={() => { setStatusMessage(""); setOpen(true); }}
          className="w-full bg-white rounded-2xl p-4 text-left text-gray-400 hover:border-indigo-300 hover:text-gray-600 transition-colors"
        >
          Write something in this community...
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 space-y-3">
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
      {media?.type === "image" && (
        <div className="relative w-full rounded-xl overflow-hidden">
          <img src={media.previewUrl} alt="Post attachment preview" className="w-full max-h-56 object-cover" />
          <button
            type="button"
            onClick={removeMedia}
            aria-label="Remove image"
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-900/60 text-white flex items-center justify-center hover:bg-gray-900/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {media?.type === "video" && (
        <div className="relative w-full rounded-xl overflow-hidden bg-black">
          <video src={media.previewUrl} className="w-full max-h-56 object-contain" muted loop autoPlay playsInline controls />
          <button
            type="button"
            onClick={removeMedia}
            aria-label="Remove video"
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-900/60 text-white flex items-center justify-center hover:bg-gray-900/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {processingVideo && <p className="text-sm text-gray-500">Checking video…</p>}
      {mediaError && <p className="text-sm text-red-500">{mediaError}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            aria-label="Add photo"
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            aria-label="Add video"
            disabled={processingVideo}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors disabled:opacity-50"
          >
            <VideoIcon className="h-5 w-5" />
          </button>
        </div>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
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
