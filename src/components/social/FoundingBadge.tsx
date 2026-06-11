"use client"

import { Crown } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"

/**
 * Founding Creator badge — one of the first 250 verified creators. A premium,
 * gold "minted" pill: holographic sheen, soft glow, engraved serial. Cosmetic.
 * `serial` is the 1-based tenure ordinal; tooltip reads "Founding Creator #N".
 */
export function FoundingBadge({ serial, size = 16 }: { serial: number; size?: number }) {
  const label = `Founding Creator #${serial}`
  const reduce = useReducedMotion()
  const px = size

  return (
    <span
      title={label}
      aria-label={label}
      className="relative inline-flex shrink-0 select-none items-center overflow-hidden whitespace-nowrap rounded-full"
      style={{
        gap: px * 0.32,
        padding: `${px * 0.28}px ${px * 0.6}px ${px * 0.28}px ${px * 0.5}px`,
        // Brushed-gold gradient with a bright top edge.
        background:
          "linear-gradient(135deg, #FFF3C8 0%, #F6CF5E 38%, #E2A93B 62%, #C9892A 100%)",
        border: "1px solid rgba(255,243,200,0.85)",
        boxShadow:
          "0 2px 10px rgba(226,169,59,0.45), 0 0 22px rgba(242,201,76,0.30), inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -2px 5px rgba(140,90,10,0.35)",
      }}
    >
      {/* Holographic sheen sweep */}
      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, transparent 28%, rgba(255,255,255,0.85) 47%, rgba(255,255,255,0.2) 56%, transparent 72%)",
            mixBlendMode: "overlay",
          }}
          initial={{ x: "-130%" }}
          animate={{ x: "130%" }}
          transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.6 }}
        />
      )}

      <Crown
        size={px}
        strokeWidth={2.4}
        className="relative shrink-0"
        style={{ color: "#5A3B05", filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.5))" }}
      />
      <span
        className="relative font-black uppercase"
        style={{ fontSize: px * 0.62, letterSpacing: "0.12em", color: "#4A2F03", textShadow: "0 1px 0 rgba(255,255,255,0.45)" }}
      >
        Founding
      </span>
      <span
        className="relative font-black tabular-nums"
        style={{
          fontSize: px * 0.72,
          color: "#3A2402",
          textShadow: "0 1px 0 rgba(255,255,255,0.55)",
          paddingLeft: px * 0.1,
        }}
      >
        #{serial}
      </span>
    </span>
  )
}
