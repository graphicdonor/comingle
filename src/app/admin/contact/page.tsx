import { createAdminClient } from "@/lib/supabase/admin";
import { ContactMessages, type ContactRow } from "@/components/admin/contact-messages";

export const revalidate = 0;

export default async function AdminContactPage() {
  const { data, error } = await createAdminClient()
    .from("contact_messages")
    .select("id, topic, message, name, reply_to, status, created_at, profiles(username)")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as unknown as ContactRow[];
  const open = rows.filter((r) => r.status === "open").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-sm text-gray-500 mt-1">
          From the Contact us form · {open} open, {rows.length - open} resolved
        </p>
        {error && <p className="text-sm text-red-400 mt-2">Couldn&apos;t load messages: {error.message}</p>}
      </div>
      <ContactMessages rows={rows} />
    </div>
  );
}
