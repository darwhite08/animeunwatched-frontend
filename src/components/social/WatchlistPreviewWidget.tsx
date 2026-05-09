"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { MonitorPlay, ArrowRight, Plus, Check } from "lucide-react"
import { ANIME_DB } from "@/lib/data/anime"
import { useWatchlist } from "@/stores/watchlist.store"
import { useToast } from "@/stores/toast.store"

const PREVIEW = ANIME_DB.filter(a => a.status === "airing").slice(0, 4)

export default function WatchlistPreviewWidget() {
  const { add, has } = useWatchlist()
  const { push } = useToast()

  return (
    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MonitorPlay size={14} className="text-emerald-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Now Airing</h3>
        </div>
        <Link href="/calendar" className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60 hover:text-indigo-400 transition-colors flex items-center gap-1">
          Calendar <ArrowRight size={10} />
        </Link>
      </div>

      <div className="space-y-2">
        {PREVIEW.map((anime, i) => {
          const inList = has(anime.id)
          return (
            <motion.div
              key={anime.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 group"
            >
              <Link href={`/anime/${anime.id}`} className="relative h-10 w-8 rounded-lg overflow-hidden shrink-0">
                <Image src={anime.image} alt={anime.title} fill className="object-cover" sizes="32px" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/anime/${anime.id}`}>
                  <p className="text-xs font-black text-white/70 group-hover:text-white transition-colors truncate">
                    {anime.title}
                  </p>
                </Link>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] text-emerald-400/70 font-bold">Airing</span>
                </div>
              </div>
              <button
                onClick={() => { add(anime); push(`Added "${anime.title}"`, "success") }}
                disabled={inList}
                className={`p-1.5 rounded-lg transition-all shrink-0 ${
                  inList
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-white/20 hover:text-white hover:bg-white/5"
                }`}
              >
                {inList ? <Check size={12} /> : <Plus size={12} />}
              </button>
            </motion.div>
          )
        })}
      </div>

      <Link
        href="/watchlist"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/8 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white hover:bg-white/5 transition-all"
      >
        <MonitorPlay size={11} /> My Watchlist
      </Link>
    </div>
  )
}
