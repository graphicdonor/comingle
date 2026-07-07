"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronLeft, Check, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { DEV_MODE, getDevProfile, setDevProfile } from "@/lib/dev-auth";
import { createClient } from "@/lib/supabase/client";

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export default function EditProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    bio: "",
    date_of_birth: "",
    gender: "",
    state: "",
    city: "",
  });

  useEffect(() => {
    if (DEV_MODE) {
      const p = getDevProfile();
      if (!p) { router.push("/signup"); return; }
      setForm({
        full_name: p.full_name || "",
        username: p.username || "",
        bio: p.bio || "",
        date_of_birth: p.date_of_birth || "",
        gender: p.gender || "",
        state: p.state || "",
        city: p.city || "",
      });
      setAvatarPreview(p.avatar_url || null);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      const { data: p } = await supabase
        .from("profiles").select("*").eq("id", data.user.id).single();
      if (!p) { router.push("/signup-details"); return; }
      setForm({
        full_name: p.full_name || "",
        username: p.username || "",
        bio: p.bio || "",
        date_of_birth: p.date_of_birth || "",
        gender: p.gender || "",
        state: p.state || "",
        city: p.city || "",
      });
      setAvatarPreview(p.avatar_url || null);
    });
  }, []);

  const set = (field: string, val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) { setError("Full name is required"); return; }
    if (!form.username.trim()) { setError("Username is required"); return; }
    setError("");
    setLoading(true);

    if (DEV_MODE) {
      let avatar_url = avatarPreview;
      if (avatarFile) {
        avatar_url = URL.createObjectURL(avatarFile);
      }
      setDevProfile({ ...form, avatar_url: avatar_url || null });
      setTimeout(() => {
        setLoading(false);
        setSaved(true);
        setTimeout(() => router.push(`/profile/${form.username}`), 900);
      }, 600);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    let avatar_url: string | null = avatarPreview;
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("avatars").upload(path, avatarFile, { upsert: true });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = urlData.publicUrl;
      }
    }

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ ...form, avatar_url, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    setLoading(false);
    if (updateErr) {
      setError(updateErr.message);
      return;
    }
    setSaved(true);
    setTimeout(() => router.push(`/profile/${form.username}`), 900);
  };

  const displayName = form.full_name || form.username || "You";

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Profile Photo</p>
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar src={avatarPreview} name={displayName} size="xl" className="ring-4 ring-gray-100" />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#8B1A6B] rounded-full flex items-center justify-center shadow-md hover:bg-[#7a1760] transition-colors"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{displayName}</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-[#8B1A6B] font-medium hover:underline mt-0.5"
            >
              Change photo
            </button>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-4 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Basic Info</p>

        <Field label="Full Name" required>
          <input
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            placeholder="Your full name"
            className="input-field"
          />
        </Field>

        <Field label="Username" required>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">@</span>
            <input
              value={form.username}
              onChange={(e) => set("username", e.target.value.toLowerCase().replace(/\s+/g, "_"))}
              placeholder="your_username"
              className="input-field pl-7"
            />
          </div>
        </Field>

        <Field label="Bio">
          <textarea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="Tell people a little about yourself…"
            rows={3}
            maxLength={160}
            className="input-field resize-none"
          />
          <p className="text-right text-xs text-gray-400 mt-1">{form.bio.length}/160</p>
        </Field>
      </div>

      {/* Personal details */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-4 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Personal Details</p>

        <Field label="Date of Birth">
          <input
            type="date"
            value={form.date_of_birth}
            onChange={(e) => set("date_of_birth", e.target.value)}
            className="input-field"
          />
        </Field>

        <Field label="Gender">
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => set("gender", g)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  form.gender === g
                    ? "bg-[#8B1A6B] text-white border-[#8B1A6B]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#8B1A6B]/40"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </Field>
      </div>

      {/* Location */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</p>

        <Field label="State">
          <input
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
            placeholder="e.g. Haryana"
            className="input-field"
          />
        </Field>

        <Field label="City">
          <input
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="e.g. Gurugram"
            className="input-field"
          />
        </Field>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={loading || saved}
        className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        style={{ background: saved ? "#2A5C27" : "#1E2952" }}
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>
        ) : saved ? (
          <><Check className="w-5 h-5" /> Saved!</>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-[#8B1A6B] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
