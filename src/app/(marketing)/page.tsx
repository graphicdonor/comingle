import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Briefcase,
  CalendarDays,
  Camera,
  Clock,
  ClipboardList,
  Flag,
  GraduationCap,
  Heart,
  Home,
  Languages,
  MessageCircle,
  Newspaper,
  Scale,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Store,
  UserCheck,
  Users,
} from "lucide-react";
import { StandaloneRedirect } from "@/components/landing/standalone-redirect";
import { HeroBlobs, HeroPhone, PulseDot, Reveal } from "@/components/landing/motion";
import { GooglePlayBadge, InstallWebAppButton } from "@/components/landing/get-the-app";

export const metadata: Metadata = {
  title: "WePray — One home for your whole community",
  description:
    "WePray brings your community's conversations and services into one safe place: a shared feed, matrimonial, jobs, events, local businesses, housing and education.",
  alternates: { canonical: "/" },
};

const SERVICES = [
  { icon: Heart, label: "Matrimonial", desc: "Find a match within your own community, with families in the loop." },
  { icon: Briefcase, label: "Jobs", desc: "Post openings and find work through people who know you." },
  { icon: CalendarDays, label: "Events", desc: "Gatherings, festivals and meetups, online or in person." },
  { icon: Store, label: "Businesses", desc: "Discover and support businesses run by your community." },
  { icon: Home, label: "Housing", desc: "Homes for sale or rent, listed by people you can trust." },
  { icon: GraduationCap, label: "Education", desc: "Tuitions, classes and courses, online, offline or hybrid." },
  { icon: Stethoscope, label: "Health Care", desc: "Coming soon", soon: true },
  { icon: Scale, label: "Legal Aid", desc: "Coming soon", soon: true },
];

const SCREENS = [
  { src: "/landing/app-home.jpg", alt: "WePray home screen with community services and surveys", caption: "Everything your community offers, on one screen" },
  { src: "/landing/app-communities.jpg", alt: "WePray communities list with join buttons", caption: "Join the communities you belong to" },
  { src: "/landing/app-post.jpg", alt: "WePray create post screen with camera and gallery options", caption: "Share a photo or a short video in seconds" },
];

function PhoneFrame({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-[260px] rounded-[2.25rem] border-[10px] border-[#1E2952] bg-[#1E2952] shadow-2xl shadow-[#8B1A6B]/20">
      <Image src={src} alt={alt} width={720} height={1616} priority={priority} className="rounded-[1.6rem] w-full h-auto" />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B1A6B] mb-3">{children}</p>;
}

export default function LandingPage() {
  return (
    <div className="bg-white text-[#201D1E]">
      <StandaloneRedirect />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" aria-label="WePray home" className="flex-shrink-0">
            <img src="/wepray-logo.svg" alt="WePray" className="h-7 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#story" className="hover:text-[#8B1A6B]">Our story</a>
            <a href="#features" className="hover:text-[#8B1A6B]">What you can do</a>
            <a href="#safety" className="hover:text-[#8B1A6B]">Safety</a>
            <a href="#how" className="hover:text-[#8B1A6B]">How it works</a>
          </nav>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#8B1A6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#741458] transition-colors"
          >
            Open the app <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#ffe4f0] via-[#fff5f0] to-white" />
          <HeroBlobs />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-20 md:pt-20 md:pb-28 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-[#8B1A6B]/15 px-3 py-1 text-xs font-semibold text-[#8B1A6B] mb-6">
                <PulseDot /> Uniting communities
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                One home for your <span className="text-[#8B1A6B]">whole community</span>.
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
                WePray brings your community&apos;s conversations and services into one safe place: a shared feed,
                matrimonial, jobs, events, local businesses, housing and education, all shared with the people
                who belong.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 rounded-full bg-[#8B1A6B] px-6 py-3 font-semibold text-white shadow-lg shadow-[#8B1A6B]/25 hover:bg-[#741458] transition-colors"
                >
                  Open WePray <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#story"
                  className="inline-flex items-center gap-2 rounded-full border border-[#1E2952]/20 bg-white px-6 py-3 font-semibold text-[#1E2952] hover:border-[#1E2952]/40 transition-colors"
                >
                  Read our story
                </a>
              </div>
              <div className="mt-6 flex flex-wrap items-start gap-3">
                <InstallWebAppButton />
                <GooglePlayBadge />
              </div>
              <p className="mt-5 text-sm text-gray-500">Free to join. Sign in with your phone number or Google.</p>
            </div>
            <HeroPhone>
              <PhoneFrame src="/landing/app-home.jpg" alt="WePray home screen" priority />
            </HeroPhone>
          </div>
        </section>

        {/* The challenge */}
        <section id="story" className="scroll-mt-20 py-20 md:py-28">
          <Reveal>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-[1fr_1.2fr] gap-12 md:gap-20">
            <div>
              <SectionLabel>The challenge</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Communities are close-knit. Their information isn&apos;t.
              </h2>
            </div>
            <div className="space-y-5 text-lg text-gray-600 leading-relaxed">
              <p>
                When a family looks for a match, a young person looks for a job, or someone needs a home to rent,
                the first place they turn is their own community. It&apos;s where trust already lives.
              </p>
              <p>
                But that help is scattered across dozens of chat groups, notice boards, phone calls and word of
                mouth. Important posts get buried under forwards. Newcomers don&apos;t know who to ask. And in open
                groups there&apos;s little protection against spam, scams or abuse.
              </p>
              <p className="font-semibold text-[#201D1E]">
                We asked a simple question: what if a community had one place of its own, built for the things
                communities actually do together?
              </p>
            </div>
          </div>
          </Reveal>
        </section>

        {/* Approach */}
        <section className="bg-[#1E2952] text-white py-20 md:py-28">
          <Reveal>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionLabel>
              <span className="text-[#F7A8C8]">Our approach</span>
            </SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl leading-tight">
              Start with the community, not the individual.
            </h2>
            <div className="mt-12 grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  title: "Community first",
                  text: "You join the communities you belong to. Your feed, your services and your conversations are shaped by them, not by strangers or an algorithm.",
                },
                {
                  icon: ShieldCheck,
                  title: "Safe by default",
                  text: "Every post, comment, photo and listing is checked before anyone else sees it, so the space stays respectful for every generation.",
                },
                {
                  icon: Smartphone,
                  title: "Made for the phone in your pocket",
                  text: "Quick to learn, light on data, and ready to install like an app. Built for people who live on their phones, and those just getting started.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-white/5 border border-white/10 p-6">
                  <item.icon className="h-7 w-7 text-[#F7A8C8]" />
                  <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-white/70 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          </Reveal>
        </section>

        {/* What you can do */}
        <section id="features" className="scroll-mt-20 py-20 md:py-28">
          <Reveal>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl">
              <SectionLabel>What we built</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Everything your community does, in one app.
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                A shared feed for staying in touch, and community services for the moments that matter.
              </p>
            </div>

            <div className="mt-12 grid md:grid-cols-3 gap-5">
              {[
                { icon: Newspaper, title: "Community feed", text: "See posts from every community you've joined in one feed. Like, comment and reply in threads." },
                { icon: Camera, title: "Photos and short videos", text: "Share a moment straight from your camera or gallery: a photo, or a video of up to 15 seconds." },
                { icon: Bell, title: "Notifications", text: "Know when someone replies to you or something needs your attention, on the web and on Android." },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6">
                  <div className="h-11 w-11 rounded-xl bg-[#8B1A6B]/10 flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-[#8B1A6B]" />
                  </div>
                  <h3 className="mt-4 font-bold text-lg">{f.title}</h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-16 text-xl font-bold">Community services</h3>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SERVICES.map((s) => (
                <div
                  key={s.label}
                  className={`rounded-2xl border p-5 ${s.soon ? "border-dashed border-gray-200 bg-white" : "border-gray-100 bg-white shadow-sm"}`}
                >
                  <s.icon className={`h-6 w-6 ${s.soon ? "text-gray-400" : "text-[#E8355A]"}`} />
                  <p className="mt-3 font-semibold">{s.label}</p>
                  <p className={`mt-1 text-sm leading-relaxed ${s.soon ? "text-gray-400 italic" : "text-gray-600"}`}>{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-[#2A5C27]/[0.06] border border-[#2A5C27]/15 p-6 flex gap-4 items-start">
              <ClipboardList className="h-6 w-6 text-[#2A5C27] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Surveys that shape what comes next</p>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  Members tell us, through short in-app surveys, what their community needs most. That&apos;s how we
                  decide what to build next.
                </p>
              </div>
            </div>
          </div>
          </Reveal>
        </section>

        {/* Screens */}
        <section className="bg-gradient-to-b from-[#fff5f0] to-white py-20 md:py-28">
          <Reveal>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <SectionLabel>Inside the app</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Simple enough for everyone at home.</h2>
            </div>
            <div className="mt-14 grid sm:grid-cols-3 gap-10">
              {SCREENS.map((s) => (
                <figure key={s.src}>
                  <PhoneFrame src={s.src} alt={s.alt} />
                  <figcaption className="mt-5 text-center font-medium text-gray-700">{s.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          </Reveal>
        </section>

        {/* Safety */}
        <section id="safety" className="scroll-mt-20 py-20 md:py-28">
          <Reveal>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 md:gap-20 items-start">
            <div>
              <SectionLabel>Keeping it safe</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                A space your parents and your children can both use.
              </h2>
              <p className="mt-5 text-lg text-gray-600 leading-relaxed">
                Safety isn&apos;t an add-on. It runs through everything you share on WePray.
              </p>
            </div>
            <ul className="space-y-6">
              {[
                { icon: ShieldCheck, title: "Checked before it's shared", text: "Posts, comments, photos, profiles and listings are reviewed by automated moderation before other members can see them." },
                { icon: Languages, title: "Understands how we really write", text: "Moderation works across English, Hindi and Hinglish, not just English." },
                { icon: UserCheck, title: "People make the final call", text: "Anything unclear is held for a human to review, and you can appeal a decision you think was wrong." },
                { icon: Flag, title: "Report in one tap", text: "See something that doesn't belong? Report it and it goes straight to review." },
                { icon: MessageCircle, title: "Community admins", text: "Each community has its own admins and moderators, who can set rules and keep conversations on track." },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#8B1A6B]/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-[#8B1A6B]" />
                  </div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          </Reveal>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 bg-gray-50 py-20 md:py-28">
          <Reveal>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <SectionLabel>How it works</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Up and running in a minute.</h2>
            </div>
            <ol className="mt-14 grid md:grid-cols-3 gap-6">
              {[
                { title: "Sign up", text: "Use your phone number with a one-time code, or continue with Google." },
                { title: "Choose your communities", text: "Pick the communities you belong to. You can join more, or start your own, any time." },
                { title: "Connect and find help", text: "Post, reply, and use community services for matches, jobs, homes, events and more." },
              ].map((step, i) => (
                <li key={step.title} className="rounded-2xl bg-white p-7 shadow-sm">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E8355A] text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
          </Reveal>
        </section>

        {/* What's next */}
        <section className="py-20 md:py-28">
          <Reveal>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <SectionLabel>What&apos;s next</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Growing with the communities we serve.</h2>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              Health Care and Legal Aid are on the way, and survey answers from members guide every new feature.
              WePray is still early, and the communities using it help shape where it goes.
            </p>
            <ul className="mt-8 inline-flex flex-col sm:flex-row gap-3 sm:gap-6 text-left text-gray-700">
              {["Health Care services", "Legal Aid services", "More ways to connect"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#8B1A6B]" /> {item}
                </li>
              ))}
            </ul>
          </div>
          </Reveal>
        </section>

        {/* Final CTA */}
        <section className="px-4 sm:px-6 pb-20 md:pb-28">
          <Reveal>
          <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-[#8B1A6B] to-[#5E1148] px-6 py-14 md:py-20 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Find your community on WePray.</h2>
            <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
              Join the people you already trust, in a space built for them.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-[#8B1A6B] hover:bg-white/90 transition-colors"
              >
                Open WePray <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/communities"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Browse communities
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center items-start gap-3">
              <InstallWebAppButton tone="light" />
              <GooglePlayBadge tone="light" />
            </div>
          </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <img src="/wepray-logo.svg" alt="WePray" className="h-6 w-auto" />
          <nav className="flex gap-6">
            <Link href="/app" className="hover:text-[#8B1A6B]">Open the app</Link>
            <Link href="/terms" className="hover:text-[#8B1A6B]">Terms</Link>
            <Link href="/privacy" className="hover:text-[#8B1A6B]">Privacy</Link>
          </nav>
          <p>© {new Date().getFullYear()} WePray</p>
        </div>
      </footer>
    </div>
  );
}
