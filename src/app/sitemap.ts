import type { MetadataRoute } from "next"
import { GENRES, FEATURED_STUDIOS, toSlug } from "@/lib/seo/taxonomy"

const BASE = "https://kaiveron.com"

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

async function fetchTopAnimeIds(): Promise<number[]> {
  try {
    // Fetch top 500 by score for maximum SEO coverage
    const pages = await Promise.allSettled([
      fetch(`${process.env.API_BASE ?? "http://localhost:4000"}/api/v1/anime?limit=100&sort=score`, { next: { revalidate: 3600 } }),
      fetch(`${process.env.API_BASE ?? "http://localhost:4000"}/api/v1/anime?limit=100&sort=score&page=2`, { next: { revalidate: 3600 } }),
      fetch(`${process.env.API_BASE ?? "http://localhost:4000"}/api/v1/anime?limit=100&sort=score&page=3`, { next: { revalidate: 3600 } }),
      fetch(`${process.env.API_BASE ?? "http://localhost:4000"}/api/v1/anime?limit=100&sort=score&page=4`, { next: { revalidate: 3600 } }),
      fetch(`${process.env.API_BASE ?? "http://localhost:4000"}/api/v1/anime?limit=100&sort=score&page=5`, { next: { revalidate: 3600 } }),
    ])
    const ids: number[] = []
    for (const result of pages) {
      if (result.status === "fulfilled" && result.value.ok) {
        const data = await result.value.json() as { data?: Array<{ malId: number }> }
        ids.push(...(data.data ?? []).map((a) => a.malId).filter(Boolean))
      }
    }
    // Merge with featured list to ensure key anime are always indexed
    const all = [...new Set([...ids, ...FEATURED_ANIME_IDS])]
    return all.length > 0 ? all : FEATURED_ANIME_IDS
  } catch {
    return FEATURED_ANIME_IDS
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
  const animeIds = await fetchTopAnimeIds()

  const animeRoutes: MetadataRoute.Sitemap = animeIds.map((malId) => ({
    url:             `${BASE}/anime/${malId}`,
    changeFrequency: "weekly",
    priority:        0.8,
    lastModified:    new Date(),
  }))

  // Episode discussion pages for top anime
  const discussRoutes: MetadataRoute.Sitemap = animeIds.slice(0, 20).map((malId) => ({
    url:             `${BASE}/anime/${malId}/discuss`,
    changeFrequency: "daily",
    priority:        0.6,
    lastModified:    new Date(),
  }))

  return [
    ...STATIC_ROUTES,
    ...GENRE_ROUTES,
    ...STUDIO_ROUTES,
    ...seasonRoutes(),
    ...animeRoutes,
    ...discussRoutes,
  ]
}
