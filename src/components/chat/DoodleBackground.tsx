"use client"

/**
 * Anime doodle tile backgrounds.
 * Pure SVG patterns — zero JS, GPU-composited.
 */

interface DoodleProps {
  opacity?: number
  color?: string
}

/* ── Pattern definitions ──────────────────────────────────────────────────── */

export function StarsDoodle({ opacity = 0.06, color = "255,255,255" }: DoodleProps) {
  const enc = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
    <polygon points="40,8 42,32 66,34 42,36 40,60 38,36 14,34 38,32" fill="none" stroke="rgba(${color},${opacity * 1.5})" stroke-width="0.9"/>
    <polygon points="14,56 15,62 21,63 15,64 14,70 13,64 7,63 13,62" fill="none" stroke="rgba(${color},${opacity})" stroke-width="0.6"/>
    <polygon points="62,12 63,17 68,18 63,19 62,24 61,19 56,18 61,17" fill="none" stroke="rgba(${color},${opacity})" stroke-width="0.6"/>
    <circle cx="68" cy="55" r="1.8" fill="rgba(${color},${opacity})"/>
    <circle cx="10" cy="25" r="1.2" fill="rgba(${color},${opacity * 0.7})"/>
    <circle cx="72" cy="72" r="0.9" fill="rgba(${color},${opacity * 0.7})"/>
    <circle cx="35" cy="70" r="1.4" fill="rgba(${color},${opacity * 0.8})"/>
    <line x1="58" y1="60" x2="62" y2="56" stroke="rgba(${color},${opacity})" stroke-width="0.5"/>
    <line x1="60" y1="60" x2="60" y2="56" stroke="rgba(${color},${opacity})" stroke-width="0.5"/>
    <line x1="62" y1="60" x2="58" y2="56" stroke="rgba(${color},${opacity})" stroke-width="0.5"/>
    <line x1="60" y1="61" x2="60" y2="55" stroke="rgba(${color},${opacity})" stroke-width="0.5"/>
  </svg>`
  return (
    <div className="absolute inset-0 pointer-events-none"
      style={{ backgroundImage: `url("${enc(svg)}")`, backgroundRepeat: "repeat", backgroundSize: "80px 80px" }} />
  )
}

export function SakuraDoodle({ opacity = 0.055, color = "255,180,200" }: DoodleProps) {
  const enc = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
  const petal = (cx: number, cy: number, r: number, rot: number, op: number) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r*0.55}" transform="rotate(${rot},${cx},${cy})" fill="none" stroke="rgba(${color},${op})" stroke-width="0.7"/>`
  const flower = (x: number, y: number, r: number, baseOp: number) => Array.from({length:5},(_,i)=>
    petal(x + r*1.1*Math.cos(i*72*Math.PI/180), y + r*1.1*Math.sin(i*72*Math.PI/180), r, i*72, baseOp)
  ).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90">
    ${flower(22, 22, 7, opacity * 1.4)}
    ${flower(65, 65, 9, opacity * 1.2)}
    ${flower(72, 18, 5, opacity)}
    ${flower(18, 70, 5, opacity * 0.8)}
    <circle cx="22" cy="22" r="2" fill="rgba(${color},${opacity})"/>
    <circle cx="65" cy="65" r="2.5" fill="rgba(${color},${opacity})"/>
    <circle cx="72" cy="18" r="1.5" fill="rgba(${color},${opacity * 0.7})"/>
    <line x1="40" y1="10" x2="40" y2="80" stroke="rgba(${color},${opacity * 0.3})" stroke-width="0.4" stroke-dasharray="4,8"/>
    <line x1="10" y1="45" x2="80" y2="45" stroke="rgba(${color},${opacity * 0.3})" stroke-width="0.4" stroke-dasharray="4,8"/>
  </svg>`
  return (
    <div className="absolute inset-0 pointer-events-none"
      style={{ backgroundImage: `url("${enc(svg)}")`, backgroundRepeat: "repeat", backgroundSize: "90px 90px" }} />
  )
}

export function SwordsDoodle({ opacity = 0.055, color = "180,190,255" }: DoodleProps) {
  const enc = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <!-- Katana 1 (diagonal) -->
    <line x1="15" y1="85" x2="65" y2="15" stroke="rgba(${color},${opacity * 1.6})" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="14" y1="84" x2="18" y2="88" stroke="rgba(${color},${opacity * 1.4})" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="30" y="42" width="6" height="2.5" rx="0.5" transform="rotate(-55,33,43)" fill="rgba(${color},${opacity * 1.2})"/>
    <!-- Katana 2 (other diagonal, smaller) -->
    <line x1="72" y1="90" x2="95" y2="42" stroke="rgba(${color},${opacity})" stroke-width="0.8" stroke-linecap="round"/>
    <line x1="71" y1="89" x2="74" y2="92" stroke="rgba(${color},${opacity})" stroke-width="1.2" stroke-linecap="round"/>
    <!-- Stars / sparkles around -->
    <polygon points="82,18 83,24 89,25 83,26 82,32 81,26 75,25 81,24" fill="none" stroke="rgba(${color},${opacity})" stroke-width="0.6"/>
    <polygon points="8,40 9,44 13,45 9,46 8,50 7,46 3,45 7,44" fill="none" stroke="rgba(${color},${opacity * 0.8})" stroke-width="0.5"/>
    <circle cx="52" cy="78" r="1.4" fill="rgba(${color},${opacity})"/>
    <circle cx="90" cy="65" r="0.9" fill="rgba(${color},${opacity * 0.7})"/>
  </svg>`
  return (
    <div className="absolute inset-0 pointer-events-none"
      style={{ backgroundImage: `url("${enc(svg)}")`, backgroundRepeat: "repeat", backgroundSize: "100px 100px" }} />
  )
}

export function RamenDoodle({ opacity = 0.05, color = "255,210,140" }: DoodleProps) {
  const enc = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="110" height="110" viewBox="0 0 110 110">
    <!-- Ramen bowl outline -->
    <path d="M25 45 Q20 75 55 78 Q90 75 85 45 Z" fill="none" stroke="rgba(${color},${opacity * 1.4})" stroke-width="0.9"/>
    <ellipse cx="55" cy="45" rx="30" ry="8" fill="none" stroke="rgba(${color},${opacity * 1.4})" stroke-width="0.9"/>
    <!-- Steam lines -->
    <path d="M40 40 Q42 32 40 24" fill="none" stroke="rgba(${color},${opacity})" stroke-width="0.6" stroke-linecap="round"/>
    <path d="M55 38 Q57 30 55 22" fill="none" stroke="rgba(${color},${opacity})" stroke-width="0.6" stroke-linecap="round"/>
    <path d="M70 40 Q72 32 70 24" fill="none" stroke="rgba(${color},${opacity})" stroke-width="0.6" stroke-linecap="round"/>
    <!-- Chopsticks -->
    <line x1="50" y1="42" x2="80" y2="20" stroke="rgba(${color},${opacity * 1.2})" stroke-width="0.8" stroke-linecap="round"/>
    <line x1="56" y1="44" x2="86" y2="22" stroke="rgba(${color},${opacity * 1.2})" stroke-width="0.8" stroke-linecap="round"/>
    <!-- Small star accent -->
    <polygon points="12,20 13,25 18,26 13,27 12,32 11,27 6,26 11,25" fill="none" stroke="rgba(${color},${opacity})" stroke-width="0.5"/>
    <circle cx="92" cy="85" r="1.5" fill="rgba(${color},${opacity})"/>
    <circle cx="18" cy="90" r="1" fill="rgba(${color},${opacity * 0.7})"/>
  </svg>`
  return (
    <div className="absolute inset-0 pointer-events-none"
      style={{ backgroundImage: `url("${enc(svg)}")`, backgroundRepeat: "repeat", backgroundSize: "110px 110px" }} />
  )
}

export function AsanohaDoodle({ opacity = 0.055, color = "180,185,255" }: DoodleProps) {
  const enc = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
  // Asanoha (hemp leaf) — traditional Japanese pattern
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
    <line x1="30" y1="5"  x2="30" y2="55" stroke="rgba(${color},${opacity})" stroke-width="0.5"/>
    <line x1="5"  y1="30" x2="55" y2="30" stroke="rgba(${color},${opacity})" stroke-width="0.5"/>
    <line x1="9"  y1="9"  x2="51" y2="51" stroke="rgba(${color},${opacity})" stroke-width="0.5"/>
    <line x1="51" y1="9"  x2="9"  y2="51" stroke="rgba(${color},${opacity})" stroke-width="0.5"/>
    <polygon points="30,5 55,30 30,55 5,30" fill="none" stroke="rgba(${color},${opacity})" stroke-width="0.4"/>
    <circle cx="30" cy="30" r="3" fill="none" stroke="rgba(${color},${opacity * 1.3})" stroke-width="0.5"/>
  </svg>`
  return (
    <div className="absolute inset-0 pointer-events-none"
      style={{ backgroundImage: `url("${enc(svg)}")`, backgroundRepeat: "repeat", backgroundSize: "60px 60px" }} />
  )
}

export function MangaDoodle({ opacity = 0.04, color = "255,255,255" }: DoodleProps) {
  const enc = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
  // Speed lines + panel borders
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <!-- Speed lines from center-right -->
    ${Array.from({length:12},(_,i) => {
      const angle = (i/12)*Math.PI - Math.PI/2
      const x1=90, y1=40
      const x2=x1+70*Math.cos(angle), y2=y1+70*Math.sin(angle)
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(${color},${opacity * 0.8})" stroke-width="0.4"/>`
    }).join('')}
    <!-- Panel line -->
    <line x1="0" y1="80" x2="120" y2="80" stroke="rgba(${color},${opacity * 1.5})" stroke-width="0.8"/>
    <line x1="55" y1="0" x2="55" y2="80" stroke="rgba(${color},${opacity * 1.5})" stroke-width="0.8"/>
    <!-- Exclamation / sound effect suggestion -->
    <text x="10" y="30" font-family="serif" font-size="12" font-style="italic" font-weight="bold" fill="rgba(${color},${opacity * 1.2})" transform="rotate(-15,10,30)">!</text>
    <text x="65" y="100" font-family="serif" font-size="10" font-style="italic" font-weight="bold" fill="rgba(${color},${opacity})" transform="rotate(10,65,100)">?!</text>
  </svg>`
  return (
    <div className="absolute inset-0 pointer-events-none"
      style={{ backgroundImage: `url("${enc(svg)}")`, backgroundRepeat: "repeat", backgroundSize: "120px 120px" }} />
  )
}

/* ── None (clean dark background) ────────────────────────────────────────── */
export function NoDoodle() {
  return null
}
