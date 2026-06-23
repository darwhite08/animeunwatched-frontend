// Server component — fetches the real post (public API, no auth) so logged-out
// visitors AND crawlers get accurate title/description/OG tags + Article JSON-LD.
import type { Metadata } from "next"
import Script from "next/script"
import { JsonLd } from "@/components/seo/JsonLd"

const API_BASE = process.env.API_BASE ?? "http://localhost:4000"
const SITE = "https://kaiveron.com"

type BlogData = {
  slug: string
  title: string
  body: string
  publishedAt: string | null
  updatedAt: string | null
  author?: { username: string; displayName: string; avatarUrl: string | null } | null
}

/** Public, unauthenticated fetch (ISR-cached). Next memoises identical calls
 *  within one render, so generateMetadata + the layout share one request. */
async function getBlog(slug: string): Promise<BlogData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/blogs/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { blog?: BlogData }
    return json.blog ?? null
  } catch {
    return null
  }
}

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
const firstImage = (html: string) => html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null
const titleFromSlug = (slug: string) => slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const blog = await getBlog(slug)
  const url = `${SITE}/blog/${slug}`

  if (!blog) {
    const fallback = titleFromSlug(slug)
    return {
      title: `${fallback} | The Chronicle — Kaiveron`,
      description: `Read "${fallback}" on The Chronicle — anime long-form journalism by the Kaiveron community.`,
      alternates: { canonical: url },
    }
  }

  const description = stripHtml(blog.body).slice(0, 160) || "Anime long-form journalism on Kaiveron."
  const image = firstImage(blog.body)
  const author = blog.author?.displayName || blog.author?.username

  return {
    title: `${blog.title} | The Chronicle — Kaiveron`,
    description,
    alternates: { canonical: url },
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title: blog.title,
      description,
      type: "article",
      url,
      siteName: "Kaiveron",
      publishedTime: blog.publishedAt ?? undefined,
      modifiedTime: blog.updatedAt ?? undefined,
      authors: author ? [author] : undefined,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: blog.title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function BlogSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const blog = await getBlog(slug)

  return (
    <>
      {/* Google AdSense — loaded only on blog reading pages. `afterInteractive`
          defers it until the article is interactive, so it never blocks the
          reading experience. Ad placement is controlled in the AdSense dashboard
          (Auto Ads), which keeps units out of the way of the content. */}
      <Script
        id="google-adsense"
        async
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7026816666510256"
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE },
            { "@type": "ListItem", position: 2, name: "The Chronicle", item: `${SITE}/blog` },
            { "@type": "ListItem", position: 3, name: blog?.title ?? titleFromSlug(slug), item: `${SITE}/blog/${slug}` },
          ],
        }}
      />
      {blog && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: blog.title,
            description: stripHtml(blog.body).slice(0, 200),
            datePublished: blog.publishedAt ?? undefined,
            dateModified: blog.updatedAt ?? blog.publishedAt ?? undefined,
            author: {
              "@type": "Person",
              name: blog.author?.displayName || blog.author?.username || "Kaiveron",
            },
            image: firstImage(blog.body) ?? undefined,
            mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/blog/${slug}` },
            publisher: { "@type": "Organization", name: "Kaiveron", url: SITE },
          }}
        />
      )}
      {children}
    </>
  )
}
