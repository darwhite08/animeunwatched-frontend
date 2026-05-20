"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, Play, MoreHorizontal, Layers, Star, Check, X, Edit2, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/stores/toast.store"

type WatchItem = {
  id: string | number
  title: string
  ep: string
  progress: number
  platform: string
  status: string
  image: string
}

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  "Watching":      { color: "text-emerald-400", bg: "bg-emerald-500/10" },
  "Plan to Watch": { color: "text-amber-400",  bg: "bg-indigo-500/10"  },
  "Completed":     { color: "text-amber-400",   bg: "bg-amber-500/10"   },
  "On Hold":       { color: "text-orange-400",  bg: "bg-orange-500/10"  },
  "Dropped":       { color: "text-red-400",     bg: "bg-red-500/10"     },
}

export const WatchCard = ({ anime, onRemove }: { anime: WatchItem; onRemove?: (id: string | number) => void }) => {
  const { push } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const statusStyle = STATUS_CONFIG[anime.status] ?? { color: "text-white/40", bg: "bg-white/5" }

  const handleMarkDone = () => {
    push(`Marked "${anime.title}" as completed!`, "success")
    setMenuOpen(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative rounded-[2.5rem] border border-white/5 bg-[#080808] overflow-hidden flex flex-col h-full hover:border-indigo-500/30 transition-all duration-500 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* IMAGE */}
      <div className="relative h-60 w-full overflow-hidden">
        <Image
          src={anime.image}
          alt={anime.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105 brightness-75 group-hover:brightness-90"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-5 left-5 z-10">
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border border-white/10 ${statusStyle.color} ${statusStyle.bg}`}>
            {anime.status}
          </span>
        </div>

        {/* Menu */}
        <div className="absolute top-5 right-5 z-10">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-white/40 hover:text-white transition-colors"
          >
            <MoreHorizontal size={15} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-10 w-40 bg-[#0c0c0c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-20"
              >
                <button onClick={handleMarkDone} className="flex items-center gap-2 w-full px-4 py-3 text-xs font-bold text-white/60 hover:bg-white/5 hover:text-emerald-400 transition-colors">
                  <Check size={13} /> Mark Done
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-3 text-xs font-bold text-white/60 hover:bg-white/5 transition-colors">
                  <Edit2 size={13} /> Edit Entry
                </button>
                <button
                  onClick={() => { onRemove?.(anime.id); push(`Removed "${anime.title}"`, "info") }}
                  className="flex items-center gap-2 w-full px-4 py-3 text-xs font-bold text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} /> Remove
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* DATA */}
      <div className="p-7 flex-1 flex flex-col gap-5">
        {/* Title */}
        <div>
          <Link
            href={`/bestanimelist`}
            className="text-xl font-black text-white tracking-tighter leading-tight hover:text-amber-400 transition-colors line-clamp-2"
          >
            {anime.title}
          </Link>
          <p className="text-xs font-bold text-white/25 uppercase tracking-widest mt-1 flex items-center gap-1.5">
            <Layers size={11} className="text-indigo-500/50" /> {anime.ep}
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-white/25 italic">Progress</span>
            <span className="text-white">{anime.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${anime.progress}%` }}
              transition={{ duration: 1.2, ease: "circOut" }}
              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-auto">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/8 text-white/50 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black hover:border-white transition-all duration-300">
            <ExternalLink size={12} /> {anime.platform}
          </button>
          <button
            onClick={() => push(`Opening ${anime.title}…`, "info")}
            className="h-11 w-11 flex items-center justify-center rounded-2xl bg-indigo-600/15 border border-indigo-500/25 text-amber-400 hover:bg-indigo-600 hover:text-white transition-all"
          >
            <Play size={15} fill="currentColor" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
