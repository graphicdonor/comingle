import { LEGAL_LAST_UPDATED, TERMS_SECTIONS } from "@/lib/legal-docs";

export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Terms & Conditions</h1>
      <p className="text-xs text-gray-400 mb-6">Last updated: {LEGAL_LAST_UPDATED}</p>

      <div className="bg-white rounded-3xl shadow-sm p-6 space-y-5">
        {TERMS_SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="font-semibold text-gray-900 text-sm mb-1">{s.title}</h2>
            {/* whitespace-pre-line keeps the paragraph and bullet breaks in the text */}
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
