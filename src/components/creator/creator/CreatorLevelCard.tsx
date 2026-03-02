"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles } from "lucide-react"

type SidebarLevelCardProps = {
  level: number
  xp: number
  maxXp: number
  tier?: "Bronze" | "Silver" | "Gold" | "Platinum"
}

export default function SidebarLevelCard({
  level,
  xp,
  maxXp,
  tier,
}: SidebarLevelCardProps) {
  const [visible, setVisible] = useState(true)

  const safeMaxXp = maxXp || 1

  const progress = useMemo(
    () => Math.min((xp / safeMaxXp) * 100, 100),
    [xp, safeMaxXp]
  )

  useEffect(() => {
    const hidden = localStorage.getItem("hideLevelCard")
    if (hidden === `level-${level}`) {
      setVisible(false)
    } else {
      setVisible(true)
    }
  }, [level])

  const handleClose = () => {
    localStorage.setItem("hideLevelCard", `level-${level}`)
    setVisible(false)
  }

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className=" relative rounded-xl border border-white/10 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md p-4 shadow-lg shadow-indigo-500/5"
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-white">
                  Level {level}
                </span>
              </div>

              {tier && (
                <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
                  {tier}
                </span>
              )}
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
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                />
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}