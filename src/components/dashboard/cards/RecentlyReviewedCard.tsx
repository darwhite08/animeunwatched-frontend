"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { PenSquare, Star } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated } from "@/lib/api/types"

/* ── Types ── */
type ApiReview = {
  id: string
  score: number
  body: string
  createdAt: string
  anime?: { title: string; studios: string[] }
}

type Review = {
  id: string
  animeTitle: string
  studio: string
  score: number
  excerpt: string
  date: string
}

/* ── Helpers ── */
function relativeDate(iso: string): string {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`
  return `${Math.floor(d / 86_400_000)}d ago`
}

function ScoreStars({ score }: { score: number }) {
  const full  = Math.floor(score / 2)
  const half  = score % 2 >= 1 ? 1 : 0
  const empty = 5 - full - half

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} size={9} className="text-amber-400" fill="currentColor" />
      ))}
      {half === 1 && (
        <Star size={9} className="text-amber-400/50" fill="currentColor" />
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} size={9} className="text-white/10" fill="currentColor" />
      ))}
      <span className="ml-1.5 text-[9px] font-black text-white/40">{score}/10</span>
    </div>
  )
}

/* ── Component ── */
export default function RecentlyReviewedCard() {
  const { push } = useToast()
  const user = useAuthStore(s => s.user)

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["my-recent-reviews", user?.id],
    queryFn:  () => api<Paginated<ApiReview>>(`/reviews?limit=3`),
    enabled:  !!user,
  })

  const reviews: Review[] = (reviewsData?.data ?? []).map(r => ({
    id: r.id,
    animeTitle: r.anime?.title ?? "Unknown Anime",
    studio: r.anime?.studios?.[0] ?? "Unknown Studio",
    score: r.score,
    excerpt: r.body.slice(0, 120) + (r.body.length > 120 ? "…" : ""),
    date: relativeDate(r.createdAt),
  }))

  return (
    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-violet-500/5 blur-[60px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-7 relative z-10">
        <div className="flex items-center gap-2">
          <PenSquare size={14} className="text-amber-400" />
          <h4 className="text-xs font-black uppercase tracking-[0.28em] text-white/30">Recent Reviews</h4>
        </div>
        <button
          onClick={() => push("Select an anime to review", "info")}
          className="text-[9px] font-black uppercase tracking-widest text-amber-400/60 hover:text-amber-400 transition-colors"
        >
          Write Review
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-8 flex justify-center relative z-10">
          <div className="w-6 h-6 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && reviews.length === 0 && (
        <div className="py-6 text-center relative z-10">
          <PenSquare size={20} className="mx-auto mb-2 text-white/10" />
          <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">No reviews yet</p>
          <Link href="/bestanimelist" className="mt-2 block text-[9px] text-amber-400 hover:text-amber-300 font-black uppercase tracking-widest">
            Find Anime to Review →
          </Link>
        </div>
      )}

      {/* Review rows */}
      {!isLoading && reviews.length > 0 && (
        <ul className="space-y-4 relative z-10">
          {reviews.map((review, i) => (
            <motion.li
              key={review.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group p-4 rounded-2xl border border-white/5 hover:border-amber-500/15 hover:bg-white/[0.025] transition-all cursor-pointer"
            >
              {/* Top row: anime info + date */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-black text-white/85 group-hover:text-white transition-colors truncate leading-tight">
                    {review.animeTitle}
                  </p>
                  <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">{review.studio}</p>
                </div>
                <span className="text-[9px] text-white/20 font-mono shrink-0 pt-0.5">{review.date}</span>
              </div>

              {/* Stars */}
              <ScoreStars score={review.score} />

              {/* Excerpt */}
              <p className="mt-2 text-[11px] text-white/40 leading-relaxed line-clamp-2 italic">
                "{review.excerpt}"
              </p>
            </motion.li>
          ))}
        </ul>
      )}

      {/* Write review CTA */}
      <div className="relative z-10 mt-6">
        <button
          onClick={() => push("Select an anime to review", "info")}
          className="w-full py-3 rounded-2xl border border-dashed border-white/8 hover:border-amber-500/30 text-[10px] font-black uppercase tracking-widest text-white/25 hover:text-amber-400 transition-all"
        >
          + Write a Review
        </button>
      </div>
    </div>
  )
}
