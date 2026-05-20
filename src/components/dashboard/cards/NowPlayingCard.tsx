"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Play, Pause, SkipForward, Plus, Check, ExternalLink } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import { useWatchlist } from "@/stores/watchlist.store"
import { useToast } from "@/stores/toast.store"
import Link from "next/link"

function mapDTO(a: AnimeDTO, i: number) {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as "TV"|"Movie"|"OVA" : "TV" as const, status: a.status?.toLowerCase().includes("airing") ? "airing" as const : "finished" as const, studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all" as const, rank: i+1 }
}

export default function NowPlayingCard() {
  const [playing, setPlaying] = useState(false)
  const [episode, setEpisode] = useState(12)
  const { add, has } = useWatchlist()
  const { push } = useToast()
  const { data, isLoading } = useBrowseAnime({ limit: 10 })
  const list = (data?.data ?? []).map(mapDTO)
  const NOW = list.find(a => a.status === "airing") ?? list[0]

  if (isLoading || !NOW) {
    return (
      <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0a0a0a] h-48 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
      </div>
    )
  }

  const inList = has(NOW.id)

  return (
    <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0a0a0a]">
      {/* Background cover */}
      <div className="absolute inset-0">
        <Image src={NOW.image} alt={NOW.title} fill className="object-cover opacity-25 blur-sm scale-110" sizes="600px" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-[#0a0a0a]" />
      </div>

      <div className="relative z-10 p-8 space-y-5">
        {/* Label */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${playing ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
            {playing ? "Now Streaming" : "Paused"}
          </span>
        </div>

        {/* Anime info */}
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-12 rounded-xl overflow-hidden shrink-0 shadow-lg">
            <Image src={NOW.image} alt={NOW.title} fill className="object-cover" sizes="48px" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-white leading-tight line-clamp-1">{NOW.title}</p>
            <p className="text-[10px] text-white/40 mt-0.5">Episode {episode} · {NOW.studio}</p>
          </div>
          <button
            onClick={() => { if (!inList) { add(NOW); push(`Added to watchlist!`, "success") } }}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${inList ? "text-emerald-400 bg-emerald-500/10" : "text-white/30 hover:text-white hover:bg-white/5"}`}
          >
            {inList ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "35%" }}
              animate={{ width: playing ? "38%" : "35%" }}
              transition={{ duration: playing ? 30 : 0, ease: "linear", repeat: playing ? Infinity : 0 }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #f59e0b, #fbbf24)" }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-white/20">
            <span>14:22</span><span>24:00</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPlaying(p => !p)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-black transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 0 16px rgba(245,158,11,0.45)" }}
            >
              {playing ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
            </button>
            <button
              onClick={() => { setEpisode(e => e + 1); push(`Skipped to Episode ${episode + 1}`, "info") }}
              className="p-2 text-white/30 hover:text-white transition-colors"
            >
              <SkipForward size={16} />
            </button>
          </div>
          <Link href={`/anime/${NOW.id}`}
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-400/60 hover:text-indigo-400 transition-colors"
          >
            Details <ExternalLink size={10} />
          </Link>
        </div>
      </div>
    </div>
  )
}
