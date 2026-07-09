"use client";
import { useState } from "react";
import { ScrollText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface CommunityRulesProps {
  communityId: string;
  rules: string | null;
  canEdit: boolean;
}

export function CommunityRules({ communityId, rules: initialRules, canEdit }: CommunityRulesProps) {
  const [rules, setRules] = useState(initialRules);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialRules ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const { error: updateError } = await supabase
      .from("communities")
      .update({ rules: draft.trim() || null })
      .eq("id", communityId);
    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    setRules(draft.trim() || null);
    setEditing(false);
  };

  if (!rules && !canEdit) return null;

  if (editing) {
    return (
      <div className="bg-white rounded-2xl border border-indigo-200 p-5 mb-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Community Rules</p>
        <Textarea
          placeholder="e.g. 1. Be respectful. 2. No spam. 3. Stay on topic."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={5}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={() => { setEditing(false); setDraft(rules ?? ""); }}>
            Cancel
          </Button>
          <Button type="button" size="sm" loading={saving} onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-indigo-500" />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Community Rules</p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Edit community rules"
            className="text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {rules ? (
        <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{rules}</p>
      ) : (
        <p className="text-sm text-gray-400 mt-2">No rules set yet.</p>
      )}
    </div>
  );
}
