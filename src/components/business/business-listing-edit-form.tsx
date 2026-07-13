"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { BUSINESS_DAYS, BUSINESS_CATEGORIES } from "@/lib/business";
import type { BusinessListing } from "@/lib/types";

interface FormState {
  name: string;
  pinCode: string;
  addressLine1: string;
  addressLine2: string;
  street: string;
  landmark: string;
  area: string;
  city: string;
  state: string;
  pocName: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
  openDays: string[];
  openTime: string;
  closeTime: string;
  categories: string[];
}

function toForm(listing: BusinessListing): FormState {
  return {
    name: listing.name,
    pinCode: listing.pin_code ?? "",
    addressLine1: listing.address_line1 ?? "",
    addressLine2: listing.address_line2 ?? "",
    street: listing.street ?? "",
    landmark: listing.landmark ?? "",
    area: listing.area ?? "",
    city: listing.city ?? "",
    state: listing.state ?? "",
    pocName: listing.poc_name ?? "",
    mobileNumber: listing.mobile_number ?? "",
    whatsappNumber: listing.whatsapp_number ?? "",
    email: listing.email ?? "",
    openDays: listing.open_days,
    openTime: listing.open_time?.slice(0, 5) ?? "",
    closeTime: listing.close_time?.slice(0, 5) ?? "",
    categories: listing.categories,
  };
}

export function BusinessListingEditForm({ listing }: { listing: BusinessListing }) {
  const [form, setForm] = useState<FormState>(toForm(listing));
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>(listing.photo_urls);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const toggleDay = (day: string) => {
    setForm((f) => ({ ...f, openDays: f.openDays.includes(day) ? f.openDays.filter((d) => d !== day) : [...f.openDays, day] }));
  };

  const toggleCategory = (cat: string) => {
    setForm((f) => ({ ...f, categories: f.categories.includes(cat) ? f.categories.filter((c) => c !== cat) : [...f.categories, cat] }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const oversized = files.find((f) => f.size > 5 * 1024 * 1024);
    if (oversized) { setPhotoError("Each photo must be under 5MB"); return; }
    setPhotoError("");
    setNewPhotoFiles((prev) => [...prev, ...files]);
    setNewPhotoPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeExistingPhoto = (url: string) => setExistingPhotoUrls((prev) => prev.filter((u) => u !== url));
  const removeNewPhoto = (index: number) => {
    setNewPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => router.push(`/services/businesses/${listing.id}`);

  const validate = (): boolean => {
    if (!form.name.trim()) { setError("Business name is required"); return false; }
    if (!form.mobileNumber.trim()) { setError("Mobile number is required"); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setError("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const uploadedUrls: string[] = [];
    for (let i = 0; i < newPhotoFiles.length; i++) {
      const file = newPhotoFiles[i];
      const ext = file.name.split(".").pop();
      const path = `${user.id}/photo-${Date.now()}-${i}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("business-photos").upload(path, file);
      if (uploadErr) { setError(uploadErr.message); setLoading(false); return; }
      uploadedUrls.push(supabase.storage.from("business-photos").getPublicUrl(path).data.publicUrl);
    }

    const res = await fetch(`/api/moderation/business-listings/${listing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        pin_code: form.pinCode.trim() || null,
        address_line1: form.addressLine1.trim() || null,
        address_line2: form.addressLine2.trim() || null,
        street: form.street.trim() || null,
        landmark: form.landmark.trim() || null,
        area: form.area.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        poc_name: form.pocName.trim() || null,
        mobile_number: form.mobileNumber.trim() || null,
        whatsapp_number: form.whatsappNumber.trim() || null,
        email: form.email.trim() || null,
        categories: form.categories,
        open_days: form.openDays,
        open_time: form.openTime || null,
        close_time: form.closeTime || null,
        photo_urls: [...existingPhotoUrls, ...uploadedUrls],
      }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(body.error || "Something went wrong saving this listing."); return; }
    router.push(`/services/businesses/${listing.id}`);
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={handleCancel} className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Edit Business</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Business Details</p>
        <Input label="Business Name *" value={form.name} onChange={set("name")} placeholder="e.g. Gurujisangat Printers" />
        <Input label="PIN code" value={form.pinCode} onChange={set("pinCode")} inputMode="numeric" maxLength={6} />
        <Input placeholder="Plot No. / Bldg No. / Wing / Shop No. / Floor" value={form.addressLine1} onChange={set("addressLine1")} />
        <Input placeholder="Building Name / Market / Colony / Society" value={form.addressLine2} onChange={set("addressLine2")} />
        <Input placeholder="Street / Road Name" value={form.street} onChange={set("street")} />
        <Input placeholder="Landmark" value={form.landmark} onChange={set("landmark")} />
        <Input placeholder="Area" value={form.area} onChange={set("area")} />
        <Input label="City" value={form.city} onChange={set("city")} />
        <Input label="State" value={form.state} onChange={set("state")} />

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Contact</p>
        <Input label="POC Name" value={form.pocName} onChange={set("pocName")} />
        <Input label="Mobile Number *" value={form.mobileNumber} onChange={set("mobileNumber")} inputMode="numeric" />
        <Input label="WhatsApp Number" value={form.whatsappNumber} onChange={set("whatsappNumber")} inputMode="numeric" />
        <Input label="Email Address" type="email" value={form.email} onChange={set("email")} />

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Timing</p>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Days open</label>
          <div className="flex flex-wrap gap-2">
            {BUSINESS_DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors",
                  form.openDays.includes(day) ? "bg-[#a3384b] text-white border-[#a3384b]" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <Input label="Open at" type="time" value={form.openTime} onChange={set("openTime")} />
        <Input label="Close at" type="time" value={form.closeTime} onChange={set("closeTime")} />

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Category</p>
        <div className="flex flex-wrap gap-2">
          {BUSINESS_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors",
                form.categories.includes(cat) ? "bg-[#a3384b] text-white border-[#a3384b]" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {cat}
              {form.categories.includes(cat) && <X className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Photos</p>
        <div className="flex flex-wrap gap-3">
          {existingPhotoUrls.map((url) => (
            <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Business" className="w-full h-full object-cover" />
              <button onClick={() => removeExistingPhoto(url)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {newPhotoPreviews.map((url, i) => (
            <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="New upload" className="w-full h-full object-cover" />
              <button onClick={() => removeNewPhoto(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#8B1A6B] hover:text-[#8B1A6B] transition-colors"
          >
            <span className="text-2xl">+</span>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png" multiple className="hidden" onChange={handlePhotoChange} />
        {photoError && <p className="text-xs text-red-500">{photoError}</p>}

        {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" size="lg" fullWidth onClick={handleCancel}>Cancel</Button>
          <Button type="button" size="lg" fullWidth loading={loading} onClick={handleSubmit}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
