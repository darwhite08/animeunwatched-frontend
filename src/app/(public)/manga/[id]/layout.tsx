import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/JsonLd"

const SITE = "https://kaiveron.com"

interface MangaPayload {
  malId?:         number
  title?:         string
  titleEnglish?:  string
  titleJapanese?: string
  synopsis?:      string
  imageUrl?:      string
  score?:         number
  membersCount?:  number
  chapters?:      number
  volumes?:       number
  type?:          string
  status?:        string
  demographic?:   string
  authors?:       string[]
  genres?:        string[]
  publishedFrom?: string
}

async function fetchManga(idOrSlug: string): Promise<MangaPayload | null> {
  try {
    const res = await fetch(`${process.env.API_BASE ?? "http://localhost:4000"}/api/v1/manga/${idOrSlug}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json() as { manga?: MangaPayload }
    return data.manga ?? null
  } catch { return null }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const m = await fetchManga(id)

  if (m) {
    const display = m.titleEnglish ?? m.title ?? "Manga"
    const title = `${display} — Chapters, Ratings & Reading List`
    const score = m.score ? ` ★ ${m.score}/10.` : ""
    const description = m.synopsis
      ? `Track ${display} on Kaiveron.${score} ${m.chapters ?? "?"} chapters${m.authors?.[0] ? `, by ${m.authors[0]}` : ""}. ${m.synopsis.slice(0, 90).replace(/\n/g, " ")}…`
      : `Track ${display} on Kaiveron — ratings, chapter tracking, and community discussion.`
    const canonical = `/manga/${m.malId ?? id}`
    return {
      title,
      description,
      keywords: [m.title, m.titleEnglish, ...(m.genres ?? []), "manga", "read", "review"].filter(Boolean) as string[],
      openGraph: {
        title,
        description,
        url: canonical,
        type: "book",
        ...(m.imageUrl ? {
          images: [{ url: m.imageUrl, width: 225, height: 318, alt: m.title ?? "Manga cover" }],
        } : {}),
      },
      twitter: {
        card: m.imageUrl ? "summary_large_image" : "summary",
        title,
        description,
        ...(m.imageUrl ? { images: [m.imageUrl] } : {}),
      },
      alternates: { canonical },
    }
  }

  return {
    title: `Manga ${id}`,
    description: "Track, rate, and discover manga on Kaiveron — chapter-level progress and reading lists.",
    alternates: { canonical: `/manga/${id}` },
  }
}

/**
 * Manga detail layout. Injects per-manga Book + AggregateRating + BreadcrumbList
 * JSON-LD around the page body — mirrors the anime detail layout's TVSeries markup.
 */
export default async function MangaDetailLayout({
  children, params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const m = await fetchManga(id)

  const url = `${SITE}/manga/${m?.malId ?? id}`

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",  item: SITE },
      { "@type": "ListItem", position: 2, name: "Manga", item: `${SITE}/manga` },
      { "@type": "ListItem", position: 3, name: m?.title ?? `Manga ${id}`, item: url },
    ],
  }

  const book = m ? {
    "@context":    "https://schema.org",
    "@type":       "Book",
    bookFormat:    "https://schema.org/GraphicNovel",
    name:          m.titleEnglish ?? m.title,
    alternateName: [m.title, m.titleJapanese].filter(Boolean) as string[],
    url,
    ...(m.imageUrl        ? { image: m.imageUrl }       : {}),
    ...(m.synopsis        ? { description: m.synopsis } : {}),
    ...(m.publishedFrom   ? { datePublished: m.publishedFrom } : {}),
    ...(m.genres?.length  ? { genre: m.genres }         : {}),
    ...(m.authors?.length ? { author: m.authors.map(a => ({ "@type": "Person", name: a })) } : {}),
    ...(m.score
      ? {
          aggregateRating: {
            "@type":     "AggregateRating",
            ratingValue: m.score,
            bestRating:  10,
            worstRating: 1,
            ratingCount: m.membersCount && m.membersCount > 0 ? m.membersCount : 1,
          },
        }
      : {}),
  } : null

  return (
    <>
      <JsonLd data={breadcrumb} />
      {book && <JsonLd data={book} />}
      {children}
    </>
  )
}
