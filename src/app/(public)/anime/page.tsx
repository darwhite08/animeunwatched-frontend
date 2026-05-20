"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import { Calendar, TrendingUp, Star, Clock } from "lucide-react"
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

const SEASONAL_YEARS = [2024, 2023, 2022, 2021, 2020]
const SEASONS = ["winter", "spring", "summer", "fall"] as const
const SEASON_LABELS: Record<string, string> = { winter: "❄️ Winter", spring: "🌸 Spring", summer: "☀️ Summer", fall: "🍂 Fall" }

export default function AnimeBrowsePage() {
  const [selected, setSelected] = useState<Anime | null>(null)

  const { data: browseData, isLoading } = useBrowseAnime({ limit: 24 })
  const animeList = (browseData?.data ?? []).map(mapDTO)

  if (isLoading) return null

  const TOP = [...animeList].sort((a, b) => b.rating - a.rating).slice(0, 12)
  const AIRING = animeList.filter(a => a.status === "airing").slice(0, 6)
  const RECENT = animeList.filter(a => a.year >= 2022).sort((a, b) => b.year - a.year).slice(0, 6)

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* Hero */}
      <div className="border-b border-white/5 bg-[#020202]/80 backdrop-blur-md sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
            Anime Browse<span style={{color:"#f59e0b"}}>.</span>
          </h1>
          <p className="text-white/35 text-sm mt-0.5">Your gateway to every archive in the neural network</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: "/bestanimelist", icon: Star,      label: "Top Rated",     desc: "Highest neural scores",    color: "from-amber-600/20 to-amber-900/5",  border: "border-amber-500/20", text: "text-amber-400"   },
            { href: "/calendar",      icon: Calendar,   label: "Seasonal",      desc: "Browse by season & year",  color: "from-indigo-600/20 to-indigo-900/5", border: "border-amber-500/20",text: "text-amber-400"  },
            { href: "/discover",      icon: TrendingUp, label: "Trending",      desc: "What's hot right now",      color: "from-rose-600/20 to-rose-900/5",    border: "border-rose-500/20",  text: "text-rose-400"    },
            { href: "/ai-discover",   icon: Clock,      label: "For You",       desc: "AI-matched to your taste",  color: "from-violet-600/20 to-violet-900/5",border: "border-violet-500/20",text: "text-violet-400"  },
          ].map(({ href, icon: Icon, label, desc, color, border, text }) => (
            <Link key={href} href={href} className={`group p-6 rounded-2xl bg-gradient-to-br ${color} border ${border} hover:scale-[1.02] transition-all`}>
              <Icon size={20} className={`${text} mb-3`} />
              <p className="font-black text-white">{label}</p>
              <p className="text-[10px] text-white/35 mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>

        {/* Currently Airing */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-black tracking-tighter uppercase italic text-white">Currently Airing</h2>
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {AIRING.map((a, i) => <AnimeCard key={a.id} anime={a} index={i} onClick={setSelected} />)}
          </div>
        </div>

        {/* Top Rated */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black tracking-tighter uppercase italic text-white">All-Time Best</h2>
            <Link href="/bestanimelist" className="text-[10px] font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors">
              Full List →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {TOP.map((a, i) => <AnimeCard key={a.id} anime={a} index={i} onClick={setSelected} />)}
          </div>
        </div>

        {/* Seasonal quick-nav */}
        <div>
          <h2 className="text-xl font-black tracking-tighter uppercase italic text-white mb-6">Browse by Season</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SEASONS.map(s => (
              <div key={s} className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{SEASON_LABELS[s]}</p>
                {SEASONAL_YEARS.map(y => (
                  <Link key={y} href={`/anime/season/${y}/${s}`}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/8 hover:border-amber-500/25 hover:bg-white/[0.04] transition-all group"
                  >
                    <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">{y}</span>
                    <span className="text-[9px] text-white/20 group-hover:text-amber-400 transition-colors font-mono">
                      {animeList.filter(a => a.year === y).length} anime
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimeModal isOpen={selected !== null} onClose={() => setSelected(null)} anime={selected} />
    </div>
  )
}
