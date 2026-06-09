import type { AnimeDTO } from "@/lib/api/types"
import { AnimeDetailClient } from "./AnimeDetailClient"

// Server-fetch the anime so its full body (title, synopsis, score, episodes,
// genres) is in the initial HTML for Googlebot — fixing the "Crawled, currently
// not indexed" problem caused by the page previously rendering a client-side
// spinner at crawl time. Same URL+options as the layout's fetch, so Next.js
// dedupes the request. ISR-cached.
async function fetchAnime(malId: number): Promise<AnimeDTO | null> {
  try {
    const res = await fetch(
      `${process.env.API_BASE ?? "http://localhost:4000"}/api/v1/anime/${malId}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return null
    const data = (await res.json()) as { anime?: AnimeDTO }
    return data.anime ?? null
  } catch {
    return null
  }
}

export default async function AnimeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const malId = parseInt(id, 10)
  const anime = isNaN(malId) ? null : await fetchAnime(malId)

  // initialAnime null is fine: the client falls back to its own fetch (spinner
  // → content), which also covers anime not yet synced into the DB.
  return <AnimeDetailClient malId={malId} initialAnime={anime} />
}
