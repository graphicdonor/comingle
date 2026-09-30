import Link from "next/link";
import type { BlogBlock } from "@/lib/blog";

/** Renders the **bold** and [text](href) inline markup used in blog posts. */
export function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) {
      parts.push(<strong key={m.index} className="font-semibold text-gray-900">{m[1]}</strong>);
    } else {
      const href = m[3];
      const cls = "font-semibold text-[#8B1A6B] underline decoration-[#8B1A6B]/30 underline-offset-2 hover:decoration-[#8B1A6B]";
      parts.push(
        href.startsWith("/") ? (
          <Link key={m.index} href={href} className={cls}>{m[2]}</Link>
        ) : (
          <a key={m.index} href={href} target="_blank" rel="noopener noreferrer" className={cls}>{m[2]}</a>
        ),
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

/** Plain-text version (for RSS and structured data). */
export function plainText(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[(.+?)\]\((.+?)\)/g, "$1");
}

export function BlogBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-5 text-[17px] leading-8 text-gray-700">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return <p key={i}><RichText text={b.text} /></p>;
          case "h2":
            return <h2 key={i} className="!mt-12 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">{b.text}</h2>;
          case "h3":
            return <h3 key={i} className="!mt-8 text-xl font-semibold text-gray-900">{b.text}</h3>;
          case "ul":
            return (
              <ul key={i} className="list-disc pl-6 space-y-2 marker:text-[#8B1A6B]">
                {b.items.map((it, j) => <li key={j}><RichText text={it} /></li>)}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal pl-6 space-y-3 marker:font-semibold marker:text-[#8B1A6B]">
                {b.items.map((it, j) => <li key={j}><RichText text={it} /></li>)}
              </ol>
            );
          case "quote":
            return (
              <blockquote key={i} className="rounded-2xl border-l-4 border-[#8B1A6B] bg-[#fff0f5] px-6 py-5 text-xl font-semibold leading-relaxed text-[#1E2952]">
                <RichText text={b.text} />
              </blockquote>
            );
          case "cta":
            return (
              <div key={i} className="!mt-12 rounded-3xl bg-gradient-to-br from-[#8B1A6B] to-[#1E2952] p-8 text-white">
                <p className="text-2xl font-bold">{b.title}</p>
                <p className="mt-2 text-white/80 leading-relaxed">{b.text}</p>
                <Link href={b.href} className="mt-5 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-[#8B1A6B] hover:bg-white/90 transition-colors">
                  {b.label}
                </Link>
              </div>
            );
        }
      })}
    </div>
  );
}
