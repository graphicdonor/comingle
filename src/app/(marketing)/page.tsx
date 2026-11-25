import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CloudDownload,
  Flower2,
  GraduationCap,
  HeartHandshake,
  Lock,
  Mic,
  BellRing,
  Volume2,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { StandaloneRedirect } from "@/components/landing/standalone-redirect";
import { LandingHeader } from "@/components/landing/landing-header";
import { Journey, type Chapter } from "@/components/landing/journey/journey";
import { STORIES, storyArt } from "@/lib/learn/jataka";
import { Reveal } from "@/components/landing/motion";
import { GooglePlayBadge, InstallWebAppButton } from "@/components/landing/get-the-app";
import { HeroArt, PhoneShot, PrayerDemo, SectionHeading } from "@/components/landing/companion";
import { PostureFigure, type FigureId } from "@/components/visuals/posture-figure";
import { SITE_URL } from "@/lib/site-url";
import { PRAYERS } from "@/lib/practice/prayers";
import { MEDITATIONS } from "@/lib/practice/meditations";
import { GUIDES } from "@/lib/learn/guides";

const PLAY_URL = "https://play.google.com/store/apps/details?id=in.wepray.app";

export const metadata: Metadata = {
  title: { absolute: "WePray: Buddhist Prayers in Pali, Hindi & English, with Audio" },
  description:
    "Buddha Vandana, Tisarana, Panchsheel, Metta and more Pali prayers with Hindi and English meaning and audio. Meditation, pronunciation help and beginner guides. Free, works offline.",
  keywords: [
    "Buddhist prayers",
    "Buddha Vandana",
    "Namo Tassa Bhagavato Arahato Sammasambuddhassa",
    "Buddham Saranam Gacchami",
    "Tisarana",
    "Three Refuges",
    "Pancasila",
    "Panchsheel",
    "Five Precepts",
    "Metta Sutta",
    "Mangala Sutta",
    "Dhammapada",
    "Pali chanting",
    "Pali prayers with meaning",
    "Buddhist prayer app",
    "Buddhist meditation",
    "Vipassana",
    "बुद्ध वंदना",
    "त्रिशरण",
    "पंचशील",
    "बौद्ध प्रार्थना",
    "बुद्धं सरणं गच्छामि",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "WePray: Buddhist prayers in Pali, Hindi and English",
    description: "Buddha Vandana, Tisarana, Panchsheel, Metta and more, with meaning and audio. Meditation and beginner guides. Free and offline.",
    url: "/",
    siteName: "WePray",
    type: "website",
    locale: "en_IN",
    alternateLocale: ["hi_IN"],
  },
  twitter: {
    card: "summary_large_image",
    title: "WePray: Buddhist prayers in Pali, Hindi and English",
    description: "Buddha Vandana, Tisarana, Panchsheel, Metta and more, with meaning and audio. Free and offline.",
  },
};

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: BookOpen, title: "Pali prayers with meaning", text: "Buddha Vandanā, Tisaraṇa, Pañcasīla, Mettā, the Maṅgala Sutta and more, in Pali beside their Hindi or English meaning, in Roman script or Devanagari." },
  { icon: Volume2, title: "Listen to every prayer", text: "Hear each prayer read aloud line by line, in Pali and in Hindi or English, at a slower or faster speed, and follow along as each line lights up." },
  { icon: Mic, title: "Pronunciation practice", text: "Learn to say Pali correctly, syllable by syllable, with simple tips on long vowels, aspirated consonants and the niggahīta (ṃ)." },
  { icon: Sun, title: "Morning & evening practice", text: "A short sequence of prayers, one at a time, with nothing to distract you. Tap a line to keep your place." },
  { icon: Flower2, title: "Meditation", text: "Seven practices, from mindful breathing (ānāpānasati) and loving-kindness to walking meditation, for 3 to 20 minutes with a soft bell." },
  { icon: BellRing, title: "Gentle reminders", text: "Add a daily reminder for your practice to your calendar, at the time that suits you, in the morning or evening." },
  { icon: GraduationCap, title: "Beginner guides", text: "How to pray at home, how to sit comfortably and how to visit a temple, with illustrations. No posture is required." },
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
  {
    q: "What is Buddha Vandana?",
    a: "Buddha Vandanā is the traditional homage that opens most Pali chanting: “Namo tassa bhagavato arahato sammāsambuddhassa”, meaning “Homage to the Blessed One, the Worthy One, the Perfectly Self-Awakened One”. It is recited three times. WePray shows it in Pali with its Hindi and English meaning, and can read it aloud.",
  },
  {
    q: "What does “Buddhaṃ saraṇaṃ gacchāmi” mean?",
    a: "It means “I go to the Buddha for refuge”. It begins the Tisaraṇa, the Three Refuges, in which one takes refuge in the Buddha, the Dhamma (his teaching) and the Saṅgha (the community of practitioners), each recited three times.",
  },
  {
    q: "What are the Five Precepts (Panchsheel)?",
    a: "The Pañcasīla, or Panchsheel, are the five training rules of lay Buddhists: to refrain from harming living beings, from taking what is not given, from sexual misconduct, from false speech, and from intoxicants that cloud the mind. In WePray you can read and recite them in Pali with their meaning.",
  },
  {
    q: "Can I listen to the prayers?",
    a: "Yes. Every prayer can be read aloud line by line, in Pali and in its Hindi or English meaning, with a choice of speed. The voice is computer-generated to help you follow and learn; it is not a recording of a monk or teacher.",
  },
  {
    q: "How do I pray at home as a Buddhist?",
    a: "Find a quiet place, sit comfortably, take a few calm breaths, then recite Buddha Vandanā, the Three Refuges and the Five Precepts, and close with a wish for the well-being of all beings. WePray’s “How to pray” guide and morning and evening practice walk you through it step by step. Customs differ between communities, and any respectful way is fine.",
  },
  { q: "Is WePray free?", a: "Yes. WePray is free to use, with no ads and no subscriptions." },
  { q: "Do I need to create an account?", a: "No. You can use every prayer, guide and meditation without signing up, and your saved prayers and settings stay on your own device. If you like, sign in with Google to sync them privately across your devices." },
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


function ChapterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#F7F2E8]/35 bg-black/15 px-5 py-2.5 text-sm font-bold text-[#F7F2E8] backdrop-blur-sm transition-colors hover:border-[#E9BE73] hover:text-[#E9BE73]">
      {children} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

const lead = "mt-5 text-[17px] leading-relaxed text-[#F7F2E8]/85 sm:text-lg";
const headline = "font-display text-[44px] font-medium leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl";

/** The opening journey: one day of practice, from before dawn to night. */
function chapters(): Chapter[] {
  const stories = STORIES.slice(0, 3);
  return [
    {
      id: "dawn",
      label: "Before dawn",
      labelHi: "ब्रह्म मुहूर्त",
      content: (
        <>
          <h1>
            <span className={`block ${headline}`}>
              Begin in <em className="text-[#E9BE73]">stillness.</em>
            </span>
            <span className="mt-4 block text-lg font-semibold sm:text-xl">Buddhist prayers in Pali, with Hindi and English meaning</span>
          </h1>
          <p className={lead}>
            A calm companion for Buddhist practice: traditional Pali prayers read aloud with their meaning, a gentle morning and evening practice, meditation, Jātaka tales and guides for beginners.
          </p>
          <p lang="hi" className="mt-2 text-base text-[#F7F2E8]/70">
            धम्म सीखें। सजगता से अभ्यास करें। करुणा के साथ जिएँ।
          </p>
          <div className="mt-7">
            <Cta tone="light" />
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-[#F7F2E8]/75">
            {["Free", "No account needed", "No ads", "Works offline"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#E9BE73]" /> {t}
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: "sunrise",
      label: "Sunrise",
      labelHi: "प्रातः",
      content: (
        <>
          <h2 className={headline}>
            Take refuge as the <em className="text-[#E9BE73]">sun rises.</em>
          </h2>
          <p className={lead}>
            A morning practice, one prayer at a time: Buddha Vandanā, the Three Refuges and the Five Precepts, in Pali beside their meaning. Listen line by line, slower or faster, and learn to say each word.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {PRAYERS.slice(0, 4).map((pr) => (
              <li key={pr.slug}>
                <Link href={`/practice/${pr.slug}`} className="inline-flex rounded-full bg-[#F7F2E8]/12 px-3.5 py-1.5 font-pali text-[15px] italic text-[#F7F2E8] ring-1 ring-[#F7F2E8]/20 hover:bg-[#F7F2E8]/20">
                  {pr.title.pi}
                </Link>
              </li>
            ))}
          </ul>
          <ChapterLink href="/practice">All {PRAYERS.length} prayers</ChapterLink>
        </>
      ),
    },
    {
      id: "midday",
      label: "Midday",
      labelHi: "मध्याह्न",
      content: (
        <>
          <h2 className={headline}>
            Stories older than <em className="text-[#E9BE73]">the tree.</em>
          </h2>
          <p className={lead}>
            Jātaka tales of the Buddha&apos;s earlier lives, the hare in the moon, the banyan deer, the monkey king, retold simply in Hindi and English, each with a painting, narration and its lesson. And a verse of the Dhammapada for every day.
          </p>
          <ul className="mt-6 flex gap-3">
            {stories.map((st) => {
              const art = storyArt(st.slug);
              return (
                <li key={st.slug} className="w-28 sm:w-32">
                  <Link href={`/learn/jataka/${st.slug}`} className="group block">
                    {art && <Image src={art} alt="" width={128} height={128} className="aspect-square w-full rounded-2xl object-cover ring-1 ring-[#F7F2E8]/25 transition-transform group-hover:-translate-y-1" />}
                    <span className="mt-2 block text-[13px] font-semibold leading-snug text-[#F7F2E8]/90">{st.title.en}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <ChapterLink href="/learn/jataka">Read the Jātaka tales</ChapterLink>
        </>
      ),
    },
    {
      id: "dusk",
      label: "Dusk",
      labelHi: "संध्या",
      content: (
        <>
          <h2 className={headline}>
            Light a lamp. <em className="text-[#E9BE73]">Sit a while.</em>
          </h2>
          <p className={lead}>
            An evening practice to close the day, and {MEDITATIONS.length} meditations, from mindful breathing to loving-kindness, for 3 to 20 minutes with a soft bell. Set a gentle reminder for the time that suits you.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {MEDITATIONS.slice(0, 4).map((m) => (
              <li key={m.id} className="rounded-full bg-[#F7F2E8]/12 px-3.5 py-1.5 text-sm text-[#F7F2E8] ring-1 ring-[#F7F2E8]/20">
                {m.title.en}
              </li>
            ))}
          </ul>
          <ChapterLink href="/meditate">Start a meditation</ChapterLink>
        </>
      ),
    },
    {
      id: "night",
      label: "Night",
      labelHi: "रात्रि",
      content: (
        <>
          <h2 className={headline}>
            Carry the quiet <em className="text-[#E9BE73]">with you.</em>
          </h2>
          <p className={lead}>
            Everything works offline, in Hindi and English, with no account, no ads and no streaks. Your practice stays on your phone. Free on Android and on the web.
          </p>
          <p lang="hi" className="mt-2 text-base text-[#F7F2E8]/70">
            आज ही अभ्यास शुरू करें।
          </p>
          <div className="mt-7">
            <Cta tone="light" />
          </div>
        </>
      ),
    },
  ];
}

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "WePray",
        url: SITE_URL,
        inLanguage: ["en", "hi"],
        description: "Buddhist prayers in Pali with Hindi and English meaning and audio, meditation and beginner guides.",
      },
      {
        "@type": "MobileApplication",
        "@id": `${SITE_URL}/#app`,
        name: "WePray",
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Android, Web",
        inLanguage: ["en", "hi"],
        description: "Buddhist prayers in Pali with Hindi and English meaning and audio, guided practice, meditation, pronunciation practice and beginner guides.",
        url: SITE_URL,
        installUrl: PLAY_URL,
        sameAs: [PLAY_URL],
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        featureList: FEATURES.map((f) => f.title),
      },
      {
        "@type": "ItemList",
        name: "Buddhist prayers in Pali with Hindi and English meaning",
        itemListElement: PRAYERS.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${p.title.pi} (${p.title.en})`,
          url: `${SITE_URL}/practice/${p.slug}`,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F7F2E8] text-[#2A1A1C]">
      <StandaloneRedirect />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <LandingHeader />

      <main>
        <Journey chapters={chapters()} />
        {/* Night gives way to the page. */}
        <div aria-hidden className="h-40 bg-gradient-to-b from-[#070B1F] to-[#F7F2E8]" />

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

        {/* Prayer library */}
        <section id="library" aria-labelledby="library-title" className="scroll-mt-20 pb-20 md:pb-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <SectionHeading
                id="library-title"
                eyebrow="Prayer library"
                title="Buddhist prayers in Pali, with Hindi and English meaning"
                intro={`${PRAYERS.length} traditional Pali recitations, from Buddha Vandanā and the Three Refuges to the Maṅgala Sutta. Each one shows its source, can be read aloud, and has pronunciation help.`}
              />
              <p lang="hi" className="mt-3 max-w-2xl text-base leading-relaxed text-[#6E6560]">
                बुद्ध वंदना, त्रिशरण, पंचशील, मैत्री भावना और महामंगल सुत्त: पालि पाठ, हिन्दी अर्थ और ऑडियो के साथ।
              </p>
            </Reveal>
            <ul className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRAYERS.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/practice/${p.slug}`}
                    className="group flex h-full flex-col rounded-3xl bg-white border border-[#E7DCC8] p-5 hover:border-[#6D252C]/40 transition-colors"
                  >
                    <h3 className="text-lg font-bold text-[#2A1A1C] group-hover:text-[#6D252C]">
                      {p.title.pi} <span className="font-normal text-[#6E6560]">· {p.title.en}</span>
                    </h3>
                    <p lang="hi" className="text-sm text-[#885F19]">{p.title.hi}</p>
                    {p.sections[0]?.lines[0] && (
                      <p lang="pi" className="mt-3 text-[15px] italic text-[#5B5350]">“{p.sections[0].lines[0].pi.replace(/[,;:.]+$/, "")}”</p>
                    )}
                    <p className="mt-2 text-sm leading-relaxed text-[#5B5350]">{p.summary.en}</p>
                    <span className="mt-auto pt-3 inline-flex items-center gap-1 text-sm font-bold text-[#6D252C]">
                      Read with meaning <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-16 rounded-3xl bg-[#FFFCF6] border border-[#E7DCC8] p-6 md:p-8">
              <h3 className="text-2xl font-bold tracking-tight">Buddhist meditation for beginners</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#5B5350] max-w-2xl">
                Short, guided practices with written steps in Hindi and English and a quiet timer with a soft bell, from 3 to 20 minutes.
              </p>
              <ul className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                {MEDITATIONS.map((m) => (
                  <li key={m.id} className="text-[15px]">
                    <span className="font-semibold text-[#2A1A1C]">{m.title.en}</span>
                    {m.pali && <span className="text-[#6E6560]"> ({m.pali})</span>}
                    <span className="block text-sm text-[#5B5350]">{m.summary.en}</span>
                  </li>
                ))}
              </ul>
              <Link href="/meditate" className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#6D252C]/25 bg-white px-5 py-3 text-sm font-bold text-[#6D252C] hover:border-[#6D252C]">
                Start a meditation <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
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
                { icon: Lock, title: "No account needed", text: "Use everything without signing up; your saved prayers, history and settings stay on your device. Prefer them on every device? Sign in with Google to sync them privately." },
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
            <h2 id="faq-title" className="text-center text-3xl font-bold tracking-tight">Questions about Buddhist prayer and WePray</h2>
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
            <Link href="/practice" className="hover:text-[#F7F2E8]">Prayers</Link>
            <Link href="/meditate" className="hover:text-[#F7F2E8]">Meditation</Link>
            {GUIDES.map((g) => (
              <Link key={g.slug} href={`/learn/${g.slug}`} className="hover:text-[#F7F2E8]">
                {g.title.en}
              </Link>
            ))}
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
