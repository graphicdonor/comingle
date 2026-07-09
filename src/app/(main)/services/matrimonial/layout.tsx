import { MatrimonialNavTabs } from "@/components/matrimonial/matrimonial-nav-tabs";
import { DEV_MODE } from "@/lib/dev-auth";
import { createClient } from "@/lib/supabase/server";

export default async function MatrimonialLayout({ children }: { children: React.ReactNode }) {
  if (!DEV_MODE) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Visiting any matrimonial page counts as "active" for the "Last seen"
      // display elsewhere in this section. Awaited rather than
      // fire-and-forget — serverless runtimes can cut execution once the
      // response is sent, so an un-awaited write isn't reliably durable.
      await supabase.from("profiles").update({ last_active_at: new Date().toISOString() }).eq("id", user.id);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Matrimonial</h1>
      <MatrimonialNavTabs />
      {children}
    </div>
  );
}
