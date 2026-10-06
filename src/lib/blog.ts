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
    slug: "why-humans-cooperate-culture-faith-communities",
    title: "Why we help one another: what science says about culture, cooperation and community",
    seoTitle: "Why humans cooperate: culture, faith and community",
    description:
      "Humans cooperate with people who aren't family on a scale no other animal does. A well-known paper by evolutionary scientists Robert Boyd and Peter Richerson argues that culture is the reason. Here's what they found, and what it means for faith communities today.",
    published: "2026-10-06",
    author: "The WePray team",
    category: "Research",
    keywords: [
      "why humans cooperate",
      "culture and cooperation",
      "evolution of human cooperation",
      "Boyd and Richerson",
      "cultural group selection",
      "community and belonging",
      "faith community",
      "shared norms and values",
    ],
    readingMinutes: 7,
    body: [
      {
        type: "p",
        text: "Think about the last time your community came together: a festival, a wedding, a family in need, a new arrival who needed a home. Most of the people who helped weren't related to each other. Many barely knew each other. And yet they showed up.",
      },
      {
        type: "p",
        text: "That's more remarkable than it sounds. Among animals, helping strangers on this scale is rare. So why do humans do it? A widely cited paper by evolutionary scientists **Robert Boyd** (University of California, Los Angeles) and **Peter Richerson** (University of California, Davis), [\"Culture and the evolution of human cooperation\"](https://pmc.ncbi.nlm.nih.gov/articles/PMC2781880/), offers an answer: **culture**.",
      },
      { type: "h2", text: "The puzzle: we cooperate with people who aren't family" },
      {
        type: "p",
        text: "Boyd and Richerson start from a puzzle. The evidence suggests our distant ancestors lived in groups much like those of other primates. Yet today, as they put it, \"even in foraging societies people regularly cooperate with many unrelated individuals.\" Something changed human psychology to support \"larger, more cooperative societies.\"",
      },
      {
        type: "p",
        text: "The usual explanations, such as helping relatives, or helping people who'll help you back, only go so far. The authors point out that reciprocity and reputation can keep almost any behaviour stable once it exists, but they don't explain why large-scale cooperation appeared in the first place.",
      },
      { type: "h2", text: "What the paper argues" },
      {
        type: "p",
        text: "The paper is theoretical: it brings together evolutionary models, anthropology and history rather than reporting a new experiment. Its argument has three steps.",
      },
      { type: "h3", text: "1. We learn from each other, and that adds up" },
      {
        type: "p",
        text: "Over the last million years or so, humans became unusually good at learning from one another. That made **cumulative culture** possible: knowledge, skills and customs passed on and improved across generations, letting groups adapt to their surroundings far faster than genes alone could. The authors also note that \"people have a strong tendency to imitate the successful.\"",
      },
      { type: "h3", text: "2. Groups develop their own norms, and the best ones spread" },
      {
        type: "p",
        text: "Because culture changes quickly, neighbouring groups end up with different ways of living. \"Different human groups have different norms and values,\" the authors write, \"and the cultural transmission of these traits can cause such differences to persist.\" Groups whose norms helped them cooperate tended to do better and to spread, a process the authors call **cultural group selection**. It's slow: their figures from New Guinea suggest it could take 500 to 1,000 years for an innovation to spread from one group to most of its neighbours this way.",
      },
      {
        type: "p",
        text: "They describe human societies as built on in-groups \"of a few hundred to a few thousand people\" that are \"symbolically marked by language, ritual practices, dress and the like.\" Shared rituals and customs, in other words, help people recognise who belongs and what's expected.",
      },
      { type: "h3", text: "3. Living in cooperative groups shaped our hearts" },
      {
        type: "p",
        text: "Finally, in communities held together by shared norms, the people who fitted in well did better. Over a very long time, the authors argue, this favoured \"more pro-social motives\": \"Moral systems enforced by systems of sanctions and rewards increased the reproductive success of individuals who functioned well in such environments, and this in turn led to the evolution of other regarding motives like empathy and social emotions like shame.\"",
      },
      {
        type: "quote",
        text: "In short: culture made us cooperative, and cooperation made us caring. Empathy and a sense of right and wrong grew in communities that shared norms and looked after one another.",
      },
      { type: "h2", text: "What the paper doesn't claim" },
      {
        type: "p",
        text: "It's worth being careful here. This is a theory, and the authors say so: they write that \"there has been little systematic quantitative empirical work\" to measure how important cultural group selection is compared with other forces, and they call for sharper, testable studies. The paper isn't a study of any particular religion, and it doesn't say anything about apps. The reflections below are ours, not the authors'.",
      },
      { type: "h2", text: "What this means for faith communities today" },
      {
        type: "p",
        text: "Read with a community in mind, the paper says something many of us already feel: the things a community shares, its rituals, gatherings, values and expectations of one another, aren't extras. They're what makes it possible for people who aren't family to trust each other and help each other. Faith communities are some of the oldest and strongest examples of this.",
      },
      {
        type: "p",
        text: "But the paper also explains why communities can struggle. Shared norms only work when people can see them, learn them and keep them. Today, community life is scattered across dozens of chat groups, notice boards and phone calls. Announcements get buried, newcomers can't see how things are done, and in open groups there's little to stop spam or disrespect from wearing trust away.",
      },
      { type: "h2", text: "How WePray is built around these ideas" },
      {
        type: "p",
        text: "We built WePray to give every faith community a place where the things that hold it together are easy to see and easy to keep:",
      },
      {
        type: "ul",
        items: [
          "**A space of its own.** Each community has its own feed, members and admins, so people know who they're with and what's expected. You join up to five communities of your faith, not a feed of strangers.",
          "**Shared moments, front and centre.** Festivals, prayer meetings and celebrations appear as [upcoming events](/services/events) on your home screen, the modern equivalent of the shared rituals the paper describes.",
          "**Norms that protect trust.** Every post, comment, photo and listing is checked by AI before anyone sees it, members can report or block in one tap, and each community's admins set its rules. Respect is the default, not something that has to be fought for.",
          "**Learning from one another.** The feed lets members see how others in their community celebrate, help and give, which is how good practices spread.",
          "**Helping people who aren't family.** Matrimonial, jobs, housing, education, health care and legal aid listings let members help one another, and the [Donate](/donate) tab lets them give to causes their community shares, through trusted platforms.",
        ],
      },
      {
        type: "p",
        text: "If Boyd and Richerson are right, cooperation is one of the oldest things humans do together, and community is where it happens. Our job is simply to give that community a good home.",
      },
      {
        type: "h2",
        text: "Source",
      },
      {
        type: "p",
        text: "Boyd R, Richerson PJ. Culture and the evolution of human cooperation. Philosophical Transactions of the Royal Society B: Biological Sciences. 2009;364(1533):3281–3288. [Read the full paper (open access)](https://pmc.ncbi.nlm.nih.gov/articles/PMC2781880/). Quotations are from the paper; the interpretation for faith communities is ours.",
      },
      {
        type: "cta",
        title: "Give your community a home of its own",
        text: "WePray is free and open to every faith. Bring your community together in one safe, respectful place.",
        href: "/app",
        label: "Open WePray",
      },
    ],
    faqs: [
      {
        q: "Why do humans cooperate with people who aren't family?",
        a: "Boyd and Richerson argue that culture is the key. Because humans learn from one another, groups develop shared norms; groups whose norms support cooperation tend to do better and spread, and over a long time this favoured pro-social feelings like empathy and shame.",
      },
      {
        q: "What is cultural group selection?",
        a: "It's the idea that groups with different cultural norms compete, and norms that help a group cooperate and thrive spread, by the group growing, being imitated or absorbing others. The authors describe it as a slow process, taking centuries.",
      },
      {
        q: "Is this paper about religion?",
        a: "No. It's a general theory of human cooperation. It mentions ritual practices and beliefs as examples of what marks and guides groups, but it isn't a study of any religion. The link to faith communities in this article is our interpretation.",
      },
      {
        q: "Is the theory proven?",
        a: "Not fully. The authors say the theory is well worked out with convincing examples, but that more systematic, quantitative evidence is needed to measure how important it is compared with other explanations.",
      },
    ],
  },
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
