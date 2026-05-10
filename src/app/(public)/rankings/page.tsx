"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ANIME_DB } from "@/lib/data/anime"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import { BarChart3, Star, TrendingUp, Award, Zap } from "lucide-react"
import Link from "next/link"

type Category = { id: string; label: string; icon: typeof Star; desc: string; filter: (a: Anime) => boolean; sort: (a: Anime, b: Anime) => number }

const CATEGORIES: Category[] = [
  { id:"score",    label:"Highest Rated",     icon:Star,       desc:"Ranked purely by community score",   filter:() => true,                    sort:(a,b) => b.rating - a.rating   },
  { id:"airing",   label:"Top Airing",        icon:Zap,        desc:"Best currently airing series",       filter:a => a.status==="airing",      sort:(a,b) => b.rating - a.rating   },
  { id:"movie",    label:"Best Movies",       icon:Award,      desc:"Highest rated anime films",          filter:a => a.type==="Movie",         sort:(a,b) => b.rating - a.rating   },
  { id:"classic",  label:"Classic Picks",     icon:TrendingUp, desc:"Best anime from before 2010",        filter:a => a.year < 2010,            sort:(a,b) => b.rating - a.rating   },
  { id:"new",      label:"Best of 2024",      icon:BarChart3,  desc:"Top rated anime of 2024",            filter:a => a.year === 2024,          sort:(a,b) => b.rating - a.rating   },
]

export default function RankingsPage() {
  const [cat, setCat] = useState("score")
  const [selected, setSelected] = useState<Anime | null>(null)
  const active = CATEGORIES.find(c => c.id === cat)!
  const ranked = ANIME_DB.filter(active.filter).sort(active.sort)

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-10">
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60 mb-3">Neural Rankings</p>
        <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none mb-2">
          Rankings<span className="text-indigo-500">.</span>
        </h1>
        <p className="text-white/35 text-sm mb-10">Ranked by community credibility-weighted scores</p>

        {/* Category cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                cat === c.id ? "border-indigo-500/40 bg-indigo-500/10" : "border-white/8 bg-white/[0.02] hover:border-white/15"
              }`}
            >
              <c.icon size={16} className={cat===c.id ? "text-indigo-400" : "text-white/30"} />
              <p className={`font-black text-sm mt-2 ${cat===c.id ? "text-white" : "text-white/60"}`}>{c.label}</p>
              <p className="text-[9px] text-white/25 mt-0.5 leading-tight">{c.desc}</p>
            </button>
          ))}
        </div>

        {/* Top 3 highlight */}
        {ranked.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[1,0,2].map((pos, i) => {
              const anime = ranked[pos]
              const medals = ["🥈","🥇","🥉"]
              return (
                <motion.div key={anime.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}
                  onClick={() => setSelected(anime)}
                  className={`group p-5 rounded-2xl border cursor-pointer transition-all hover:border-indigo-500/30 ${
                    pos===0 ? "border-amber-500/30 bg-amber-500/5" : "border-white/8 bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{medals[i]}</span>
                    <span className="text-[10px] font-black text-white/30 font-mono">#{pos+1}</span>
                  </div>
                  <p className="font-black text-white/90 group-hover:text-white text-sm leading-tight line-clamp-2">{anime.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Star size={10} fill="#f59e0b" className="text-amber-400" />
                    <span className="text-xs font-black text-white/60">{anime.rating.toFixed(1)}</span>
                    <span className="text-[9px] text-white/25">· {anime.year}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Full grid */}
        {ranked.length > 3 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ranked.slice(3).map((a, i) => (
              <AnimeCard key={a.id} anime={a} index={i+3} onClick={setSelected} />
            ))}
          </div>
        )}

        {ranked.length === 0 && (
          <div className="py-16 text-center border border-dashed border-white/5 rounded-[3rem]">
            <p className="text-white/20 text-sm font-black uppercase tracking-widest">No anime in this category yet</p>
          </div>
        )}
      </div>
      <AnimeModal isOpen={selected!==null} onClose={() => setSelected(null)} anime={selected} />
    </div>
  )
}
