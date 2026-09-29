/** Topics for the Contact us form — ids are stored in contact_messages.topic. */
export const CONTACT_TOPICS = [
  { id: "privacy", label: "Privacy or data request" },
  { id: "terms", label: "Question about the Terms" },
  { id: "safety", label: "Report a safety concern" },
  { id: "account", label: "Help with my account" },
  { id: "guardian", label: "Parent or guardian request" },
  { id: "other", label: "Something else" },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["id"];

export function isContactTopic(v: unknown): v is ContactTopic {
  return typeof v === "string" && CONTACT_TOPICS.some((t) => t.id === v);
}

export function contactTopicLabel(id: string): string {
  return CONTACT_TOPICS.find((t) => t.id === id)?.label ?? id;
}

export const CONTACT_MESSAGE_MIN = 10;
export const CONTACT_MESSAGE_MAX = 4000;
