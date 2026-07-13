"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { DEV_MODE } from "@/lib/dev-auth";
import { cn } from "@/lib/utils";

const STEPS = ["Business Details", "Contact", "Timing", "Category", "Photos"];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CATEGORIES = [
  "Printing Shop",
  "T Shirt Printing Services",
  "Grocery Store",
  "Restaurant",
  "Salon & Spa",
  "Electronics",
  "Clothing & Apparel",
  "Home Services",
  "Tutoring",
  "Other",
];

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

const EMPTY_FORM: FormState = {
  name: "",
  pinCode: "",
  addressLine1: "",
  addressLine2: "",
  street: "",
  landmark: "",
  area: "",
  city: "",
  state: "",
  pocName: "",
  mobileNumber: "",
  whatsappNumber: "",
  email: "",
  openDays: [],
  openTime: "",
  closeTime: "",
  categories: [],
};

interface PhotoFile {
  file: File;
  previewUrl: string;
}

export default function RegisterBusinessPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  if (DEV_MODE) {
    return (
      <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-sm p-8 text-center">
        <p className="text-sm text-gray-500 mb-3">
          Registering a business uploads photos and runs moderation against the live backend, so this page isn&apos;t available in dev mode.
        </p>
        <Link href="/services/businesses" className="text-sm font-semibold text-[#8B1A6B] hover:underline">
          Back to Businesses →
        </Link>
      </div>
    );
  }

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const toggleDay = (day: string) => {
    setError("");
    setForm((f) => ({
      ...f,
      openDays: f.openDays.includes(day) ? f.openDays.filter((d) => d !== day) : [...f.openDays, day],
    }));
  };

  const toggleCategory = (cat: string) => {
    setError("");
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter((c) => c !== cat) : [...f.categories, cat],
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const oversized = files.find((f) => f.size > 5 * 1024 * 1024);
    if (oversized) { setPhotoError("Each photo must be under 5MB"); return; }
    setPhotoError("");
    setPhotos((p) => [...p, ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((p) => {
      URL.revokeObjectURL(p[index].previewUrl);
      return p.filter((_, i) => i !== index);
    });
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!form.name.trim()) { setError("Business name is required"); return false; }
      if (!form.city.trim() || !form.state.trim()) { setError("City and state are required"); return false; }
    }
    if (step === 1) {
      if (!form.mobileNumber.trim()) { setError("Mobile number is required"); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setError("");
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError("");
    if (step === 0) router.push("/services/businesses");
    else setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const photoUrls: string[] = [];
    for (let i = 0; i < photos.length; i++) {
      const { file } = photos[i];
      const ext = file.name.split(".").pop();
      const path = `${user.id}/photo-${Date.now()}-${i}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("business-photos").upload(path, file);
      if (uploadErr) { setError(uploadErr.message); setLoading(false); return; }
      photoUrls.push(supabase.storage.from("business-photos").getPublicUrl(path).data.publicUrl);
    }

    const res = await fetch("/api/moderation/business-listings", {
      method: "POST",
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
        photo_urls: photoUrls,
      }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(body.error || "Something went wrong submitting your listing."); return; }

    setStatusMessage({ text: body.message, ok: body.decision !== "block" });
  };

  if (statusMessage) {
    return (
      <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-sm p-8 text-center">
        <CheckCircle2 className={cn("w-10 h-10 mx-auto mb-3", statusMessage.ok ? "text-[#2A5C27]" : "text-red-400")} />
        <p className="text-sm text-gray-600 mb-4">{statusMessage.text}</p>
        <Link
          href="/services/businesses"
          className="inline-block bg-[#1E2952] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#16203D] transition-colors"
        >
          Back to Businesses
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-3xl shadow-sm px-4 pt-4 pb-3 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0"
          >
            <ChevronLeft className="h-5 w-5 text-orange-500" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Register your Business</h1>
        </div>

        <div className="flex items-center gap-1 px-1">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-1 flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all",
                  i < step ? "bg-[#2A5C27] text-white" : i === step ? "bg-[#8B1A6B] text-white" : "bg-gray-200 text-gray-400"
                )}>
                  {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={cn("text-[9px] font-medium whitespace-nowrap", i === step ? "text-[#8B1A6B]" : "text-gray-400")}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("h-0.5 flex-1 mb-4 rounded-full transition-all", i < step ? "bg-[#2A5C27]" : "bg-gray-200")} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6">
        {/* ── Step 0: Business Details ── */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 mb-0.5">Business Details</h2>
              <p className="text-sm text-gray-500">Lets know your business</p>
            </div>
            <Input label="Business Name *" placeholder="e.g. Gurujisangat Printers" value={form.name} onChange={set("name")} autoFocus />
            <Input label="PIN code" placeholder="Enter PIN code" value={form.pinCode} onChange={set("pinCode")} inputMode="numeric" maxLength={6} />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-1">Business Address</p>
            <Input placeholder="Plot No. / Bldg No. / Wing / Shop No. / Floor" value={form.addressLine1} onChange={set("addressLine1")} />
            <Input placeholder="Building Name / Market / Colony / Society" value={form.addressLine2} onChange={set("addressLine2")} />
            <Input placeholder="Street / Road Name" value={form.street} onChange={set("street")} />
            <Input placeholder="Landmark" value={form.landmark} onChange={set("landmark")} />
            <Input placeholder="Area" value={form.area} onChange={set("area")} />
            <Input label="City *" placeholder="e.g. Gurugram" value={form.city} onChange={set("city")} />
            <Input label="State *" placeholder="e.g. Haryana" value={form.state} onChange={set("state")} />
          </div>
        )}

        {/* ── Step 1: Contact Details ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 mb-0.5">Add Contact Details</h2>
              <p className="text-sm text-gray-500">Lets know your POC</p>
            </div>
            <Input label="POC Name" placeholder="Enter POC" value={form.pocName} onChange={set("pocName")} autoFocus />
            <Input label="Mobile Number *" placeholder="Enter Mobile Number" value={form.mobileNumber} onChange={set("mobileNumber")} inputMode="numeric" />
            <Input label="WhatsApp Number" placeholder="Enter WhatsApp Number" value={form.whatsappNumber} onChange={set("whatsappNumber")} inputMode="numeric" />
            <Input label="Email Address" placeholder="Enter Email Address" type="email" value={form.email} onChange={set("email")} />
          </div>
        )}

        {/* ── Step 2: Business Timing ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 mb-0.5">Add Business timing</h2>
              <p className="text-sm text-gray-500">Let your customers know when you are open for business</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Select Days of the week</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors",
                      form.openDays.includes(day)
                        ? "bg-[#a3384b] text-white border-[#a3384b]"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Open at" type="time" value={form.openTime} onChange={set("openTime")} />
            <Input label="Close at" type="time" value={form.closeTime} onChange={set("closeTime")} />
          </div>
        )}

        {/* ── Step 3: Business Category ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 mb-0.5">Add business category</h2>
              <p className="text-sm text-gray-500">Choose the right business categories so your customer can easily find you</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Business Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors",
                      form.categories.includes(cat)
                        ? "bg-[#a3384b] text-white border-[#a3384b]"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {cat}
                    {form.categories.includes(cat) && <X className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Photos ── */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 mb-0.5">Add Photos</h2>
              <p className="text-sm text-gray-500">Showcase photos of your business to look authentic</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-[#8B1A6B] hover:text-[#8B1A6B] transition-colors"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-xs">Upload Photo</span>
                <span className="text-[10px] text-gray-400 px-3 text-center">Supporting formats: jpg, jpeg, png</span>
              </button>
              {photos.map((p, i) => (
                <div key={p.previewUrl} className="relative h-32 rounded-xl overflow-hidden">
                  <img src={p.previewUrl} alt={`Business photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label="Remove photo"
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-gray-900/60 text-white flex items-center justify-center hover:bg-gray-900/80 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              multiple
              className="hidden"
              onChange={handlePhotoChange}
            />
            {photoError && <p className="text-xs text-red-500">{photoError}</p>}
          </div>
        )}

        {error && (
          <div className="mt-3 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="ghost" size="lg" fullWidth onClick={handleBack}>
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" variant="dark" size="lg" fullWidth onClick={handleNext}>Next</Button>
          ) : (
            <Button type="button" variant="dark" size="lg" fullWidth loading={loading} onClick={handleSubmit}>Submit</Button>
          )}
        </div>
      </div>
    </div>
  );
}
