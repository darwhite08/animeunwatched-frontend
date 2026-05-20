"use client"

import { use } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Users, ChevronLeft, Star } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

// Mock character data seeded by anime
const getCharacters = (animeId: string) => {
  const seed = animeId.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  const names = [
    ["Protagonist A", "Main character", "9.2"],
    ["Antagonist B", "Primary villain", "8.8"],
    ["Support C",    "Loyal companion", "7.5"],
    ["Mentor D",     "Wise guide",      "8.1"],
    ["Rival E",      "Complex rival",   "7.9"],
    ["Hidden F",     "Mystery figure",  "8.4"],
  ]
  return names.map(([name, role, score], i) => ({
    id: `${animeId}-char-${i}`,
    name,
    role,
    score,
    voiceActor: ["Hiroshi Kamiya", "Yuki Kaji", "Miyuki Sawashiro", "Daisuke Ono", "Kana Hanazawa", "Takuya Eguchi"][i % 6],
    gradient: ["from-indigo-600 to-violet-600", "from-red-600 to-rose-600", "from-emerald-600 to-teal-600", "from-amber-600 to-orange-600", "from-blue-600 to-cyan-600", "from-purple-600 to-pink-600"][i],
  }))
}

export default function AnimeCharactersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: browseData, isLoading } = useBrowseAnime({ limit: 1 })
  const anime = (browseData?.data ?? []).map(mapDTO)[0] ?? null

  const chars = getCharacters(id)

  if (isLoading) return <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center text-white/30">Loading…</div>

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* Mini hero */}
      <div className="relative h-40 overflow-hidden">
        <Image src={anime?.image ?? ""} alt={anime?.title ?? ""} fill className="object-cover brightness-[0.2] blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020202]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 mb-6">
          <Link href="/bestanimelist" className="hover:text-white transition-colors">Archive</Link>
          <span>·</span>
          <Link href={`/anime/${id}`} className="hover:text-white transition-colors truncate max-w-[200px]">{anime?.title ?? id}</Link>
          <span>·</span>
          <span className="text-white/60">Characters</span>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Users size={18} className="text-amber-400" />
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
            Characters<span style={{color:"#f59e0b"}}>.</span>
          </h1>
          <span className="text-sm text-white/30 font-mono">{chars.length} shown</span>
        </div>

        {/* Characters grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {chars.map((char, i) => (
            <motion.div key={char.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-colors space-y-4"
            >
              {/* Avatar */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${char.gradient} flex items-center justify-center text-2xl font-black text-white`}>
                {char.name[0]}
              </div>

              <div>
                <p className="font-black text-white">{char.name}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{char.role}</p>
              </div>

              <div className="space-y-1 text-[10px] text-white/30">
                <div className="flex justify-between">
                  <span>Popularity</span>
                  <span className="flex items-center gap-1"><Star size={9} className="text-amber-400" fill="currentColor" />{char.score}</span>
                </div>
                <div className="flex justify-between">
                  <span>Voice Actor</span>
                  <span className="text-white/50 font-bold">{char.voiceActor}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back link */}
        <div className="mt-10 flex justify-center">
          <Link href={`/anime/${id}`} className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors">
            <ChevronLeft size={14} /> Back to {anime?.title ?? id}
          </Link>
        </div>
      </div>
    </div>
  )
}
