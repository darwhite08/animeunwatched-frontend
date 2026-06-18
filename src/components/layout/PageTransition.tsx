"use client"

import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { usePathname } from "next/navigation"

/**
 * Shared route transition for the whole site. Keyed on pathname so it plays on
 * every navigation. Uses the app's signature easing curve and only animates
 * opacity + transform (GPU-friendly — no layout/blur thrash on big pages).
 * Honors prefers-reduced-motion: a quick, motionless cross-fade instead of the
 * slide. Used by both the public layout and the logged-in AppShell.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduce = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: reduce ? 0.12 : 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ willChange: "opacity, transform" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
