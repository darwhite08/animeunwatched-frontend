"use client"

import { useState, useCallback, useMemo } from "react"
import AIDiscoverHero from "@/components/ai-discover/AIDiscoverHero"
import AIPromptInput from "@/components/ai-discover/AIPromptInput"
import AIResultsGrid from "@/components/ai-discover/AIResultsGrid"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"
import { useSearchAnimeApi, useBrowseAnime } from "@/hooks/useAnime"

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

  const { data: searchData } = useSearchAnimeApi(lastQuery)
  const { data: browseData } = useBrowseAnime({ limit: 12 })

  const results: Anime[] = useMemo(() => {
    if (hasSearched && lastQuery && searchData?.data) return searchData.data.map(mapToAnime)
    return (browseData?.data ?? []).slice(0, 12).map(mapToAnime)
  }, [hasSearched, lastQuery, searchData, browseData])

  const handleSearch = useCallback((prompt: string) => {
    setLastQuery(prompt)
    setHasSearched(true)
    setTimeout(() => {
      document.getElementById("ai-results")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 300)
  }, [])

  return (
    <main className="min-h-screen flex flex-col bg-black text-white w-full">
      <AIDiscoverHero />
      <div className="bg-[#030303] pt-0 pb-16 px-6 -mt-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <AIPromptInput onSearch={handleSearch} />
        </div>
      </div>
      <div id="ai-results">
        <AIResultsGrid results={results} hasSearched={hasSearched} query={lastQuery} />
      </div>
    </main>
  )
}
