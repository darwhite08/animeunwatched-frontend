/**
 * Server-only data fetchers for SEO landing pages + sitemap.
 *
 * These run in Server Components / route handlers (no browser, no auth token),
 * so they hit the backend directly via API_BASE rather than the client
 * `api()` helper (which depends on the zustand auth store). Mirrors the
 * pattern already used in app/(public)/anime/[id]/layout.tsx.
 *
 * Everything is ISR-cached (revalidate) so landing pages are static-fast and
 * the backend is never hit at request time once warm.
 *
 * NOTE: import only from Server Components / route handlers — these functions
 * read API_BASE and must never run in the browser bundle.
 */

const API_BASE = process.env.API_BASE ?? "http://localhost:4000"
const REVALIDATE = 60 * 60 // 1h — fresh enough for "best of" lists, cheap to serve

export interface SeoAnime {
  malId: number
  title: string
  titleEnglish: string | null
  synopsis: string | null
  imageUrl: string | null
  score: number | null
  year: number | null
  episodes: number | null
  type: string | null
  genres: string[]
  studios: string[]
}

interface BrowseResponse {
  data?: Array<Record<string, unknown>>
  meta?: { total?: number }
}

function toSeoAnime(a: Record<string, unknown>): SeoAnime {
  return {
    malId:        Number(a.malId) || 0,
    title:        String(a.title ?? "Unknown"),
    titleEnglish: (a.titleEnglish as string) ?? null,
    synopsis:     (a.synopsis as string) ?? null,
    imageUrl:     (a.imageUrl as string) ?? null,
    score:        typeof a.score === "number" ? a.score : null,
    year:         typeof a.year === "number" ? a.year : null,
    episodes:     typeof a.episodes === "number" ? a.episodes : null,
    type:         (a.type as string) ?? null,
    genres:       Array.isArray(a.genres) ? (a.genres as string[]) : [],
    studios:      Array.isArray(a.studios) ? (a.studios as string[]) : [],
  }
}

async function browse(params: Record<string, string | number>): Promise<{ items: SeoAnime[]; total: number }> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString()
  try {
    const res = await fetch(`${API_BASE}/api/v1/anime?${qs}`, {
      next: { revalidate: REVALIDATE },
    })
    if (!res.ok) return { items: [], total: 0 }
    const json = (await res.json()) as BrowseResponse
    const items = (json.data ?? []).map(toSeoAnime).filter((a) => a.malId > 0)
    return { items, total: json.meta?.total ?? items.length }
  } catch {
    return { items: [], total: 0 }
  }
}

/** Top-scored anime for a genre — powers /genres/[slug]. */
export function getAnimeByGenre(genre: string, limit = 30) {
  return browse({ genre, limit })
}

/** Top-scored anime by studio — powers /studios/[slug]. */
export function getAnimeByStudio(studio: string, limit = 30) {
  return browse({ studio, limit })
}

/** Distinct catalog genres with counts (for sitemap / index breadth). */
export async function listCatalogGenres(): Promise<Array<{ name: string; count: number }>> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/anime/genres?limit=80`, {
      next: { revalidate: 60 * 60 * 24 },
    })
    if (!res.ok) return []
    const json = (await res.json()) as { data?: Array<{ name: string; count: number }> }
    return json.data ?? []
  } catch {
    return []
  }
}

/** Distinct catalog studios with counts. */
export async function listCatalogStudios(): Promise<Array<{ name: string; count: number }>> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/anime/studios?limit=120`, {
      next: { revalidate: 60 * 60 * 24 },
    })
    if (!res.ok) return []
    const json = (await res.json()) as { data?: Array<{ name: string; count: number }> }
    return json.data ?? []
  } catch {
    return []
  }
}
