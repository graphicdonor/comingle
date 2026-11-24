import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CloudDownload,
  Flower2,
  GraduationCap,
  HeartHandshake,
  Languages,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { StandaloneRedirect } from "@/components/landing/standalone-redirect";
import { Reveal } from "@/components/landing/motion";
import { GooglePlayBadge, InstallWebAppButton } from "@/components/landing/get-the-app";
import { HeroArt, PhoneShot, PrayerDemo, SectionHeading } from "@/components/landing/companion";
import { PostureFigure, type FigureId } from "@/components/visuals/posture-figure";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "WePray — Buddhist prayers, meditation and guides in Hindi and English",
  description:
    "A calm companion for Buddhist practice: Pali prayers with Hindi and English meaning, guided morning and evening practice, meditation, and simple guides on how to pray and sit. Free, private, no account, works offline.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "WePray — Buddhist Spiritual Companion",
    description: "Pali prayers with Hindi and English meaning, guided practice, meditation and beginner guides. Free, private and offline.",
    url: "/",
    siteName: "WePray",
    type: "website",
  },
};

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: BookOpen, title: "Prayers in three languages", text: "Buddha Vandanā, the Three Refuges, the Five Precepts, the Triple Gem and Mettā, in Pali beside Hindi or English." },
  { icon: Sun, title: "Morning & evening practice", text: "A short sequence of prayers, one at a time, with nothing to distract you. Tap a line to keep your place." },
  { icon: Flower2, title: "Meditation", text: "Mindful breathing, loving-kindness, walking meditation or a silent timer, 3 to 20 minutes, with a soft bell." },
  { icon: GraduationCap, title: "Beginner guides", text: "How to pray, how to sit comfortably and how to visit a temple, with illustrations. No posture is required." },
  { icon: Sparkles, title: "A verse each day", text: "A verse from the Dhammapada every day, with its reference and meaning in your language." },
  { icon: Search, title: "Search in any script", text: "Find any prayer, line or guide in English, Hindi or Pali, with or without diacritics." },
];

const POSTURES: { id: FigureId; label: string }[] = [
  { id: "chair", label: "On a chair" },
  { id: "bench", label: "On a bench" },
  { id: "burmese", label: "Cross-legged" },
  { id: "half-lotus", label: "Half-lotus" },
];

const FAQ: { q: string; a: string }[] = [
  { q: "Is WePray free?", a: "Yes. WePray is free to use, with no ads and no subscriptions." },
  { q: "Do I need to create an account?", a: "No. You can use every prayer, guide and meditation without signing up. Your saved prayers and settings stay on your own device." },
  { q: "Can I use it without internet?", a: "Yes. Open Settings and choose “Download for offline” once; after that, prayers, guides, meditation and illustrations all work with no connection." },
  { q: "Which Buddhist tradition is it based on?", a: "The prayers are traditional Pali recitations widely used in Theravāda and by Buddhist communities across India. Practices differ between traditions and communities, and the app says so wherever it matters. Every prayer shows its source." },
  { q: "Are the translations reviewed?", a: "Each prayer and guide shows its review status. Hindi and English translations are clearly marked as drafts until a qualified reviewer has checked them." },
  { q: "Does it work in Hindi?", a: "Yes. The whole app is available in Hindi and English, and you can read Pali in Roman script or Devanagari." },
  { q: "Is it a substitute for a teacher or medical advice?", a: "No. WePray supports your own practice and learning; it doesn't replace a teacher, monastery or community, and meditation here is a contemplative practice, not a medical or therapeutic treatment." },
];

function Cta({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/app"
        className={`inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-bold transition-colors ${
          tone === "dark" ? "bg-[#6D252C] text-[#F7F2E8] hover:bg-[#5E1F25]" : "bg-[#F7F2E8] text-[#6D252C] hover:bg-white"
        }`}
      >
        Open WePray <ArrowRight className="h-4 w-4" />
      </Link>
      <GooglePlayBadge tone={tone === "dark" ? "dark" : "light"} />
      <InstallWebAppButton tone={tone === "dark" ? "dark" : "light"} />
    </div>
  );
}

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "WePray",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Android, Web",
    inLanguage: ["en", "hi"],
    description: "Buddhist prayers in Pali with Hindi and English meaning, guided practice, meditation and beginner guides.",
    url: SITE_URL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  };

  return (
    <div className="min-h-screen bg-[#F7F2E8] text-[#2A1A1C]">
      <StandaloneRedirect />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#F7F2E8]/85 backdrop-blur-md border-b border-[#E7DCC8]/70">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center gap-6">
          <Link href="/" aria-label="WePray home" className="text-xl font-bold tracking-tight text-[#6D252C]">
            WePray
          </Link>
          <nav aria-label="Sections" className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5B5350]">
            <a href="#inside" className="hover:text-[#6D252C]">What&apos;s inside</a>
            <a href="#prayers" className="hover:text-[#6D252C]">Prayers</a>
            <a href="#learn" className="hover:text-[#6D252C]">Learn</a>
            <a href="#private" className="hover:text-[#6D252C]">Private &amp; offline</a>
            <a href="#faq" className="hover:text-[#6D252C]">FAQ</a>
          </nav>
          <Link href="/app" className="ml-auto rounded-full bg-[#6D252C] px-5 py-2.5 text-sm font-bold text-[#F7F2E8] hover:bg-[#5E1F25]">
            Open app
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute -top-40 right-[-10%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(217,154,56,0.22),transparent_65%)]" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-[#885F19] ring-1 ring-[#E7DCC8]">
                <Languages className="h-3.5 w-3.5" /> Pali · हिन्दी · English
              </p>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.05]">
                A calm companion for <span className="text-[#6D252C]">Buddhist prayer</span> and practice
              </h1>
              <p className="mt-5 text-lg sm:text-xl leading-relaxed text-[#5B5350] max-w-xl">
                Recite traditional Pali prayers with their meaning in Hindi and English, follow a gentle morning or evening practice, sit in meditation, and learn how to pray and sit, at your own pace.
              </p>
              <p lang="hi" className="mt-3 text-base text-[#6E6560]">
                धम्म सीखें। सजगता से अभ्यास करें। करुणा के साथ जिएँ।
              </p>
              <div className="mt-8">
                <Cta />
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-[#5B5350]">
                {["Free", "No account needed", "No ads", "Works offline"].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#D99A38]" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative mx-auto w-full max-w-[380px]">
              <HeroArt />
            </div>
          </div>
        </section>

        {/* What's inside */}
        <section id="inside" aria-labelledby="inside-title" className="scroll-mt-20 py-20 md:py-28 bg-[#FFFCF6] border-y border-[#E7DCC8]/70">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <SectionHeading id="inside-title" eyebrow="What's inside" title="Everything you need for a daily practice" intro="Simple, quiet and respectful, so the app gets out of the way of your practice." center />
            </Reveal>
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={(i % 3) * 0.08}>
                  <div className="h-full rounded-3xl bg-white border border-[#E7DCC8] p-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F2E8] text-[#6D252C]">
                      <f.icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#5B5350]">{f.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-16">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 items-start">
                <figure>
                  <PhoneShot src="/landing/screen-today.webp" alt="WePray Today screen with the evening practice and the daily verse" />
                  <figcaption className="mt-3 text-center text-sm text-[#6E6560]">Your practice for today</figcaption>
                </figure>
                <figure className="md:mt-10">
                  <PhoneShot src="/landing/screen-session.webp" alt="A guided session showing Buddha Vandanā with its translation" />
                  <figcaption className="mt-3 text-center text-sm text-[#6E6560]">One prayer at a time</figcaption>
                </figure>
                <figure>
                  <PhoneShot src="/landing/screen-meditate.webp" alt="The meditation timer counting down with a progress ring" />
                  <figcaption className="mt-3 text-center text-sm text-[#6E6560]">A quiet meditation timer</figcaption>
                </figure>
                <figure className="md:mt-10">
                  <PhoneShot src="/landing/screen-prayer-hi.webp" alt="The Triple Gem recollection in Pali with Hindi meaning" />
                  <figcaption className="mt-3 text-center text-sm text-[#6E6560]">Fully in Hindi, too</figcaption>
                </figure>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Try a prayer */}
        <section id="prayers" aria-labelledby="prayers-title" className="scroll-mt-20 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center">
            <Reveal>
              <SectionHeading
                id="prayers-title"
                eyebrow="Try it here"
                title="Pali, with its meaning beside every line"
                intro="Read Pali alone, with a translation, or the translation by itself. Choose Hindi or English, and Roman script or Devanagari. Try it on the Three Refuges."
              />
              <ul className="mt-6 space-y-2 text-[15px] text-[#5B5350]">
                {["Source and tradition shown for every prayer", "Adjustable text size, save and share", "Morning and evening sessions built from these prayers"].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#87977A]" /> {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <PrayerDemo />
            </Reveal>
          </div>
        </section>

        {/* Learn */}
        <section id="learn" aria-labelledby="learn-title" className="scroll-mt-20 py-20 md:py-28 bg-[#FFFCF6] border-y border-[#E7DCC8]/70">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <SectionHeading
                id="learn-title"
                eyebrow="New to practice?"
                title="Learn how to pray and how to sit"
                intro="Gentle, illustrated guides for beginners: how to pray at home, comfortable postures from a chair to the lotus, and how to visit a temple respectfully. Tap a cue to see it on the figure."
                center
              />
            </Reveal>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {POSTURES.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.07}>
                  <figure className="rounded-3xl bg-[#F3ECDF] p-4 pb-3">
                    <PostureFigure id={p.id} decorative still className="mx-auto h-40 sm:h-48" />
                    <figcaption className="mt-2 text-center text-sm font-semibold text-[#2A1A1C]">{p.label}</figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-[#6E6560]">Any safe, comfortable posture is fine. No posture is required.</p>
            <div className="mt-8 flex justify-center">
              <Link href="/learn" className="inline-flex items-center gap-2 rounded-full border border-[#6D252C]/25 bg-white px-5 py-3 text-sm font-bold text-[#6D252C] hover:border-[#6D252C]">
                Read the guides <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Private & offline */}
        <section id="private" aria-labelledby="private-title" className="scroll-mt-20 bg-[#3A1418] py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <SectionHeading
                id="private-title"
                eyebrow="Private & offline"
                title="Your practice stays yours"
                intro="Prayer and meditation are personal. WePray is built so that what you do in it stays with you."
                light
              />
            </Reveal>
            <div className="mt-12 grid sm:grid-cols-3 gap-5">
              {[
                { icon: Lock, title: "No account, no tracking", text: "Use everything without signing up. Your saved prayers, history and settings are stored only on your device. We never receive them." },
                { icon: CloudDownload, title: "Works without internet", text: "Download everything once from Settings, then practise anywhere, even with no signal." },
                { icon: ShieldCheck, title: "Calm by design", text: "No ads, no streaks, no pressure. Gentle animations that switch off if you prefer less motion, and support for zoom and screen readers." },
              ].map((c, i) => (
                <Reveal key={c.title} delay={i * 0.08}>
                  <div className="h-full rounded-3xl bg-white/[0.06] border border-white/10 p-6">
                    <c.icon className="h-6 w-6 text-[#E9BE73]" strokeWidth={1.8} />
                    <h3 className="mt-4 text-lg font-bold text-[#F7F2E8]">{c.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#F7F2E8]/75">{c.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Made with respect */}
        <section aria-labelledby="respect-title" className="py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <Reveal>
              <HeartHandshake className="mx-auto h-8 w-8 text-[#6D252C]" strokeWidth={1.6} />
              <h2 id="respect-title" className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">Made with respect</h2>
              <p className="mt-5 text-lg leading-relaxed text-[#5B5350]">
                Buddhist practice differs between traditions, countries and communities, and WePray doesn&apos;t present any one way as the only way. Every prayer shows its source, translations show their review status, and customs are described as customs, not rules.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-[#6E6560]">
                WePray supports your practice; it doesn&apos;t replace a teacher, monastery or community.
              </p>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 pb-20 md:pb-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 id="faq-title" className="text-center text-3xl font-bold tracking-tight">Questions</h2>
            <div className="mt-8 divide-y divide-[#E7DCC8] rounded-3xl border border-[#E7DCC8] bg-white">
              {FAQ.map((f) => (
                <details key={f.q} className="group px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden className="text-2xl leading-none text-[#885F19] transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#5B5350]">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final call to action */}
        <section className="relative overflow-hidden bg-[#6D252C]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-20 grid md:grid-cols-[1fr_auto] gap-10 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F7F2E8]">Begin your practice today</h2>
              <p className="mt-3 text-lg text-[#F7F2E8]/80">
                Free, private, in Hindi and English. <span lang="hi">आज ही अभ्यास शुरू करें।</span>
              </p>
              <div className="mt-7">
                <Cta tone="light" />
              </div>
            </div>
            <div className="hidden md:block w-56">
              <HeroArt className="rounded-[1.5rem]" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#2A1A1C] text-[#F7F2E8]/70">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between text-sm">
          <div>
            <p className="text-lg font-bold text-[#F7F2E8]">WePray</p>
            <p className="mt-1">Learn the Dhamma. Practise with mindfulness. Live with compassion.</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-[#F7F2E8]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#F7F2E8]">Terms</Link>
            <Link href="/contact" className="hover:text-[#F7F2E8]">Contact</Link>
            <Link href="/delete-account" className="hover:text-[#F7F2E8]">Delete account</Link>
          </nav>
        </div>
        <p className="border-t border-white/10 py-4 text-center text-xs text-[#F7F2E8]/50">© {new Date().getFullYear()} WePray</p>
      </footer>
    </div>
  );
}
