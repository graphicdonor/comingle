"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { DEV_MODE } from "@/lib/dev-auth";
import { cn } from "@/lib/utils";
import { JOB_TYPES, JOB_CATEGORIES } from "@/lib/job";

const STEPS = ["Job Details", "Contact", "Salary", "Category", "Description"];

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

const EMPTY_FORM: FormState = {
  title: "",
  companyName: "",
  jobType: JOB_TYPES[0],
  city: "",
  state: "",
  isRemote: false,
  pocName: "",
  mobileNumber: "",
  whatsappNumber: "",
  email: "",
  applicationLink: "",
  salaryMin: "",
  salaryMax: "",
  categories: [],
  description: "",
};

interface PhotoFile {
  file: File;
  previewUrl: string;
}

export default function RegisterJobPage() {
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
          Posting a job uploads photos and runs moderation against the live backend, so this page isn&apos;t available in dev mode.
        </p>
        <Link href="/services/jobs" className="text-sm font-semibold text-[#8B1A6B] hover:underline">
          Back to Jobs →
        </Link>
      </div>
    );
  }

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setError("");
    setForm((f) => ({ ...f, [key]: e.target.value }));
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
      if (!form.title.trim()) { setError("Job title is required"); return false; }
      if (!form.isRemote && (!form.city.trim() || !form.state.trim())) { setError("City and state are required, unless the role is remote"); return false; }
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
    if (step === 0) router.push("/services/jobs");
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
      const { error: uploadErr } = await supabase.storage.from("job-photos").upload(path, file);
      if (uploadErr) { setError(uploadErr.message); setLoading(false); return; }
      photoUrls.push(supabase.storage.from("job-photos").getPublicUrl(path).data.publicUrl);
    }

    const res = await fetch("/api/moderation/job-listings", {
      method: "POST",
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
        photo_urls: photoUrls,
      }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(body.error || "Something went wrong submitting your job posting."); return; }

    setStatusMessage({ text: body.message, ok: body.decision !== "block" });
  };

  if (statusMessage) {
    return (
      <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-sm p-8 text-center">
        <CheckCircle2 className={cn("w-10 h-10 mx-auto mb-3", statusMessage.ok ? "text-[#2A5C27]" : "text-red-400")} />
        <p className="text-sm text-gray-600 mb-4">{statusMessage.text}</p>
        <Link
          href="/services/jobs"
          className="inline-block bg-[#1E2952] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#16203D] transition-colors"
        >
          Back to Jobs
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
          <h1 className="text-lg font-bold text-gray-900">Post a Job</h1>
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
        {/* ── Step 0: Job Details ── */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 mb-0.5">Job Details</h2>
              <p className="text-sm text-gray-500">Lets know about the role</p>
            </div>
            <Input label="Job Title *" placeholder="e.g. Front Desk Executive" value={form.title} onChange={set("title")} autoFocus />
            <Input label="Company Name" placeholder="e.g. Gurujisangat Printers" value={form.companyName} onChange={set("companyName")} />
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
                <Input label="City *" placeholder="e.g. Gurugram" value={form.city} onChange={set("city")} />
                <Input label="State *" placeholder="e.g. Haryana" value={form.state} onChange={set("state")} />
              </>
            )}
          </div>
        )}

        {/* ── Step 1: Contact ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 mb-0.5">Add Contact Details</h2>
              <p className="text-sm text-gray-500">How should candidates reach you</p>
            </div>
            <Input label="POC Name" placeholder="Enter POC" value={form.pocName} onChange={set("pocName")} autoFocus />
            <Input label="Mobile Number *" placeholder="Enter Mobile Number" value={form.mobileNumber} onChange={set("mobileNumber")} inputMode="numeric" />
            <Input label="WhatsApp Number" placeholder="Enter WhatsApp Number" value={form.whatsappNumber} onChange={set("whatsappNumber")} inputMode="numeric" />
            <Input label="Email Address" placeholder="Enter Email Address" type="email" value={form.email} onChange={set("email")} />
            <Input label="Application Link" placeholder="e.g. a form or careers page URL" value={form.applicationLink} onChange={set("applicationLink")} />
          </div>
        )}

        {/* ── Step 2: Salary ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 mb-0.5">Add Salary</h2>
              <p className="text-sm text-gray-500">Optional, but listings with a salary range get more applicants</p>
            </div>
            <Input label="Minimum (per month)" placeholder="e.g. 15000" value={form.salaryMin} onChange={set("salaryMin")} inputMode="numeric" />
            <Input label="Maximum (per month)" placeholder="e.g. 25000" value={form.salaryMax} onChange={set("salaryMax")} inputMode="numeric" />
          </div>
        )}

        {/* ── Step 3: Category ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 mb-0.5">Add job category</h2>
              <p className="text-sm text-gray-500">Choose the right category so candidates can easily find this role</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Category</label>
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
            </div>
          </div>
        )}

        {/* ── Step 4: Description + Photos ── */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 mb-0.5">Describe the role</h2>
              <p className="text-sm text-gray-500">Responsibilities, requirements, anything a candidate should know</p>
            </div>
            <Textarea placeholder="What does this role involve?" value={form.description} onChange={set("description")} rows={6} />

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Photos (optional)</p>
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
                  <img src={p.previewUrl} alt={`Job photo ${i + 1}`} className="w-full h-full object-cover" />
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
