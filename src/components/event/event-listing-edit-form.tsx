"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { EVENT_CATEGORIES } from "@/lib/event";
import type { EventListing } from "@/lib/types";

interface FormState {
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  isOnline: boolean;
  onlineLink: string;
  venueName: string;
  address: string;
  city: string;
  state: string;
  pocName: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
  registrationLink: string;
  categories: string[];
}

function toForm(event: EventListing): FormState {
  return {
    title: event.title,
    description: event.description ?? "",
    eventDate: event.event_date,
    startTime: event.start_time?.slice(0, 5) ?? "",
    endTime: event.end_time?.slice(0, 5) ?? "",
    isOnline: event.is_online,
    onlineLink: event.online_link ?? "",
    venueName: event.venue_name ?? "",
    address: event.address ?? "",
    city: event.city ?? "",
    state: event.state ?? "",
    pocName: event.poc_name ?? "",
    mobileNumber: event.mobile_number ?? "",
    whatsappNumber: event.whatsapp_number ?? "",
    email: event.email ?? "",
    registrationLink: event.registration_link ?? "",
    categories: event.categories,
  };
}

export function EventListingEditForm({ event }: { event: EventListing }) {
  const [form, setForm] = useState<FormState>(toForm(event));
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>(event.photo_urls);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setError("");
    setForm((f) => ({ ...f, [key]: e.target.value }));
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

  const handleCancel = () => router.push(`/services/events/${event.id}`);

  const validate = (): boolean => {
    if (!form.title.trim()) { setError("Event title is required"); return false; }
    if (!form.eventDate) { setError("Event date is required"); return false; }
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
      const { error: uploadErr } = await supabase.storage.from("event-photos").upload(path, file);
      if (uploadErr) { setError(uploadErr.message); setLoading(false); return; }
      uploadedUrls.push(supabase.storage.from("event-photos").getPublicUrl(path).data.publicUrl);
    }

    const res = await fetch(`/api/moderation/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        description: form.description.trim() || null,
        event_date: form.eventDate,
        start_time: form.startTime || null,
        end_time: form.endTime || null,
        is_online: form.isOnline,
        online_link: form.onlineLink.trim() || null,
        venue_name: form.venueName.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        poc_name: form.pocName.trim() || null,
        mobile_number: form.mobileNumber.trim() || null,
        whatsapp_number: form.whatsappNumber.trim() || null,
        email: form.email.trim() || null,
        registration_link: form.registrationLink.trim() || null,
        categories: form.categories,
        photo_urls: [...existingPhotoUrls, ...uploadedUrls],
      }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(body.error || "Something went wrong saving this event."); return; }
    router.push(`/services/events/${event.id}`);
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={handleCancel} className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Edit Event</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Event Details</p>
        <Input label="Event Title *" value={form.title} onChange={set("title")} placeholder="e.g. Community Diwali Mela" />
        <Textarea label="Description" value={form.description} onChange={set("description")} rows={4} placeholder="What's this event about?" />

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Date &amp; Venue</p>
        <Input label="Event Date *" type="date" value={form.eventDate} onChange={set("eventDate")} />
        <Input label="Start Time" type="time" value={form.startTime} onChange={set("startTime")} />
        <Input label="End Time" type="time" value={form.endTime} onChange={set("endTime")} />
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, isOnline: !f.isOnline }))}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">Online event</span>
          <span className={cn("relative w-11 h-6 rounded-full transition-colors", form.isOnline ? "bg-[#8B1A6B]" : "bg-gray-200")}>
            <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform", form.isOnline && "translate-x-5")} />
          </span>
        </button>
        {form.isOnline ? (
          <Input label="Online Link" value={form.onlineLink} onChange={set("onlineLink")} placeholder="e.g. a video call link" />
        ) : (
          <>
            <Input label="Venue Name" value={form.venueName} onChange={set("venueName")} placeholder="e.g. Community Hall" />
            <Input label="Address" value={form.address} onChange={set("address")} />
            <Input label="City" value={form.city} onChange={set("city")} />
            <Input label="State" value={form.state} onChange={set("state")} />
          </>
        )}

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Contact</p>
        <Input label="Organizer Name" value={form.pocName} onChange={set("pocName")} />
        <Input label="Mobile Number *" value={form.mobileNumber} onChange={set("mobileNumber")} inputMode="numeric" />
        <Input label="WhatsApp Number" value={form.whatsappNumber} onChange={set("whatsappNumber")} inputMode="numeric" />
        <Input label="Email Address" type="email" value={form.email} onChange={set("email")} />
        <Input label="Registration Link" value={form.registrationLink} onChange={set("registrationLink")} placeholder="Optional external signup link" />

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Category</p>
        <div className="flex flex-wrap gap-2">
          {EVENT_CATEGORIES.map((cat) => (
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
              <img src={url} alt="Event" className="w-full h-full object-cover" />
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
