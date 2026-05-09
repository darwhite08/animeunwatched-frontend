"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type XPToastProps = {
  fromLevel: number
  toLevel: number
  newTitle: string
  onDismiss?: () => void
}

const DURATION_MS = 5000

export default function XPToast({ fromLevel, toLevel, newTitle, onDismiss }: XPToastProps) {
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const start = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / DURATION_MS) * 100)
      setProgress(remaining)
      if (elapsed >= DURATION_MS) {
        clearInterval(interval)
        setVisible(false)
        onDismiss?.()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [onDismiss])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[9999] mx-auto"
          style={{ maxWidth: "100vw" }}
        >
          <div className="relative overflow-hidden w-full"
            style={{ background: "linear-gradient(90deg, #92400e 0%, #b45309 25%, #d97706 50%, #b45309 75%, #92400e 100%)" }}
          >
            {/* Shimmer layer */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
              {/* Level up text */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-2xl sm:text-3xl font-black tracking-tighter italic text-white drop-shadow-lg">
                  ⚡ LEVEL UP!
                </span>
              </div>

              {/* Level transition */}
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-amber-200">
                  Level {fromLevel}
                </span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="text-amber-300 font-black text-xl"
                >
                  →
                </motion.span>
                <span className="text-lg font-black text-white">
                  Level {toLevel}
                </span>
              </div>

              {/* New title */}
              <div className="flex items-center gap-2">
                <span className="text-amber-200/70 text-sm font-bold uppercase tracking-tighter">
                  You are now:
                </span>
                <span className="text-white font-black text-sm tracking-tight">
                  {newTitle}
                </span>
              </div>

              {/* Dismiss button */}
              <button
                onClick={() => { setVisible(false); onDismiss?.() }}
                className="sm:ml-auto text-amber-200/60 hover:text-white font-black text-xs uppercase tracking-tighter transition-colors flex-shrink-0"
              >
                Dismiss
              </button>
            </div>

            {/* Countdown bar */}
            <div className="h-1 w-full bg-black/20">
              <motion.div
                className="h-full bg-white/40"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
