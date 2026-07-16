import type { MangaDTO } from "@/lib/api/types"
import { MangaDetailClient } from "./MangaDetailClient"

// Server-fetch the manga so its full body (title, synopsis, score, chapters,
// genres) is in the initial HTML for Googlebot — same pattern as /anime/[id].
// Same URL+options as the layout's fetch, so Next.js dedupes the request.
async function fetchManga(idOrSlug: string): Promise<MangaDTO | null> {
  try {
    const res = await fetch(
      `${process.env.API_BASE ?? "http://localhost:4000"}/api/v1/manga/${idOrSlug}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return null
    const data = (await res.json()) as { manga?: MangaDTO }
    return data.manga ?? null
  } catch {
    return null
  }
}

export default async function MangaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const manga = await fetchManga(id)

  // initialManga null is fine: the client falls back to its own fetch, which
  // also covers manga not yet synced into the DB (backend read-through).
  return <MangaDetailClient idOrSlug={id} initialManga={manga} />
}
