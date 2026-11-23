import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WePray — Buddhist Spiritual Companion",
    short_name: "WePray",
    description: "Buddhist prayers in Pali, Hindi and English, guided practice and meditation.",
    // The app lives at /app; "/" is the public landing page. Scope stays
    // "/" because the app's other pages (/feed, /communities, …) sit at the root.
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F7F2E8",
    theme_color: "#F7F2E8",
    categories: ["lifestyle", "education"],
    icons: [
      { src: "/icons/icon-72.png",   sizes: "72x72",   type: "image/png" },
      { src: "/icons/icon-96.png",   sizes: "96x96",   type: "image/png" },
      { src: "/icons/icon-128.png",  sizes: "128x128", type: "image/png" },
      { src: "/icons/icon-144.png",  sizes: "144x144", type: "image/png" },
      { src: "/icons/icon-152.png",  sizes: "152x152", type: "image/png" },
      { src: "/icons/icon-192.png",  sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-384.png",  sizes: "384x384", type: "image/png" },
      { src: "/icons/icon-512.png",  sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Morning practice",
        short_name: "Morning",
        description: "Homage, the Three Refuges and the Five Precepts",
        url: "/practice/session/morning",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "Meditate",
        short_name: "Meditate",
        description: "A calm meditation timer",
        url: "/meditate",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }],
      },
    ],
    screenshots: [],
  };
}
