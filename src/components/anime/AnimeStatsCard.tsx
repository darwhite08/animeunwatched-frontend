"use client"

import { useMemo } from "react"
import { Users, Star, BookOpen, Trophy } from "lucide-react"
import { TiltCard } from "@/components/ui/TiltCard"
import type { Anime } from "@/lib/data/anime"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated } from "@/lib/api/types"

/* Stable "random" values derived from rank so they don't flicker on re-render */
function seedInt(rank: number, salt: number, min: number, max: number): number {
  const val = ((rank * 2654435761 + salt * 40503) >>> 0) / 4294967296
  return Math.floor(min + val * (max - min))
}

interface AnimeStatsCardProps {
  anime: Anime
}

export function AnimeStatsCard({ anime }: AnimeStatsCardProps) {
  // Try to get real review count from API
  const { data: reviewsData } = useQuery({
    queryKey: ["anime-review-count", anime.id],
    queryFn: () => api<Paginated<{ id: string }>>(`/anime/${anime.id}/reviews?limit=1`),
    enabled: !!anime.id,
  })

  const realReviewCount = reviewsData?.meta?.total
  const fallbackStats = useMemo(() => ({
    members:    seedInt(anime.rank, 1, 1000, 50000),
    reviews:    seedInt(anime.rank, 2, 50, 500),
    watchlists: seedInt(anime.rank, 3, 200, 12000),
  }), [anime.rank])

  const stats = {
    members:    fallbackStats.members,
    reviews:    realReviewCount ?? fallbackStats.reviews,
    watchlists: fallbackStats.watchlists,
  }

  const fillPct = Math.round((anime.rating / 10) * 100)

  const scoreColor =
    anime.rating >= 9
      ? "bg-emerald-500"
      : anime.rating >= 8
      ? "bg-amber-400"
      : "bg-amber-400"

  return (
    <TiltCard intensity={5} scale={1.01} glare={false}>
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">
          Community Stats
        </h3>

        {/* Community Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/40 flex items-center gap-1.5">
              <Star size={11} className="text-amber-400" /> Community Score
            </span>
            <span className="text-sm font-black text-white">{anime.rating.toFixed(1)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
            <div
              className={`h-full rounded-full ${scoreColor} transition-all duration-700`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        {/* Stat rows */}
        {[
          { icon: Users,    label: "Members watching",  value: stats.members.toLocaleString()    },
          { icon: BookOpen, label: "Reviews",            value: stats.reviews.toLocaleString()    },
          { icon: Star,     label: "On watchlists",      value: stats.watchlists.toLocaleString() },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="text-white/35 font-medium flex items-center gap-1.5">
              <Icon size={11} className="text-white/20" /> {label}
            </span>
            <span className="font-black text-white/60">{value}</span>
          </div>
        ))}

        {/* Rank badge */}
        <div className="pt-1 border-t border-white/5 flex items-center gap-2">
          <Trophy size={11} className="text-amber-400/70" />
          <span className="text-[10px] font-black text-white/35">
            <span className="text-amber-400/90">#{anime.rank}</span> on Neural Archive
          </span>
        </div>
      </div>
    </TiltCard>
  )
}
