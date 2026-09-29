export const EVENT_CATEGORIES = ["Cultural", "Religious", "Social", "Educational", "Sports", "Charity", "Other"];

export interface EventListingBody {
  title: string;
  description?: string | null;
  categories: string[];
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  is_online: boolean;
  online_link?: string | null;
  venue_name?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  poc_name?: string | null;
  mobile_number?: string | null;
  whatsapp_number?: string | null;
  email?: string | null;
  registration_link?: string | null;
  photo_urls: string[];
}

/** Shared by the create and edit routes so the column list can't drift between the two. */
export function sanitizeEventListingBody(body: EventListingBody) {
  return {
    title: body.title.trim(),
    description: body.description?.trim() || null,
    categories: body.categories ?? [],
    event_date: body.event_date,
    start_time: body.start_time || null,
    end_time: body.end_time || null,
    is_online: !!body.is_online,
    online_link: body.online_link?.trim() || null,
    venue_name: body.venue_name?.trim() || null,
    address: body.address?.trim() || null,
    city: body.city?.trim() || null,
    state: body.state?.trim() || null,
    poc_name: body.poc_name?.trim() || null,
    mobile_number: body.mobile_number?.trim() || null,
    whatsapp_number: body.whatsapp_number?.trim() || null,
    email: body.email?.trim() || null,
    registration_link: body.registration_link?.trim() || null,
    photo_urls: body.photo_urls ?? [],
  };
}

export function eventListingModerationText(body: EventListingBody) {
  return [body.title, body.description, body.venue_name, body.categories?.join(", ")].filter(Boolean).join("\n\n");
}

/** Today's date as YYYY-MM-DD in India time — event_date is a plain date and
 * the server may run in UTC. Mirrors todayIsoDate in the native app. */
export function todayIsoDate(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

/** Splits a YYYY-MM-DD event date into calendar-badge parts without timezone drift. */
export function eventDateParts(isoDate: string): { day: string; month: string; weekday: string } {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return {
    day: String(d),
    month: date.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }),
    weekday: date.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" }),
  };
}

/** "18:30:00" → "6:30 PM". */
export function formatEventTime(time: string | null): string | null {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
