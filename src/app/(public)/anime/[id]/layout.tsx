import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/JsonLd"

const SITE = "https://kaiveron.com"

interface AnimePayload {
  title?:        string
  titleEnglish?: string
  titleJapanese?: string
  synopsis?:     string
  imageUrl?:     string
  score?:        number
  scoredBy?:     number
  year?:         number
  studios?:      string[]
  genres?:       string[]
  episodes?:     number
  type?:         string
  status?:       string
  airedFrom?:    string
}

async function fetchAnime(malId: number): Promise<AnimePayload | null> {
  try {
    const res = await fetch(`${process.env.API_BASE ?? "http://localhost:4000"}/api/v1/anime/${malId}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json() as { anime?: AnimePayload }
    return data.anime ?? null
  } catch { return null }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const malId = Number(id)
  const a = await fetchAnime(malId)

  if (a) {
    // Title format: search-optimized — primary keyword (anime title) first,
    // then "Episodes, Ratings & Where to Track" surface intent words.
    // The " | Kaiveron" suffix is appended by the root layout's title template.
    const display = a.titleEnglish ?? a.title ?? "Anime"
    const title = `${display} — Episodes, Ratings & Reviews`
    const score = a.score ? ` ★ ${a.score}/10.` : ""
    const description = a.synopsis
      ? `Track ${display} on Kaiveron.${score} ${a.episodes ?? "?"} episodes${a.year ? `, ${a.year}` : ""}${a.studios?.[0] ? `, by ${a.studios[0]}` : ""}. ${a.synopsis.slice(0, 90).replace(/\n/g, " ")}…`
      : `Track ${display} on Kaiveron — ratings, episode tracking, and community discussion.`
    return {
      title,
      description,
      keywords: [a.title, a.titleEnglish, ...(a.genres ?? []), "anime", "watch", "review"].filter(Boolean) as string[],
      openGraph: {
        title,
        description,
        url: `/anime/${malId}`,
        type: "video.tv_show",
        ...(a.imageUrl ? {
          images: [{ url: a.imageUrl, width: 225, height: 318, alt: a.title ?? "Anime poster" }],
        } : {}),
      },
      twitter: {
        card: a.imageUrl ? "summary_large_image" : "summary",
        title,
        description,
        ...(a.imageUrl ? { images: [a.imageUrl] } : {}),
      },
      // Self-referencing canonical relative to metadataBase (=kaiveron.com)
      alternates: { canonical: `/anime/${malId}` },
    }
  }

  return {
    title: `Anime ${id}`,
    description: "Track, rate, and discover anime on Kaiveron — the AI-powered anime tracker.",
    alternates: { canonical: `/anime/${id}` },
  }
}

/**
 * Anime detail layout. Injects per-anime TVSeries + AggregateRating + BreadcrumbList
 * JSON-LD around the page body — critical for Google rich results
 * (rating stars in SERP) and for AI engine citation when users ask
 * about a specific show.
 */
export default async function AnimeDetailLayout({
  children, params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const malId = Number(id)
  const a = await fetchAnime(malId)

  const url = `${SITE}/anime/${malId}`

  // BreadcrumbList helps Google show breadcrumb trails in results and
  // gives AI engines structural context.
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",     item: SITE },
      { "@type": "ListItem", position: 2, name: "Anime",    item: `${SITE}/bestanimelist` },
      { "@type": "ListItem", position: 3, name: a?.title ?? `Anime ${id}`, item: url },
    ],
  }

  const tvSeries = a ? {
    "@context":   "https://schema.org",
    "@type":      "TVSeries",
    name:         a.titleEnglish ?? a.title,
    alternateName: [a.title, a.titleJapanese].filter(Boolean) as string[],
    url,
    ...(a.imageUrl       ? { image: a.imageUrl }              : {}),
    ...(a.synopsis       ? { description: a.synopsis }        : {}),
    ...(a.episodes       ? { numberOfEpisodes: a.episodes }   : {}),
    ...(a.year           ? { datePublished: String(a.year) }  : {}),
    ...(a.airedFrom      ? { startDate: a.airedFrom }         : {}),
    ...(a.genres?.length ? { genre: a.genres }                : {}),
    ...(a.studios?.length ? { productionCompany: a.studios.map(s => ({ "@type": "Organization", name: s })) } : {}),
    ...(a.score
      ? {
          aggregateRating: {
            "@type":     "AggregateRating",
            ratingValue: a.score,
            bestRating:  10,
            worstRating: 1,
            ratingCount: a.scoredBy && a.scoredBy > 0 ? a.scoredBy : 1,
          },
        }
      : {}),
  } : null

  return (
    <>
      <JsonLd data={breadcrumb} />
      {tvSeries && <JsonLd data={tvSeries} />}
      {children}
    </>
  )
}
