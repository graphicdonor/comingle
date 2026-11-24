"use client";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS, type ReviewLang, type Role, type RoleAssignment } from "@/lib/cms/model";
import { api, ApiError } from "@/components/cms/api";
import { useActor } from "@/components/cms/cms-shell";
import { Button, Card, Problems, TextInput } from "@/components/cms/ui";

const LANGS: { id: ReviewLang; label: string }[] = [
  { id: "pali", label: "Pali" },
  { id: "hi", label: "Hindi" },
  { id: "en", label: "English" },
];

export default function CmsAccess() {
  const actor = useActor();
  const [roles, setRoles] = useState<RoleAssignment[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ roles: RoleAssignment[] }>("/api/cms/roles").then((r) => setRoles(r.roles)).catch(setError);
  }, []);

  if (actor.role !== "super_admin") return <p>Only a Super Admin can manage access.</p>;
  if (!roles) return error ? <Problems message={error.message} problems={[]} /> : <Loader2 className="h-6 w-6 animate-spin text-[#6D645D]" aria-label="Loading" />;

  const update = (i: number, patch: Partial<RoleAssignment>) => {
    setSaved(false);
    setRoles(roles.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Access</h1>
        <p className="text-sm text-[#5B5350]">
          People sign in to the CMS with Google, using the email listed here. The admin password always has full access.
        </p>
      </div>
      <Card className="space-y-3">
        {roles.length === 0 && <p className="text-sm text-[#6D645D]">No one else has access yet.</p>}
        {roles.map((r, i) => (
          <div key={i} className="rounded-xl border border-[#EFE7D8] bg-[#FFFCF6] p-3 space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              <TextInput className="flex-1 min-w-[14rem]" type="email" aria-label="Email" placeholder="name@example.com" value={r.email} onChange={(email) => update(i, { email })} />
              <select
                aria-label="Role"
                value={r.role}
                onChange={(e) => update(i, { role: e.target.value as Role, languages: e.target.value === "language_reviewer" ? (r.languages ?? ["hi"]) : undefined })}
                className="rounded-xl border border-[#E7DCC8] bg-white px-3 py-2 text-sm"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
              <button type="button" aria-label={`Remove ${r.email || "person"}`} onClick={() => setRoles(roles.filter((_, k) => k !== i))} className="rounded-lg p-2 text-[#7A2A24] hover:bg-[#FBEDEA]">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-[#6D645D]">{ROLE_DESCRIPTIONS[r.role]}</p>
            {r.role === "language_reviewer" && (
              <div className="flex gap-3 text-sm" role="group" aria-label="Languages">
                {LANGS.map((l) => (
                  <label key={l.id} className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={r.languages?.includes(l.id) ?? false}
                      onChange={(e) => update(i, { languages: e.target.checked ? [...(r.languages ?? []), l.id] : (r.languages ?? []).filter((x) => x !== l.id) })}
                    />
                    {l.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setRoles([...roles, { email: "", role: "editor" }])}>
            <Plus className="h-4 w-4" /> Add person
          </Button>
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                const r = await api<{ roles: RoleAssignment[] }>("/api/cms/roles", { method: "PUT", body: { roles } });
                setRoles(r.roles);
                setSaved(true);
              } catch (e) {
                setError(e as ApiError);
              }
              setBusy(false);
            }}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save access
          </Button>
          {saved && <span className="self-center text-sm text-[#56634A]">Saved.</span>}
        </div>
        <Problems message={error?.message} problems={error?.problems ?? []} />
      </Card>
      <Card>
        <h2 className="font-bold">Roles</h2>
        <dl className="mt-2 grid gap-2 text-sm">
          {ROLES.map((role) => (
            <div key={role} className="grid sm:grid-cols-[11rem_1fr] gap-1">
              <dt className="font-semibold">{ROLE_LABELS[role]}</dt>
              <dd className="text-[#5B5350]">{ROLE_DESCRIPTIONS[role]}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
