"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Plus, PenSquare, Share2 } from "lucide-react"
import { useWatchlist } from "@/stores/watchlist.store"
import { useToast } from "@/stores/toast.store"
import type { Anime } from "@/lib/data/anime"

interface FloatingActionsProps {
  anime: Anime
  onReview?: () => void
}

export default function FloatingActions({ anime, onReview }: FloatingActionsProps) {
  const [visible, setVisible] = useState(false)
  const { add, remove, has } = useWatchlist()
  const { push } = useToast()
  const inList = has(anime.id)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const toggle = () => {
    if (inList) { remove(anime.id); push(`Removed from watchlist`, "info") }
    else { add(anime); push(`"${anime.title}" added to watchlist!`, "success") }
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      push("Link copied!", "success")
    } catch { push("Could not copy", "error") }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2 px-3 py-3 bg-[#0c0c0c]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        >
          {/* Anime title pill */}
          <span className="text-[10px] font-black uppercase tracking-widest text-white/50 px-2 max-w-[140px] truncate hidden sm:block">
            {anime.title}
          </span>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />

          {/* Add to watchlist */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={toggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              inList
                ? "bg-emerald-600 text-white"
                : "bg-indigo-600 text-white shadow-[0_0_16px_rgba(99,102,241,0.4)]"
            }`}
          >
            {inList ? <Check size={13} /> : <Plus size={13} />}
            {inList ? "In List" : "Add to List"}
          </motion.button>

          {/* Write review */}
          {onReview && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              onClick={onReview}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <PenSquare size={12} /> Review
            </motion.button>
          )}

          {/* Share */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={share}
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <Share2 size={13} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
