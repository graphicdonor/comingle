export const metadata = { title: "Terms & Conditions" };

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By creating an account or using Comingle, you agree to these Terms & Conditions. If you do not agree, please do not use the app.",
  },
  {
    title: "2. Your Account",
    body: "You're responsible for the accuracy of the information you provide and for keeping your account secure. You must be old enough to legally use this service in your country.",
  },
  {
    title: "3. Communities & Content",
    body: "Communities are spaces created by users around shared interests or identities. You're responsible for what you post. Content that is abusive, hateful, illegal, or infringes on others' rights may be removed, and accounts may be suspended.",
  },
  {
    title: "4. Community Guidelines",
    body: "Treat other members with respect. Impersonation, spam, harassment, and coordinated inauthentic behavior are not allowed anywhere on the platform.",
  },
  {
    title: "5. Termination",
    body: "We may suspend or terminate access to accounts that violate these terms. You may also delete your account at any time.",
  },
  {
    title: "6. Changes to These Terms",
    body: "We may update these terms from time to time. Continued use of Comingle after changes means you accept the updated terms.",
  },
  {
    title: "7. Contact",
    body: "Questions about these terms can be sent to the app's support contact.",
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Terms & Conditions</h1>
      <p className="text-xs text-gray-400 mb-6">Last updated: July 2026</p>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="font-semibold text-gray-900 text-sm mb-1">{s.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
