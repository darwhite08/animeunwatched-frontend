"use client"

import { motion } from "framer-motion"

/* Deterministic pseudo-random helpers — avoids hydration mismatch by keeping
   all values purely index-derived rather than Math.random() on each render. */
function lerp(t: number, min: number, max: number) {
  return min + ((t * 2654435761) % 1000) / 1000 * (max - min)
}

function seededPct(seed: number, offset = 0) {
  return ((seed * 1234567 + offset * 7654321) % 97) + 1 // 1–97
}

const COLORS = [
  "rgba(99,102,241,0.7)",   // indigo
  "rgba(139,92,246,0.7)",   // violet
  "rgba(255,255,255,0.5)",  // white
  "rgba(167,139,250,0.6)",  // light violet
  "rgba(129,140,248,0.65)", // indigo-400
]

interface Particle {
  left: string
  top: string
  size: number
  color: string
  duration: number
  delay: number
  floatDistance: number
  glowColor: string
}

function buildParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1
    const size = 1 + (i % 3)                          // 1–3 px
    const colorIdx = i % COLORS.length
    const glowColor = COLORS[colorIdx].replace(/[\d.]+\)$/, "0.4)")

    return {
      left:          `${seededPct(n, 1)}%`,
      top:           `${seededPct(n, 2)}%`,
      size,
      color:         COLORS[colorIdx],
      duration:      3 + (n % 6),                     // 3–8 s
      delay:         (i * 0.31) % 4,                  // spread delays 0–4 s
      floatDistance: 20 + (i % 40),                   // 20–60 px upward drift
      glowColor,
    }
  })
}

export default function HeroParticles({ count = 30 }: { count?: number }) {
  const particles = buildParticles(count)

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top:  p.top,
            width:  p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.size * 2}px ${p.glowColor}`,
          }}
          animate={{
            y:       [0, -p.floatDistance, 0],
            opacity: [0.15, 0.9, 0.15],
            scale:   [1, 1 + p.size * 0.2, 1],
          }}
          transition={{
            duration: p.duration,
            delay:    p.delay,
            repeat:   Infinity,
            ease:     "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
