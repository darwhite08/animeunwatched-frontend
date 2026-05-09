"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Sparkles, X } from "lucide-react"

export default function WrappedBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem("aw_wrapped_dismissed_2024")
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem("aw_wrapped_dismissed_2024", "1")
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="relative flex items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-600/20 to-violet-600/15 border border-indigo-500/25 mb-6"
        >
          {/* Shimmer */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 4 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none rounded-2xl overflow-hidden"
          />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-black text-white">Your 2024 Anime Wrapped is ready 🎉</p>
              <p className="text-[10px] text-white/40 mt-0.5">See your year in anime — top shows, stats, badges, and more</p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 shrink-0">
            <Link
              href="/profile/wrapped"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase tracking-widest text-white transition-all"
            >
              See Wrapped
            </Link>
            <button onClick={dismiss} className="p-1.5 text-white/30 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
