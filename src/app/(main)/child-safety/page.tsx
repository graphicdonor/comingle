import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Child safety standards",
  description: "WePray's standards against child sexual abuse and exploitation (CSAE), and how to report a concern.",
};

/** Public child-safety standards page — the published CSAE standards Google
 * Play's Child Safety Standards policy requires of social apps. */
export default function ChildSafetyPage() {
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Child safety standards</h1>
          <p className="text-xs text-gray-500">For the WePray app (Android) and www.wepray.in</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4 text-sm text-gray-600 leading-relaxed">
        <div>
          <h2 className="font-semibold text-gray-900 mb-1">Zero tolerance</h2>
          <p>
            WePray does not tolerate child sexual abuse and exploitation (CSAE) of any kind. It is forbidden to post, share,
            request or link to child sexual abuse material (CSAM), or to use WePray to contact, groom, sexualise, extort or
            traffic a child. This applies to posts, comments, photos, videos, profiles, listings, fundraisers and messages.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 mb-1">How we keep children safe</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>WePray is for people aged 13 and over; under-18s may use it only with a parent or guardian&apos;s consent.</li>
            <li>The Matrimonial service, including its private messages, is for adults aged 18 and over only.</li>
            <li>Posts, comments, photos, videos, profiles, listings and fundraisers are checked before other members can see them.</li>
            <li>Anyone can report a post, comment or member, and block a member, in one tap.</li>
            <li>Our team reviews every report and acts on child-safety reports first.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 mb-1">What we do when we find CSAE</h2>
          <p>
            We remove the content, permanently disable the accounts involved and preserve the information the law requires.
            We report child sexual abuse material and exploitation to the relevant authorities, including Indian law
            enforcement through the National Cybercrime Reporting Portal and, where applicable, the National Center for
            Missing &amp; Exploited Children (NCMEC). We comply with child-safety laws, including India&apos;s Protection
            of Children from Sexual Offences (POCSO) Act and the Information Technology Act.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 mb-1">Report a concern</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>In the app:</strong> open the post, comment or profile, tap the menu (⋯) and choose Report.</li>
            <li>
              <strong>To our child-safety contact:</strong> use our{" "}
              <Link href="/contact?topic=safety" className="font-semibold text-[#8B1A6B] hover:underline">Contact us form</Link>{" "}
              and choose &quot;Report a safety concern&quot;.
            </li>
            <li>
              <strong>If a child is in danger:</strong> call <strong>112</strong> (emergency) or <strong>1098</strong> (Childline),
              or report to the cybercrime helpline <strong>1930</strong> or{" "}
              <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#8B1A6B] hover:underline">cybercrime.gov.in</a>.
            </li>
          </ul>
        </div>

        <p className="text-xs text-gray-400">
          See also our <Link href="/terms" className="hover:underline">Terms &amp; Conditions</Link> and{" "}
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
