import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { JsonLd } from "@/components/seo/JsonLd"
import { SeoAnimeGrid } from "@/components/seo/SeoAnimeGrid"
import { getAnimeByStudio, listCatalogStudios } from "@/lib/seo/server-fetch"
import { FEATURED_STUDIOS, toSlug } from "@/lib/seo/taxonomy"
import { currentYear } from "@/lib/seo/metadata"

const SITE = "https://kaiveron.com"

export function generateStaticParams() {
  return FEATURED_STUDIOS.map((name) => ({ slug: toSlug(name) }))
}

export const dynamicParams = true
export const revalidate = 3600

/** Resolve a URL slug back to the catalog studio's display name. */
async function resolveStudioName(slug: string): Promise<string | null> {
  const featured = FEATURED_STUDIOS.find((n) => toSlug(n) === slug)
  if (featured) return featured
  const all = await listCatalogStudios()
  return all.find((s) => toSlug(s.name) === slug)?.name ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const name = await resolveStudioName(slug)
  if (!name) return { title: "Studio not found" }

  const title = `${name} Anime — Every Series Ranked`
  const description = `Every anime from ${name}, ranked by score. Episodes, ratings, trailers, and one-tap tracking. The complete ${name} watch guide on Kaiveron.`

  return {
    title,
    description,
    keywords: [
      `${name.toLowerCase()} anime`,
      `${name.toLowerCase()} anime list`,
      `best ${name.toLowerCase()} anime`,
      `anime by ${name.toLowerCase()}`,
    ],
    alternates: { canonical: `/studios/${slug}` },
    openGraph: {
      type: "website",
      siteName: "Kaiveron",
      title: `${title} | Kaiveron`,
      description,
      url: `${SITE}/studios/${slug}`,
    },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function StudioPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const name = await resolveStudioName(slug)
  if (!name) notFound()

  const { items } = await getAnimeByStudio(name, 30)
  if (items.length === 0) notFound()

  const year = currentYear()
  const top = items.slice(0, 6)

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${name} Anime, Ranked`,
    numberOfItems: items.length,
    itemListElement: items.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/anime/${a.malId}`,
      name: a.titleEnglish ?? a.title,
    })),
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Studios", item: `${SITE}/studios` },
      { "@type": "ListItem", position: 3, name, item: `${SITE}/studios/${slug}` },
    ],
  }

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: `${SITE}/studios/${slug}`,
    description: `${name} is an anime production studio. View its full catalog ranked by score on Kaiveron.`,
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={orgJsonLd} />

      <nav className="mb-4 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-amber-300">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/studios" className="hover:text-amber-300">Studios</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{name}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {name} Anime — Every Series Ranked
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">
          The complete catalog of anime produced by {name}, ranked by community score and
          updated for {year}. Standouts include{" "}
          {top.slice(0, 3).map((a, i) => (
            <span key={a.malId}>
              {i > 0 ? ", " : ""}
              <Link href={`/anime/${a.malId}`} className="text-amber-400 hover:text-amber-300">
                {a.titleEnglish ?? a.title}
              </Link>
            </span>
          ))}
          . Track what you&apos;ve watched and rate each one —{" "}
          <Link href="/register" className="text-amber-400 underline hover:text-amber-300">
            free forever
          </Link>.
        </p>
      </header>

      <SeoAnimeGrid items={items} />

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="mb-4 text-lg font-bold text-foreground">More from top anime studios</h2>
        <div className="flex flex-wrap gap-2">
          {FEATURED_STUDIOS.filter((n) => n !== name).map((n) => (
            <Link
              key={n}
              href={`/studios/${toSlug(n)}`}
              className="rounded-full border border-border bg-white/[0.02] px-3 py-1.5 text-sm text-muted transition hover:border-amber-500/40 hover:text-amber-300"
            >
              {n}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
