"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Command } from "lucide-react"

const SECTIONS = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["g", "h"], desc: "Home" },
      { keys: ["g", "d"], desc: "Dashboard" },
      { keys: ["g", "w"], desc: "Watchlist" },
      { keys: ["g", "a"], desc: "AI Discover" },
      { keys: ["g", "b"], desc: "Best Anime" },
      { keys: ["g", "c"], desc: "Community" },
      { keys: ["g", "l"], desc: "Leaderboard" },
      { keys: ["g", "n"], desc: "Notifications" },
    ],
  },
  {
    title: "Scrolling",
    shortcuts: [
      { keys: ["j"], desc: "Scroll down" },
      { keys: ["k"], desc: "Scroll up" },
    ],
  },
  {
    title: "Global",
    shortcuts: [
      { keys: ["⌘", "k"], desc: "Open search" },
      { keys: ["?"], desc: "Show shortcuts" },
      { keys: ["Esc"], desc: "Close modal / overlay" },
    ],
  },
]

export default function KeyboardShortcutsOverlay() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if (e.key === "?") setOpen(o => !o)
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="relative w-full max-w-lg bg-[#0c0c0c] rounded-3xl border border-white/10 p-7 shadow-2xl"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>

            <div className="mb-6">
              <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-1">Keyboard Shortcuts</p>
              <h2 className="text-xl font-black tracking-tighter text-white">Command Palette</h2>
            </div>

            <div className="space-y-6">
              {SECTIONS.map(section => (
                <div key={section.title}>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25 mb-3">
                    {section.title}
                  </p>
                  <div className="space-y-2">
                    {section.shortcuts.map(({ keys, desc }) => (
                      <div key={desc} className="flex items-center justify-between">
                        <span className="text-sm text-white/55">{desc}</span>
                        <div className="flex items-center gap-1">
                          {keys.map((k, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg bg-white/8 border border-white/10 text-[10px] font-black font-mono text-white/60">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-[9px] text-white/20 font-mono uppercase tracking-widest">
              Press <span className="text-white/40">?</span> to toggle · <span className="text-white/40">Esc</span> to close
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
