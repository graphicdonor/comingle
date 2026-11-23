import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { SplashScreen } from "@/components/splash/splash-screen";
import { SITE_URL } from "@/lib/site-url";
import { DialogProvider } from "@/components/ui/dialog";
import { figtreeFont, devanagariFont, paliRomanFont } from "@/lib/fonts";


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "WePray — Buddhist Spiritual Companion",
  description: "Learn the Dhamma, practise with mindfulness, live with compassion. Buddhist prayers in Pali, Hindi and English, guided practice and meditation.",
  applicationName: "WePray",
  keywords: ["Buddhist prayers", "Pali", "Buddha Vandana", "Tisarana", "Pancasila", "meditation", "Dhamma", "बुद्ध वंदना"],
  authors: [{ name: "WePray" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WePray",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    url: "/",
    title: "WePray — Buddhist Spiritual Companion",
    description: "Learn the Dhamma. Practise with mindfulness. Live with compassion.",
    siteName: "WePray",
  },
  twitter: {
    card: "summary_large_image",
    title: "WePray — Buddhist Spiritual Companion",
    description: "Learn the Dhamma. Practise with mindfulness. Live with compassion.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F2E8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${figtreeFont.variable} ${devanagariFont.variable} ${paliRomanFont.variable}`}>
      <body>
        <DialogProvider>{children}</DialogProvider>
        <SplashScreen />
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
