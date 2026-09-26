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
import { LISTING_TYPES, PROPERTY_TYPES, RENT_FREQUENCIES, AMENITIES } from "@/lib/housing";
import { useUserCommunities } from "@/lib/hooks/use-user-communities";
import { CommunityPicker } from "@/components/community/community-picker";
import { uploadMedia } from "@/lib/media";

interface FormState {
  title: string;
  listingType: (typeof LISTING_TYPES)[number];
  propertyType: string;
  price: string;
  rentFrequency: string;
  bedrooms: string;
  bathrooms: string;
  areaSqft: string;
  addressLine1: string;
  city: string;
  state: string;
  pinCode: string;
  amenities: string[];
  description: string;
  pocName: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  listingType: LISTING_TYPES[0],
  propertyType: "",
  price: "",
  rentFrequency: "",
  bedrooms: "",
  bathrooms: "",
  areaSqft: "",
  addressLine1: "",
  city: "",
  state: "",
  pinCode: "",
  amenities: [],
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

export default function HousingRegisterPage() {
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

  const toggleAmenity = (a: string) =>
    setForm((f) => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] }));

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
      try {
        photoUrls.push(await uploadMedia(file, "housing-photo"));
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
        return;
      }
    }

    const res = await fetch("/api/moderation/housing-listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        listing_type: form.listingType,
        property_type: form.propertyType || null,
        price: form.price ? Number(form.price) : null,
        rent_frequency: form.listingType === "For Rent" ? form.rentFrequency || null : null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        area_sqft: form.areaSqft ? Number(form.areaSqft) : null,
        address_line1: form.addressLine1.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        pin_code: form.pinCode.trim() || null,
        amenities: form.amenities,
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
        <Link href="/services/housing" className="text-sm font-semibold text-[#8B1A6B] hover:underline">
          Back to Housing
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/services/housing" className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Post a Property</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm p-5 space-y-5">
        <Input label="Title" placeholder="e.g. 3BHK near Central Park" value={form.title} onChange={set("title")} />

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1.5">Listing type</p>
          <ChipGroup
            options={[...LISTING_TYPES]}
            value={[form.listingType]}
            onToggle={(v) => setForm((f) => ({ ...f, listingType: v as FormState["listingType"] }))}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1.5">Property type</p>
          <ChipGroup
            options={PROPERTY_TYPES}
            value={form.propertyType ? [form.propertyType] : []}
            onToggle={(v) => setForm((f) => ({ ...f, propertyType: f.propertyType === v ? "" : v }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={form.listingType === "For Rent" ? "Rent" : "Price"}
            type="number"
            placeholder="₹"
            value={form.price}
            onChange={set("price")}
          />
          {form.listingType === "For Rent" && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">Frequency</p>
              <ChipGroup
                options={RENT_FREQUENCIES}
                value={form.rentFrequency ? [form.rentFrequency] : []}
                onToggle={(v) => setForm((f) => ({ ...f, rentFrequency: v }))}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input label="Beds" type="number" placeholder="Optional" value={form.bedrooms} onChange={set("bedrooms")} />
          <Input label="Baths" type="number" placeholder="Optional" value={form.bathrooms} onChange={set("bathrooms")} />
          <Input label="Sq.ft" type="number" placeholder="Optional" value={form.areaSqft} onChange={set("areaSqft")} />
        </div>

        <Input label="Address" placeholder="Street address" value={form.addressLine1} onChange={set("addressLine1")} />
        <div className="grid grid-cols-3 gap-3">
          <Input label="City" value={form.city} onChange={set("city")} />
          <Input label="State" value={form.state} onChange={set("state")} />
          <Input label="PIN" value={form.pinCode} onChange={set("pinCode")} />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1.5">Amenities</p>
          <ChipGroup options={AMENITIES} value={form.amenities} onToggle={toggleAmenity} />
        </div>

        <Textarea
          label="Description"
          placeholder="Tell buyers/renters more about the property"
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
              <img src={photos[0].preview} alt="Property preview" className="w-full h-full object-cover" />
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
          Post Property
        </Button>
      </form>
    </div>
  );
}
