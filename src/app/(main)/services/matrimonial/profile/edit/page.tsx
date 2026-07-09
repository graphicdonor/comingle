"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { DEV_MODE, getDevUser } from "@/lib/dev-auth";
import { getDevMatrimonialProfile, setDevMatrimonialProfile } from "@/lib/dev-matrimonial";
import {
  MARITAL_STATUSES,
  INCOME_BRACKETS,
  EDUCATION_OPTIONS,
  EMPLOYMENT_OPTIONS,
  CREATED_BY_OPTIONS,
  ABOUT_ME_MAX_LENGTH,
  MAX_PHOTOS,
  MAX_PHOTO_SIZE_BYTES,
  isMatrimonialEligible,
} from "@/lib/matrimonial";

interface FormState {
  full_name: string;
  date_of_birth: string;
  time_of_birth: string;
  place_of_birth: string;
  city: string;
  height: string;
  mangalik_dosh: boolean;
  income_range: string;
  marital_status: string;
  education: string;
  employment_status: string;
  created_by: string;
  about_me: string;
}

const EMPTY_FORM: FormState = {
  full_name: "",
  date_of_birth: "",
  time_of_birth: "",
  place_of_birth: "",
  city: "",
  height: "",
  mangalik_dosh: false,
  income_range: "",
  marital_status: "",
  education: "",
  employment_status: "",
  created_by: "",
  about_me: "",
};

export default function MatrimonialProfileEditPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (DEV_MODE) {
      const p = getDevMatrimonialProfile();
      if (p) {
        setForm({
          full_name: p.full_name,
          date_of_birth: p.date_of_birth ?? "",
          time_of_birth: p.time_of_birth ?? "",
          place_of_birth: p.place_of_birth ?? "",
          city: p.city ?? "",
          height: p.height ?? "",
          mangalik_dosh: p.mangalik_dosh,
          income_range: p.income_range ?? "",
          marital_status: p.marital_status ?? "",
          education: p.education ?? "",
          employment_status: p.employment_status ?? "",
          created_by: p.created_by ?? "",
          about_me: p.about_me ?? "",
        });
        setExistingPhotoUrls(p.photo_urls);
      }
      setReady(true);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }

      const [{ data: mainProfile }, { data: matProfile }] = await Promise.all([
        supabase.from("profiles").select("full_name, date_of_birth, gender").eq("id", data.user.id).single(),
        supabase.from("matrimonial_profiles").select("*").eq("user_id", data.user.id).maybeSingle(),
      ]);

      if (!isMatrimonialEligible(mainProfile?.gender)) {
        router.push("/services/matrimonial");
        return;
      }

      if (matProfile) {
        setForm({
          full_name: matProfile.full_name,
          date_of_birth: matProfile.date_of_birth,
          time_of_birth: matProfile.time_of_birth ?? "",
          place_of_birth: matProfile.place_of_birth ?? "",
          city: matProfile.city ?? "",
          height: matProfile.height ?? "",
          mangalik_dosh: matProfile.mangalik_dosh,
          income_range: matProfile.income_range ?? "",
          marital_status: matProfile.marital_status ?? "",
          education: matProfile.education ?? "",
          employment_status: matProfile.employment_status ?? "",
          created_by: matProfile.created_by ?? "",
          about_me: matProfile.about_me ?? "",
        });
        setExistingPhotoUrls(matProfile.photo_urls);
      } else {
        // Prefill from the main profile on first creation.
        setForm((f) => ({
          ...f,
          full_name: mainProfile?.full_name ?? "",
          date_of_birth: mainProfile?.date_of_birth ?? "",
        }));
      }
      setReady(true);
    });
  }, []);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setError("");
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const totalPhotoCount = existingPhotoUrls.length + newPhotoFiles.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    setError("");
    for (const file of files) {
      if (totalPhotoCount + newPhotoFiles.length >= MAX_PHOTOS) {
        setError(`You can upload up to ${MAX_PHOTOS} photos`);
        break;
      }
      if (file.size > MAX_PHOTO_SIZE_BYTES) {
        setError("Each photo must be under 5MB");
        continue;
      }
      setNewPhotoFiles((prev) => [...prev, file]);
      setNewPhotoPreviews((prev) => [...prev, URL.createObjectURL(file)]);
    }
  };

  const removeExistingPhoto = (url: string) => setExistingPhotoUrls((prev) => prev.filter((u) => u !== url));
  const removeNewPhoto = (index: number) => {
    setNewPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    if (!form.full_name.trim()) { setError("Full name is required"); return false; }
    if (!form.date_of_birth) { setError("Date of birth is required"); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");

    if (DEV_MODE) {
      setDevMatrimonialProfile({
        user_id: getDevUser()?.id ?? "dev",
        ...form,
        photo_urls: [...existingPhotoUrls, ...newPhotoPreviews],
      });
      setTimeout(() => {
        setLoading(false);
        router.push("/services/matrimonial/profile");
      }, 400);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); router.push("/login"); return; }

    const uploadedUrls: string[] = [];
    for (let i = 0; i < newPhotoFiles.length; i++) {
      const file = newPhotoFiles[i];
      const ext = file.name.split(".").pop();
      const path = `${user.id}/photo-${Date.now()}-${i}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("matrimonial-photos").upload(path, file);
      if (uploadError) { setError(uploadError.message); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("matrimonial-photos").getPublicUrl(path);
      uploadedUrls.push(urlData.publicUrl);
    }

    const { error: saveError } = await supabase.from("matrimonial_profiles").upsert(
      {
        user_id: user.id,
        full_name: form.full_name.trim(),
        date_of_birth: form.date_of_birth,
        time_of_birth: form.time_of_birth || null,
        place_of_birth: form.place_of_birth.trim() || null,
        city: form.city.trim() || null,
        height: form.height.trim() || null,
        mangalik_dosh: form.mangalik_dosh,
        income_range: form.income_range || null,
        marital_status: form.marital_status || null,
        education: form.education || null,
        employment_status: form.employment_status || null,
        created_by: form.created_by || null,
        about_me: form.about_me.trim() || null,
        photo_urls: [...existingPhotoUrls, ...uploadedUrls].slice(0, MAX_PHOTOS),
      },
      { onConflict: "user_id" }
    );

    setLoading(false);
    if (saveError) { setError(saveError.message); return; }
    window.location.href = "/services/matrimonial/profile";
  };

  if (!ready) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.push("/services/matrimonial/profile")}
          className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </button>
        <h2 className="text-lg font-bold text-gray-900">Create Matrimony Profile</h2>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Personal Information</p>

        <Input label="Full Name *" value={form.full_name} onChange={set("full_name")} placeholder="Enter your full name" />

        <div className="flex flex-col gap-1.5">
          <Textarea
            label="About"
            value={form.about_me}
            onChange={set("about_me")}
            placeholder="Tell people a little about yourself…"
            rows={4}
            maxLength={ABOUT_ME_MAX_LENGTH}
          />
          <p className="text-right text-xs text-gray-400">{form.about_me.length}/{ABOUT_ME_MAX_LENGTH} characters</p>
        </div>

        <Input label="Date of Birth *" type="date" value={form.date_of_birth} onChange={set("date_of_birth")} />
        <Input label="Time of Birth" type="time" value={form.time_of_birth} onChange={set("time_of_birth")} />
        <Input label="Place of Birth" value={form.place_of_birth} onChange={set("place_of_birth")} placeholder="e.g. Hissar, Haryana" />
        <Input label="City living in" value={form.city} onChange={set("city")} placeholder="e.g. Gurugram" />
        <Input label="Height" value={form.height} onChange={set("height")} placeholder={'e.g. 5\'8"'} />

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Mangalik Dosh</span>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, mangalik_dosh: !f.mangalik_dosh }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.mangalik_dosh ? "bg-[#8B1A6B]" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.mangalik_dosh ? "translate-x-5" : ""}`} />
          </button>
        </div>

        <SelectField label="Income (LPA)" value={form.income_range} onChange={set("income_range")} options={INCOME_BRACKETS} />
        <SelectField label="Marital Status" value={form.marital_status} onChange={set("marital_status")} options={MARITAL_STATUSES} />
        <SelectField label="Education" value={form.education} onChange={set("education")} options={EDUCATION_OPTIONS} />
        <SelectField label="Employment" value={form.employment_status} onChange={set("employment_status")} options={EMPLOYMENT_OPTIONS} />
        <SelectField label="Profile Created by" value={form.created_by} onChange={set("created_by")} options={CREATED_BY_OPTIONS} />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Profile pic</label>
          <div className="flex flex-wrap gap-3">
            {existingPhotoUrls.map((url) => (
              <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Profile" className="w-full h-full object-cover" />
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
          </div>
          {totalPhotoCount < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#1E2952] border border-[#1E2952] px-4 py-2 rounded-full hover:bg-[#1E2952] hover:text-white transition-colors w-fit mt-1"
            >
              <Camera className="w-4 h-4" /> Upload profile picture
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png" multiple className="hidden" onChange={handleFileChange} />
          <p className="text-xs text-gray-400">Profile picture should be under 5MB. Supported formats: jpg, jpeg, png.</p>
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" size="lg" fullWidth onClick={() => router.push("/services/matrimonial/profile")}>
            Cancel
          </Button>
          <Button type="button" size="lg" fullWidth loading={loading} onClick={handleSubmit}>
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: readonly string[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 appearance-none focus:border-[#8B1A6B] focus:outline-none focus:ring-2 focus:ring-[#8B1A6B]/15"
        >
          <option value="">Select…</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
      </div>
    </div>
  );
}
