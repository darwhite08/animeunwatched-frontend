"use client"

import { use } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Flame, Star, CheckCircle2, Trophy, Users, ExternalLink, Download, Copy } from "lucide-react"
import { useUserProfile } from "@/hooks/useUsers"
import { useUserList } from "@/hooks/useLists"
import { useToast } from "@/stores/toast.store"
import { useMemo } from "react"
import type { AnimeDTO } from "@/lib/api/types"

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,var(--app-accent),#d97706)",
  "linear-gradient(135deg,#8b5cf6,#6d28d9)",
  "linear-gradient(135deg,#10b981,#059669)",
  "linear-gradient(135deg,#ef4444,#dc2626)",
  "linear-gradient(135deg,#3b82f6,#1d4ed8)",
]

function grad(name: string) {
  return AVATAR_GRADIENTS[(name.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length]
}

function levelFromRep(rep: number) {
  if (rep >= 5000) return { level: 99, title: "Legendary Shinobi", color: "var(--app-accent)" }
  if (rep >= 2000) return { level: Math.floor(rep / 50) + 20, title: "Elite Jonin",     color: "#8b5cf6" }
  if (rep >= 500)  return { level: Math.floor(rep / 25) + 10, title: "Arch-Mage",       color: "#3b82f6" }
  if (rep >= 100)  return { level: Math.floor(rep / 10) + 5,  title: "Flame Grade II",  color: "#f97316" }
  return           { level: Math.max(1, Math.floor(rep / 5)), title: "Rookie Shinobi",  color: "#6b7280" }
}

export default function ShareProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const { push } = useToast()
  const { data: profileData, isLoading } = useUserProfile(username)
  const { data: listData } = useUserList(username)

  const user = profileData?.user
  const entries = listData?.data ?? []

  const stats = useMemo(() => {
    const completed = entries.filter(e => e.status === "COMPLETED").length
    const watching  = entries.filter(e => e.status === "WATCHING").length
    const total     = entries.length
    const scores    = entries.map(e => e.score).filter(Boolean) as number[]
    const avgScore  = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—"
    const topGenres: Record<string, number> = {}
    entries.forEach(e => {
      const anime = e.anime as AnimeDTO | null
      if (anime?.genres) {
        anime.genres.forEach(g => { topGenres[g] = (topGenres[g] ?? 0) + 1 })
      }
    })
    const top3Genres = Object.entries(topGenres).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g]) => g)
    const topAnime = entries
      .filter(e => e.status === "COMPLETED" && e.score && e.score >= 8)
      .slice(0, 3)
      .map(e => ({ title: (e.anime as AnimeDTO | null)?.title ?? "Unknown", score: e.score ?? 8 }))
    return { completed, watching, total, avgScore, top3Genres, topAnime }
  }, [entries])

  const displayName = user?.displayName ?? username
  const rep = user?.reputation ?? 0
  const streak = user?.streakDays ?? 0
  const { level, title, color } = levelFromRep(rep)

  const handleCopyLink = () => {
    const url = `${window.location.origin}/share/${username}`
    navigator.clipboard.writeText(url).then(() => push("Profile link copied!", "success")).catch(() => push("Failed to copy", "error"))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent/30 border-t-amber-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-16">
      <div className="max-w-xl mx-auto px-6 space-y-8">

        {/* Label */}
        <div className="text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-accent-bright/60">Kaiveron Profile</p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[2.5rem] border border-border"
          style={{ background: "linear-gradient(160deg,var(--app-bg),var(--app-bg))" }}
        >
          {/* Background glow */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] opacity-30"
            style={{ background: color }} />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-[80px] opacity-15"
            style={{ background: "var(--app-accent)" }} />

          <div className="relative z-10 p-8 space-y-8">

            {/* Header */}
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-3xl flex items-center justify-center text-3xl font-black shrink-0"
                style={{ background: grad(displayName) }}>
                {user?.avatarUrl
                  ? <img loading="lazy" decoding="async" src={user.avatarUrl} alt={displayName} className="w-full h-full rounded-3xl object-cover" />
                  : displayName[0]?.toUpperCase()
                }
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-black tracking-tighter text-foreground uppercase italic truncate">{displayName}</h1>
                <p className="text-xs text-muted mt-0.5">@{username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                    style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}>
                    Lv.{level} {title}
                  </span>
                  {streak > 0 && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-orange-500/10 border border-orange-500/25 text-orange-400">
                      <Flame size={9} /> {streak}d streak
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Watched",  value: stats.completed, icon: CheckCircle2, color: "text-emerald-400" },
                { label: "Watching", value: stats.watching,  icon: Star,         color: "text-accent-bright"   },
                { label: "Avg Score", value: stats.avgScore, icon: Trophy,       color: "text-violet-400"  },
              ].map(({ label, value, icon: Icon, color: c }) => (
                <div key={label} className="text-center p-4 rounded-2xl bg-surface border border-border space-y-1">
                  <Icon size={14} className={`mx-auto ${c}`} />
                  <p className="text-xl font-black text-foreground">{value}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-subtle">{label}</p>
                </div>
              ))}
            </div>

            {/* Top genres */}
            {stats.top3Genres.length > 0 && (
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">Anime DNA</p>
                <div className="flex flex-wrap gap-2">
                  {stats.top3Genres.map(g => (
                    <span key={g} className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-surface border border-border text-muted">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Top rated anime */}
            {stats.topAnime.length > 0 && (
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">Top Picks</p>
                <div className="space-y-2">
                  {stats.topAnime.map((a, i) => (
                    <div key={a.title} className="flex items-center gap-3 text-sm">
                      <span className="text-[9px] font-black" style={{ color }}>{i + 1}</span>
                      <span className="flex-1 text-muted truncate font-medium">{a.title}</span>
                      <span className="flex items-center gap-0.5 text-[10px] font-black text-accent-bright">
                        <Star size={9} className="fill-accent-bright" /> {a.score}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Kaiveron watermark */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <span className="text-xs font-black italic text-subtle">Kaiveron</span>
              <span className="flex-1 h-px bg-surface" />
              <span className="text-[9px] text-subtle uppercase tracking-widest">kaiveron.app</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-surface border border-border text-xs font-black uppercase tracking-widest text-muted hover:text-foreground hover:border-border transition-all"
          >
            <Copy size={12} /> Copy Link
          </button>
          <Link
            href={`/u/${username}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-black transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))", boxShadow: "0 4px 20px color-mix(in srgb, var(--app-accent) 30%, transparent)" }}
          >
            <ExternalLink size={12} /> View Profile
          </Link>
        </div>

        {/* CTA for non-users */}
        <div className="p-5 rounded-2xl border border-border bg-surface text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Users size={14} className="text-accent-bright" />
            <p className="text-xs font-black text-muted">Build your own anime profile</p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-black"
            style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))" }}
          >
            Join Kaiveron Free →
          </Link>
        </div>
      </div>
    </div>
  )
}
