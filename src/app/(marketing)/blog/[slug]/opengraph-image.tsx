import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BLOG_POSTS, getPost } from "@/lib/blog";

export const alt = "WePray blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

/** Share card for a post: title on the brand gradient, so links shared on
 * WhatsApp, Facebook, X and LinkedIn get a large, readable preview. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  const title = post?.title ?? "WePray blog";
  const logo = `data:image/svg+xml;base64,${(await readFile(join(process.cwd(), "public/favicon.svg"))).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #8B1A6B 0%, #C2185B 45%, #1E2952 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src={logo} width={72} height={72} alt="" />
          <div style={{ fontSize: 40, fontWeight: 700 }}>WePray</div>
          <div style={{ fontSize: 28, opacity: 0.75, marginLeft: 12 }}>Blog</div>
        </div>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1, maxWidth: 1000 }}>{title}</div>
        <div style={{ fontSize: 30, opacity: 0.85 }}>A safe home for every faith community · www.wepray.in</div>
      </div>
    ),
    size,
  );
}
