"use client"

import { useState } from "react"
import BestAnimeListHeader from "@/components/bestanimelist/BestAnimeListHeader"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import CategoryTabs from "@/components/bestanimelist/CategoryTabs"
import FilterDrawer from "@/components/bestanimelist/FilterDrawer"
import { ListFilter } from "lucide-react"

const mockData = [
  { title: "Vinland Saga", rating: "8.9", year: "2019" },
  { title: "Monster", rating: "9.0", year: "2004" },
  { title: "Steins;Gate", rating: "9.1", year: "2011" },
  { title: "Cowboy Bebop", rating: "8.8", year: "1998" },
  { title: "Berserk", rating: "9.3", year: "1997" },
  { title: "Neon Genesis Evangelion", rating: "8.6", year: "1995" },
]

export default function BestAnimeListPage() {
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#020202] pb-40">
      <BestAnimeListHeader />

      <div className="max-w-7xl mx-auto px-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-8 mb-16 py-4 border-b border-white/5">
          <CategoryTabs />
          <button 
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <ListFilter size={14} className="text-indigo-500" />
            Refine
          </button>
        </div>

        {/* Cinematic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {mockData.map((anime, i) => (
            <AnimeCard key={i} anime={anime} index={i} />
          ))}
          {/* Repeat for visual filler if needed */}
          {mockData.map((anime, i) => (
            <AnimeCard key={`filler-${i}`} anime={anime} index={i + 6} />
          ))}
        </div>
      </div>

      <FilterDrawer isOpen={filterOpen} onClose={() => setFilterOpen(false)} />
    </div>
  )
}