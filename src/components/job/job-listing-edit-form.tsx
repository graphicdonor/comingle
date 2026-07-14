"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { JOB_TYPES, JOB_CATEGORIES } from "@/lib/job";
import type { JobListing } from "@/lib/types";

interface FormState {
  title: string;
  companyName: string;
  jobType: string;
  city: string;
  state: string;
  isRemote: boolean;
  pocName: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
  applicationLink: string;
  salaryMin: string;
  salaryMax: string;
  categories: string[];
  description: string;
}

function toForm(listing: JobListing): FormState {
  return {
    title: listing.title,
    companyName: listing.company_name ?? "",
    jobType: listing.job_type ?? JOB_TYPES[0],
    city: listing.city ?? "",
    state: listing.state ?? "",
    isRemote: listing.is_remote,
    pocName: listing.poc_name ?? "",
    mobileNumber: listing.mobile_number ?? "",
    whatsappNumber: listing.whatsapp_number ?? "",
    email: listing.email ?? "",
    applicationLink: listing.application_link ?? "",
    salaryMin: listing.salary_min != null ? String(listing.salary_min) : "",
    salaryMax: listing.salary_max != null ? String(listing.salary_max) : "",
    categories: listing.categories,
    description: listing.description ?? "",
  };
}

export function JobListingEditForm({ listing }: { listing: JobListing }) {
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

  const handleCancel = () => router.push(`/services/jobs/${listing.id}`);

  const validate = (): boolean => {
    if (!form.title.trim()) { setError("Job title is required"); return false; }
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
      const { error: uploadErr } = await supabase.storage.from("job-photos").upload(path, file);
      if (uploadErr) { setError(uploadErr.message); setLoading(false); return; }
      uploadedUrls.push(supabase.storage.from("job-photos").getPublicUrl(path).data.publicUrl);
    }

    const res = await fetch(`/api/moderation/job-listings/${listing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        company_name: form.companyName.trim() || null,
        job_type: form.jobType || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        is_remote: form.isRemote,
        poc_name: form.pocName.trim() || null,
        mobile_number: form.mobileNumber.trim() || null,
        whatsapp_number: form.whatsappNumber.trim() || null,
        email: form.email.trim() || null,
        application_link: form.applicationLink.trim() || null,
        salary_min: form.salaryMin ? Number(form.salaryMin) : null,
        salary_max: form.salaryMax ? Number(form.salaryMax) : null,
        categories: form.categories,
        description: form.description.trim() || null,
        photo_urls: [...existingPhotoUrls, ...uploadedUrls],
      }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(body.error || "Something went wrong saving this job posting."); return; }
    router.push(`/services/jobs/${listing.id}`);
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={handleCancel} className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Edit Job Posting</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Job Details</p>
        <Input label="Job Title *" value={form.title} onChange={set("title")} placeholder="e.g. Front Desk Executive" />
        <Input label="Company Name" value={form.companyName} onChange={set("companyName")} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Job Type</label>
          <div className="flex flex-wrap gap-2">
            {JOB_TYPES.map((jt) => (
              <button
                key={jt}
                type="button"
                onClick={() => setForm((f) => ({ ...f, jobType: jt }))}
                className={cn(
                  "px-3.5 py-2 rounded-full text-sm font-medium border transition-colors",
                  form.jobType === jt ? "bg-[#a3384b] text-white border-[#a3384b]" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {jt}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, isRemote: !f.isRemote }))}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">Remote role</span>
          <span className={cn("relative w-11 h-6 rounded-full transition-colors", form.isRemote ? "bg-[#8B1A6B]" : "bg-gray-200")}>
            <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform", form.isRemote && "translate-x-5")} />
          </span>
        </button>
        {!form.isRemote && (
          <>
            <Input label="City" value={form.city} onChange={set("city")} />
            <Input label="State" value={form.state} onChange={set("state")} />
          </>
        )}

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Contact</p>
        <Input label="POC Name" value={form.pocName} onChange={set("pocName")} />
        <Input label="Mobile Number *" value={form.mobileNumber} onChange={set("mobileNumber")} inputMode="numeric" />
        <Input label="WhatsApp Number" value={form.whatsappNumber} onChange={set("whatsappNumber")} inputMode="numeric" />
        <Input label="Email Address" type="email" value={form.email} onChange={set("email")} />
        <Input label="Application Link" value={form.applicationLink} onChange={set("applicationLink")} />

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Salary</p>
        <Input label="Minimum (per month)" value={form.salaryMin} onChange={set("salaryMin")} inputMode="numeric" />
        <Input label="Maximum (per month)" value={form.salaryMax} onChange={set("salaryMax")} inputMode="numeric" />

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Category</p>
        <div className="flex flex-wrap gap-2">
          {JOB_CATEGORIES.map((cat) => (
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

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Description</p>
        <Textarea value={form.description} onChange={set("description")} rows={6} placeholder="Responsibilities, requirements, anything a candidate should know" />

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Photos</p>
        <div className="flex flex-wrap gap-3">
          {existingPhotoUrls.map((url) => (
            <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Job" className="w-full h-full object-cover" />
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
