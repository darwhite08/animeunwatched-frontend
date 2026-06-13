"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { SPRING, DURATION } from "@/lib/design/tokens"

/**
 * The Kaiveron modal→bottom-sheet pattern.
 *
 * On phones (<sm) it's a true bottom sheet: pinned to the bottom edge, slides up
 * from off-screen, has a grab handle, and pads past the home indicator.
 * On ≥sm it's a refined centered dialog (rise + fade).
 *
 * Handles backdrop click, Escape, and body-scroll lock. Pass your own padded
 * content; the sheet only provides the surface, motion, and safe-area.
 */
export function Sheet({
  open,
  onClose,
  children,
  ariaLabel,
  className = "",
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  ariaLabel?: string
  className?: string
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)")
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  const panel = isMobile
    ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, transition: SPRING.sheet }
    : {
        initial: { opacity: 0, y: 16, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 16, scale: 0.97 },
        transition: SPRING.soft,
      }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.fast }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          className="fixed inset-0 z-[300] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <motion.div
            {...panel}
            onClick={(e) => e.stopPropagation()}
            className={`relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain border-border bg-background shadow-2xl [-webkit-overflow-scrolling:touch] rounded-t-3xl border-t pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:w-auto sm:max-w-md sm:rounded-3xl sm:border sm:pb-0 ${className}`}
          >
            {/* Grab handle — phones only. */}
            <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-white/15 sm:hidden" />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
