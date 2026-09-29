import Script from "next/script";

const GA_MEASUREMENT_ID = "G-N1QXRS9M8H";

/** Google Analytics (gtag.js) for the public marketing pages only — see
 * src/app/(marketing)/layout.tsx. The app itself (/app and everything behind
 * sign-in) isn't tracked. Loads after hydration so it never delays the page. */
export function GoogleAnalytics() {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
