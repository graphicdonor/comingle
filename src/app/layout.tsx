import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Comingle — Uniting Communities",
  description: "Connect with your community — matrimonial, health, education, housing and more.",
  applicationName: "Comingle",
  keywords: ["community", "social", "matrimonial", "health", "education", "housing"],
  authors: [{ name: "Comingle" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Comingle",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "Comingle — Uniting Communities",
    description: "Connect with your community.",
    siteName: "Comingle",
  },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#8B1A6B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
