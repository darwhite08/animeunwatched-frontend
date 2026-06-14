"use client"

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Bookmark, Flame, Globe2, ShieldCheck, Crown, Sparkles, Heart, Medal,
  Clock, Camera, Settings, Share2, Play, ChevronRight, Plus, Check,
  MessageSquare, Star, TrendingUp, BookOpen, Pencil, CalendarDays,
} from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { useUserList } from "@/hooks/useLists"
import { useUserProfile } from "@/hooks/useUsers"
import { useActivityFeed } from "@/hooks/useActivityFeed"
import { useImageUpload } from "@/hooks/useImageUpload"
import { useToast } from "@/stores/toast.store"
import * as ep from "@/lib/api/endpoints"
import { InviteCard } from "@/components/social/InviteCard"

/** Ninja-tier title from reputation (matches the sidebar gamification strip). */
const NINJA_TIERS: [number, string][] = [
  [5000, "Kage"], [2000, "Jonin"], [1000, "Special Jonin"], [500, "Chunin"], [100, "Genin"], [0, "Academy Student"],
]
const ninjaTier = (rep: number) => NINJA_TIERS.find(([min]) => rep >= min)?.[1] ?? "Academy Student"

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
function ProfileAvatar({ size = 128, progress, level, name, avatarUrl, editable = false }: {
  size?: number; progress: number; level: number; name: string; avatarUrl?: string | null; editable?: boolean
}) {
  const r = size / 2 - 5
  const c = 2 * Math.PI * r
  const off = c * (1 - progress)
  const initial = (name?.[0] ?? "K").toUpperCase()

  const fileRef = useRef<HTMLInputElement>(null)
  const { upload, isUploading } = useImageUpload("avatar")
  const { push } = useToast()
  const setUser = useAuthStore((s) => s.setUser)
  const [src, setSrc] = useState<string | null | undefined>(avatarUrl)
  useEffect(() => { setSrc(avatarUrl) }, [avatarUrl])

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { publicUrl } = await upload(file)
      await ep.updateMe({ avatarUrl: publicUrl })
      setSrc(publicUrl)
      const u = useAuthStore.getState().user
      if (u) setUser({ ...u, avatarUrl: publicUrl })
      push("Profile photo updated", "success")
    } catch {
      push("Couldn't update photo — try a smaller image.", "error")
    } finally {
      e.target.value = ""
    }
  }
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
        {src
          ? // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={name} referrerPolicy="no-referrer" className="h-full w-full object-cover" onError={() => setSrc(null)} />
          : <span className="font-black text-4xl text-foreground italic">{initial}</span>}
      </div>
      {editable && (
        <>
          <button aria-label="Change profile photo" onClick={() => fileRef.current?.click()} disabled={isUploading}
            className={`absolute bottom-1 right-1 z-[3] w-7 h-7 rounded-full grid place-items-center border border-border bg-background/80 backdrop-blur hover:bg-surface transition-colors disabled:opacity-50 ${isUploading ? "animate-pulse" : ""}`}>
            <Camera size={13} />
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFile} />
        </>
      )}
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
  const { data: profileData } = useUserProfile(user?.username ?? "")
  const profile = profileData?.user
  const { data: listData } = useUserList(user?.username ?? "")
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

  const { push } = useToast()
  const setUser = useAuthStore((s) => s.setUser)
  const coverRef = useRef<HTMLInputElement>(null)
  const coverUpload = useImageUpload("post")
  const coverImage = (user as { coverImage?: string | null } | null)?.coverImage ?? null
  const settingsHref = user?.slug ? `/user/${user.slug}/settings/account` : "/settings/account"

  const shareProfile = async () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : "https://kaiveron.com"}/u/${user?.username ?? ""}`
    try { await navigator.clipboard.writeText(url); push("Profile link copied!", "success") }
    catch { push("Couldn't copy link", "error") }
  }

  const onCover = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { publicUrl } = await coverUpload.upload(file)
      await ep.updateMe({ coverImage: publicUrl })
      const u = useAuthStore.getState().user
      if (u) setUser({ ...u, coverImage: publicUrl } as typeof u)
      push("Cover updated", "success")
    } catch {
      push("Couldn't update cover — try a smaller image.", "error")
    } finally {
      e.target.value = ""
    }
  }

  // Real social + curation counts. Curations = items in this user's
  // public watchlist (lists are public in this app).
  const followers  = profileData?.stats?.followers ?? 0
  const followingN = profileData?.stats?.following ?? 0
  const curations  = listData?.data?.length ?? 0

  return (
    <section className="relative rounded-2xl bg-surface border border-border overflow-hidden">
      {/* Cover with aurora */}
      <div className="relative h-[120px] sm:h-[150px] overflow-hidden"
        style={{ background: "linear-gradient(120deg, var(--app-surface-2), var(--app-surface))" }}>
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="" referrerPolicy="no-referrer" className="absolute inset-0 z-[1] h-full w-full object-cover" />
        )}
        <div className={`absolute inset-[-60%_-20%_auto_-20%] h-[320px] blur-[36px] opacity-85 pointer-events-none animate-[aurora_16s_ease-in-out_infinite_alternate] ${coverImage ? "hidden" : ""}`}
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
          <button onClick={() => coverRef.current?.click()} disabled={coverUpload.isUploading}
            className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-[2] flex items-center gap-1.5 px-2.5 sm:px-3 h-9 rounded-lg text-[10px] font-mono uppercase tracking-widest text-muted backdrop-blur-md border border-border bg-background/40 hover:bg-background/70 transition-colors disabled:opacity-60 ${coverUpload.isUploading ? "animate-pulse" : ""}`}>
            <Camera size={12} /> {coverUpload.isUploading ? "Uploading…" : "Edit cover"}
          </button>
        )}
        <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onCover} />
      </div>

      {/* Body — 3-col grid on lg: [avatar | identity | actions]. All three
          start at the same top edge (pt-4); avatar gets its own negative
          margin so only IT pokes up over the cover. */}
      <div className="px-4 sm:px-6 pb-5 sm:pb-6 grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-start">
        <div className="-mt-12 sm:-mt-[54px] self-start">
          <ProfileAvatar progress={progress} level={level} name={displayName}
            avatarUrl={profile?.avatarUrl ?? user?.avatarUrl} editable={isOwner} />
        </div>

        <div className="min-w-0 pt-1 sm:pt-4">
          <div className="flex items-center gap-x-2 gap-y-1.5 flex-wrap">
            <h1 className="text-[22px] sm:text-3xl font-black tracking-tighter text-foreground italic uppercase leading-none break-words">{displayName}</h1>
            <span title="Verified" className="text-accent-bright"><ShieldCheck size={18} className="sm:hidden" /><ShieldCheck size={20} className="hidden sm:inline" /></span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-accent border border-accent/40 bg-accent/10">
              <Sparkles size={11} /> Elite
            </span>
          </div>
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-2 text-xs text-muted">
            <span>Lv {level} · {ninjaTier(reputation)}</span>
            <span className="opacity-40">•</span>
            <span className="font-mono uppercase tracking-widest text-muted">{handle}</span>
          </div>
          <p className="text-[13px] sm:text-sm text-muted mt-2.5 sm:mt-3 max-w-prose leading-relaxed">{bio}</p>
          <div className="flex items-center flex-wrap gap-x-4 sm:gap-x-5 gap-y-2 mt-3.5 sm:mt-4">
            {[
              { n: followers.toLocaleString(),  l: "Followers"  },
              { n: followingN.toLocaleString(), l: "Following"  },
              { n: curations.toLocaleString(),  l: "Curations"  },
            ].map(it => (
              <button key={it.l} className="flex items-baseline gap-1.5 group min-h-11 -my-1.5 py-1.5">
                <span className="text-base font-black text-foreground tabular-nums">{it.n}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted group-hover:text-foreground transition-colors">{it.l}</span>
              </button>
            ))}
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted whitespace-nowrap">
              <CalendarDays size={11} /> Joined {joined}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-1 sm:pt-4 w-full lg:w-[300px]">
          <div className="flex items-center gap-2 lg:justify-end">
            {isOwner ? (
              <>
                <Link href={settingsHref}
                  className="flex flex-1 lg:flex-none items-center justify-center gap-2 min-h-11 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-black bg-accent hover:bg-accent-bright active:scale-95 transition-[transform,background-color]">
                  <Settings size={14} /> Customize
                </Link>
                <button onClick={shareProfile} className="flex flex-1 lg:flex-none items-center justify-center gap-2 min-h-11 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-foreground border border-border hover:bg-surface-2 active:scale-95 transition-[transform,background-color]">
                  <Share2 size={13} /> Share
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setFollowing(f => !f)}
                  className={`flex flex-1 lg:flex-none items-center justify-center gap-2 min-h-11 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-[transform,background-color] ${
                    following ? "text-foreground border border-border hover:bg-surface-2" : "text-black bg-accent hover:bg-accent-bright"
                  }`}>
                  {following ? <><Check size={14} /> Following</> : <><Plus size={14} /> Follow</>}
                </button>
                <button className="flex flex-1 lg:flex-none items-center justify-center gap-2 min-h-11 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-foreground border border-border hover:bg-surface-2 active:scale-95 transition-[transform,background-color]">
                  <MessageSquare size={13} /> Message
                </button>
              </>
            )}
          </div>

          <Link href={user?.slug ? `/user/${user.slug}/profile/wrapped` : "/profile/wrapped"}
            className="group relative flex items-center gap-3 min-h-11 px-4 py-3 rounded-xl text-left border border-accent/30 bg-accent/[0.06] hover:bg-accent/[0.10] active:scale-[0.98] transition-[transform,background-color] overflow-hidden">
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
/** Honest heatmap: lights the most-recent `streakDays` cells (the live streak),
 *  counting back from today. Everything older is empty — no fabricated history. */
function buildHeatmap(streakDays: number): number[][] {
  const weeks = 52, days = 7
  const total = weeks * days
  const grid: number[][] = []
  for (let w = 0; w < weeks; w++) {
    const col: number[] = []
    for (let d = 0; d < days; d++) {
      const fromEnd = total - (w * days + d) - 1 // 0 = today
      col.push(fromEnd < streakDays ? (fromEnd === 0 ? 4 : 3) : 0)
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
  const user = useAuthStore((s) => s.user)
  const streakDays = (user as { streakDays?: number } | null)?.streakDays ?? 0
  const bestStreak = (user as { bestStreak?: number } | null)?.bestStreak ?? streakDays
  const grid = useMemo(() => buildHeatmap(streakDays), [streakDays])
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl bg-surface border border-border p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Flame size={15} className="text-accent" />
            Watch activity
          </div>
          <div className="text-xs text-muted mt-1">
            {streakDays > 0 ? (
              <><b className="text-[#F0883E]">{streakDays}-day streak</b>{bestStreak > streakDays && <> · best <b className="text-foreground">{bestStreak}</b></>}</>
            ) : (
              <>No streak yet — watch an episode today to start one.</>
            )}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-subtle">
          Less
          {[0, 1, 2, 3, 4].map(l => (
            <span key={l} className="w-[10px] h-[10px] rounded-[2px]" style={{ background: cellColor(l) }} />
          ))}
          More
        </div>
      </div>
      <div className="overflow-x-auto -mx-1 px-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
        <div className="min-w-max">
          <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-subtle mb-2">
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
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Now Watching
   ────────────────────────────────────────────────────────────────────── */
function NowWatching() {
  const user = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "")

  // Pick the user's most recent WATCHING / REWATCHING entry. If they
  // haven't started anything, render an empty CTA.
  const entries = listData?.data ?? []
  const current = entries
    .filter(e => e.status === "WATCHING" || e.status === "REWATCHING")
    .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())[0]

  if (!current) {
    return (
      <section className="rounded-2xl bg-surface border border-border p-4 sm:p-5 flex flex-col gap-3 items-start">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Play size={14} className="text-accent" /> Now watching
        </div>
        <div className="text-[13px] text-muted">Nothing on the screen right now.</div>
        <Link href="/discover" className="flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest text-black bg-accent hover:bg-accent-bright active:scale-95 transition-[transform,background-color]">
          <Sparkles size={13} /> Find something
        </Link>
      </section>
    )
  }

  const totalEps = current.anime?.episodes ?? 0
  const watched  = current.episodesSeen ?? 0
  const progress = totalEps > 0 ? Math.min(1, watched / totalEps) : 0
  const r = 26, c = 2 * Math.PI * r, off = c * (1 - progress)
  const title = current.anime?.title ?? "Unknown title"
  const malId = current.anime?.malId

  return (
    <section className="rounded-2xl bg-surface border border-border p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Play size={14} className="text-accent" />
          Now watching
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-surface-2">
        {current.anime?.imageUrl
          ? /* eslint-disable-next-line @next/next/no-img-element */
            <img src={current.anime.imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-70" />
          : <span className="absolute top-2 left-2 font-mono text-[9px] uppercase tracking-widest text-subtle">{title}</span>
        }
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width="68" height="68" viewBox="0 0 68 68">
          <circle cx="34" cy="34" r={r} fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.18)" strokeWidth={4} />
          <circle cx="34" cy="34" r={r} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 34 34)" />
          <text x="34" y="38" textAnchor="middle" fontSize={14} fontWeight={800} fill="#fff">
            {Math.round(progress * 100)}
          </text>
        </svg>
      </div>
      <div>
        <div className="text-sm font-bold text-foreground line-clamp-1">{title}</div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-subtle mt-1">
          EP {watched}{totalEps > 0 ? ` / ${totalEps}` : ""}
        </div>
      </div>
      <Link href={malId ? `/anime/${malId}` : "/watchlist"}
        className="flex items-center justify-center gap-2 min-h-11 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-black bg-accent hover:bg-accent-bright active:scale-95 transition-[transform,background-color]">
        <Play size={13} /> Continue
      </Link>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Stat band
   ────────────────────────────────────────────────────────────────────── */
function StatBand({ archiveCount }: { archiveCount: number }) {
  const user = useAuthStore(s => s.user)
  const streakDays = (user as { streakDays?: number } | null)?.streakDays ?? 0
  const bestStreak = (user as { bestStreak?: number } | null)?.bestStreak ?? streakDays
  const reputation = user?.reputation ?? 0

  // Series shapes are still illustrative (we don't yet store daily history
  // for arbitrary metrics) — but every headline value is real.
  const stats = [
    { id: "archive",  icon: Bookmark, value: archiveCount.toLocaleString(), label: "Archive",   sub: "Anime catalogued",      delta: archiveCount > 0 ? `${archiveCount} total` : "Empty",  up: true, color: "var(--app-accent)",      series: Array.from({ length: 8 }, (_, i) => Math.round(archiveCount * (i + 1) / 8)) },
    { id: "streak",   icon: Flame,    value: streakDays.toString(),         label: "Day streak", sub: bestStreak > streakDays ? `Best: ${bestStreak}` : "Personal best", delta: bestStreak > streakDays ? `Best ${bestStreak}` : "Current run", up: true, color: "#F0883E",                 series: Array.from({ length: 8 }, (_, i) => Math.round(streakDays * (i + 1) / 8)) },
    { id: "rep",      icon: Globe2,   value: reputation.toLocaleString(),    label: "Reputation",  sub: "XP from activity",     delta: reputation > 0 ? `${reputation} XP` : "Get started",  up: true, color: "var(--app-accent-bright)", series: Array.from({ length: 8 }, (_, i) => Math.round(reputation * (i + 1) / 8)) },
    { id: "trust",    icon: ShieldCheck, value: Math.min(99, 50 + Math.floor(reputation / 20)).toString(), label: "Trust score", sub: "Reviewer reputation",   delta: "From your activity", up: true, color: "#3FB950",                 series: [50, 60, 70, 75, 80, 85, 90, 95] },
  ]
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl bg-surface border border-border overflow-hidden divide-x divide-y lg:divide-y-0 divide-border">
      {stats.map((s, i) => {
        const Icon = s.icon
        return (
          <div key={s.id} className="p-4 sm:p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span style={{ color: s.color }}><Icon size={17} /></span>
              <Sparkline series={s.series} color={s.color} />
            </div>
            <div className="text-xl sm:text-2xl font-black text-foreground tabular-nums tracking-tighter">
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
  const user = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "")

  // Top 6 from the user's own list ranked by their personal score. Falls
  // back to "no favourites" if the user hasn't scored anything yet.
  const list = (listData?.data ?? [])
    .filter(e => (e.score ?? 0) > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 6)
    .map((e, i) => ({
      id:    e.animeId,
      rank:  i + 1,
      title: e.anime?.title ?? "Unknown",
      sub:   e.anime?.titleEnglish ?? e.anime?.type ?? "—",
      score: (e.score ?? 0) / 10 * 10,  // 1-10 scale already
      image: e.anime?.imageUrl ?? null,
      malId: e.anime?.malId ?? null,
    }))

  if (list.length === 0) {
    return (
      <section className="rounded-2xl bg-surface border border-border p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
          <Crown size={15} className="text-accent" /> All-time favorites
        </div>
        <div className="flex flex-col items-start gap-3 py-1">
          <div className="text-[13px] text-muted">Score some anime in your watchlist to see your top picks here.</div>
          <Link href="/watchlist" className="flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest text-foreground border border-border hover:bg-surface-2 active:scale-95 transition-[transform,background-color]">
            <Star size={13} /> Rate your list
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl bg-surface border border-border p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Crown size={15} className="text-accent" /> All-time favorites
        </div>
        <button className="flex items-center gap-1 text-xs font-bold text-accent hover:text-accent-bright transition-colors">
          Edit list <ChevronRight size={13} />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {list.map(f => {
          const card = (
            <>
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-border bg-surface-2">
                {f.image
                  /* eslint-disable-next-line @next/next/no-img-element */
                  ? <img src={f.image} alt={f.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  : <span className="absolute top-1.5 left-1.5 font-mono text-[8px] uppercase tracking-widest text-subtle">POSTER</span>
                }
                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-background/60 backdrop-blur text-foreground">#{f.rank}</span>
                <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-background/60 backdrop-blur text-accent-bright">
                  <Star size={9} fill="currentColor" /> {f.score}
                </span>
              </div>
              <div className="text-xs font-bold text-foreground line-clamp-1">{f.title}</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-subtle line-clamp-1">{f.sub}</div>
            </>
          )
          return f.malId
            ? <Link key={f.id} href={`/anime/${f.malId}`} className="flex flex-col gap-2 hover:opacity-90 active:scale-95 transition-[transform,opacity]">{card}</Link>
            : <div key={f.id} className="flex flex-col gap-2">{card}</div>
        })}
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Taste radar
   ────────────────────────────────────────────────────────────────────── */
function TasteRadar() {
  const user = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "")

  // Derive top genres from the user's actual list. Each genre's value is
  // the share of total tagged entries, capped at 1.0.
  const tally = new Map<string, number>()
  let totalTags = 0
  for (const e of listData?.data ?? []) {
    const gs = e.anime?.genres ?? []
    for (const g of gs) {
      const label = typeof g === "string" ? g : (g as { name?: string }).name
      if (!label) continue
      tally.set(label, (tally.get(label) ?? 0) + 1)
      totalTags++
    }
  }
  const top = Array.from(tally.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
  const data = top.length >= 3
    ? top.map(([label, count]) => ({
        label: label.length > 16 ? label.slice(0, 15) + "…" : label,
        val:   Math.min(1, count / (totalTags / Math.max(3, top.length))),
      }))
    : []

  if (data.length === 0) {
    return (
      <section className="rounded-2xl bg-surface border border-border p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
          <Heart size={14} className="text-accent" /> Taste profile
        </div>
        <div className="flex flex-col items-start gap-3 py-1">
          <div className="text-[13px] text-muted">Add a few anime to your list to see your taste DNA.</div>
          <Link href="/discover" className="flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest text-black bg-accent hover:bg-accent-bright active:scale-95 transition-[transform,background-color]">
            <Sparkles size={13} /> Browse anime
          </Link>
        </div>
      </section>
    )
  }
  // viewBox is widened horizontally (-50 → 290 = 340 wide) so left/right
  // axis labels have room to sit fully inside without clipping.
  const cx = 120, cy = 116, R = 86, N = data.length
  const ang = (i: number) => -Math.PI / 2 + i * (2 * Math.PI / N)
  const pt = (i: number, rad: number) => [cx + Math.cos(ang(i)) * rad, cy + Math.sin(ang(i)) * rad] as [number, number]
  const poly = data.map((d, i) => pt(i, R * d.val).join(",")).join(" ")
  const rings = [0.25, 0.5, 0.75, 1]
  // Anchor each label by its horizontal position so edge labels read inward.
  const anchorFor = (x: number): "start" | "middle" | "end" => {
    const dx = x - cx
    if (dx > 6) return "start"
    if (dx < -6) return "end"
    return "middle"
  }
  return (
    <section className="rounded-2xl bg-surface border border-border p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Heart size={14} className="text-accent" /> Taste profile
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">{data.length} dimensions</span>
      </div>
      <div className="flex justify-center py-1">
        <svg viewBox="-50 0 340 240" className="w-full max-w-[320px]">
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
            const [lx, ly] = pt(i, R + 18)
            return (
              <text key={i} x={lx} y={ly} textAnchor={anchorFor(lx)} dominantBaseline="middle"
                fontSize={9} fill="var(--app-muted)"
                style={{ textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "monospace" }}>
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
  const user        = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "")
  const reputation  = user?.reputation ?? 0
  const streakDays  = (user as { streakDays?: number } | null)?.streakDays ?? 0
  const archiveLen  = listData?.data?.length ?? 0
  const completed   = (listData?.data ?? []).filter(e => e.status === "COMPLETED").length

  // Derived from live counters. Each achievement is unlocked when the
  // user meets its threshold; locked ones are dimmed.
  const defs: Array<{ id: string; icon: typeof Flame; name: string; desc: string; rarity: string; tint: string; unlocked: boolean }> = [
    { id: "a1", icon: Flame,    name: "Streak Spark",   desc: "7-day watch streak",       rarity: "Common",    tint: "#F0883E", unlocked: streakDays >= 7 },
    { id: "a2", icon: Flame,    name: "Eternal Flame",  desc: "365-day watch streak",     rarity: "Legendary", tint: "#F0883E", unlocked: streakDays >= 365 },
    { id: "a3", icon: Crown,    name: "Completionist",  desc: "Finish 50 series",         rarity: "Epic",      tint: "#F2C94C", unlocked: completed >= 50 },
    { id: "a4", icon: Bookmark, name: "Archivist",      desc: "Catalogue 100 anime",      rarity: "Rare",      tint: "var(--app-accent)", unlocked: archiveLen >= 100 },
    { id: "a5", icon: Medal,    name: "Tastemaker",     desc: "Earn 500 reputation",      rarity: "Rare",      tint: "var(--app-accent-bright)", unlocked: reputation >= 500 },
    { id: "a6", icon: Sparkles, name: "Founding Shinobi", desc: "Joined Kaiveron — welcome.", rarity: "Mythic", tint: "var(--app-accent)", unlocked: !!user },
  ]
  const unlocked = defs.filter(a => a.unlocked).length

  return (
    <section className="rounded-2xl bg-surface border border-border p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Medal size={15} className="text-accent" /> Achievements
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">{unlocked} / {defs.length} unlocked</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {defs.map(a => {
          const Icon = a.icon
          return (
            <div key={a.id} className={`flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-2 transition-opacity ${a.unlocked ? "" : "opacity-40"}`}>
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
function timeShort(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000)     return "now"
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`
  return `${Math.floor(diff / 86_400_000)}d`
}

function ActivityFeed() {
  const user = useAuthStore(s => s.user)
  const { data: activityData } = useActivityFeed("profile", user?.id)

  type ActivityRow = {
    id:           string
    kind:         string
    verb?:        string | null
    body?:        string | null
    score?:       number | null
    linkedAnime?: { title?: string | null; episodes?: number | null } | null
    createdAt:    string
  }

  const events = ((activityData?.pages.flatMap(p => p.data) ?? []) as ActivityRow[])
    .slice(0, 6)
    .map((a) => {
      const animeTitle = a.linkedAnime?.title ?? ""
      if (a.kind === "LIST_UPDATE") {
        if (a.verb === "RATED")     return { id: a.id, icon: Star,     tint: "#F2C94C",                  text: "Rated",      strong: animeTitle, meta: `${a.score ?? "?"} ★`,           time: timeShort(a.createdAt) }
        if (a.verb === "COMPLETED") return { id: a.id, icon: Check,    tint: "#3FB950",                  text: "Completed",  strong: animeTitle, meta: a.linkedAnime?.episodes ? `${a.linkedAnime.episodes} episodes` : "", time: timeShort(a.createdAt) }
        if (a.verb === "STARTED")   return { id: a.id, icon: Play,     tint: "var(--app-accent)",         text: "Started",    strong: animeTitle, meta: "Watching",                       time: timeShort(a.createdAt) }
        return { id: a.id, icon: Bookmark, tint: "#8B5CF6",                  text: "Updated",    strong: animeTitle, meta: a.verb ?? "",                     time: timeShort(a.createdAt) }
      }
      if (a.kind === "REVIEW") return { id: a.id, icon: Pencil,   tint: "var(--app-accent)",        text: "Reviewed",   strong: animeTitle, meta: a.body ? `"${a.body.slice(0, 60)}…"` : "", time: timeShort(a.createdAt) }
      if (a.kind === "TEXT")   return { id: a.id, icon: Pencil,   tint: "var(--app-accent)",        text: "Posted",     strong: (a.body ?? "").slice(0, 60),  meta: "",                              time: timeShort(a.createdAt) }
      return                     { id: a.id, icon: Sparkles, tint: "var(--app-accent-bright)", text: "Activity",   strong: animeTitle || (a.body ?? "").slice(0, 60), meta: "",            time: timeShort(a.createdAt) }
    })

  if (events.length === 0) {
    return (
      <section className="rounded-2xl bg-surface border border-border p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
          <Clock size={14} className="text-accent" /> Recent activity
        </div>
        <div className="flex flex-col items-start gap-3 py-1">
          <div className="text-[13px] text-muted">Your activity will appear here as you watch + rate + post.</div>
          <Link href="/discover" className="flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest text-foreground border border-border hover:bg-surface-2 active:scale-95 transition-[transform,background-color]">
            <Play size={13} /> Start watching
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl bg-surface border border-border p-4 sm:p-5">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-5 pb-32">
      <style jsx global>{`
        @keyframes aurora {
          0%   { transform: translateX(-6%) translateY(0)    scale(1.05); }
          100% { transform: translateX(8%)  translateY(-8%)  scale(1.18); }
        }
      `}</style>

      <Hero isOwner={isOwner} />

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Heatmap />
        <NowWatching />
      </div>

      <StatBand archiveCount={archiveCount} />

      <InviteCard />

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start">
        <Favorites />
        <TasteRadar />
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2 items-start">
        <Achievements />
        <ActivityFeed />
      </div>
    </div>
  )
}
