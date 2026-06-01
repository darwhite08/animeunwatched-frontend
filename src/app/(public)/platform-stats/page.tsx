"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  Users, MessageSquare, BookOpen, Shield, Star, FileText, List,
  Trophy, Flame, Clock, Zap, RefreshCw,
} from "lucide-react"
import { AnimatedCounterText } from "@/components/ui/AnimatedCounter"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"

/* ─── Fallback data ─── */
const FALLBACK_STATS = {
  users: 12402,
  posts: 48921,
  anime: 24,
  clubs: 187,
  reviews: 3842,
  blogs: 291,
  listEntries: 142803,
}

const FALLBACK_TOP: { malId: number; title: string; score: number; imageUrl: string; type: string; year: number }[] = []

/* ─── Types ─── */
type PlatformStats = typeof FALLBACK_STATS
type TopAnimeEntry = (typeof FALLBACK_TOP)[number]

/* ─── Stat card config ─── */
const STAT_CONFIG = [
  { key: "users" as const,       icon: Users,         label: "Shinobi Members",  color: "indigo",   suffix: "" },
  { key: "posts" as const,       icon: MessageSquare, label: "Community Posts",   color: "violet",   suffix: "" },
  { key: "anime" as const,       icon: BookOpen,      label: "Anime in Archive",  color: "fuchsia",  suffix: "" },
  { key: "clubs" as const,       icon: Shield,        label: "Active Clubs",      color: "cyan",     suffix: "" },
  { key: "reviews" as const,     icon: Star,          label: "Reviews Written",   color: "amber",    suffix: "" },
  { key: "blogs" as const,       icon: FileText,      label: "Blog Posts",        color: "rose",     suffix: "" },
  { key: "listEntries" as const, icon: List,          label: "List Entries",      color: "emerald",  suffix: "" },
]

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  indigo:  { bg: "bg-accent/10",  border: "border-accent/20",  text: "text-accent-bright",  glow: "bg-accent" },
  violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/20",  text: "text-violet-400",  glow: "bg-violet-500" },
  fuchsia: { bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20", text: "text-fuchsia-400", glow: "bg-fuchsia-500" },
  cyan:    { bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    text: "text-cyan-400",    glow: "bg-cyan-500" },
  amber:   { bg: "bg-accent/10",   border: "border-accent/20",   text: "text-accent-bright",   glow: "bg-accent" },
  rose:    { bg: "bg-rose-500/10",    border: "border-rose-500/20",    text: "text-rose-400",    glow: "bg-rose-500" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", glow: "bg-emerald-500" },
}

/* ─── "By the Numbers" big stats ─── */
const BIG_STATS = [
  { icon: Zap,    label: "Total XP Distributed", value: "142M",  sub: "across all Shinobi"     },
  { icon: Flame,  label: "Avg Streak Length",     value: "22",    sub: "days per active member" },
  { icon: Star,   label: "Reviews Submitted",     value: "3.8k",  sub: "community voices"       },
  { icon: Clock,  label: "Hours Logged",          value: "1.2M",  sub: "watching anime"         },
]

/* ─── Live pulse indicator ─── */
function LivePulse() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Live</span>
    </span>
  )
}

/* ─── Page ─── */
export default function StatsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /* browse anime for fallback top list */
  const { data: browseData } = useBrowseAnime({ limit: 50 })
  const browseTopAnime = (browseData?.data ?? []).slice(0, 10).map((a: AnimeDTO) => ({
    malId: a.malId,
    title: a.title,
    score: a.score ?? 0,
    imageUrl: a.imageUrl ?? "",
    type: a.type ?? "TV",
    year: a.year ?? 0,
  }))

  /* platform stats */
  const statsQuery = useQuery<PlatformStats>({
    queryKey: ["analytics/stats", refreshKey],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE ?? ""}/api/v1/analytics/stats`,
        { credentials: "include" },
      )
      if (!res.ok) throw new Error("stats unavailable")
      const json = await res.json()
      return json.stats ?? json
    },
    placeholderData: FALLBACK_STATS,
    retry: false,
  })

  /* top anime */
  const topQuery = useQuery<TopAnimeEntry[]>({
    queryKey: ["analytics/top-anime", refreshKey],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE ?? ""}/api/v1/analytics/top-anime`,
        { credentials: "include" },
      )
      if (!res.ok) throw new Error("top anime unavailable")
      const json = await res.json()
      return json.data ?? json
    },
    placeholderData: FALLBACK_TOP,
    retry: false,
  })

  const stats: PlatformStats = statsQuery.data ?? FALLBACK_STATS
  const topAnime: TopAnimeEntry[] = topQuery.data ?? (browseTopAnime.length > 0 ? browseTopAnime : FALLBACK_TOP)

  /* auto-refresh every 60s */
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRefreshKey((k) => k + 1)
      setLastUpdated(new Date())
    }, 60_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleManualRefresh = () => {
    setRefreshKey((k) => k + 1)
    setLastUpdated(new Date())
  }

  const formatLastUpdated = (d: Date) => {
    const diff = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diff < 10) return "just now"
    if (diff < 60) return `${diff}s ago`
    return `${Math.floor(diff / 60)}m ago`
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-accent/7 blur-[130px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-accent/25 bg-accent/8 text-accent-bright mb-8"
          >
            <LivePulse />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Platform Stats</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.92] text-foreground"
          >
            The Numbers<span className="text-accent-bright">.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-6 text-muted text-base max-w-xl mx-auto leading-relaxed"
          >
            Live platform metrics across every Shinobi, club, post, and review on Kaiveron.
          </motion.p>
        </div>
      </section>

      {/* ── 7 Stat Cards ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {STAT_CONFIG.map((cfg, i) => {
            const c = COLOR_MAP[cfg.color]
            const Icon = cfg.icon
            return (
              <motion.div
                key={cfg.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`relative overflow-hidden rounded-3xl border ${c.border} bg-surface p-6 group hover:border-opacity-40 transition-all`}
              >
                <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-15 transition-opacity ${c.glow}`} />
                <div className={`p-2.5 rounded-xl ${c.bg} ${c.text} w-fit mb-4`}>
                  <Icon size={16} />
                </div>
                <p className="text-3xl font-black tracking-tighter text-foreground">
                  <AnimatedCounterText value={stats[cfg.key]} duration={1800} />
                </p>
                <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${c.text} mt-2 opacity-80`}>
                  {cfg.label}
                </p>
              </motion.div>
            )
          })}

          {/* 8th card — empty / filler for grid alignment on lg */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="hidden lg:flex items-center justify-center rounded-3xl border border-white/4 bg-white/[0.01] p-6"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle text-center">
              More metrics<br />coming soon
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Top Anime in the Archive ── */}
      <section className="border-t border-border py-16">
        <div className="max-w-5xl mx-auto px-6 mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-subtle mb-2">Archive</p>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">
            Top Anime in the Archive<span className="text-violet-500">.</span>
          </h2>
        </div>

        {/* Horizontal scroll */}
        <div className="px-6 overflow-x-auto no-scrollbar">
          <div className="flex gap-4 w-max pb-3 max-w-none ml-[max(1.5rem,calc((100vw-80rem)/2))]">
            {topAnime.map((anime, i) => (
              <motion.div
                key={anime.malId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative w-40 shrink-0 group"
              >
                {/* Rank badge */}
                <div className="absolute top-2 left-2 z-10 h-6 w-6 rounded-lg bg-black/70 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-[10px] font-black text-muted">#{i + 1}</span>
                </div>

                {/* Cover */}
                <div className="relative h-56 w-full rounded-2xl overflow-hidden bg-surface">
                  <Image
                    src={anime.imageUrl}
                    alt={anime.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="160px"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {/* Score overlay */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <Star size={9} className="text-accent-bright fill-accent-bright" />
                    <span className="text-[10px] font-black text-foreground">{anime.score.toFixed(1)}</span>
                  </div>
                </div>

                {/* Title */}
                <div className="mt-2.5 px-0.5">
                  <p className="text-xs font-black text-muted leading-snug line-clamp-2 group-hover:text-foreground transition-colors">
                    {anime.title}
                  </p>
                  <p className="text-[9px] font-bold text-subtle mt-0.5 uppercase tracking-wider">
                    {anime.type} · {anime.year}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── By the Numbers ── */}
      <section className="border-t border-border bg-white/[0.012] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-subtle mb-2">Milestones</p>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">
              By the Numbers<span style={{color:"var(--app-accent)"}}>.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {BIG_STATS.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="text-center space-y-3"
                >
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-accent/10 border border-accent/15 flex items-center justify-center text-accent-bright">
                    <Icon size={20} />
                  </div>
                  <p className="text-4xl font-black tracking-tighter text-foreground">{s.value}</p>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted">{s.label}</p>
                    <p className="text-[9px] text-subtle mt-0.5">{s.sub}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Footer / refresh ── */}
      <div className="max-w-5xl mx-auto px-6 pt-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[10px] text-subtle">
          <LivePulse />
          <span>Last updated {formatLastUpdated(lastUpdated)} · auto-refreshes every 60s</span>
        </div>
        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-accent-bright hover:text-accent-bright transition-colors"
        >
          <RefreshCw size={11} className={statsQuery.isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

    </div>
  )
}
