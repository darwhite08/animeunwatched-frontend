"use client"

import { useState } from "react"
import { Trophy, Crown, Shield } from "lucide-react"
import { useClubLeaderboard } from "@/hooks/useClubs"
import { useAuthStore } from "@/stores/auth.store"

export function ClubLeaderboardTab({ slug, ownerId }: { slug: string; ownerId?: string }) {
  const myId = useAuthStore((s) => s.user?.id)
  const [period, setPeriod] = useState<"week" | "all">("all")
  const { data: rows, isLoading } = useClubLeaderboard(slug, period)
  const medal = (r: number) => (r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `${r}`)

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["all", "week"] as const).map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className={`rounded-full px-3 py-1 text-xs font-semibold ${period === p ? "bg-accent text-black" : "bg-surface text-muted hover:text-foreground"}`}>{p === "all" ? "All time" : "This week"}</button>
        ))}
      </div>
      {isLoading ? <p className="py-10 text-center text-sm text-muted">Loading…</p> : !rows?.length ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface py-12 text-center">
          <Trophy size={28} className="text-muted" />
          <p className="text-sm font-semibold text-foreground">No activity yet</p>
          <p className="text-xs text-muted">Earn XP by posting, replying, and joining events.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.user.id} className={`flex items-center gap-3 rounded-xl border p-3 ${r.user.id === myId ? "border-accent bg-accent/5" : "border-border bg-surface"}`}>
              <span className="w-8 text-center text-sm font-bold text-foreground">{medal(r.rank)}</span>
              <div className="flex min-w-0 flex-1 items-center gap-1">
                <span className="truncate text-sm font-semibold text-foreground">{r.user.displayName ?? r.user.username}</span>
                {ownerId === r.user.id ? <Crown size={13} className="text-amber-400" /> : r.role === "ADMIN" ? <Shield size={13} className="text-accent" /> : r.role === "MOD" ? <Shield size={13} className="text-sky-400" /> : null}
              </div>
              <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-bold text-accent">{r.xp} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
