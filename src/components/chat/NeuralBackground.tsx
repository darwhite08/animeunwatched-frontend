"use client"

/**
 * Lightweight neural-network background.
 *
 * Uses CSS animations (GPU-accelerated) instead of a canvas loop, so it
 * doesn't burn a CPU core.  Only 20 dots with CSS keyframes; the "lines"
 * are SVG elements that animate their opacity — no JavaScript per-frame math.
 */

import { useMemo } from "react"

// Seeded pseudo-random so SSR and client produce identical output
function seeded(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
}

export default function NeuralBackground({ opacity = 0.45 }: { opacity?: number }) {
  const { dots, lines } = useMemo(() => {
    const rand = seeded(42)
    const N = 22
    const dots = Array.from({ length: N }, (_, i) => ({
      id: i,
      cx: rand() * 100,
      cy: rand() * 100,
      r:  rand() * 1.2 + 0.5,
      dur: 6 + rand() * 8,   // animation duration
      dx:  (rand() - 0.5) * 12, // drift range
      dy:  (rand() - 0.5) * 12,
      delay: rand() * 5,
    }))

    // Connect nearby dots (based on initial position only — static lines)
    const lines: { id: string; x1: number; y1: number; x2: number; y2: number; o: number }[] = []
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].cx - dots[j].cx
        const dy = dots[i].cy - dots[j].cy
        const d  = Math.sqrt(dx * dx + dy * dy)
        if (d < 28) {
          lines.push({
            id:  `${i}-${j}`,
            x1:  dots[i].cx, y1: dots[i].cy,
            x2:  dots[j].cx, y2: dots[j].cy,
            o:   0.18 * (1 - d / 28),
          })
        }
      }
    }
    return { dots, lines }
  }, [])

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        {/* One reusable pulse animation per dot */}
        {dots.map(d => (
          <animateTransform
            key={`at-${d.id}`}
            xlinkHref={`#dot-${d.id}`}
            attributeName="transform"
            type="translate"
            values={`0,0; ${d.dx},${d.dy}; 0,0`}
            dur={`${d.dur}s`}
            begin={`${d.delay}s`}
            repeatCount="indefinite"
          />
        ))}
      </defs>

      {/* Connection lines (static) */}
      {lines.map(l => (
        <line
          key={l.id}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="rgba(130,140,255,1)"
          strokeWidth="0.3"
          opacity={l.o}
        />
      ))}

      {/* Animated dots */}
      {dots.map(d => (
        <circle key={d.id} id={`dot-${d.id}`} cx={d.cx} cy={d.cy} r={d.r}
          fill="rgba(155,165,255,0.55)">
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`0,0; ${d.dx},${d.dy}; 0,0`}
            dur={`${d.dur}s`}
            begin={`${d.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  )
}
