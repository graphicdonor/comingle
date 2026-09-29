import { ContactForm } from "@/components/contact/contact-form";
import { isContactTopic } from "@/lib/contact";

export const metadata = { title: "Contact us" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  return <ContactForm initialTopic={isContactTopic(topic) ? topic : undefined} />;
}
