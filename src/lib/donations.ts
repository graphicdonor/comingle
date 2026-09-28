/**
 * Donation platforms shown on the Donate tab. WePray never handles money:
 * every card and fundraiser opens the platform's own site. Members can only
 * share fundraiser links hosted on one of these platforms (see
 * platformForUrl) — that keeps shared links to known, established sites and
 * also means the server-side link-preview fetch can only ever hit these hosts.
 *
 * Mirrored in the native app's src/lib/donations.ts — keep the two in sync.
 */
export interface DonationPlatform {
  id: string;
  name: string;
  url: string;
  region: "India" | "Global";
  description: string;
  /** Hostnames (and their subdomains) that count as this platform. */
  hosts: string[];
}

export const DONATION_PLATFORMS: DonationPlatform[] = [
  { id: "ketto", name: "Ketto", url: "https://www.ketto.org/crowdfunding/fundraisers", region: "India", description: "India's largest crowdfunding site: medical, NGO and personal causes.", hosts: ["ketto.org"] },
  { id: "milaap", name: "Milaap", url: "https://milaap.org/fundraisers", region: "India", description: "Fundraisers for medical treatment, education and communities.", hosts: ["milaap.org"] },
  { id: "impactguru", name: "ImpactGuru", url: "https://www.impactguru.com/", region: "India", description: "Mostly medical and hospital fundraisers.", hosts: ["impactguru.com"] },
  { id: "give", name: "Give (GiveIndia)", url: "https://give.do/", region: "India", description: "Donate to verified NGOs, often with an 80G tax benefit.", hosts: ["give.do", "giveindia.org"] },
  { id: "donatekart", name: "Donatekart", url: "https://www.donatekart.com/", region: "India", description: "Donate goods like food and supplies to NGOs instead of cash.", hosts: ["donatekart.com"] },
  { id: "fueladream", name: "Fueladream", url: "https://www.fueladream.com/", region: "India", description: "Crowdfunding for social causes and community projects.", hosts: ["fueladream.com"] },
  { id: "gofundme", name: "GoFundMe", url: "https://www.gofundme.com/discover", region: "Global", description: "Personal and community fundraisers around the world.", hosts: ["gofundme.com", "gofund.me"] },
  { id: "globalgiving", name: "GlobalGiving", url: "https://www.globalgiving.org/", region: "Global", description: "Vetted nonprofits and community projects worldwide.", hosts: ["globalgiving.org"] },
  { id: "everyorg", name: "Every.org", url: "https://www.every.org/", region: "Global", description: "Fee-free giving to nonprofits.", hosts: ["every.org"] },
  { id: "justgiving", name: "JustGiving", url: "https://www.justgiving.com/", region: "Global", description: "Charities and personal fundraisers, mainly in the UK.", hosts: ["justgiving.com"] },
  { id: "launchgood", name: "LaunchGood", url: "https://www.launchgood.com/", region: "Global", description: "Crowdfunding for faith-based and community causes.", hosts: ["launchgood.com"] },
  { id: "tithely", name: "Tithe.ly", url: "https://get.tithe.ly/", region: "Global", description: "Online giving for churches and congregations.", hosts: ["tithe.ly"] },
];

export function getPlatform(id: string): DonationPlatform | undefined {
  return DONATION_PLATFORMS.find((p) => p.id === id);
}

/** The platform a URL belongs to, or null if it isn't an https link on a trusted platform. */
export function platformForUrl(raw: string): DonationPlatform | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();
  return DONATION_PLATFORMS.find((p) => p.hosts.some((h) => host === h || host.endsWith(`.${h}`))) ?? null;
}
