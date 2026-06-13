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
              background: "linear-gradient(160deg, var(--app-bg) 0%, var(--app-bg) 100%)",
              boxShadow: "0 0 120px color-mix(in srgb, var(--app-accent) 8%, transparent), 0 0 60px rgba(99,102,241,0.12), 0 40px 80px rgba(0,0,0,0.8)",
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
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[var(--app-bg)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-bg)] via-transparent to-transparent" />

                {/* Rank badge — gold */}
                <div className="absolute top-6 left-6 px-3 py-1.5 backdrop-blur-md rounded-xl text-[10px] font-black uppercase italic"
                  style={{
                    background: "color-mix(in srgb, var(--app-accent) 15%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--app-accent) 35%, transparent)",
                    color: "var(--app-accent-bright)",
                    boxShadow: "0 2px 12px color-mix(in srgb, var(--app-accent) 15%, transparent)",
                  }}>
                  #{anime.rank} Neural Ranked
                </div>
              </div>

              {/* Right — Info */}
              <div className="p-8 lg:p-12 flex flex-col justify-between">
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-surface border border-border text-muted hover:text-foreground hover:bg-surface transition-all"
                >
                  <X size={18} />
                </button>

                <div className="space-y-5">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                      style={{ background: "color-mix(in srgb, var(--app-accent) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--app-accent) 30%, transparent)" }}>
                      <Star size={12} weight="fill" className="text-accent-bright" />
                      <span className="text-xs font-black text-accent-bright">{anime.rating.toFixed(1)}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      anime.status === "airing"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-surface border-border text-muted"
                    }`}>
                      {anime.status === "airing" ? "Airing" : "Completed"}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-accent/10 border border-accent/20 text-accent-bright">
                      {anime.type}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <p className="text-[10px] font-black text-subtle uppercase tracking-widest mb-1">
                      {anime.titleJapanese}
                    </p>
                    <h2 className="text-4xl lg:text-5xl font-black text-foreground uppercase italic tracking-tighter leading-none">
                      {anime.title}
                    </h2>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[10px] font-black text-muted uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} />
                      {anime.episodes ? `${anime.episodes} Episodes` : "Ongoing"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Monitor size={11} />
                      {anime.studio}
                    </span>
                    <span className="text-subtle">{anime.year}</span>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map(g => (
                      <span key={g} className="px-3 py-1 rounded-full bg-surface border border-border text-[9px] font-black uppercase tracking-wider text-muted">
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Synopsis */}
                  <p className="text-muted text-sm leading-relaxed font-medium">
                    {anime.synopsis}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-border mt-6">
                  <button
                    onClick={handleToggleList}
                    className={`flex-1 min-w-[140px] py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 transition-all ${
                      inList
                        ? "bg-emerald-600 text-foreground hover:bg-emerald-700"
                        : ""
                    }`}
                    style={!inList ? {
                      background: "linear-gradient(135deg, var(--app-accent), #d97706)",
                      color: "var(--app-bg)",
                      boxShadow: "0 4px 20px color-mix(in srgb, var(--app-accent) 35%, transparent)",
                    } : undefined}
                  >
                    {inList ? <><Check size={15} /> In Watchlist</> : <><Plus size={15} /> Add to List</>}
                  </button>

                  <Link
                    href={`/anime/${anime.id}`}
                    className="flex items-center gap-2 px-4 py-3.5 rounded-2xl border border-border bg-surface text-muted hover:bg-surface hover:text-foreground transition-all text-xs font-black uppercase tracking-widest"
                  >
                    <ArrowUpRight size={14} weight="bold" /> Full Page
                  </Link>

                  <button
                    onClick={handleShare}
                    className="p-3.5 bg-surface border border-border rounded-2xl text-muted hover:bg-surface hover:text-foreground transition-all"
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
