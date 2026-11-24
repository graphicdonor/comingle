import { LEGAL_LAST_UPDATED, PRIVACY_SECTIONS } from "@/lib/legal-docs";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-[28px] font-bold tracking-tight text-[#2A1A1C] mb-1">Privacy Policy</h1>
      <p className="text-sm text-[#6D645D] mb-6">Last updated: {LEGAL_LAST_UPDATED}</p>

      <div className="bg-white rounded-3xl border border-[#E7DCC8] p-6 space-y-6">
        {PRIVACY_SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="font-semibold text-[#2A1A1C] text-[15px] mb-1.5">{s.title}</h2>
            {/* whitespace-pre-line keeps the paragraph and bullet breaks in the text */}
            <p className="text-sm text-[#4A4340] leading-relaxed whitespace-pre-line">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
