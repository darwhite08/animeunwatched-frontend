"use client"

import { useState, useCallback } from "react"
import AIDiscoverHero from "@/components/ai-discover/AIDiscoverHero"
import AIPromptInput from "@/components/ai-discover/AIPromptInput"
import AIResultsGrid from "@/components/ai-discover/AIResultsGrid"
import { searchAnime, type Anime } from "@/lib/data/anime"

export default function AIDiscoverPage() {
  const [results, setResults] = useState<Anime[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [lastQuery, setLastQuery] = useState("")

  const handleSearch = useCallback((prompt: string) => {
    setLastQuery(prompt)
    // AI-style search: match tags + genres + synopsis keywords from prompt
    const results = searchAnime(prompt)
    // Fallback: if very few matches, show top-rated
    setResults(results.length >= 2 ? results : searchAnime("").slice(0, 6))
    setHasSearched(true)
    // Scroll to results
    setTimeout(() => {
      document.getElementById("ai-results")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }, [])

  return (
    <main className="min-h-screen flex flex-col bg-black text-white w-full">
      <AIDiscoverHero />

      {/* Prompt input — lifted out of hero so state can flow */}
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
