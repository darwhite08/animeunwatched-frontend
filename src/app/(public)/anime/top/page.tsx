"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { Anime } from "@/lib/data/anime"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import { Trophy, Star, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"

const mapDTO = (a: AnimeDTO, i: number): Anime => ({
  id: String(a.malId),
  title: a.title,
  titleJapanese: a.titleJapanese ?? "",
  rating: a.score ?? 0,
  year: a.year ?? 0,
  episodes: a.episodes,
  type: (["TV", "Movie", "OVA"] as const).includes(a.type as any) ? a.type as any : "TV",
  status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished",
  studio: a.studios[0] ?? "Unknown",
  genres: a.genres,
  synopsis: a.synopsis ?? "",
  image: a.imageUrl ?? "",
  tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")),
  category: "all",
  rank: i + 1,
})

const CATEGORIES = [
  { id: "all-time",  label: "All Time",         filter: (a: Anime) => true },
  { id: "airing",    label: "Currently Airing",  filter: (a: Anime) => a.status === "airing" },
  { id: "movies",    label: "Movies",            filter: (a: Anime) => a.type === "Movie" },
  { id: "2024",      label: "2024",              filter: (a: Anime) => a.year === 2024 },
  { id: "2023",      label: "2023",              filter: (a: Anime) => a.year === 2023 },
]

export default function TopAnimePage() {
  const [cat, setCat] = useState("all-time")
  const [selected, setSelected] = useState<Anime | null>(null)

  const { data: browseData, isLoading } = useBrowseAnime({ limit: 24 })
  const animeList = (browseData?.data ?? []).map(mapDTO)

  if (isLoading) return null

  const filtered = animeList
    .filter(CATEGORIES.find(c => c.id === cat)?.filter ?? (() => true))
    .sort((a, b) => b.rating - a.rating)

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <Trophy size={18} className="text-accent-bright" />
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60">Neural Rankings</p>
        </div>
        <h1 className="text-6xl font-black tracking-tighter uppercase italic text-foreground leading-none mb-2">
          Top Anime<span className="text-accent-bright">.</span>
        </h1>
        <p className="text-subtle text-sm mb-8">Ranked by community score × credibility weighted ratings</p>

        {/* #1 Highlight */}
        {filtered[0] && (
          <motion.div
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            onClick={() => setSelected(filtered[0])}
            className="group relative overflow-hidden rounded-[2.5rem] border border-accent/20 bg-gradient-to-br from-amber-900/30 to-amber-950/10 p-8 mb-10 cursor-pointer hover:border-accent/40 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-16 rounded-2xl overflow-hidden shrink-0 shadow-2xl">
                <img src={filtered[0].image} alt={filtered[0].title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl font-black text-accent-bright/20 italic">#1</span>
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter text-foreground uppercase italic">{filtered[0].title}</h2>
                    <p className="text-subtle text-sm">{filtered[0].studio} · {filtered[0].year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/15 border border-accent/25">
                    <Star size={13} fill="#f59e0b" className="text-accent-bright" />
                    <span className="font-black text-accent-bright text-sm">{filtered[0].rating.toFixed(1)}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-subtle">{filtered[0].type}</span>
                  <span className="text-[10px] text-subtle">{filtered[0].genres.join(" · ")}</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-subtle group-hover:text-accent-bright group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </motion.div>
        )}

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                cat === c.id ? "bg-accent text-foreground shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                             : "bg-surface text-muted hover:bg-surface border border-border"
              }`}
            >{c.label}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {filtered.map((a, i) => <AnimeCard key={a.id} anime={a} index={i} onClick={setSelected} />)}
      </div>

      <AnimeModal isOpen={selected !== null} onClose={() => setSelected(null)} anime={selected} />
    </div>
  )
}
