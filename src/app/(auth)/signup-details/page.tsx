"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, User, CheckCircle2 } from "lucide-react";
import { DEV_MODE, getDevUser, setDevProfile } from "@/lib/dev-auth";

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

const STEPS = ["Personal Info", "Location", "Photo"];

export default function SignupDetailsPage() {
  const [step, setStep] = useState(0); // 0 = personal, 1 = location, 2 = photo
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    dob: "",
    gender: "Male",
    state: "",
    city: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const set = (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setError("");
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  // Auto-generate username from full name
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const auto = name.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    setForm((f) => ({ ...f, fullName: name, username: f.username || auto }));
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Profile picture must be under 5MB"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setShowPhotoSheet(false);
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!form.fullName.trim()) { setError("Full name is required"); return false; }
      if (!form.username || form.username.length < 3) { setError("Username must be at least 3 characters"); return false; }
      if (!/^[a-z0-9_]+$/.test(form.username)) { setError("Username: only letters, numbers, underscores"); return false; }
      if (!form.dob) { setError("Date of birth is required"); return false; }
    }
    if (step === 1) {
      if (!form.state.trim()) { setError("State is required"); return false; }
      if (!form.city.trim()) { setError("City is required"); return false; }
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
    if (step === 0) router.push("/otp");
    else setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    // Dev bypass
    if (DEV_MODE) {
      const devUser = getDevUser();
      setDevProfile({
        id: devUser?.id ?? "dev-user",
        username: form.username,
        full_name: form.fullName.trim(),
        date_of_birth: form.dob,
        gender: form.gender,
        state: form.state.trim(),
        city: form.city.trim(),
        avatar_url: avatarPreview,
      });
      setLoading(false);
      router.push("/pin");
      return;
    }

    // Supabase flow
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/signup"); return; }

    let avatar_url: string | null = null;
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const { data: up, error: upErr } = await supabase.storage
        .from("avatars")
        .upload(`${user.id}.${ext}`, avatarFile, { upsert: true });
      if (!upErr && up) {
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(up.path);
        avatar_url = publicUrl;
      }
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      username: form.username,
      full_name: form.fullName.trim(),
      date_of_birth: form.dob,
      gender: form.gender,
      state: form.state.trim(),
      city: form.city.trim(),
      avatar_url,
    });

    setLoading(false);
    if (profileError) { setError(profileError.message); return; }
    router.push("/pin");
  };

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleBack}
          className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Create Profile</h1>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-5 px-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step
                  ? "bg-[#2A5C27] text-white"
                  : i === step
                  ? "bg-[#8B1A6B] text-white"
                  : "bg-gray-200 text-gray-400"
              }`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${i === step ? "text-[#8B1A6B]" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mb-4 rounded-full transition-all ${i < step ? "bg-[#2A5C27]" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        {/* ── Step 0: Personal Info ── */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 mb-0.5">Personal Details</h2>
              <p className="text-sm text-gray-500">Let&apos;s get to know you better</p>
            </div>

            <Input
              label="Full Name *"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleFullNameChange}
              autoFocus
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Username *
                {form.username && (
                  <span className="ml-2 text-xs text-[#8B1A6B] font-normal">@{form.username}</span>
                )}
              </label>
              <input
                type="text"
                placeholder="e.g. neha_singh"
                value={form.username}
                onChange={(e) => {
                  setError("");
                  setForm((f) => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") }));
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#8B1A6B] focus:outline-none focus:ring-2 focus:ring-[#8B1A6B]/15 transition-all"
              />
            </div>

            <Input
              label="Date of Birth *"
              type="date"
              value={form.dob}
              onChange={set("dob")}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <div className="relative">
                <select
                  value={form.gender}
                  onChange={set("gender")}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 appearance-none focus:border-[#8B1A6B] focus:outline-none focus:ring-2 focus:ring-[#8B1A6B]/15"
                >
                  {GENDERS.map((g) => <option key={g}>{g}</option>)}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Location ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 mb-0.5">Your Location</h2>
              <p className="text-sm text-gray-500">Helps connect you with nearby communities</p>
            </div>

            <Input
              label="State *"
              placeholder="e.g. Haryana"
              value={form.state}
              onChange={set("state")}
              autoFocus
            />
            <Input
              label="City *"
              placeholder="e.g. Gurugram"
              value={form.city}
              onChange={set("city")}
            />
          </div>
        )}

        {/* ── Step 2: Photo ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 mb-0.5">Profile Photo</h2>
              <p className="text-sm text-gray-500">Add a photo so people can recognise you</p>
            </div>

            <div className="flex flex-col items-center gap-4 py-4">
              <div
                onClick={() => setShowPhotoSheet(true)}
                className="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#8B1A6B] transition-colors"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-400">
                    <User className="w-10 h-10" />
                    <span className="text-xs">Tap to add</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowPhotoSheet(true)}
                className="text-sm font-semibold text-[#1E2952] border border-[#1E2952] px-5 py-2 rounded-full hover:bg-[#1E2952] hover:text-white transition-colors"
              >
                {avatarPreview ? "Change Photo" : "Upload Profile Picture"}
              </button>
              <p className="text-xs text-gray-400">Max 5MB · JPG, JPEG or PNG</p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpg,image/jpeg,image/png"
              className="hidden"
              onChange={handleFileChange}
            />

            <p className="text-xs text-center text-gray-400">
              You can skip this and add a photo later from your profile.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button type="button" variant="ghost" size="lg" fullWidth onClick={handleBack}>
            {step === 0 ? "Cancel" : "Back"}
          </Button>

          {step < 2 ? (
            <Button type="button" variant="dark" size="lg" fullWidth onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="button" variant="dark" size="lg" fullWidth loading={loading} onClick={handleSubmit}>
              Save Profile
            </Button>
          )}
        </div>
      </div>

      {/* Photo upload bottom sheet */}
      {showPhotoSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setShowPhotoSheet(false)}>
          <div className="absolute inset-0 bg-gray-600/60" />
          <div className="relative bg-white rounded-t-3xl p-6 space-y-1" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />
            <p className="font-semibold text-gray-900 pb-2">Upload profile picture</p>
            <button
              className="w-full flex items-center gap-3 py-3 px-1 text-sm text-gray-700 hover:bg-gray-50 rounded-xl"
              onClick={() => { fileRef.current?.click(); setShowPhotoSheet(false); }}
            >
              <span className="text-xl">🖼️</span> Choose from Gallery
            </button>
            <button
              className="w-full flex items-center gap-3 py-3 px-1 text-sm text-gray-700 hover:bg-gray-50 rounded-xl"
              onClick={() => { fileRef.current?.click(); setShowPhotoSheet(false); }}
            >
              <span className="text-xl">📷</span> Click Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
