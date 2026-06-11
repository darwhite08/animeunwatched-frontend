"use client"

import { useEffect } from "react"
import { Star, BookOpen, Trophy, Eye } from "lucide-react"
import { TiltCard } from "@/components/ui/TiltCard"
import type { Anime } from "@/lib/data/anime"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated } from "@/lib/api/types"
import { getSocket } from "@/lib/socket"

type UserStats = {
  watching: number
  completed: number
  planToWatch: number
  onHold: number
  dropped: number
  total: number
}

interface AnimeStatsCardProps {
  anime: Anime
}

export function AnimeStatsCard({ anime }: AnimeStatsCardProps) {
  const qc = useQueryClient()

  // Real first-party review count for this anime.
  const { data: reviewsData } = useQuery({
    queryKey: ["anime-review-count", anime.id],
    queryFn: () => api<Paginated<{ id: string }>>(`/anime/${anime.id}/reviews?limit=1`),
    enabled: !!anime.id,
  })

  // Real first-party community list stats (how many Kaiveron users are
  // watching / have it on a list). No fabricated numbers.
  const { data: userStats } = useQuery({
    queryKey: ["anime-user-stats", anime.id],
    queryFn: () => api<UserStats>(`/anime/${anime.id}/user-stats`),
    enabled: !!anime.id,
    refetchOnWindowFocus: true,
  })

  // Live counts: when anyone changes their list for this anime the backend
  // emits anime.list-changed to the anime room — refetch the stats.
  useEffect(() => {
    if (!anime.id) return
    const room = `anime:${anime.id}`
    const onChange = () => qc.invalidateQueries({ queryKey: ["anime-user-stats", anime.id] })
    const join = () => {
      const s = getSocket()
      if (!s) { retry = setTimeout(join, 600); return }
      s.emit("room:join", room)
      s.on("anime.list-changed", onChange)
    }
    let retry: ReturnType<typeof setTimeout> | null = null
    join()
    return () => {
      if (retry) clearTimeout(retry)
      const s = getSocket()
      if (s) { s.off("anime.list-changed", onChange); s.emit("room:leave", room) }
    }
  }, [anime.id, qc])

  const reviewCount = reviewsData?.meta?.total ?? 0
  const watching = userStats?.watching ?? 0
  const onLists = userStats?.total ?? 0

  const fillPct = Math.round((anime.rating / 10) * 100)
  const scoreColor = anime.rating >= 9 ? "bg-emerald-500" : "bg-accent-bright"

  return (
    <TiltCard intensity={5} scale={1.01} glare={false}>
      <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">
          Community Stats
        </h3>

        {/* Community Score — the canonical score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted flex items-center gap-1.5">
              <Star size={11} className="text-accent-bright" /> Community Score
            </span>
            <span className="text-sm font-black text-foreground">{anime.rating.toFixed(1)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface overflow-hidden">
            <div
              className={`h-full rounded-full ${scoreColor} transition-all duration-700`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        {/* Real first-party stat rows */}
        {[
          { icon: Eye,      label: "Watching",      value: watching.toLocaleString()    },
          { icon: Star,     label: "On watchlists", value: onLists.toLocaleString()     },
          { icon: BookOpen, label: "Reviews",       value: reviewCount.toLocaleString() },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="text-subtle font-medium flex items-center gap-1.5">
              <Icon size={11} className="text-subtle" /> {label}
            </span>
            <span className="font-black text-muted">{value}</span>
          </div>
        ))}

        {/* Rank badge — real catalog rank */}
        {anime.rank > 0 && (
          <div className="pt-1 border-t border-border flex items-center gap-2">
            <Trophy size={11} className="text-accent-bright/70" />
            <span className="text-[10px] font-black text-subtle">
              <span className="text-accent-bright/90">#{anime.rank}</span> on Neural Archive
            </span>
          </div>
        )}
      </div>
    </TiltCard>
  )
}
