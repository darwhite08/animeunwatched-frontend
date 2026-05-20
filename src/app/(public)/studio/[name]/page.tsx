"use client"

import { use, useState } from "react"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"
import { useBrowseAnime } from "@/hooks/useAnime"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import { motion } from "framer-motion"
import Link from "next/link"
import { Building2, Star, ChevronLeft } from "lucide-react"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

export default function StudioPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params)
  const studioName = decodeURIComponent(name)
  const [selected, setSelected] = useState<Anime | null>(null)
  const { data: browseData } = useBrowseAnime({ limit: 20 })

  const anime = (browseData?.data ?? []).map(mapDTO)
    .filter(a => a.studio.toLowerCase() === studioName.toLowerCase())
    .sort((a, b) => b.rating - a.rating)

  const avgRating = anime.length
    ? (anime.reduce((s, a) => s + a.rating, 0) / anime.length).toFixed(2)
    : "—"

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-7xl mx-auto px-6 pt-32">
        <Link href="/studios" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400/60 hover:text-amber-400 transition-colors mb-6">
          <ChevronLeft size={11}/> All Studios
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Building2 size={24} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">{studioName}<span style={{color:"#f59e0b"}}>.</span></h1>
            <div className="flex items-center gap-4 mt-1 text-[10px] text-white/30 font-mono">
              <span>{anime.length} anime</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Star size={9} className="text-amber-400" fill="currentColor"/> avg {avgRating}</span>
            </div>
          </div>
        </div>

        {anime.length > 0 ? (
          <>
            {/* Top rated highlight */}
            {anime[0] && (
              <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}
                onClick={() => setSelected(anime[0])}
                className="group p-6 rounded-2xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-indigo-500/25 mb-8 cursor-pointer hover:border-indigo-500/40 transition-all"
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60 mb-2">Top Rated by {studioName}</p>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-12 rounded-xl overflow-hidden shrink-0">
                    <img src={anime[0].image} alt={anime[0].title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white uppercase italic">{anime[0].title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star size={12} fill="#f59e0b" className="text-amber-400" />
                      <span className="text-sm font-black text-amber-400">{anime[0].rating.toFixed(1)}</span>
                      <span className="text-[10px] text-white/30">{anime[0].year} · {anime[0].type}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {anime.map((a, i) => <AnimeCard key={a.id} anime={a} index={i} onClick={setSelected} />)}
            </div>
          </>
        ) : (
          <div className="py-20 text-center border border-dashed border-white/5 rounded-[3rem]">
            <Building2 size={32} className="mx-auto mb-3 text-white/15" />
            <p className="text-white/20 font-black uppercase tracking-widest text-sm">"{studioName}" not found in archive</p>
            <Link href="/studios" className="mt-4 inline-block text-xs text-amber-400 hover:underline font-black uppercase tracking-widest">Browse All Studios</Link>
          </div>
        )}
      </div>
      <AnimeModal isOpen={selected !== null} onClose={() => setSelected(null)} anime={selected} />
    </div>
  )
}
