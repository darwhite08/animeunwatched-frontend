import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { JsonLd } from "@/components/seo/JsonLd"
import { SeoAnimeGrid } from "@/components/seo/SeoAnimeGrid"
import { getAnimeByGenre } from "@/lib/seo/server-fetch"
import { GENRES, getGenre } from "@/lib/seo/taxonomy"
import { currentYear } from "@/lib/seo/metadata"

const SITE = "https://kaiveron.com"

// Statically pre-render every known genre at build time (fast + crawlable).
// Unknown-but-valid catalog genres still resolve at request time via ISR.
export function generateStaticParams() {
  return GENRES.map((g) => ({ slug: g.slug }))
}

export const dynamicParams = true
export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const genre = getGenre(slug)
  if (!genre) return { title: "Genre not found" }

  const year = currentYear()
  const title = `Best ${genre.name} Anime to Watch in ${year}`
  const description = `The ${genre.name.toLowerCase()} anime worth your time — ${genre.blurb}. Ranked by score, with episodes, ratings, and where to track them. Updated for ${year} on Kaiveron.`

  return {
    title,
    description,
    keywords: [
      `best ${genre.name.toLowerCase()} anime`,
      `top ${genre.name.toLowerCase()} anime`,
      `${genre.name.toLowerCase()} anime ${year}`,
      `${genre.name.toLowerCase()} anime list`,
      "anime recommendations",
    ],
    alternates: { canonical: `/genres/${genre.slug}` },
    openGraph: {
      type: "website",
      siteName: "Kaiveron",
      title: `${title} | Kaiveron`,
      description,
      url: `${SITE}/genres/${genre.slug}`,
    },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function GenrePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const genre = getGenre(slug)
  if (!genre) notFound()

  const { items } = await getAnimeByGenre(genre.name, 30)
  if (items.length === 0) notFound()

  const year = currentYear()
  const top = items.slice(0, 10)

  // ItemList = the ranked list Google can show as a carousel / AI engines cite.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best ${genre.name} Anime (${year})`,
    description: `Top ${genre.name} anime ranked by score on Kaiveron.`,
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
      { "@type": "ListItem", position: 2, name: "Genres", item: `${SITE}/genres` },
      { "@type": "ListItem", position: 3, name: genre.name, item: `${SITE}/genres/${genre.slug}` },
    ],
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the best ${genre.name.toLowerCase()} anime?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Ranked by community score, the top ${genre.name.toLowerCase()} anime right now is ${
            top[0]?.titleEnglish ?? top[0]?.title
          }, followed by ${top
            .slice(1, 4)
            .map((a) => a.titleEnglish ?? a.title)
            .join(", ")}. See the full ranked list on Kaiveron.`,
        },
      },
      {
        "@type": "Question",
        name: `How many ${genre.name.toLowerCase()} anime are on Kaiveron?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Kaiveron tracks a large, continuously-synced catalog of ${genre.name.toLowerCase()} anime, ranked by score and updated for ${year}. You can track episodes, rate them, and get AI recommendations for free.`,
        },
      },
    ],
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />

      {/* Breadcrumb trail (crawlable internal links) */}
      <nav className="mb-4 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-amber-300">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/genres" className="hover:text-amber-300">Genres</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{genre.name}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          <span className="mr-2">{genre.emoji}</span>
          Best {genre.name} Anime to Watch in {year}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">
          The definitive ranked list of {genre.name.toLowerCase()} anime — {genre.blurb}.
          Every title below is ranked by community score and links to its full page
          with episodes, ratings, trailers, and one-tap tracking.
          {" "}<Link href="/register" className="text-amber-400 underline hover:text-amber-300">
            Create a free account
          </Link>{" "}to build your own {genre.name.toLowerCase()} watchlist and get AI
          recommendations tuned to your taste.
        </p>
      </header>

      <SeoAnimeGrid items={items} />

      {/* Internal links to sibling genres — spreads crawl equity + helps users */}
      <section className="mt-12 border-t border-border pt-8">
        <h2 className="mb-4 text-lg font-bold text-foreground">Explore more anime genres</h2>
        <div className="flex flex-wrap gap-2">
          {GENRES.filter((g) => g.slug !== genre.slug).map((g) => (
            <Link
              key={g.slug}
              href={`/genres/${g.slug}`}
              className="rounded-full border border-border bg-white/[0.02] px-3 py-1.5 text-sm text-muted transition hover:border-amber-500/40 hover:text-amber-300"
            >
              {g.emoji} {g.name}
            </Link>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">
          Looking for something specific? Try{" "}
          <Link href="/ai-discover" className="text-amber-400 hover:text-amber-300">AI Discover</Link>,{" "}
          <Link href="/mood" className="text-amber-400 hover:text-amber-300">browse by mood</Link>, or see the{" "}
          <Link href="/bestanimelist" className="text-amber-400 hover:text-amber-300">all-time best anime list</Link>.
        </p>
      </section>
    </main>
  )
}
