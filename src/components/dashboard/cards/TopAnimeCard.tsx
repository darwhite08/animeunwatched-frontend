"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Star, ChevronRight } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import { useUserList } from "@/hooks/useLists"
import { useAuthStore } from "@/stores/auth.store"
import { useMemo } from "react"
import type { AnimeDTO } from "@/lib/api/types"

function mapBrowse(a: AnimeDTO, i: number) {
  return { id: String(a.malId), title: a.title, rating: a.score ?? 0, studio: a.studios[0] ?? "Unknown", image: a.imageUrl ?? "", rank: i + 1 }
}

/* ── Score dot colour ── */
function scoreColour(score: number) {
  if (score >= 9) return "text-accent-bright"
  if (score >= 7) return "text-accent-bright"
  return "text-muted"
}

/* ── Component ── */
export default function TopAnimeCard() {
  const user = useAuthStore(s => s.user)

  // Primary: COMPLETED entries from user's list, sorted by score descending
  const { data: listData, isLoading: listLoading } = useUserList(user?.username ?? "", "COMPLETED")

  // Fallback: browse API top rated
  const completed = useMemo(() => {
    return (listData?.data ?? [])
      .filter(e => e.score !== null)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 5)
      .map((e, i) => ({
        id: String(e.anime?.malId ?? e.animeId),
        title: e.anime?.title ?? "Unknown",
        rating: e.score ?? e.anime?.score ?? 0,
        studio: e.anime?.studios?.[0] ?? "Unknown",
        image: e.anime?.imageUrl ?? "",
        rank: i + 1,
      }))
  }, [listData])

  // Only fetch browse fallback when list is done loading and has no scored completed entries
  const needsFallback = !listLoading && completed.length === 0
  const { data: browseData, isLoading: browseLoading } = useBrowseAnime({ limit: 5 })

  const TOP_FIVE = completed.length > 0
    ? completed
    : (browseData?.data ?? []).map(mapBrowse)

  const isLoading = listLoading || (needsFallback && browseLoading)

  if (isLoading) {
    return (
      <div className="p-8 rounded-[2.5rem] border border-border bg-surface relative overflow-hidden h-48 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-amber-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 rounded-[2.5rem] border border-border bg-surface relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-8 -right-8 w-40 h-40 bg-accent/5 blur-[60px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-7 relative z-10">
        <div className="flex items-center gap-2">
          <Star size={14} className="text-accent-bright" fill="currentColor" />
          <h4 className="text-xs font-black uppercase tracking-[0.28em] text-subtle">
            {completed.length > 0 ? "Your Top Rated" : "Top Anime"}
          </h4>
        </div>
        <Link
          href="/rate"
          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-accent-bright/60 hover:text-accent-bright transition-colors"
        >
          Rate Another <ChevronRight size={10} />
        </Link>
      </div>

      {/* Empty state */}
      {TOP_FIVE.length === 0 && (
        <div className="py-6 text-center">
          <Star size={20} className="mx-auto mb-2 text-subtle" fill="currentColor" />
          <p className="text-[10px] text-subtle font-black uppercase tracking-widest">No rated anime yet</p>
          <Link href="/bestanimelist" className="mt-2 block text-[9px] text-accent-bright hover:text-accent-bright font-black uppercase tracking-widest">
            Browse & Rate →
          </Link>
        </div>
      )}

      {/* Ranked list */}
      <ol className="space-y-2 relative z-10">
        {TOP_FIVE.map((anime, i) => {
          const personal = anime.rating

          return (
            <motion.li
              key={anime.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                href={`/anime/${anime.id}`}
                className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-surface transition-colors"
              >
                {/* Rank */}
                <span className={`w-5 text-center text-xs font-black shrink-0 ${
                  i === 0 ? "text-accent-bright" : "text-subtle"
                }`}>
                  #{i + 1}
                </span>

                {/* Cover thumbnail */}
                <div className="h-10 w-8 rounded-xl overflow-hidden shrink-0 bg-surface">
                  <img loading="lazy" decoding="async"
                    src={anime.image}
                    alt={anime.title}
                    className="w-full h-full object-cover brightness-75 group-hover:brightness-90 transition-all"
                  />
                </div>

                {/* Title + studio */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-muted group-hover:text-foreground transition-colors truncate leading-tight">
                    {anime.title}
                  </p>
                  <p className="text-[9px] text-subtle uppercase tracking-widest mt-0.5 truncate">
                    {anime.studio}
                  </p>
                </div>

                {/* Score */}
                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  <span className={`text-base font-black leading-none ${scoreColour(personal)}`}>
                    {personal.toFixed(1)}
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-subtle">
                    {completed.length > 0 ? "Rated" : "Score"}
                  </span>
                </div>
              </Link>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
