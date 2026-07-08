export const metadata = { title: "Privacy Policy" };

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "We collect the information you give us directly — phone number, name, username, profile photo, bio, location, and the communities and posts you create — plus basic technical data needed to run the app.",
  },
  {
    title: "2. How We Use It",
    body: "We use your information to run and improve Comingle: authenticating you, showing your profile and posts to other members, connecting you with communities, and keeping the platform safe.",
  },
  {
    title: "3. What's Public",
    body: "Your profile, posts, and community memberships are visible to other users by default, since Comingle is a social platform built around communities.",
  },
  {
    title: "4. Sharing",
    body: "We don't sell your personal information. We only share data with service providers that help us operate the app (such as hosting and SMS delivery), or when required by law.",
  },
  {
    title: "5. Security",
    body: "We take reasonable measures to protect your data, but no system is 100% secure. Please use a strong, unique login and report anything suspicious.",
  },
  {
    title: "6. Your Choices",
    body: "You can edit or delete your profile information at any time from your account settings.",
  },
  {
    title: "7. Changes to This Policy",
    body: "We may update this policy as the app evolves. We'll let you know about significant changes.",
  },
  {
    title: "8. Contact",
    body: "Questions about this policy can be sent to the app's support contact.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Privacy Policy</h1>
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
