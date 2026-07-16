import type { MetadataRoute } from "next"
import { GENRES, FEATURED_STUDIOS, toSlug } from "@/lib/seo/taxonomy"

const BASE = "https://kaiveron.com"

// Regenerate hourly so newly published blogs surface in the sitemap within ~1h
// (auto-update). The heavy anime feed (~17k URLs) is fetched with its own 24h
// cache, so an hourly route regen re-reads it from cache (no DB hit / no per-
// request recompute) — only the small, fast-changing blog list refreshes.
export const revalidate = 3600 // 1h

// Static public routes — always indexed
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: BASE,                              changeFrequency: "daily",   priority: 1.0 },
  { url: `${BASE}/bestanimelist`,           changeFrequency: "daily",   priority: 0.9 },
  { url: `${BASE}/best`,                    changeFrequency: "weekly",  priority: 0.9 },
  { url: `${BASE}/ai-discover`,             changeFrequency: "weekly",  priority: 0.9 },
  { url: `${BASE}/trending`,                changeFrequency: "daily",   priority: 0.85 },
  { url: `${BASE}/seasonal`,                changeFrequency: "daily",   priority: 0.85 },
  { url: `${BASE}/rankings`,                changeFrequency: "daily",   priority: 0.8 },
  { url: `${BASE}/recommendations`,         changeFrequency: "weekly",  priority: 0.8 },
  { url: `${BASE}/reviews`,                 changeFrequency: "daily",   priority: 0.75 },
  { url: `${BASE}/lists`,                   changeFrequency: "daily",   priority: 0.7 },
  { url: `${BASE}/mood`,                    changeFrequency: "weekly",  priority: 0.85 },
  { url: `${BASE}/calendar`,               changeFrequency: "daily",   priority: 0.85 },
  { url: `${BASE}/genres`,                  changeFrequency: "monthly", priority: 0.8 },
  { url: `${BASE}/studios`,                 changeFrequency: "monthly", priority: 0.8 },
  { url: `${BASE}/collections`,             changeFrequency: "weekly",  priority: 0.75 },
  { url: `${BASE}/community`,              changeFrequency: "hourly",  priority: 0.8 },
  { url: `${BASE}/community/feed`,          changeFrequency: "hourly",  priority: 0.75 },
  { url: `${BASE}/community/anime`,         changeFrequency: "daily",   priority: 0.7 },
  { url: `${BASE}/clubs`,                   changeFrequency: "daily",   priority: 0.8 },
  { url: `${BASE}/blogs`,                   changeFrequency: "daily",   priority: 0.75 },
  { url: `${BASE}/reviews`,                 changeFrequency: "daily",   priority: 0.75 },
  { url: `${BASE}/leaderboard`,             changeFrequency: "daily",   priority: 0.7 },
  { url: `${BASE}/discover`,               changeFrequency: "daily",   priority: 0.75 },
  { url: `${BASE}/pricing`,                 changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/about`,                   changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE}/help`,                    changeFrequency: "weekly",  priority: 0.6 },
  { url: `${BASE}/roadmap`,                 changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE}/changelog`,              changeFrequency: "weekly",  priority: 0.5 },
  { url: `${BASE}/poll`,                    changeFrequency: "daily",   priority: 0.6 },
  // /login intentionally omitted — auth pages have no indexing value and
  // were showing up as "Crawled, currently not indexed" noise in GSC.
  { url: `${BASE}/register`,               changeFrequency: "yearly",  priority: 0.5 },
  { url: `${BASE}/users`,                   changeFrequency: "daily",   priority: 0.6 },
]

// Well-known high-traffic anime MAL IDs — generate static anime detail pages
// These pages have structured data and are the primary SEO target
const FEATURED_ANIME_IDS = [
  // All-time greats (guaranteed traffic)
  5114, 11061, 9253, 28977, 38000, 16498, 1535, 25777, 20, 19,
  // Top seasonal (ongoing traffic)
  52991, 54492, 51009, 50265, 48583, 40748,
  // Popular classics
  1, 6, 21, 22, 30, 31, 121, 199, 235, 245,
  // Franchise entries
  269, 1735, 1818, 2001, 4181, 5114, 6547, 7647, 9756, 10620,
  // Isekai staples
  36462, 34566, 31240, 28735, 32182, 40010, 40028,
  // Shonen staples
  11061, 16498, 13767, 17265, 20507, 20583,
]

type AnimeEntry = { malId: number; lastModified?: string }

// Every index-worthy anime page, from the backend's dedicated sitemap feed.
// The backend applies the quality gate (non-stub, real synopsis + score,
// membersCount >= 500) and returns the full filtered set in one shot — no more
// 5-page (~500-URL) cap. Featured IDs are merged in as a guaranteed floor, and
// on any failure we degrade to the featured list rather than an empty sitemap.
async function fetchAnimeEntries(): Promise<AnimeEntry[]> {
  const featuredFallback = (): AnimeEntry[] =>
    [...new Set(FEATURED_ANIME_IDS)].map((malId) => ({ malId }))
  try {
    const res = await fetch(
      `${process.env.API_BASE ?? "http://localhost:4000"}/api/v1/anime/sitemap`,
      { next: { revalidate: 86400 } },
    )
    if (!res.ok) return featuredFallback()
    const json = (await res.json()) as { data?: Array<{ malId: number; updatedAt?: string }> }
    const entries: AnimeEntry[] = (json.data ?? [])
      .filter((a) => Boolean(a.malId))
      .map((a) => ({ malId: a.malId, lastModified: a.updatedAt }))

    // Guarantee the hand-picked high-traffic anime are always present.
    const have = new Set(entries.map((e) => e.malId))
    for (const malId of FEATURED_ANIME_IDS) {
      if (!have.has(malId)) {
        entries.push({ malId })
        have.add(malId)
      }
    }
    return entries.length > 0 ? entries : featuredFallback()
  } catch {
    return featuredFallback()
  }
}

// Published blog posts — /blog/[slug]. Public, no auth; strong fresh-content
// signal. Mirrors the anime fetcher; degrades to no blog routes on failure.
async function fetchBlogSlugs(): Promise<Array<{ slug: string; lastModified?: string }>> {
  try {
    // sort=latest → newest published blogs first, so the freshest posts sit at
    // the top of the blog section of the sitemap.
    const res = await fetch(`${process.env.API_BASE ?? "http://localhost:4000"}/api/v1/blogs?sort=latest&limit=200`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json() as { data?: Array<{ slug?: string; updatedAt?: string; publishedAt?: string }> }
    return (data.data ?? [])
      .filter((b): b is { slug: string; updatedAt?: string; publishedAt?: string } => Boolean(b.slug))
      .map((b) => ({ slug: b.slug, lastModified: b.updatedAt ?? b.publishedAt }))
  } catch {
    return []
  }
}

// Programmatic genre landing pages — /genres/[slug]. High long-tail volume
// ("best action anime", "best isekai anime", …). One of the strongest
// new-user acquisition surfaces.
const GENRE_ROUTES: MetadataRoute.Sitemap = GENRES.map((g) => ({
  url:             `${BASE}/genres/${g.slug}`,
  changeFrequency: "weekly",
  priority:        0.85,
}))

// Programmatic studio landing pages — /studios/[slug].
const STUDIO_ROUTES: MetadataRoute.Sitemap = FEATURED_STUDIOS.map((name) => ({
  url:             `${BASE}/studios/${toSlug(name)}`,
  changeFrequency: "weekly",
  priority:        0.7,
}))

// Recent seasonal pages — /anime/season/[year]/[season] for the last 3 years.
function seasonRoutes(): MetadataRoute.Sitemap {
  const thisYear = new Date().getFullYear()
  const seasons = ["winter", "spring", "summer", "fall"]
  const routes: MetadataRoute.Sitemap = []
  for (let y = thisYear; y >= thisYear - 2; y--) {
    for (const s of seasons) {
      routes.push({
        url:             `${BASE}/anime/season/${y}/${s}`,
        changeFrequency: y === thisYear ? "daily" : "monthly",
        priority:        y === thisYear ? 0.8 : 0.55,
      })
    }
  }
  return routes
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [animeEntries, blogs] = await Promise.all([fetchAnimeEntries(), fetchBlogSlugs()])

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((b) => ({
    url:             `${BASE}/blog/${b.slug}`,
    changeFrequency: "daily",
    priority:        0.9,
    lastModified:    b.lastModified ? new Date(b.lastModified) : new Date(),
  }))

  const animeRoutes: MetadataRoute.Sitemap = animeEntries.map((a) => ({
    url:             `${BASE}/anime/${a.malId}`,
    changeFrequency: "weekly",
    priority:        0.8,
    lastModified:    a.lastModified ? new Date(a.lastModified) : new Date(),
  }))

  // Episode discussion pages for the most popular anime (feed is sorted by
  // popularity desc, so the first 20 are the strongest candidates).
  const discussRoutes: MetadataRoute.Sitemap = animeEntries.slice(0, 20).map((a) => ({
    url:             `${BASE}/anime/${a.malId}/discuss`,
    changeFrequency: "daily",
    priority:        0.6,
    lastModified:    a.lastModified ? new Date(a.lastModified) : new Date(),
  }))

  // Blogs sit right after the core static hubs — at the top of the content, so
  // crawlers reach freshly published posts first (newest-first, priority 0.9).
  return [
    ...STATIC_ROUTES,
    ...blogRoutes,
    ...GENRE_ROUTES,
    ...STUDIO_ROUTES,
    ...seasonRoutes(),
    ...animeRoutes,
    ...discussRoutes,
  ]
}
