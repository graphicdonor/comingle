/** Blog posts for /blog. Each post is plain data so the index, article page,
 * share image, RSS feed and sitemap all read from one place. Body text
 * supports **bold** and [link text](/path) inline. */

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "cta"; title: string; text: string; href: string; label: string };

export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  /** Shorter title for search results and the share image. */
  seoTitle: string;
  description: string;
  /** ISO date (YYYY-MM-DD). */
  published: string;
  updated?: string;
  author: string;
  category: string;
  keywords: string[];
  readingMinutes: number;
  body: BlogBlock[];
  faqs?: BlogFaq[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "wepray-mission-goals-how-it-works",
    title: "Why we built WePray: our mission, our goals and how it works",
    seoTitle: "WePray: a safe app for faith communities",
    description:
      "WePray is a free, safe app that brings people of the same faith together: a community feed, upcoming events, matrimonial, jobs, housing, health care, legal aid and trusted giving, with AI moderation on every post.",
    published: "2026-10-01",
    author: "The WePray team",
    category: "About WePray",
    keywords: [
      "faith community app",
      "religious community app India",
      "community app for temples, churches, mosques and gurdwaras",
      "matrimonial within your faith",
      "community events app",
      "safe social app",
      "AI content moderation",
      "community fundraisers",
    ],
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "For many of us, our faith community is where we turn first. It's where we look for a life partner for a son or daughter, a job, a home in a new city, a doctor we can trust, or simply people who share our values. That trust already exists. What's missing is a good place for it to live.",
      },
      {
        type: "p",
        text: "Today, that support is scattered across dozens of chat groups, notice boards at places of worship, phone calls and word of mouth. Announcements get buried under forwards, appeals for help are hard to verify, and open groups offer little protection against spam, scams or disrespect. **WePray** is our answer: one safe, respectful place for every faith community, built around the things communities already do together.",
      },
      { type: "h2", text: "Our mission" },
      {
        type: "quote",
        text: "To give every faith community a safe, respectful home of its own, where members can stay close, help one another and give with trust.",
      },
      {
        type: "p",
        text: "WePray is open to every faith and free to join. It isn't a feed of strangers or an algorithm deciding what you see. Everything you see comes from the communities you choose to join, and from people who share your beliefs.",
      },
      { type: "h2", text: "Our goals" },
      {
        type: "ol",
        items: [
          "**Bring scattered communities together.** Replace the dozens of groups, notice boards and phone trees with one place where a community's news, events and services are easy to find.",
          "**Make safety the default.** Check every post, comment, photo and listing before anyone else sees it, so the space stays respectful for every belief and every generation.",
          "**Help members help one another.** Make it simple to find a life partner, a job, a home, a doctor or legal help through people you already trust.",
          "**Make giving trustworthy.** Bring community fundraisers and well-known donation platforms together, without WePray ever touching the money.",
          "**Work for the whole family.** Keep the app quick to learn and light on data, for young people and elders alike, in the way people really write, whether that's English, Hindi or Hinglish.",
          "**Grow with the communities we serve.** Let member surveys and feedback decide what we build next.",
        ],
      },
      { type: "h2", text: "How WePray works" },
      { type: "h3", text: "1. Join your faith communities" },
      {
        type: "p",
        text: "Sign in with your phone number or Google, set up your profile and join up to five communities of your faith, or [start one](/communities) for your own group. The limit keeps your feed focused on the communities that matter most to you.",
      },
      { type: "h3", text: "2. Stay close with the community feed and events" },
      {
        type: "p",
        text: "Your feed shows announcements, gatherings and everyday moments from your communities, with likes, comments and replies. **Upcoming events** such as festivals, prayer meetings, celebrations and charity days appear right on your home screen, so nothing important gets buried. You can share a photo or a short video straight from your camera or gallery.",
      },
      { type: "h3", text: "3. Find what you need through community services" },
      {
        type: "p",
        text: "Your community is often the best place to find help you can trust. WePray brings those services into one place:",
      },
      {
        type: "ul",
        items: [
          "**Matrimonial:** find a life partner who shares your faith and values, with families involved (18+).",
          "**Jobs:** find work and hire through people from your own community.",
          "**Events:** festivals, prayer gatherings and meetups, online or in person.",
          "**Businesses:** discover and support businesses run by community members.",
          "**Housing:** homes for sale or rent, listed by people you can reach.",
          "**Education:** tuitions, classes and courses, from school subjects to classes on your traditions.",
          "**Health Care:** doctors, clinics, pharmacies and labs listed by your community.",
          "**Legal Aid:** advocates, legal aid clinics and help with documents.",
        ],
      },
      {
        type: "p",
        text: "Listings are shared by members and aren't verified by WePray, and Health Care and Legal Aid listings aren't medical or legal advice. In an emergency, call 108 or 112.",
      },
      { type: "h3", text: "4. Give with trust" },
      {
        type: "p",
        text: "The [Donate](/donate) tab brings together fundraisers shared by community members and trusted donation platforms such as Ketto, Milaap and GoFundMe. **WePray never handles money:** every donation happens on the platform's own website. Shared fundraisers are only accepted from those trusted platforms, and each one is checked before anyone sees it.",
      },
      { type: "h3", text: "5. Every post is checked by AI before it goes live" },
      {
        type: "p",
        text: "This is the heart of what makes WePray different. Before a post, comment, photo, video, profile, listing or fundraiser reaches your community, it goes through an **AI safety check**. It looks at the words and their tone, the photos and videos, and it understands English, Hindi and Hinglish, the way people really write.",
      },
      {
        type: "ul",
        items: [
          "Content that's clearly fine is published straight away.",
          "Anything unclear is held for a person on our team to review.",
          "Anything harmful is stopped before your community ever sees it, and you can appeal a decision you think was wrong.",
        ],
      },
      {
        type: "p",
        text: "On top of that, anyone can **report** a post, comment or member, or **block** someone, in one tap. Each community also has its own admins and moderators who set its rules. You can read more in our [child safety standards](/child-safety) and [Privacy Policy](/privacy).",
      },
      { type: "h2", text: "Who WePray is for" },
      {
        type: "ul",
        items: [
          "**Members** who want to stay close to their community, find help they can trust and give to causes they care about.",
          "**Families** looking for a life partner within their faith, with the family involved.",
          "**Community leaders and admins** of temples, churches, mosques, gurdwaras, viharas and other groups, who want one respectful place for announcements, events and members.",
          "**People who've moved to a new city** and want to find their community there.",
        ],
      },
      { type: "h2", text: "What's next" },
      {
        type: "p",
        text: "WePray is still early, and the communities using it help decide where it goes next. The Android app is coming to Google Play, and more community services and more ways to give and connect are on the way. If there's something your community needs, [tell us in our short survey](/survey).",
      },
      {
        type: "cta",
        title: "Bring your community to WePray",
        text: "It's free to join and open to every faith. Open WePray in your browser and install it like an app on any phone.",
        href: "/app",
        label: "Open WePray",
      },
    ],
    faqs: [
      {
        q: "Is WePray free?",
        a: "Yes. WePray is free to join and free to use, for members and for communities.",
      },
      {
        q: "Which faiths can use WePray?",
        a: "Every faith. WePray is open to all faith communities, and each community has its own space, admins and rules.",
      },
      {
        q: "How does WePray keep the community safe?",
        a: "Every post, comment, photo, video, profile, listing and fundraiser is checked by AI moderation before others can see it. Unclear content is held for a person to review, harmful content is stopped, and members can report or block anyone in one tap.",
      },
      {
        q: "Does WePray handle donations?",
        a: "No. WePray never handles money. Every donation happens directly on a trusted platform's own website, such as Ketto, Milaap or GoFundMe.",
      },
      {
        q: "How many communities can I join?",
        a: "Up to five, so your feed stays focused on the communities that matter most to you.",
      },
      {
        q: "How do I get the app?",
        a: "Open www.wepray.in on any phone and install it as a web app. The Android app is coming to Google Play.",
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Newest first. */
export function sortedPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.published.localeCompare(a.published));
}

export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
