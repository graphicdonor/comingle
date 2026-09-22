// Sends an Expo push notification for one notifications row, triggered by
// the notify_push_on_new_notification() Postgres trigger (see
// supabase/migrations/20260922130000_push_tokens.sql) whenever a row is
// inserted into `notifications`. This is what makes a notification reach a
// device with the app closed or backgrounded — the notifications table
// itself only powers the in-app notification center.
//
// Deployed with --no-verify-jwt since this is a server-to-server call from
// inside the same project (the Postgres trigger), not a user request; the
// x-webhook-secret header is the only auth check here.
import { createClient } from "jsr:@supabase/supabase-js@2";

const PUSH_TRIGGER_SECRET = Deno.env.get("PUSH_TRIGGER_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface NotificationRow {
  id: string;
  user_id: string;
  type: "matrimonial_message" | "moderation_decision" | "appeal_outcome" | "post_comment" | "post_like";
  actor_id: string | null;
  link: string;
  count: number;
}

interface ProfileRow {
  full_name: string | null;
  username: string;
}

// Mirrors messageFor() in the web app's NotificationRow component and the
// native app's NotificationsScreen — kept in sync by hand since this runs
// in a separate Deno runtime with no shared import between them.
function messageFor(notification: NotificationRow, name: string): string {
  switch (notification.type) {
    case "matrimonial_message":
      return notification.count > 1 ? `${name} sent you ${notification.count} new messages` : `${name} sent you a new message`;
    case "post_comment":
      return notification.count > 1
        ? `${name} left ${notification.count} new comments on your post`
        : `${name} commented on your post`;
    case "post_like":
      return notification.count > 1
        ? `${name} and ${notification.count - 1} other${notification.count > 2 ? "s" : ""} liked your post`
        : `${name} liked your post`;
    case "moderation_decision":
      return "There's an update on something you posted";
    case "appeal_outcome":
      return "Your appeal has been reviewed";
    default:
      return `New activity from ${name}`;
  }
}

Deno.serve(async (req) => {
  if (PUSH_TRIGGER_SECRET && req.headers.get("x-webhook-secret") !== PUSH_TRIGGER_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { notification_id } = await req.json().catch(() => ({ notification_id: null }));
  if (!notification_id) return new Response("Missing notification_id", { status: 400 });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: notification } = await supabase.from("notifications").select("*").eq("id", notification_id).single();
  if (!notification) return new Response("Notification not found", { status: 404 });

  const { data: tokens } = await supabase.from("push_tokens").select("token").eq("user_id", notification.user_id);
  if (!tokens || tokens.length === 0) return new Response("No push tokens for user", { status: 200 });

  let actorName = "Someone";
  if (notification.actor_id) {
    const { data: actor } = await supabase.from("profiles").select("full_name, username").eq("id", notification.actor_id).single();
    if (actor) actorName = (actor as ProfileRow).full_name || (actor as ProfileRow).username;
  }

  const body = messageFor(notification as NotificationRow, actorName);

  const messages = tokens.map((t) => ({
    to: t.token,
    sound: "default",
    title: "WePray",
    body,
    data: { url: notification.link },
  }));

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(messages),
  });

  return new Response("OK", { status: 200 });
});
