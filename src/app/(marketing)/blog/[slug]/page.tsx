import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BLOG_POSTS, formatPostDate, getPost } from "@/lib/blog";
import { BlogBody, plainText } from "@/components/blog/rich-text";
import { ShareButtons } from "@/components/blog/share-buttons";
import { SITE_URL } from "@/lib/site-url";

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  return {
    title: post.seoTitle,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.published,
      modifiedTime: post.updated ?? post.published,
      authors: [post.author],
      siteName: "WePray",
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const url = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.published,
      dateModified: post.updated ?? post.published,
      author: { "@type": "Organization", name: post.author, url: SITE_URL },
      publisher: { "@type": "Organization", name: "WePray", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/icons/icon-512.png` } },
      mainEntityOfPage: url,
      image: `${url}/opengraph-image`,
      keywords: post.keywords.join(", "),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
    ...(post.faqs?.length
      ? [{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: plainText(f.a) } })),
        }]
      : []),
  ];

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 md:pt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#8B1A6B]">
        <ArrowLeft className="h-4 w-4" /> All articles
      </Link>

      <header className="mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B1A6B]">{post.category}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">{post.title}</h1>
        <p className="mt-5 text-lg text-gray-600 leading-relaxed">{post.description}</p>
        <p className="mt-5 text-sm text-gray-500">
          By {post.author} · <time dateTime={post.published}>{formatPostDate(post.published)}</time> · {post.readingMinutes} min read
        </p>
        <div className="mt-6 pb-8 border-b border-gray-100">
          <ShareButtons url={url} title={post.title} />
        </div>
      </header>

      <div className="mt-10">
        <BlogBody blocks={post.body} />
      </div>

      {post.faqs && post.faqs.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-gray-100 rounded-3xl border border-gray-100">
            {post.faqs.map((f) => (
              <details key={f.q} className="group p-5 sm:p-6">
                <summary className="cursor-pointer list-none font-semibold text-gray-900 flex items-center justify-between gap-4">
                  {f.q}
                  <span className="text-[#8B1A6B] text-xl leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 rounded-3xl bg-gray-50 p-6">
        <p className="font-semibold text-gray-900">Found this useful? Share it with your community.</p>
        <div className="mt-4">
          <ShareButtons url={url} title={post.title} />
        </div>
      </div>
    </article>
  );
}
