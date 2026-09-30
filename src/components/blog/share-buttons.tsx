"use client";
import { useState, useSyncExternalStore } from "react";
import { Check, Link2, Share2 } from "lucide-react";

const noopSubscribe = () => () => {};

/** Share links for a blog post. WhatsApp first — it's how most of our
 * audience passes things on. Uses the native share sheet where available. */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  // false on the server and during hydration, so both renders match.
  const canShare = useSyncExternalStore(noopSubscribe, () => "share" in navigator, () => false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, cls: "bg-[#25D366] text-white hover:bg-[#1eb957]" },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, cls: "bg-[#1877F2] text-white hover:bg-[#1466d6]" },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`, cls: "bg-black text-white hover:bg-gray-800" },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, cls: "bg-[#0A66C2] text-white hover:bg-[#0957a6]" },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the other buttons still work */
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      /* dismissed */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold text-gray-500">Share:</span>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${l.cls}`}>
          {l.label}
        </a>
      ))}
      <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />} {copied ? "Copied" : "Copy link"}
      </button>
      {canShare && (
        <button type="button" onClick={nativeShare} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:hidden">
          <Share2 className="h-4 w-4" /> More
        </button>
      )}
    </div>
  );
}
