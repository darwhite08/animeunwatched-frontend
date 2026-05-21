"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useOnlineCount } from "@/hooks/useRealtime"

type Props = {
  className?: string
  compact?: boolean
}

export function OnlineCountBadge({ className = "", compact = false }: Props) {
  const count = useOnlineCount()
  if (count <= 0) return null

  return (
    <div
      title={`${count} ${count === 1 ? "person" : "people"} online right now`}
      className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300/90 ${className}`}
    >
      <span className="relative inline-flex h-1.5 w-1.5">
        <motion.span
          className="absolute inset-0 rounded-full bg-emerald-400"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="absolute inset-0 rounded-full bg-emerald-400 blur-[3px] opacity-50" />
      </span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={count}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -6, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="tabular-nums"
        >
          {count}
        </motion.span>
      </AnimatePresence>
      {!compact && <span className="text-emerald-300/60">online</span>}
    </div>
  )
}
