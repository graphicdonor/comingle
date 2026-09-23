"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { SERVICE_TYPES, SUBJECTS, LEVELS, MODES, FEE_PERIODS } from "@/lib/education";
import { useUserCommunities } from "@/lib/hooks/use-user-communities";
import { CommunityPicker } from "@/components/community/community-picker";

interface FormState {
  title: string;
  providerName: string;
  serviceType: string;
  subject: string;
  level: string;
  mode: (typeof MODES)[number];
  fee: string;
  feePeriod: string;
  addressLine1: string;
  city: string;
  state: string;
  description: string;
  pocName: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  providerName: "",
  serviceType: "",
  subject: "",
  level: "",
  mode: MODES[1],
  fee: "",
  feePeriod: "",
  addressLine1: "",
  city: "",
  state: "",
  description: "",
  pocName: "",
  mobileNumber: "",
  whatsappNumber: "",
  email: "",
};

function ChipGroup({ options, value, onToggle }: { options: string[]; value: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
            value.includes(opt) ? "bg-[#1E2952] text-white border-[#1E2952]" : "border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function EducationRegisterPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [communityId, setCommunityId] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const { communities } = useUserCommunities(userId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Defaults to the first joined community without a setState-in-effect —
  // communityId only ever holds an explicit user selection; until they make
  // one, this derives the default at render time instead.
  const selectedCommunityId = communityId || communities[0]?.id || "";

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be under 5MB");
      return;
    }
    setPhotos([{ file, preview: URL.createObjectURL(file) }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Title is required");
    if (!selectedCommunityId) return setError("Select a community to publish this to");

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const photoUrls: string[] = [];
    for (const { file } of photos) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("education-photos").upload(path, file);
      if (uploadErr) {
        setError(uploadErr.message);
        setLoading(false);
        return;
      }
      photoUrls.push(supabase.storage.from("education-photos").getPublicUrl(path).data.publicUrl);
    }

    const res = await fetch("/api/moderation/education-listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        provider_name: form.providerName.trim() || null,
        service_type: form.serviceType || null,
        subject: form.subject || null,
        level: form.level || null,
        mode: form.mode,
        fee: form.fee ? Number(form.fee) : null,
        fee_period: form.feePeriod || null,
        address_line1: form.addressLine1.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        description: form.description.trim() || null,
        poc_name: form.pocName.trim() || null,
        mobile_number: form.mobileNumber.trim() || null,
        whatsapp_number: form.whatsappNumber.trim() || null,
        email: form.email.trim() || null,
        photo_urls: photoUrls,
        communityId: selectedCommunityId,
      }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(body.error || "Something went wrong submitting your listing.");
      return;
    }
    setStatusMessage({ text: body.message, ok: body.decision !== "block" });
  };

  if (statusMessage) {
    return (
      <div className="max-w-sm mx-auto text-center py-16">
        <CheckCircle2 className={cn("h-12 w-12 mx-auto mb-3", statusMessage.ok ? "text-[#2A5C27]" : "text-red-400")} />
        <p className="text-gray-900 font-semibold mb-1">{statusMessage.ok ? "Listed!" : "Not published"}</p>
        <p className="text-sm text-gray-500 mb-4">{statusMessage.text}</p>
        <Link href="/services/education" className="text-sm font-semibold text-[#8B1A6B] hover:underline">
          Back to Education
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/services/education" className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Post a Class</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm p-5 space-y-5">
        <Input label="Title" placeholder="e.g. Spoken English Classes for Kids" value={form.title} onChange={set("title")} />
        <Input label="Provider / Institute name" placeholder="Optional" value={form.providerName} onChange={set("providerName")} />

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1.5">Service type</p>
          <ChipGroup
            options={SERVICE_TYPES}
            value={form.serviceType ? [form.serviceType] : []}
            onToggle={(v) => setForm((f) => ({ ...f, serviceType: f.serviceType === v ? "" : v }))}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1.5">Subject</p>
          <ChipGroup
            options={SUBJECTS}
            value={form.subject ? [form.subject] : []}
            onToggle={(v) => setForm((f) => ({ ...f, subject: f.subject === v ? "" : v }))}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1.5">Level</p>
          <ChipGroup
            options={LEVELS}
            value={form.level ? [form.level] : []}
            onToggle={(v) => setForm((f) => ({ ...f, level: f.level === v ? "" : v }))}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1.5">Mode</p>
          <ChipGroup
            options={[...MODES]}
            value={[form.mode]}
            onToggle={(v) => setForm((f) => ({ ...f, mode: v as FormState["mode"] }))}
          />
        </div>

        {form.mode !== "Online" && (
          <>
            <Input label="Address" placeholder="Street address" value={form.addressLine1} onChange={set("addressLine1")} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={form.city} onChange={set("city")} />
              <Input label="State" value={form.state} onChange={set("state")} />
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input label="Fee" type="number" placeholder="₹ (optional)" value={form.fee} onChange={set("fee")} />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">Fee period</p>
            <ChipGroup
              options={FEE_PERIODS}
              value={form.feePeriod ? [form.feePeriod] : []}
              onToggle={(v) => setForm((f) => ({ ...f, feePeriod: f.feePeriod === v ? "" : v }))}
            />
          </div>
        </div>

        <Textarea
          label="Description"
          placeholder="Tell students/parents more about this class or course"
          rows={4}
          value={form.description}
          onChange={set("description")}
        />

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Contact</p>
          <Input placeholder="Contact name (optional)" value={form.pocName} onChange={set("pocName")} />
          <Input placeholder="Mobile (optional)" value={form.mobileNumber} onChange={set("mobileNumber")} />
          <Input placeholder="WhatsApp (optional)" value={form.whatsappNumber} onChange={set("whatsappNumber")} />
          <Input placeholder="Email (optional)" type="email" value={form.email} onChange={set("email")} />
        </div>

        <div>
          {photos.length > 0 ? (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[0].preview} alt="Listing preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setPhotos([])}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 border border-dashed border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300"
            >
              <ImagePlus className="h-4 w-4" />
              Add a photo
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        <CommunityPicker communities={communities} value={selectedCommunityId} onChange={setCommunityId} />

        {error && <p className="text-xs text-red-500">{error}</p>}

        <Button type="submit" fullWidth loading={loading}>
          Post Listing
        </Button>
      </form>
    </div>
  );
}
