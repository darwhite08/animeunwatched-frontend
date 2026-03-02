"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles } from "lucide-react"

type SidebarLevelCardProps = {
  level: number
  xp: number
  maxXp: number
}

export default function SidebarLevelCard({
  level,
  xp,
  maxXp,
}: SidebarLevelCardProps) {
  const [visible, setVisible] = useState(true)

  const progress = Math.min((xp / maxXp) * 100, 100)

  useEffect(() => {
    const hidden = localStorage.getItem("hideLevelCard")
    if (hidden === "true") {
      setVisible(false)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem("hideLevelCard", "true")
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-4"
          aria-label="Creator level status"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
            aria-label="Hide level card"
          >
            <X size={16} />
          </button>

          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-medium text-white">
                Level {level}
              </span>
            </div>

            {/* XP Progress */}
            <div>
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>XP</span>
                <span>
                  {xp}/{maxXp}
                </span>
              </div>

              <div
                className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden"
                role="progressbar"
                aria-valuenow={xp}
                aria-valuemin={0}
                aria-valuemax={maxXp}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-indigo-500"
                />
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}