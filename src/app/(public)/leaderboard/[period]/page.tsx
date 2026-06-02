"use client"

import { use } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Trophy, Flame, Star, ArrowLeft, Loader2 } from "lucide-react"
import { useLeaderboard } from "@/hooks/useLeaderboard"
import { Avatar } from "@/components/ui/Avatar"

const VALID_PERIODS = ["weekly", "monthly", "all-time"] as const
type Period = typeof VALID_PERIODS[number]

const PERIOD_LABELS: Record<Period, string> = {
  "weekly":   "This Week",
  "monthly":  "This Month",
  "all-time": "All Time",
}

const RANK_STYLES = [
  { color: "text-accent-bright",  bg: "bg-accent/15", border: "border-accent/30" },
  { color: "text-muted",  bg: "bg-surface-2", border: "border-border" },
  { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
]

export default function LeaderboardPeriodPage({ params }: { params: Promise<{ period: string }> }) {
  const { period } = use(params)
  const validPeriod: Period = VALID_PERIODS.includes(period as Period) ? (period as Period) : "all-time"

  const { data, isLoading } = useLeaderboard(50, validPeriod)
  const users = data?.data ?? []

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back + period tabs */}
        <Link href="/leaderboard"
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted hover:text-muted transition-colors mb-6 group">
          <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" /> All Rankings
        </Link>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Trophy size={22} className="text-accent-bright" />
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">
              {PERIOD_LABELS[validPeriod]}<span style={{ color: "var(--app-accent)" }}>.</span>
            </h1>
          </div>
          <div className="flex gap-2">
            {VALID_PERIODS.map(p => (
              <Link key={p} href={`/leaderboard/${p}`}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  p === validPeriod ? "text-black" : "bg-surface border border-border text-muted hover:text-muted"
                }`}
                style={p === validPeriod ? { background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))" } : undefined}>
                {PERIOD_LABELS[p]}
              </Link>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-accent-bright" /></div>
        ) : users.length === 0 ? (
          <p className="text-center py-24 text-subtle text-sm">No data for this period yet.</p>
        ) : (
          <div className="space-y-2">
            {users.map((u, i) => {
              const rs = RANK_STYLES[i] ?? { color: "text-subtle", bg: "bg-surface", border: "border-border" }
              return (
                <motion.div key={u.username}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.025 }}>
                  <Link href={`/u/${u.username}`}
                    className={`flex items-center gap-4 p-4 rounded-2xl border bg-surface hover:bg-surface transition-all ${i < 3 ? rs.border : "border-border hover:border-border"}`}>
                    {/* Rank */}
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 border ${i < 3 ? `${rs.bg} ${rs.border} ${rs.color}` : "bg-surface border-border text-subtle"}`}>
                      {u.rank}
                    </div>
                    {/* Avatar */}
                    <Avatar src={(u as { avatarUrl?: string | null }).avatarUrl} name={u.displayName} size={40} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-foreground">{u.displayName}</p>
                      <p className="text-[9px] text-subtle">@{u.username} · Lv.{u.level}</p>
                    </div>
                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-5 text-xs text-subtle shrink-0">
                      <span className="flex items-center gap-1"><Trophy size={11} className="text-accent-bright" />{u.reputation.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Star size={11} className="text-accent-bright" />{u.archived}</span>
                      <span className="flex items-center gap-1"><Flame size={11} className="text-orange-400" />{u.reviews}</span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
