import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Briefcase,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  ClipboardList,
  ExternalLink,
  Flag,
  GraduationCap,
  HandHeart,
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
import { AiModerationDemo, AppMock, CountUp, Marquee, PlatformCloud, ScrollProgress } from "@/components/landing/modern";
import { GooglePlayBadge, InstallWebAppButton } from "@/components/landing/get-the-app";
import { DONATION_PLATFORMS } from "@/lib/donations";

export const metadata: Metadata = {
  title: "WePray — A home for your faith community",
  description:
    "WePray brings your faith community together in one safe, respectful place: share news and moments, find a life partner within your faith, discover events, jobs, housing, health care and legal aid, and support community causes.",
  alternates: { canonical: "/" },
};

const SERVICES = [
  { icon: Heart, label: "Matrimonial", desc: "Find a life partner who shares your faith and values, with families involved.", tint: "bg-rose-50 text-rose-500" },
  { icon: CalendarDays, label: "Events", desc: "Festivals, prayer gatherings, celebrations and meetups, online or in person.", tint: "bg-lime-50 text-lime-700" },
  { icon: Briefcase, label: "Jobs", desc: "Find work and hire through people from your own community.", tint: "bg-sky-50 text-sky-600" },
  { icon: Store, label: "Businesses", desc: "Discover and support businesses run by members of your community.", tint: "bg-indigo-50 text-indigo-500" },
  { icon: Home, label: "Housing", desc: "Homes for sale or rent, listed by people from your community.", tint: "bg-orange-50 text-orange-500" },
  { icon: GraduationCap, label: "Education", desc: "Tuitions, classes and courses, from school subjects to classes on your traditions.", tint: "bg-amber-50 text-amber-600" },
  { icon: Stethoscope, label: "Health Care", desc: "Doctors, clinics, pharmacies and labs listed by your community.", tint: "bg-emerald-50 text-emerald-600" },
  { icon: Scale, label: "Legal Aid", desc: "Advocates, legal aid clinics and help with documents, from your community.", tint: "bg-violet-50 text-violet-600" },
];

const MARQUEE_ITEMS = [
  { icon: Newspaper, label: "Community feed" },
  { icon: CalendarDays, label: "Upcoming events" },
  { icon: HandHeart, label: "Donations" },
  ...SERVICES.map((s) => ({ icon: s.icon, label: s.label })),
  { icon: ClipboardList, label: "Surveys" },
  { icon: Bell, label: "Notifications" },
  { icon: ShieldCheck, label: "AI-moderated & safe" },
];

const SCREENS = [
  { src: "/landing/app-communities.jpg", alt: "WePray communities list with join buttons", caption: "Join the communities of your faith" },
  { src: "/landing/app-donate.jpg", alt: "WePray Donate tab with community fundraisers and trusted donation platforms", caption: "Give to causes your community shares" },
  { src: "/landing/app-post.jpg", alt: "WePray create post screen with camera and gallery options", caption: "Share a photo or a short video in seconds" },
];

function PhoneFrame({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-[260px] rounded-[2.25rem] border-[10px] border-[#1E2952] bg-[#1E2952] shadow-2xl shadow-[#8B1A6B]/20 transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-[-1deg]">
      <Image src={src} alt={alt} width={720} height={1616} priority={priority} className="rounded-[1.6rem] w-full h-auto" />
    </div>
  );
}

function SectionLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`text-xs font-bold uppercase tracking-[0.18em] mb-3 ${light ? "text-[#F7A8C8]" : "text-[#8B1A6B]"}`}>{children}</p>;
}

export default function LandingPage() {
  const platformNames = DONATION_PLATFORMS.map((p) => p.name.replace(" (GiveIndia)", ""));
  const indiaPlatforms = DONATION_PLATFORMS.filter((p) => p.region === "India").length;

  return (
    <div className="bg-white text-[#201D1E]">
      <StandaloneRedirect />
      <ScrollProgress />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" aria-label="WePray home" className="flex-shrink-0">
            <img src="/wepray-logo.svg" alt="WePray" className="h-7 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
            <a href="#story" className="hover:text-[#8B1A6B]">Our story</a>
            <a href="#features" className="hover:text-[#8B1A6B]">What you can do</a>
            <a href="#give" className="hover:text-[#8B1A6B]">Donations</a>
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
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-[#8B1A6B]/15 px-3 py-1 text-xs font-semibold text-[#8B1A6B] mb-6">
                <PulseDot /> Uniting faith communities
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                A home for your{" "}
                <span className="bg-gradient-to-r from-[#E8355A] via-[#C2185B] to-[#8B1A6B] bg-clip-text text-transparent">faith community</span>.
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
                WePray brings people of the same faith together in one safe, respectful place. Share celebrations, see
                upcoming events, find a life partner, a job, a home, a doctor or legal help, and give to causes your
                community cares about.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 rounded-full bg-[#8B1A6B] px-6 py-3 font-semibold text-white shadow-lg shadow-[#8B1A6B]/25 hover:bg-[#741458] hover:-translate-y-0.5 transition-all"
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
              <a href="#safety" className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 transition-colors">
                <ShieldCheck className="h-4 w-4" /> Every post is checked by AI before it&apos;s shared
              </a>
              <p className="mt-4 text-sm text-gray-500">Free to join and open to every faith. Sign in with your phone number or Google.</p>
            </div>
            <HeroPhone>
              <AppMock />
            </HeroPhone>
          </div>
        </section>

        {/* Everything-in-one strip */}
        <section aria-label="What WePray includes" className="border-y border-gray-100 bg-white py-5">
          <Marquee duration={40}>
            {MARQUEE_ITEMS.map((m) => (
              <span key={m.label} className="inline-flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap">
                <m.icon className="h-4 w-4 text-[#8B1A6B]" /> {m.label}
              </span>
            ))}
          </Marquee>
        </section>

        {/* The challenge */}
        <section id="story" className="scroll-mt-20 py-20 md:py-28">
          <Reveal>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-[1fr_1.2fr] gap-12 md:gap-20">
              <div>
                <SectionLabel>The challenge</SectionLabel>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                  Faith brings people together. Staying connected is harder.
                </h2>
              </div>
              <div className="space-y-5 text-lg text-gray-600 leading-relaxed">
                <p>
                  For many of us, our faith community is where we turn first: to find a life partner for a son or
                  daughter, a job, a home in a new city, a trusted doctor, or simply people who share our values. It&apos;s
                  where trust already lives.
                </p>
                <p>
                  But that support is scattered across dozens of chat groups, notice boards at places of worship, phone
                  calls and word of mouth. Announcements get buried under forwards, appeals for help are hard to verify,
                  and in open groups there&apos;s little protection against spam, scams or disrespect.
                </p>
                <p className="font-semibold text-[#201D1E]">
                  We asked a simple question: what if every faith community had a place of its own, built around the
                  things it does together?
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Approach */}
        <section className="relative overflow-hidden bg-[#1E2952] text-white py-20 md:py-28">
          <div aria-hidden className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#8B1A6B]/40 blur-3xl" />
          <div aria-hidden className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#E8355A]/20 blur-3xl" />
          <Reveal className="relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <SectionLabel light>Our approach</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl leading-tight">
                Built around your faith community, not a feed of strangers.
              </h2>
              <div className="mt-12 grid sm:grid-cols-3 gap-6">
                {[
                  { icon: Users, title: "Your faith, your community", text: "Join up to five communities of your faith. Your feed, services and conversations come from them, not from strangers or an algorithm." },
                  { icon: ShieldCheck, title: "Respectful by default", text: "Every post, comment, photo, listing and fundraiser is checked before anyone else sees it, so the space stays respectful of every belief and every generation." },
                  { icon: Smartphone, title: "Made for the whole family", text: "Quick to learn and light on data, for young people and elders alike. Install it like an app on any phone." },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl bg-white/5 border border-white/10 p-6 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1">
                    <item.icon className="h-7 w-7 text-[#F7A8C8]" />
                    <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                    <p className="mt-2 text-white/70 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* What we built */}
        <section id="features" className="scroll-mt-20 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Reveal>
              <div className="max-w-2xl">
                <SectionLabel>What we built</SectionLabel>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">Everything your faith community does, in one app.</h2>
                <p className="mt-4 text-lg text-gray-600">A shared feed and events to stay close, services for life&apos;s important moments, and a trusted way to give.</p>
              </div>
            </Reveal>

            <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Newspaper, title: "Community feed", text: "Announcements, gatherings and everyday moments from every community you've joined. Like, comment and reply." },
                { icon: CalendarDays, title: "Upcoming events", text: "Festivals, prayer meetings, celebrations and charity days, right on your home screen, soonest first." },
                { icon: HandHeart, title: "Donations", text: "Support community fundraisers and trusted donation platforms from one Donate tab." },
                { icon: Camera, title: "Photos and short videos", text: "Share straight from your camera or gallery: a photo, or a video of up to 15 seconds." },
              ].map((f, i) => (
                <Reveal key={f.title} delay={i * 0.08}>
                  <div className="h-full rounded-2xl border border-gray-100 bg-gray-50/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#8B1A6B]/5 hover:bg-white">
                    <div className="h-11 w-11 rounded-xl bg-[#8B1A6B]/10 flex items-center justify-center">
                      <f.icon className="h-5 w-5 text-[#8B1A6B]" />
                    </div>
                    <h3 className="mt-4 font-bold text-lg">{f.title}</h3>
                    <p className="mt-2 text-gray-600 leading-relaxed">{f.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <h3 className="mt-16 text-xl font-bold">Eight community services</h3>
            </Reveal>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SERVICES.map((s, i) => (
                <Reveal key={s.label} delay={(i % 4) * 0.06}>
                  <div className="group h-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.tint} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]`}>
                      <s.icon className="h-5 w-5" />
                    </span>
                    <p className="mt-3 font-semibold">{s.label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div className="mt-6 rounded-2xl bg-[#2A5C27]/[0.06] border border-[#2A5C27]/15 p-6 flex gap-4 items-start">
                <ClipboardList className="h-6 w-6 text-[#2A5C27] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Surveys and notifications</p>
                  <p className="mt-1 text-gray-600 leading-relaxed">
                    Short in-app surveys tell us what your community needs most, and notifications let you know when
                    someone replies or something needs your attention.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Give with trust */}
        <section id="give" className="scroll-mt-20 relative overflow-hidden bg-gradient-to-br from-[#fff0f5] via-white to-[#f7f0ff] py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <Reveal>
              <SectionLabel>Give with trust</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Support your community&apos;s causes, without the guesswork.
              </h2>
              <p className="mt-5 text-lg text-gray-600 leading-relaxed">
                The Donate tab brings community fundraisers and well-known donation platforms together, so a temple
                repair, a medical need or a festival appeal is easy to find, and easy to check.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  { title: "Community fundraisers", text: "Members share fundraisers for causes their community cares about, with a note on why it matters." },
                  { title: `${DONATION_PLATFORMS.length} trusted platforms`, text: `Only links from established sites like Ketto, Milaap and GoFundMe are accepted: ${indiaPlatforms} in India and ${DONATION_PLATFORMS.length - indiaPlatforms} worldwide.` },
                  { title: "Reviewed before they appear", text: "Every shared fundraiser goes through the same moderation as posts before anyone sees it." },
                  { title: "WePray never touches the money", text: "You give directly on the platform's own website, under its own terms and receipts." },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#E8355A] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/donate"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E8355A] to-[#8B1A6B] px-6 py-3 font-semibold text-white shadow-lg shadow-[#E8355A]/25 hover:-translate-y-0.5 transition-transform"
              >
                Explore the Donate tab <ExternalLink className="h-4 w-4" />
              </Link>
            </Reveal>
            <PlatformCloud names={platformNames} />
          </div>
        </section>

        {/* By the numbers (real figures only) */}
        <section aria-label="WePray in numbers" className="bg-[#1E2952] text-white py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: <CountUp to={8} />, label: "Community services" },
              { value: <CountUp to={DONATION_PLATFORMS.length} />, label: "Trusted donation platforms" },
              { value: <CountUp to={3} />, label: "Languages moderation understands: English, Hindi & Hinglish" },
              { value: <CountUp to={0} prefix="₹" />, label: "Taken from your donations" },
            ].map((stat, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#F7A8C8] to-white bg-clip-text text-transparent">{stat.value}</p>
                <p className="mt-2 text-sm text-white/70 leading-snug">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Screens */}
        <section className="bg-gradient-to-b from-[#fff5f0] to-white py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto">
                <SectionLabel>Inside the app</SectionLabel>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Simple enough for everyone in the family.</h2>
              </div>
            </Reveal>
            <div className="mt-14 grid sm:grid-cols-3 gap-10">
              {SCREENS.map((s, i) => (
                <Reveal key={s.src} delay={i * 0.12}>
                  <figure className="group">
                    <PhoneFrame src={s.src} alt={s.alt} />
                    <figcaption className="mt-5 text-center font-medium text-gray-700">{s.caption}</figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Safety */}
        <section id="safety" className="scroll-mt-20 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 md:gap-20 items-start">
            <Reveal>
              <SectionLabel>Keeping it safe</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">A respectful space for every faith and every generation.</h2>
              <p className="mt-5 text-lg text-gray-600 leading-relaxed">
                Faith is personal. WePray is built to keep conversations respectful, and safety runs through everything
                you share.
              </p>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                <strong className="text-gray-900">Every post is checked by AI before it goes live.</strong> Words, photos
                and videos are screened in seconds, so hurtful or unsafe content is stopped before your community ever sees it.
              </p>
              <div className="mt-8">
                <AiModerationDemo />
              </div>
            </Reveal>
            <ul className="space-y-6">
              {[
                { icon: ShieldCheck, title: "AI-checked before it's shared", text: "Posts, comments, photos, videos, profiles, listings and fundraisers are checked by AI moderation before other members can see them." },
                { icon: Languages, title: "Understands how we really write", text: "Moderation works across English, Hindi and Hinglish, not just English." },
                { icon: UserCheck, title: "People make the final call", text: "Anything unclear is held for a human to review, and you can appeal a decision you think was wrong." },
                { icon: Flag, title: "Report in one tap", text: "See something disrespectful or out of place? Report it and it goes straight to review." },
                { icon: MessageCircle, title: "Community admins", text: "Each community has its own admins and moderators, who set its rules and keep conversations in its spirit." },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 0.06}>
                  <li className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#8B1A6B]/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-[#8B1A6B]" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 bg-gray-50 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto">
                <SectionLabel>How it works</SectionLabel>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Up and running in a minute.</h2>
              </div>
            </Reveal>
            <ol className="relative mt-14 grid md:grid-cols-3 gap-6">
              <div aria-hidden className="hidden md:block absolute top-[46px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[#E8355A]/0 via-[#E8355A]/40 to-[#E8355A]/0" />
              {[
                { title: "Sign up", text: "Use your phone number with a one-time code, or continue with Google." },
                { title: "Choose your communities", text: "Join up to five communities of your faith. You can change them, or start one for your own group, any time." },
                { title: "Connect, give and find support", text: "Share news, see events, use community services, and support causes from the Donate tab." },
              ].map((step, i) => (
                <Reveal key={step.title} delay={i * 0.12}>
                  <li className="relative h-full rounded-2xl bg-white p-7 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E8355A] text-sm font-bold text-white ring-8 ring-gray-50">
                      {i + 1}
                    </span>
                    <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                    <p className="mt-2 text-gray-600 leading-relaxed">{step.text}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* What's next */}
        <section className="py-20 md:py-28">
          <Reveal>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
              <SectionLabel>What&apos;s next</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Growing with the faith communities we serve.</h2>
              <p className="mt-5 text-lg text-gray-600 leading-relaxed">
                Member surveys guide every new feature. WePray is still early, and the faith communities using it help
                shape where it goes next.
              </p>
              <Link href="/survey" className="mt-6 inline-flex items-center gap-2 font-semibold text-[#8B1A6B] hover:underline">
                Tell us what your community needs <ArrowRight className="h-4 w-4" />
              </Link>
              <br />
              <ul className="mt-8 inline-flex flex-col sm:flex-row gap-3 sm:gap-6 text-left text-gray-700">
                {["The Android app on Google Play", "More community services", "More ways to give and connect"].map((item) => (
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
            <div className="relative overflow-hidden max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-[#8B1A6B] via-[#741458] to-[#5E1148] px-6 py-14 md:py-20 text-center text-white">
              <div aria-hidden className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[#E8355A]/30 blur-3xl" />
              <div aria-hidden className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#F7A8C8]/20 blur-3xl" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Find your faith community on WePray.</h2>
                <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">Join people who share your beliefs, in a space built with respect.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/app"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-[#8B1A6B] hover:bg-white/90 hover:-translate-y-0.5 transition-all"
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
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <img src="/wepray-logo.svg" alt="WePray" className="h-6 w-auto" />
          <nav className="flex flex-wrap justify-center gap-6">
            <Link href="/app" className="hover:text-[#8B1A6B]">Open the app</Link>
            <Link href="/donate" className="hover:text-[#8B1A6B]">Donate</Link>
            <Link href="/survey" className="hover:text-[#8B1A6B]">Share feedback</Link>
            <Link href="/contact" className="hover:text-[#8B1A6B]">Contact</Link>
            <Link href="/terms" className="hover:text-[#8B1A6B]">Terms</Link>
            <Link href="/privacy" className="hover:text-[#8B1A6B]">Privacy</Link>
            <Link href="/child-safety" className="hover:text-[#8B1A6B]">Child safety</Link>
          </nav>
          <p>© {new Date().getFullYear()} WePray</p>
        </div>
      </footer>
    </div>
  );
}
