"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp } from "lucide-react"

type Props = {
  count: number
  onClick: () => void
}

export function NewPostsBanner({ count, onClick }: Props) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          key="banner"
          type="button"
          onClick={onClick}
          initial={{ y: -20, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 480, damping: 32 }}
          className="fixed left-1/2 -translate-x-1/2 z-[60] top-[88px] inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-black shadow-[0_8px_30px_color-mix(in srgb, var(--app-accent) 45%, transparent)]"
          style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}
          aria-live="polite"
        >
          <ArrowUp size={13} strokeWidth={3} />
          <span className="tabular-nums">
            {count} new {count === 1 ? "post" : "posts"}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
