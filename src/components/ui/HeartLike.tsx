"use client"

import { useId, useRef, useState, type MouseEvent } from "react"

/**
 * Kaiveron like button — a gradient heart that pops, bursts two rings, and
 * scatters mini-heart + confetti particles on like. Reusable everywhere a
 * heart-like control appears. Particle distances scale with `size`.
 *
 *   <HeartLike liked={liked} onToggle={toggle} size={20} />
 */
const COLORS = ["#FF5C8A", "#FF3D6E", "#B23BFF", "#00D4FF", "#F2C94C"]
const HEART = "M50 84 C12 58 16 26 38 26 C48 26 50 35 50 35 C50 35 52 26 62 26 C84 26 88 58 50 84 Z"

function miniHeart(c: string): string {
  return `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 21 C3 14 5 6 10 6 C12.5 6 12 9 12 9 C12 9 11.5 6 14 6 C19 6 21 14 12 21 Z" fill="${c}"/></svg>`
}

function emit(fx: HTMLElement | null, size: number) {
  if (!fx) return
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
  const unit = size / 22 // scale the burst relative to the heart size
  const spawn = (el: HTMLElement, x: number, y: number, scale: number, rot: number, dur: number, delay: number) => {
    el.style.position = "absolute"; el.style.left = "50%"; el.style.top = "50%"; el.style.opacity = "0"
    fx.appendChild(el)
    el.animate([
      { transform: `translate(-50%,-50%) translate(0,0) scale(${scale * 0.3}) rotate(0deg)`, opacity: 0, offset: 0 },
      { transform: `translate(-50%,-50%) translate(${x * 0.55}px,${y * 0.55}px) scale(${scale}) rotate(${rot * 0.6}deg)`, opacity: 1, offset: 0.28 },
      { transform: `translate(-50%,-50%) translate(${x}px,${y}px) scale(${scale * 0.7}) rotate(${rot}deg)`, opacity: 0, offset: 1 },
    ], { duration: dur, delay, easing: "cubic-bezier(.15,.75,.25,1)", fill: "forwards" }).onfinish = () => el.remove()
  }
  const rnd = () => Math.random()
  for (let i = 0; i < 7; i++) {
    const ang = (Math.PI * 2 * i / 7) + (rnd() - 0.5) * 0.4
    const r = (60 + rnd() * 50) * unit
    const el = document.createElement("div")
    const s = (12 + rnd() * 8) * unit
    el.style.width = el.style.height = `${s}px`
    el.style.filter = "drop-shadow(0 3px 8px rgba(255,61,110,.4))"
    el.innerHTML = miniHeart(COLORS[(rnd() * COLORS.length) | 0])
    spawn(el, Math.cos(ang) * r, Math.sin(ang) * r, 0.7 + rnd() * 0.9, (rnd() - 0.5) * 90, 760 + rnd() * 220, rnd() * 60)
  }
  for (let i = 0; i < 11; i++) {
    const ang = (Math.PI * 2 * i / 11) + rnd() * 0.5
    const r = (70 + rnd() * 60) * unit
    const c = COLORS[(rnd() * COLORS.length) | 0]
    const el = document.createElement("div")
    const s = (5 + rnd() * 6) * unit
    el.style.width = el.style.height = `${s}px`
    el.style.borderRadius = "2px"; el.style.background = c; el.style.boxShadow = `0 0 10px ${c}`
    spawn(el, Math.cos(ang) * r, Math.sin(ang) * r, 0.6 + rnd() * 0.8, (rnd() - 0.5) * 180, 620 + rnd() * 200, rnd() * 40)
  }
}

export function HeartLike({
  liked,
  onToggle,
  size = 22,
  idle = false,
  className = "",
  ariaLabel = "Like",
}: {
  liked: boolean
  onToggle: () => void
  size?: number
  /** Continuous pulse/halo while liked — use only for a single prominent button. */
  idle?: boolean
  className?: string
  ariaLabel?: string
}) {
  const gid = "kvH-" + useId().replace(/[^a-zA-Z0-9]/g, "")
  const fxRef = useRef<HTMLSpanElement>(null)
  const [beat, setBeat] = useState(false)

  const handle = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = !liked
    onToggle()
    if (next) {
      setBeat(true)
      emit(fxRef.current, size)
      window.setTimeout(() => setBeat(false), 950)
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      aria-pressed={liked}
      aria-label={ariaLabel}
      style={{ width: size, height: size }}
      className={`kv-like ${idle ? "idle" : ""} ${liked ? "on text-rose-400" : "text-current"} ${beat ? "beat burst" : ""} ${className}`}
    >
      <span className="kv-halo" />
      <span className="kv-ring kv-r1" />
      <span className="kv-ring kv-r2" />
      <span ref={fxRef} className="kv-fx" />
      <svg className="kv-heart" width={size} height={size} viewBox="0 0 100 100" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF5C8A" />
            <stop offset="48%" stopColor="#FF3D6E" />
            <stop offset="100%" stopColor="#B23BFF" />
          </linearGradient>
        </defs>
        <path className="kv-heart-stroke" d={HEART} />
        <path className="kv-heart-fill" d={HEART} fill={`url(#${gid})`} />
      </svg>
    </button>
  )
}
