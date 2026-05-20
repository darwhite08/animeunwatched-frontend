"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Plus } from "lucide-react"
import { Star, Clock, Monitor, ShareNetwork, ArrowUpRight } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import type { Anime } from "@/lib/data/anime"
import { useWatchlist } from "@/stores/watchlist.store"
import { useToast } from "@/stores/toast.store"
import { useEffect } from "react"

interface AnimeModalProps {
  isOpen: boolean
  onClose: () => void
  anime: Anime | null
}

export default function AnimeModal({ isOpen, onClose, anime }: AnimeModalProps) {
  const { add, remove, has } = useWatchlist()
  const { push } = useToast()
  const inList = anime ? has(anime.id) : false

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  if (!anime) return null

  const handleToggleList = () => {
    if (inList) {
      remove(anime.id)
      push(`Removed "${anime.title}" from watchlist`, "info")
    } else {
      add(anime)
      push(`Added "${anime.title}" to watchlist!`, "success")
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${anime.title} — rated ${anime.rating}/10 on Kaiveron`)
      push("Copied to clipboard", "success")
    } catch {
      push("Could not copy", "error")
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="relative w-full max-w-5xl rounded-[2.5rem] border border-white/[0.08] overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #0a0a14 0%, #070710 100%)",
              boxShadow: "0 0 120px rgba(245,158,11,0.08), 0 0 60px rgba(99,102,241,0.12), 0 40px 80px rgba(0,0,0,0.8)",
            }}
          >
            <div className="grid lg:grid-cols-2">
              {/* Left — Cover */}
              <div className="relative h-[280px] lg:h-[560px]">
                <Image
                  src={anime.image}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a0a0a]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

                {/* Rank badge — gold */}
                <div className="absolute top-6 left-6 px-3 py-1.5 backdrop-blur-md rounded-xl text-[10px] font-black uppercase italic"
                  style={{
                    background: "rgba(245,158,11,0.15)",
                    border: "1px solid rgba(245,158,11,0.35)",
                    color: "#fbbf24",
                    boxShadow: "0 2px 12px rgba(245,158,11,0.15)",
                  }}>
                  #{anime.rank} Neural Ranked
                </div>
              </div>

              {/* Right — Info */}
              <div className="p-8 lg:p-12 flex flex-col justify-between">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={18} />
                </button>

                <div className="space-y-5">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                      style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)" }}>
                      <Star size={12} weight="fill" className="text-amber-400" />
                      <span className="text-xs font-black text-amber-300">{anime.rating.toFixed(1)}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      anime.status === "airing"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-white/5 border-white/10 text-white/40"
                    }`}>
                      {anime.status === "airing" ? "Airing" : "Completed"}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      {anime.type}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">
                      {anime.titleJapanese}
                    </p>
                    <h2 className="text-4xl lg:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                      {anime.title}
                    </h2>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[10px] font-black text-white/40 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} />
                      {anime.episodes ? `${anime.episodes} Episodes` : "Ongoing"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Monitor size={11} />
                      {anime.studio}
                    </span>
                    <span className="text-white/20">{anime.year}</span>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map(g => (
                      <span key={g} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-wider text-white/50">
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Synopsis */}
                  <p className="text-white/60 text-sm leading-relaxed font-medium">
                    {anime.synopsis}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-white/5 mt-6">
                  <button
                    onClick={handleToggleList}
                    className={`flex-1 min-w-[140px] py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 transition-all ${
                      inList
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : ""
                    }`}
                    style={!inList ? {
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      color: "#000",
                      boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
                    } : undefined}
                  >
                    {inList ? <><Check size={15} /> In Watchlist</> : <><Plus size={15} /> Add to List</>}
                  </button>

                  <Link
                    href={`/anime/${anime.id}`}
                    className="flex items-center gap-2 px-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                  >
                    <ArrowUpRight size={14} weight="bold" /> Full Page
                  </Link>

                  <button
                    onClick={handleShare}
                    className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-white/50 hover:bg-white/10 hover:text-white transition-all"
                    title="Copy to clipboard"
                  >
                    <ShareNetwork size={18} weight="duotone" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
