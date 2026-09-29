import Link from "next/link";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteAccountButton } from "@/components/settings/delete-account-button";

export const metadata = {
  title: "Delete your WePray account",
  description: "How to delete your WePray account and the data associated with it.",
};

/** Public account-deletion page — the "web link" Google Play requires in
 * addition to the in-app Settings → Delete Account path, for people who have
 * uninstalled the app or can't sign in. */
export default async function DeleteAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50">
          <Trash2 className="h-5 w-5 text-red-500" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Delete your WePray account</h1>
          <p className="text-xs text-gray-500">For the WePray app (Android) and www.wepray.in</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4 text-sm text-gray-600 leading-relaxed">
        <div>
          <h2 className="font-semibold text-gray-900 mb-1">In the app or on the website</h2>
          <p>
            Open the menu, go to <strong>Settings</strong>, and choose <strong>Delete Account</strong>. Your account is
            deleted straight away.
          </p>
        </div>

        {user ? (
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4">
            <p className="font-semibold text-gray-900 mb-2">You&apos;re signed in, so you can delete your account here:</p>
            <DeleteAccountButton />
          </div>
        ) : (
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">Can&apos;t sign in, or uninstalled the app?</h2>
            <p>
              <Link href="/login" className="font-semibold text-[#8B1A6B] hover:underline">Sign in</Link> and use the
              button on this page, or send us a deletion request through our{" "}
              <Link href="/contact?topic=privacy" className="font-semibold text-[#8B1A6B] hover:underline">Contact us form</Link>{" "}
              (choose &quot;Privacy or data request&quot;). Include the phone number or email you signed up with. We&apos;ll
              confirm and delete your account and data.
            </p>
          </div>
        )}

        <div>
          <h2 className="font-semibold text-gray-900 mb-1">What gets deleted</h2>
          <p>
            Your profile and everything you created: posts, comments, likes, community memberships, listings, fundraisers,
            your Matrimonial profile and messages, notifications, survey answers and moderation records.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 mb-1">What may be kept</h2>
          <p>
            Communities you created stay without you listed as their creator, and anonymous feedback answers are kept
            without being linked to you. Uploaded photo and video files and backups may take longer to be fully removed. We may keep limited information where the law requires it. See our{" "}
            <Link href="/privacy" className="font-semibold text-[#8B1A6B] hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      <div id="delete-some-data" className="bg-white rounded-3xl shadow-sm p-6 space-y-4 text-sm text-gray-600 leading-relaxed scroll-mt-20">
        <div>
          <h2 className="font-semibold text-gray-900 mb-1">Delete some of your data and keep your account</h2>
          <p>You can remove individual pieces of your WePray data yourself, in the app or on the website:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Posts:</strong> open your post, tap the menu (⋯) and choose Delete.</li>
            <li><strong>Comments:</strong> on the website, open the comment&apos;s menu (⋯) and choose Delete.</li>
            <li><strong>Matrimonial profile:</strong> open Matrimonial, go to your profile and delete it.</li>
            <li><strong>Profile photo, bio and details:</strong> go to Profile, then Edit profile, and clear or change them.</li>
            <li><strong>Community memberships:</strong> open the community and choose Leave.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 mb-1">Anything else</h2>
          <p>
            To have other data deleted, such as a listing, a fundraiser, your phone number, email or activity history, send a request through our{" "}
            <Link href="/contact?topic=privacy" className="font-semibold text-[#8B1A6B] hover:underline">Contact us form</Link>{" "}
            (choose &quot;Privacy or data request&quot;) and tell us what you want removed. Deleted items are removed from
            WePray straight away; uploaded photo and video files and backups may take longer to be fully removed.
          </p>
        </div>
      </div>
    </div>
  );
}
