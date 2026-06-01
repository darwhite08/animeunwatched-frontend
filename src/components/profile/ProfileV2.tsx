"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Bookmark, Flame, Globe2, ShieldCheck, Crown, Sparkles, Heart, Medal,
  Clock, Camera, Settings, Share2, Play, ChevronRight, Plus, Check,
  MessageSquare, Star, TrendingUp, BookOpen, Pencil, CalendarDays,
} from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { useUserList } from "@/hooks/useLists"

/* ──────────────────────────────────────────────────────────────────────
   count-up hook — animates a number from 0 → target
   ────────────────────────────────────────────────────────────────────── */
function useCountUp(target: number, run = true, dur = 1100) {
  const [n, setN] = useState(target)
  useEffect(() => {
    if (!run) { setN(target); return }
    let raf = 0, start = 0, cancelled = false
    const ease = (x: number) => 1 - Math.pow(1 - x, 3)
    setN(0)
    const tick = (t: number) => {
      if (cancelled) return
      if (!start) start = t
      const p = Math.min((t - start) / dur, 1)
      setN(target * ease(p))
      if (p < 1) raf = requestAnimationFrame(tick); else setN(target)
    }
    raf = requestAnimationFrame(tick)
    const safety = setTimeout(() => { if (!cancelled) setN(target) }, dur + 250)
    return () => { cancelled = true; cancelAnimationFrame(raf); clearTimeout(safety) }
  }, [target, run, dur])
  return n
}

function CountValue({ value }: { value: string }) {
  const numeric = /^[\d,]+$/.test(value)
  const target = numeric ? parseInt(value.replace(/,/g, ""), 10) : 0
  const n = useCountUp(target, numeric)
  if (!numeric) return <>{value}</>
  return <>{Math.round(n).toLocaleString()}</>
}

/* ──────────────────────────────────────────────────────────────────────
   Sparkline
   ────────────────────────────────────────────────────────────────────── */
function Sparkline({ series, color, w = 88, h = 28 }: { series: number[]; color: string; w?: number; h?: number }) {
  const min = Math.min(...series), max = Math.max(...series), span = max - min || 1
  const step = w / (series.length - 1)
  const pts = series.map((v, i) => [i * step, h - ((v - min) / span) * (h - 4) - 2] as [number, number])
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ")
  const gid = `spk-${color.replace(/[^a-z0-9]/gi, "")}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={line + ` L ${w} ${h} L 0 ${h} Z`} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2.3} fill={color} />
    </svg>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Avatar with progress ring
   ────────────────────────────────────────────────────────────────────── */
function ProfileAvatar({ size = 128, progress, level, name, avatarUrl }: {
  size?: number; progress: number; level: number; name: string; avatarUrl?: string | null
}) {
  const r = size / 2 - 5
  const c = 2 * Math.PI * r
  const off = c * (1 - progress)
  const initial = (name?.[0] ?? "K").toUpperCase()
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 z-[2]" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="color-mix(in srgb, var(--app-fg) 14%, transparent)" strokeWidth={3.5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#avRing)"
          strokeWidth={3.5} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.3,.8,.3,1)" }} />
        <defs>
          <linearGradient id="avRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--app-accent)" />
            <stop offset="100%" stopColor="var(--app-accent-bright)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-[9px] rounded-full overflow-hidden flex items-center justify-center"
        style={{
          background: "radial-gradient(120% 120% at 30% 20%, color-mix(in srgb, var(--app-accent) 55%, var(--app-surface-2)), var(--app-surface-2))",
        }}>
        {avatarUrl
          ? <Image src={avatarUrl} alt={name} fill className="object-cover" sizes="128px" />
          : <span className="font-black text-4xl text-foreground italic">{initial}</span>}
      </div>
      <button aria-label="Change avatar"
        className="absolute bottom-1 right-1 z-[3] w-7 h-7 rounded-full grid place-items-center border border-border bg-background/80 backdrop-blur hover:bg-surface transition-colors">
        <Camera size={13} />
      </button>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-[3] flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-[10px] font-black text-black"
        style={{ boxShadow: "0 4px 14px color-mix(in srgb, var(--app-accent) 35%, transparent)" }}>
        <span className="font-mono opacity-70">LV</span>{level}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Hero
   ────────────────────────────────────────────────────────────────────── */
function Hero({ isOwner }: { isOwner: boolean }) {
  const user = useAuthStore(s => s.user)
  const [following, setFollowing] = useState(false)
  const reputation = user?.reputation ?? 0
  const level = Math.max(1, Math.floor(reputation / 500) + 1)
  const xpInto = reputation % 500
  const xpNeed = 500
  const progress = xpInto / xpNeed
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleString("en", { month: "short", year: "numeric" }).toUpperCase()
    : "—"
  const displayName = user?.displayName || user?.username || "Admin"
  const handle = user?.username ? `@${user.username}` : "@admin"
  const bio = user?.bio || "Cataloguing the canon. Welcome to the archive."

  return (
    <section className="relative rounded-[22px] bg-surface border border-border overflow-hidden">
      {/* Cover with aurora */}
      <div className="relative h-[150px] overflow-hidden"
        style={{ background: "linear-gradient(120deg, var(--app-surface-2), var(--app-surface))" }}>
        <div className="absolute inset-[-60%_-20%_auto_-20%] h-[320px] blur-[36px] opacity-85 pointer-events-none animate-[aurora_16s_ease-in-out_infinite_alternate]"
          style={{
            background: `
              radial-gradient(40% 60% at 25% 40%, color-mix(in srgb, var(--app-accent) 85%, transparent), transparent 70%),
              radial-gradient(38% 55% at 70% 30%, color-mix(in srgb, var(--app-accent-bright) 75%, transparent), transparent 70%),
              radial-gradient(34% 50% at 90% 60%, color-mix(in srgb, var(--app-accent) 60%, transparent), transparent 70%)`,
          }} />
        <div className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: "radial-gradient(color-mix(in srgb, var(--app-fg) 10%, transparent) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(180deg, #000, transparent)",
          }} />
        {isOwner && (
          <button className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest text-muted backdrop-blur-md border border-border bg-background/40 hover:bg-background/70 transition-colors">
            <Camera size={12} /> Edit cover
          </button>
        )}
      </div>

      {/* Body — 3-col grid on lg: [avatar | identity | actions]. All three
          start at the same top edge (pt-4); avatar gets its own negative
          margin so only IT pokes up over the cover. */}
      <div className="px-6 pb-6 grid gap-6 grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-start">
        <div className="-mt-[54px] self-start">
          <ProfileAvatar progress={progress} level={level} name={displayName} avatarUrl={user?.avatarUrl} />
        </div>

        <div className="min-w-0 pt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-black tracking-tighter text-foreground italic uppercase leading-none">{displayName}</h1>
            <span title="Verified" className="text-accent-bright"><ShieldCheck size={20} /></span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-accent border border-accent/40 bg-accent/10">
              <Sparkles size={11} /> Elite
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted">
            <span>Lv {level} · Visionary Curator</span>
            <span className="opacity-40">•</span>
            <span className="font-mono uppercase tracking-widest text-muted">{handle}</span>
          </div>
          <p className="text-sm text-muted mt-3 max-w-prose leading-relaxed">{bio}</p>
          <div className="flex items-center flex-wrap gap-x-5 gap-y-2 mt-4">
            {[
              { n: "12.4K", l: "Followers" },
              { n: "312", l: "Following" },
              { n: "48", l: "Curations" },
            ].map(it => (
              <button key={it.l} className="flex items-baseline gap-1.5 group">
                <span className="text-base font-black text-foreground tabular-nums">{it.n}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted group-hover:text-foreground transition-colors">{it.l}</span>
              </button>
            ))}
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
              <CalendarDays size={11} /> Joined {joined}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 w-full lg:w-[300px]">
          <div className="flex items-center gap-2 lg:justify-end flex-wrap">
            {isOwner ? (
              <>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-black bg-accent hover:bg-accent-bright transition-colors">
                  <Settings size={14} /> Customize
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-foreground border border-border hover:bg-surface-2 transition-colors">
                  <Share2 size={13} /> Share
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setFollowing(f => !f)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors ${
                    following ? "text-foreground border border-border hover:bg-surface-2" : "text-black bg-accent hover:bg-accent-bright"
                  }`}>
                  {following ? <><Check size={14} /> Following</> : <><Plus size={14} /> Follow</>}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-foreground border border-border hover:bg-surface-2 transition-colors">
                  <MessageSquare size={13} /> Message
                </button>
              </>
            )}
          </div>

          <Link href={user?.slug ? `/user/${user.slug}/profile/wrapped` : "/profile/wrapped"}
            className="group relative flex items-center gap-3 px-4 py-3 rounded-xl text-left border border-accent/30 bg-accent/[0.06] hover:bg-accent/[0.10] transition-colors overflow-hidden">
            <span className="absolute inset-0 pointer-events-none opacity-50"
              style={{ background: "radial-gradient(60% 100% at 0% 50%, color-mix(in srgb, var(--app-accent) 22%, transparent), transparent 60%)" }} />
            <span className="relative w-8 h-8 rounded-lg grid place-items-center bg-accent/15 text-accent">
              <Sparkles size={15} />
            </span>
            <span className="relative flex flex-col leading-none gap-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-subtle">New · ready now</span>
              <span className="text-xs font-black text-foreground">See my 2025 Wrapped</span>
            </span>
            <ChevronRight size={15} className="ml-auto opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <div className="w-full mt-1">
            <div className="flex justify-between items-baseline text-[10px] font-mono uppercase tracking-widest mb-1.5">
              <span className="text-muted">Lv {level}</span>
              <span className="text-muted"><b className="text-foreground">{xpInto.toLocaleString()}</b> / {xpNeed.toLocaleString()} XP</span>
              <span className="text-muted">{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${progress * 100}%`,
                  background: "linear-gradient(90deg, var(--app-accent), var(--app-accent-bright))",
                }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Heatmap — 52w × 7d
   ────────────────────────────────────────────────────────────────────── */
function buildHeatmap(): number[][] {
  const weeks = 52, days = 7
  let seed = 1337
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
  const grid: number[][] = []
  for (let w = 0; w < weeks; w++) {
    const col: number[] = []
    const seasonal = 0.35 + 0.5 * Math.pow(w / weeks, 1.5)
    for (let d = 0; d < days; d++) {
      const r = rnd()
      const p = r * seasonal + (d === 5 || d === 6 ? 0.18 : 0)
      let lvl = 0
      if (p > 0.78) lvl = 4
      else if (p > 0.58) lvl = 3
      else if (p > 0.4) lvl = 2
      else if (p > 0.22) lvl = 1
      col.push(lvl)
    }
    grid.push(col)
  }
  return grid
}
const HEATMAP_MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"]

function cellColor(lvl: number) {
  if (lvl === 0) return "color-mix(in srgb, var(--app-fg) 6%, transparent)"
  const pct = [0, 28, 50, 74, 100][lvl]
  return `color-mix(in srgb, var(--app-accent) ${pct}%, color-mix(in srgb, var(--app-accent-bright) ${pct / 2}%, var(--app-surface-2)))`
}

function Heatmap() {
  const grid = useMemo(buildHeatmap, [])
  return (
    <section className="rounded-[22px] bg-surface border border-border p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Flame size={15} className="text-accent" />
            Watch activity
          </div>
          <div className="text-xs text-muted mt-1">
            <b className="text-foreground">1,284</b> episodes this year · <b className="text-[#F0883E]">365-day streak</b>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-subtle">
          Less
          {[0, 1, 2, 3, 4].map(l => (
            <span key={l} className="w-[10px] h-[10px] rounded-[2px]" style={{ background: cellColor(l) }} />
          ))}
          More
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-subtle mb-2 pl-1 pr-1">
          {HEATMAP_MONTHS.map((m, i) => <span key={i}>{m}</span>)}
        </div>
        <div className="flex gap-[3px]">
          {grid.map((col, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              {col.map((lvl, d) => (
                <span key={d} className="w-[10px] h-[10px] rounded-[2px]"
                  style={{ background: cellColor(lvl) }}
                  title={`${lvl ? lvl * 2 + Math.round(lvl / 2) : 0} episodes`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Now Watching
   ────────────────────────────────────────────────────────────────────── */
function NowWatching() {
  const w = { title: "Frieren: Beyond Journey's End", ep: "EP 18 / 28", progress: 0.64 }
  const r = 26, c = 2 * Math.PI * r, off = c * (1 - w.progress)
  return (
    <section className="rounded-[22px] bg-surface border border-border p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Play size={14} className="text-accent" />
          Now watching
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--app-accent) 40%, var(--app-surface-2)), var(--app-surface-2))" }}>
        <span className="absolute top-2 left-2 font-mono text-[9px] uppercase tracking-widest text-subtle">KEY ART</span>
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width="68" height="68" viewBox="0 0 68 68">
          <circle cx="34" cy="34" r={r} fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.18)" strokeWidth={4} />
          <circle cx="34" cy="34" r={r} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 34 34)" />
          <text x="34" y="38" textAnchor="middle" fontSize={14} fontWeight={800} fill="#fff">
            {Math.round(w.progress * 100)}
          </text>
        </svg>
      </div>
      <div>
        <div className="text-sm font-bold text-foreground line-clamp-1">{w.title}</div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-subtle mt-1">{w.ep}</div>
      </div>
      <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-black bg-accent hover:bg-accent-bright transition-colors">
        <Play size={13} /> Continue
      </button>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Stat band
   ────────────────────────────────────────────────────────────────────── */
function StatBand({ archiveCount }: { archiveCount: number }) {
  const stats = [
    { id: "archive",  icon: Bookmark, value: archiveCount.toLocaleString(), label: "Archive",   sub: "Anime catalogued",      delta: "+18 this month",     up: true, color: "var(--app-accent)",      series: [12, 18, 15, 22, 19, 26, 24, 31] },
    { id: "streak",   icon: Flame,    value: "365",                          label: "Day streak", sub: "Flame Grade IV",        delta: "Personal best",      up: true, color: "#F0883E",                 series: [40, 80, 120, 180, 220, 280, 320, 365] },
    { id: "standing", icon: Globe2,   value: "Top 4%",                        label: "Standing",   sub: "Global percentile",     delta: "+1.2% this season",  up: true, color: "var(--app-accent-bright)", series: [9, 8, 8, 7, 6, 6, 5, 4] },
    { id: "trust",    icon: ShieldCheck, value: "99",                         label: "Trust score", sub: "Reviewer reputation",   delta: "Verified curator",   up: true, color: "#3FB950",                 series: [82, 85, 88, 90, 93, 95, 97, 99] },
  ]
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 rounded-[22px] bg-surface border border-border overflow-hidden divide-x divide-y lg:divide-y-0 divide-border">
      {stats.map((s, i) => {
        const Icon = s.icon
        return (
          <div key={s.id} className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span style={{ color: s.color }}><Icon size={17} /></span>
              <Sparkline series={s.series} color={s.color} />
            </div>
            <div className="text-2xl font-black text-foreground tabular-nums tracking-tighter">
              <CountValue value={s.value} />
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-subtle">{s.label}</div>
            <div className="text-[11px] text-muted">{s.sub}</div>
            <div className={`flex items-center gap-1 text-[10px] font-bold ${s.up ? "text-emerald-500" : "text-rose-500"}`}>
              <TrendingUp size={11} /> {s.delta}
            </div>
          </div>
        )
      })}
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Favorites wall
   ────────────────────────────────────────────────────────────────────── */
function Favorites() {
  const list = [
    { id: "f1", rank: 1, title: "Frieren",       sub: "Beyond Journey's End", score: 9.4 },
    { id: "f2", rank: 2, title: "Monster",       sub: "Naoki Urasawa",         score: 9.3 },
    { id: "f3", rank: 3, title: "Vinland Saga",  sub: "Season 1",              score: 9.1 },
    { id: "f4", rank: 4, title: "Mushishi",      sub: "Complete Series",       score: 9.0 },
    { id: "f5", rank: 5, title: "Steins;Gate",   sub: "El Psy Kongroo",        score: 8.9 },
    { id: "f6", rank: 6, title: "Cowboy Bebop",  sub: "See you, space cowboy", score: 8.8 },
  ]
  return (
    <section className="rounded-[22px] bg-surface border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Crown size={15} className="text-accent" /> All-time favorites
        </div>
        <button className="flex items-center gap-1 text-xs font-bold text-accent hover:text-accent-bright transition-colors">
          Edit list <ChevronRight size={13} />
        </button>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {list.map(f => (
          <div key={f.id} className="flex flex-col gap-2">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-border"
              style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--app-accent) ${(7 - f.rank) * 8}%, var(--app-surface-2)), var(--app-surface-2))` }}>
              <span className="absolute top-1.5 left-1.5 font-mono text-[8px] uppercase tracking-widest text-subtle">POSTER</span>
              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-background/60 backdrop-blur text-foreground">#{f.rank}</span>
              <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-background/60 backdrop-blur text-accent-bright">
                <Star size={9} fill="currentColor" /> {f.score}
              </span>
            </div>
            <div className="text-xs font-bold text-foreground line-clamp-1">{f.title}</div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-subtle line-clamp-1">{f.sub}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Taste radar
   ────────────────────────────────────────────────────────────────────── */
function TasteRadar() {
  const data = [
    { label: "Psych",   val: 0.95 },
    { label: "Drama",   val: 0.82 },
    { label: "Seinen",  val: 0.74 },
    { label: "Fantasy", val: 0.58 },
    { label: "Action",  val: 0.66 },
    { label: "Slice",   val: 0.80 },
  ]
  const cx = 120, cy = 116, R = 86, N = data.length
  const ang = (i: number) => -Math.PI / 2 + i * (2 * Math.PI / N)
  const pt = (i: number, rad: number) => [cx + Math.cos(ang(i)) * rad, cy + Math.sin(ang(i)) * rad] as [number, number]
  const poly = data.map((d, i) => pt(i, R * d.val).join(",")).join(" ")
  const rings = [0.25, 0.5, 0.75, 1]
  return (
    <section className="rounded-[22px] bg-surface border border-border p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Heart size={14} className="text-accent" /> Taste profile
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">6 dimensions</span>
      </div>
      <div className="flex justify-center">
        <svg viewBox="0 0 240 232" className="w-full max-w-[260px]">
          {rings.map((rr, i) => (
            <polygon key={i} points={data.map((_, j) => pt(j, R * rr).join(",")).join(" ")}
              fill="none" stroke="color-mix(in srgb, var(--app-fg) 14%, transparent)" strokeWidth={1} />
          ))}
          {data.map((_, i) => {
            const [x, y] = pt(i, R)
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="color-mix(in srgb, var(--app-fg) 14%, transparent)" strokeWidth={1} />
          })}
          <polygon points={poly} fill="url(#radarFill)" stroke="var(--app-accent-bright)" strokeWidth={2} />
          {data.map((d, i) => {
            const [x, y] = pt(i, R * d.val)
            return <circle key={i} cx={x} cy={y} r={3} fill="var(--app-accent-bright)" />
          })}
          {data.map((d, i) => {
            const [x, y] = pt(i, R + 16)
            return (
              <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                fontSize={10} fill="var(--app-muted)"
                style={{ textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "monospace" }}>
                {d.label}
              </text>
            )
          })}
          <defs>
            <radialGradient id="radarFill">
              <stop offset="0%" stopColor="var(--app-accent)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--app-accent)" stopOpacity={0.12} />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Achievements
   ────────────────────────────────────────────────────────────────────── */
function Achievements() {
  const list = [
    { id: "a1", icon: Flame,    name: "Eternal Flame", desc: "365-day watch streak",   rarity: "Legendary", tint: "#F0883E" },
    { id: "a2", icon: Crown,    name: "Completionist", desc: "Finished 500 series",     rarity: "Epic",       tint: "#F2C94C" },
    { id: "a3", icon: Medal,    name: "Tastemaker",    desc: "50 curated lists liked",  rarity: "Rare",       tint: "var(--app-accent-bright)" },
    { id: "a4", icon: Sparkles, name: "Day One",       desc: "Founding member 2019",    rarity: "Mythic",     tint: "var(--app-accent)" },
  ]
  return (
    <section className="rounded-[22px] bg-surface border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Medal size={15} className="text-accent" /> Achievements
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">16 unlocked</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.map(a => {
          const Icon = a.icon
          return (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-2">
              <div className="w-10 h-10 rounded-lg grid place-items-center shrink-0"
                style={{ background: `color-mix(in srgb, ${a.tint} 18%, transparent)`, color: a.tint }}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-foreground">{a.name}</div>
                <div className="text-[11px] text-muted">{a.desc}</div>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-subtle">{a.rarity}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Activity feed
   ────────────────────────────────────────────────────────────────────── */
function ActivityFeed() {
  const events = [
    { id: "e1", icon: Star,     tint: "#F2C94C",                 text: "Rated",     strong: "Frieren EP 18",   meta: "9.4 ★",      time: "2h" },
    { id: "e2", icon: Check,    tint: "#3FB950",                 text: "Completed", strong: "Monster",          meta: "74 episodes", time: "1d" },
    { id: "e3", icon: Medal,    tint: "var(--app-accent-bright)", text: "Earned",    strong: "Tastemaker",       meta: "Rare badge",  time: "2d" },
    { id: "e4", icon: Pencil,   tint: "var(--app-accent)",        text: "Reviewed",  strong: "Vinland Saga",     meta: "+128 likes",  time: "3d" },
    { id: "e5", icon: Bookmark, tint: "#8B5CF6",                 text: "Added 6 titles to", strong: "Winter '26 Watch", meta: "List", time: "4d" },
  ]
  return (
    <section className="rounded-[22px] bg-surface border border-border p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Clock size={14} className="text-accent" /> Recent activity
        </div>
        <Link href="/profile/activity" className="flex items-center gap-1 text-xs font-bold text-accent hover:text-accent-bright transition-colors">
          All <ChevronRight size={13} />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {events.map(e => {
          const Icon = e.icon
          return (
            <div key={e.id} className="flex items-center gap-3 py-3">
              <span className="w-8 h-8 rounded-lg grid place-items-center shrink-0"
                style={{ background: `color-mix(in srgb, ${e.tint} 14%, transparent)`, color: e.tint }}>
                <Icon size={14} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted">{e.text} <b className="text-foreground">{e.strong}</b></div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-subtle mt-0.5">{e.meta}</div>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-subtle shrink-0">{e.time}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Root
   ────────────────────────────────────────────────────────────────────── */
export default function ProfileV2() {
  const user = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "")
  const archiveCount = (listData?.data?.length) ?? 0
  const isOwner = true   // dashboard route → always owner; visitor view lives at /u/[username]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-5 pb-32">
      <style jsx global>{`
        @keyframes aurora {
          0%   { transform: translateX(-6%) translateY(0)    scale(1.05); }
          100% { transform: translateX(8%)  translateY(-8%)  scale(1.18); }
        }
      `}</style>

      <Hero isOwner={isOwner} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Heatmap />
        <NowWatching />
      </div>

      <StatBand archiveCount={archiveCount} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start">
        <Favorites />
        <TasteRadar />
      </div>

      <div className="grid gap-5 lg:grid-cols-2 items-start">
        <Achievements />
        <ActivityFeed />
      </div>
    </div>
  )
}
