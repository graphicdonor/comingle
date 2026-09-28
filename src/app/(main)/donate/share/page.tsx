"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, HandHeart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserCommunities } from "@/lib/hooks/use-user-communities";
import { CommunityPicker } from "@/components/community/community-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DONATION_PLATFORMS, platformForUrl } from "@/lib/donations";

interface Preview {
  platform: { id: string; name: string };
  title: string | null;
  description: string | null;
  imageUrl: string | null;
}

export default function ShareFundraiserPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const { communities } = useUserCommunities(userId);
  const [communityId, setCommunityId] = useState("");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doneMessage, setDoneMessage] = useState("");

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const selectedCommunityId = communityId || communities[0]?.id || "";

  const checkLink = async () => {
    setError("");
    setPreview(null);
    if (!platformForUrl(url)) {
      setError("That link isn't from one of the trusted platforms below. Paste the full https:// link to the fundraiser.");
      return;
    }
    setChecking(true);
    try {
      const res = await fetch("/api/fundraisers/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Couldn't check that link.");
        return;
      }
      setPreview(body);
      if (!title && body.title) setTitle(body.title);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!platformForUrl(url)) return setError("Paste a link from one of the trusted platforms.");
    if (!title.trim()) return setError("Add a title for this fundraiser.");
    if (!selectedCommunityId) return setError("Join a community first, then share the fundraiser with it.");
    setLoading(true);
    try {
      const res = await fetch("/api/moderation/fundraisers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId: selectedCommunityId, url: url.trim(), title: title.trim(), note: note.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDoneMessage(body.message);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (doneMessage) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-[#2A5C27] mx-auto" strokeWidth={1.5} />
        <p className="mt-4 font-semibold text-gray-900">{doneMessage}</p>
        <Link href="/donate" className="mt-6 inline-block rounded-full bg-[#8B1A6B] px-6 py-2.5 text-sm font-semibold text-white">
          Back to Donate
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8355A]/10">
          <HandHeart className="h-5 w-5 text-[#E8355A]" />
        </span>
        <div>
          <h1 className="font-bold text-lg text-gray-900">Share a fundraiser</h1>
          <p className="text-xs text-gray-500">Post a link to a fundraiser for your community to support.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Input
          id="url"
          label="Fundraiser link"
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setPreview(null);
          }}
          placeholder="https://www.ketto.org/fundraiser/..."
          maxLength={500}
        />
        <Button type="button" variant="ghost" size="sm" onClick={checkLink} loading={checking} disabled={!url.trim()}>
          Check link
        </Button>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Accepted: {DONATION_PLATFORMS.map((p) => p.name).join(", ")}.
        </p>
      </div>

      {preview && (
        <div className="rounded-2xl border border-gray-100 overflow-hidden">
          {preview.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview.imageUrl} alt="" className="w-full aspect-[16/9] object-cover bg-gray-100" />
          )}
          <div className="p-3">
            <p className="text-[11px] font-semibold text-[#8B1A6B]">{preview.platform.name}</p>
            <p className="text-sm font-semibold text-gray-900">{preview.title ?? "No title found — add one below"}</p>
            {preview.description && <p className="mt-1 text-xs text-gray-500 line-clamp-2">{preview.description}</p>}
          </div>
        </div>
      )}

      <Input id="title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="What is this fundraiser for?" />
      <Textarea
        id="note"
        label="Why should your community support it? (optional)"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={1000}
        placeholder="e.g. Rebuilding our temple's kitchen before Diwali"
      />

      <CommunityPicker communities={communities} value={selectedCommunityId} onChange={setCommunityId} label="Share with community" />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button type="submit" fullWidth loading={loading}>
        Share fundraiser
      </Button>
      <p className="text-[11px] text-center text-gray-400">
        Fundraisers are reviewed before they appear. WePray never collects money — donors give on the platform itself.
      </p>
    </form>
  );
}
