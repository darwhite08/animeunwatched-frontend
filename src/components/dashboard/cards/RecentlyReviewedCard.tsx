"use client"

import { motion } from "framer-motion"
import { PenSquare, Star } from "lucide-react"
import { useToast } from "@/stores/toast.store"

/* ── Types ── */
type Review = {
  id: number
  animeTitle: string
  studio: string
  score: number
  excerpt: string
  date: string
}

/* ── Mock data ── */
const MOCK_REVIEWS: Review[] = [
  {
    id: 1,
    animeTitle: "Fullmetal Alchemist: Brotherhood",
    studio: "Bones",
    score: 10,
    excerpt: "An absolute masterpiece. Perfect pacing, perfect payoff, perfect characters. The ending hit me like a freight train.",
    date: "3 days ago",
  },
  {
    id: 2,
    animeTitle: "Steins;Gate",
    studio: "White Fox",
    score: 9,
    excerpt: "The slow-burn first half is intentional and brilliant. Once it flips — nothing can prepare you for what follows.",
    date: "1 week ago",
  },
  {
    id: 3,
    animeTitle: "Vinland Saga",
    studio: "MAPPA",
    score: 9,
    excerpt: "Thorfinn's arc in Season 2 is one of anime's greatest character transformations. War, peace, and what it means to be human.",
    date: "2 weeks ago",
  },
]

/* ── Helpers ── */
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

  return (
    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-violet-500/5 blur-[60px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-7 relative z-10">
        <div className="flex items-center gap-2">
          <PenSquare size={14} className="text-violet-400" />
          <h4 className="text-xs font-black uppercase tracking-[0.28em] text-white/30">Recent Reviews</h4>
        </div>
        <button
          onClick={() => push("Select an anime to review", "info")}
          className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60 hover:text-indigo-400 transition-colors"
        >
          Write Review
        </button>
      </div>

      {/* Review rows */}
      <ul className="space-y-4 relative z-10">
        {MOCK_REVIEWS.map((review, i) => (
          <motion.li
            key={review.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="group p-4 rounded-2xl border border-white/5 hover:border-violet-500/15 hover:bg-white/[0.025] transition-all cursor-pointer"
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

      {/* Write review CTA */}
      <div className="relative z-10 mt-6">
        <button
          onClick={() => push("Select an anime to review", "info")}
          className="w-full py-3 rounded-2xl border border-dashed border-white/8 hover:border-violet-500/30 text-[10px] font-black uppercase tracking-widest text-white/25 hover:text-violet-400 transition-all"
        >
          + Write a Review
        </button>
      </div>
    </div>
  )
}
