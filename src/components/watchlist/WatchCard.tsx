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
  "Plan to Watch": { color: "text-accent-bright",  bg: "bg-accent/10"  },
  "Completed":     { color: "text-accent-bright",   bg: "bg-accent/10"   },
  "On Hold":       { color: "text-orange-400",  bg: "bg-orange-500/10"  },
  "Dropped":       { color: "text-red-400",     bg: "bg-red-500/10"     },
}

export const WatchCard = ({ anime, onRemove, onEdit, onMarkDone }: { anime: WatchItem; onRemove?: (id: string | number) => void; onEdit?: () => void; onMarkDone?: () => void }) => {
  const { push } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const statusStyle = STATUS_CONFIG[anime.status] ?? { color: "text-muted", bg: "bg-surface" }

  const handleMarkDone = () => {
    onMarkDone?.()
    setMenuOpen(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative rounded-[2.5rem] border border-border bg-background overflow-hidden flex flex-col h-full hover:border-white/30 transition-all duration-500 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]"
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
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-bg)] via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-5 left-5 z-10">
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border border-border ${statusStyle.color} ${statusStyle.bg}`}>
            {anime.status}
          </span>
        </div>

        {/* Menu */}
        <div className="absolute top-5 right-5 z-10">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-2 rounded-xl bg-black/50 backdrop-blur-md border border-border text-muted hover:text-foreground transition-colors"
          >
            <MoreHorizontal size={15} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-10 w-40 bg-background border border-border rounded-2xl overflow-hidden shadow-2xl z-20"
              >
                <button onClick={handleMarkDone} className="flex items-center gap-2 w-full px-4 py-3 text-xs font-bold text-muted hover:bg-surface hover:text-emerald-400 transition-colors">
                  <Check size={13} /> Mark Done
                </button>
                <button
                  type="button"
                  onClick={() => { onEdit?.(); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-4 py-3 text-xs font-bold text-muted hover:bg-surface transition-colors"
                >
                  <Edit2 size={13} /> Edit Entry
                </button>
                <button
                  onClick={() => { onRemove?.(anime.id); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-4 py-3 text-xs font-bold text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors"
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
            className="text-xl font-black text-foreground tracking-tighter leading-tight hover:text-white transition-colors line-clamp-2"
          >
            {anime.title}
          </Link>
          <p className="text-xs font-bold text-subtle uppercase tracking-widest mt-1 flex items-center gap-1.5">
            <Layers size={11} className="text-accent/50" /> {anime.ep}
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-subtle italic">Progress</span>
            <span className="text-foreground">{anime.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
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
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(`${anime.title} watch on ${anime.platform}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-surface border border-border text-muted text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black hover:border-white transition-all duration-300"
          >
            <ExternalLink size={12} /> {anime.platform}
          </a>
          <button
            onClick={() => push(`Opening ${anime.title}…`, "info")}
            className="h-11 w-11 flex items-center justify-center rounded-2xl bg-accent/15 border border-accent/25 text-accent-bright hover:bg-accent hover:text-foreground transition-all"
          >
            <Play size={15} fill="currentColor" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
