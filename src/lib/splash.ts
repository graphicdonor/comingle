// Splash-screen artwork layers, back to front (see scripts/process-splash.mjs).
// A plain module (not "use client") so the root layout, a server component,
// can read it to preload the images, and the offline download can list them.
export const SPLASH_LAYERS = [
  { src: "/splash/splash-sky-predawn.webp", className: "" },
  { src: "/splash/splash-sky-dawn.webp", className: "sp-dawn" },
  { src: "/splash/splash-rays.webp", className: "sp-rays" },
  { src: "/splash/splash-sun.webp", className: "sp-sun" },
  { src: "/splash/splash-hills-far.webp", className: "sp-far" },
  { src: "/splash/splash-mist.webp", className: "sp-mist" },
  { src: "/splash/splash-hill-near.webp", className: "sp-near" },
] as const;
