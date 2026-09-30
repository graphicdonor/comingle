import { GoogleAnalytics } from "@/components/analytics/google-analytics";

/** Shared by the public marketing pages: the landing page (/) and the
 * feedback survey (/survey) and the blog (/blog). */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <GoogleAnalytics />
    </>
  );
}
