# Nearby — landing page

A standalone marketing/landing page for a community-service platform, built
separately from the Next.js app that lives elsewhere in this repo. This is a
plain Vite SPA — no server, no data layer, no connection to the Supabase
project the main app uses.

"Nearby" is a placeholder brand name (`BRAND` in `src/data/content.ts`) — the
main app's own branding is intentionally not reused here per this project's
"don't put the product name in generic scaffolding" convention. Swap it out
once real branding exists.

## Stack

React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + lucide-react.

## Commands

```bash
npm install
npm run dev       # local dev server
npm run build     # tsc -b && vite build -> dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

## Structure

- `src/components/` — one file per page section (`Hero`, `CommunityOrbit`,
  `ExploreSection`, `LiveCommunity`, `ImpactSection`, `CommunityStories`,
  `HowItWorks`, `CTASection`, `Footer`, `Navbar`), plus `shared/` for
  cross-section pieces (`NetworkCanvas`, `PillButton`, `SectionLabel`,
  `CustomCursor`).
- `src/data/content.ts` — every section's copy/data lives here, not inline
  in components.
- `src/hooks/` — `useCountUp` (scroll-triggered number animation),
  `useInView` (IntersectionObserver wrapper), `useMediaQuery`.

## Notable implementation details

- **`NetworkCanvas`** is the generative "living community" visualization
  reused (at different density/config) in the hero and the final CTA — a
  canvas-based particle system with organic curved connections, occasional
  traveling "signal" pulses between hub nodes, and subtle cursor-proximity
  repulsion. It is NOT the scroll-driven reveal used in `CommunityOrbit`
  (section 2), which is a separate, deterministic SVG graph
  (`stroke`/`opacity` driven by scroll progress via Framer Motion
  `useTransform`) — the two look similar but solve different problems
  (ambient motion vs. precise scroll-linked reveal).
- **`useTransform` input ranges must stay within `[0, 1]` and strictly
  increasing.** This version of Framer Motion hands those breakpoints
  straight to the browser's native Web Animations API, which throws
  (uncaught, no error boundary — it unmounts the whole tree) if an offset
  falls outside that range. `HowItWorks.tsx`'s `clampBreakpoints` helper
  exists because the first/last step's padded range originally went
  negative/above 1. If you add a new `useTransform` with a computed
  (not literal) input array, run it through the same clamp.
- Respects `prefers-reduced-motion` throughout (ambient canvas motion,
  count-up numbers, and the custom cursor all disable themselves) and hides
  the custom cursor on touch devices.
