import type { Metadata } from "next"

const BASE = "https://kaiveron.app"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const malId = Number(id)

  try {
    const res = await fetch(`${process.env.API_BASE ?? "http://localhost:4000"}/api/v1/anime/${malId}`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const data = await res.json() as {
        anime?: {
          title?: string
          titleEnglish?: string
          synopsis?: string
          imageUrl?: string
          score?: number
          year?: number
          studios?: string[]
          genres?: string[]
          episodes?: number
          type?: string
        }
      }
      const a = data.anime
      if (a) {
        const title = `${a.titleEnglish ?? a.title ?? "Anime"} — Kaiveron`
        const score = a.score ? ` | ★ ${a.score}/10` : ""
        const year  = a.year  ? ` (${a.year})`      : ""
        const studio = a.studios?.[0] ? ` · ${a.studios[0]}` : ""
        const description = a.synopsis
          ? `${a.synopsis.slice(0, 160).replace(/\n/g, " ")}…`
          : `Watch ${a.title ?? "this anime"} on Kaiveron — the AI-powered anime social platform.`
        const desc2 = `${a.type ?? "Anime"} ${year}${score}${studio} | Track, rate, and discuss on Kaiveron.`
        return {
          title,
          description: a.synopsis ? description : desc2,
          keywords: [a.title, a.titleEnglish, ...(a.genres ?? []), "anime", "watch", "review"].filter(Boolean) as string[],
          openGraph: {
            title,
            description: a.synopsis ? description : desc2,
            url: `${BASE}/anime/${malId}`,
            type: "video.tv_show",
            ...(a.imageUrl ? {
              images: [{ url: a.imageUrl, width: 225, height: 318, alt: a.title ?? "Anime poster" }],
            } : {}),
          },
          twitter: {
            card: a.imageUrl ? "summary_large_image" : "summary",
            title,
            description: a.synopsis ? description : desc2,
            ...(a.imageUrl ? { images: [a.imageUrl] } : {}),
          },
          alternates: { canonical: `${BASE}/anime/${malId}` },
        }
      }
    }
  } catch {
    // Graceful fallback
  }

  return {
    title: `Anime ${id} — Kaiveron`,
    description: "Track, rate, and discover anime on Kaiveron — the AI-powered anime social platform.",
    alternates: { canonical: `${BASE}/anime/${id}` },
  }
}

export default function AnimeDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
