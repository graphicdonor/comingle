import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Comingle — Uniting Communities",
    short_name: "Comingle",
    description: "Connect with your community — matrimonial, health, education, housing and more.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#8B1A6B",
    theme_color: "#8B1A6B",
    categories: ["social", "lifestyle", "community"],
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
        name: "Communities",
        short_name: "Communities",
        description: "Browse and join communities",
        url: "/communities",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "My Profile",
        short_name: "Profile",
        description: "View your profile",
        url: "/",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }],
      },
    ],
    screenshots: [],
  };
}
