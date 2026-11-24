import { createHash } from "node:crypto";

// Every hour, asks the site to publish CMS items whose scheduled time has
// come (src/app/api/cms/cron/route.ts). The shared secret is derived from
// ADMIN_SECRET the same way as the admin session token.

const scheduler = async () => {
  const secret = process.env.ADMIN_SECRET;
  const site = process.env.URL;
  if (!secret || !site) return new Response("Not configured", { status: 500 });
  const token = createHash("sha256").update(secret + "admin-salt").digest("hex");
  const res = await fetch(`${site}/api/cms/cron`, { method: "POST", headers: { "x-cms-cron": token } });
  return new Response(await res.text(), { status: res.status });
};

export default scheduler;

export const config = { schedule: "@hourly" };
