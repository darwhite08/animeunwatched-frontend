"use client"

import { useState, useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import AIDiscoverHero from "@/components/ai-discover/AIDiscoverHero"
import AIPromptInput from "@/components/ai-discover/AIPromptInput"
import AIResultsGrid from "@/components/ai-discover/AIResultsGrid"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"
import { useBrowseAnime } from "@/hooks/useAnime"
import { discoverAI } from "@/lib/api/endpoints"

function mapToAnime(a: AnimeDTO, i: number): Anime {
  return {
    id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "",
    rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes,
    type: (["TV","Movie","OVA"] as const).includes(a.type as "TV"|"Movie"|"OVA") ? (a.type as "TV"|"Movie"|"OVA") : "TV",
    status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished",
    studio: a.studios[0] ?? "Unknown", genres: a.genres,
    synopsis: a.synopsis ?? "", image: a.imageUrl ?? "",
    tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i + 1,
  }
}

export default function AIDiscoverPage() {
  const [hasSearched, setHasSearched] = useState(false)
  const [lastQuery, setLastQuery] = useState("")

  // Wire to the new AI discovery endpoint
  const { data: aiData, isFetching } = useQuery({
    queryKey: ["discovery/ai", lastQuery],
    queryFn:  () => discoverAI(lastQuery, 18),
    enabled:  hasSearched && lastQuery.length >= 3,
    staleTime: 5 * 60_000,
  })
  const { data: browseData } = useBrowseAnime({ limit: 12 })

  const results: Anime[] = useMemo(() => {
    if (hasSearched && aiData?.data) return aiData.data.map((r, i) => mapToAnime(r.anime, i))
    return (browseData?.data ?? []).slice(0, 12).map(mapToAnime)
  }, [hasSearched, aiData, browseData])

  // Real per-result match% + one-line reason from the backend (Groq rerank),
  // keyed by malId — replaces the old random "synch rate".
  const aiMeta: Record<string, { match: number; reason?: string }> = useMemo(() => {
    const m: Record<string, { match: number; reason?: string }> = {}
    if (hasSearched && aiData?.data) {
      for (const r of aiData.data) m[String(r.anime.malId)] = { match: r.match, reason: r.reason }
    }
    return m
  }, [hasSearched, aiData])

  const handleSearch = useCallback((prompt: string) => {
    setLastQuery(prompt)
    setHasSearched(true)
    setTimeout(() => {
      document.getElementById("ai-results")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 300)
  }, [])

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground w-full">
      <AIDiscoverHero />
      <div className="bg-background pt-0 pb-16 px-4 sm:px-6 -mt-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <AIPromptInput onSearch={handleSearch} loading={isFetching} />
        </div>
      </div>
      <div id="ai-results">
        <AIResultsGrid results={results} hasSearched={hasSearched} query={lastQuery} meta={aiMeta} loading={isFetching} />
      </div>
    </main>
  )
}
