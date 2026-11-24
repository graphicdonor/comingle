import { getPrayer, type Localised, type Prayer } from "./prayers";

// Guided sessions: a short sequence of prayers recited one after another in a
// distraction-free view. Sequences follow a common order (homage, refuges,
// precepts …) but practice differs between communities, which the session
// screen says.

export interface PracticeSession {
  id: "morning" | "evening";
  title: Localised;
  description: Localised;
  prayerSlugs: string[];
}

export const SESSIONS: PracticeSession[] = [
  {
    id: "morning",
    title: { en: "Morning practice", hi: "प्रातः वंदना" },
    description: {
      en: "Homage, offerings, the Three Refuges and the Five Precepts — a common way to begin the day.",
      hi: "वंदना, पूजा, त्रिशरण और पंचशील — दिन आरंभ करने का एक प्रचलित क्रम।",
    },
    prayerSlugs: ["buddha-vandana", "buddha-puja", "tisarana", "pancasila"],
  },
  {
    id: "evening",
    title: { en: "Evening practice", hi: "सायं वंदना" },
    description: {
      en: "Homage, recollecting the Triple Gem, loving-kindness and sharing merit to close the day.",
      hi: "वंदना, त्रिरत्न अनुस्मृति, मैत्री भावना और पुण्यानुमोदन से दिन का समापन।",
    },
    prayerSlugs: ["buddha-vandana", "tiratana-anussati", "metta", "punnanumodana"],
  },
];

export function getSession(id: string): PracticeSession | undefined {
  return SESSIONS.find((s) => s.id === id);
}

export function sessionPrayers(session: PracticeSession): Prayer[] {
  return session.prayerSlugs.map((slug) => getPrayer(slug)).filter((p): p is Prayer => Boolean(p));
}

export function sessionMinutes(session: PracticeSession): number {
  return sessionPrayers(session).reduce((sum, p) => sum + p.durationMinutes, 0);
}

/** Morning from 3am until 3pm local time, evening otherwise. */
export function sessionForHour(hour: number): PracticeSession["id"] {
  return hour >= 3 && hour < 15 ? "morning" : "evening";
}
