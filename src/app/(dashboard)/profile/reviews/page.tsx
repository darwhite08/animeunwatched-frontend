"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useBrowseAnime } from "@/hooks/useAnime"
import { useAuthStore } from "@/stores/auth.store"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { PenSquare, Star, ThumbsUp, Trash2, Edit2, Filter } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

type Sort = "recent" | "highest" | "lowest" | "helpful"

const REVIEW_SCORES = [10, 9, 10, 9, 8, 9, 9, 8]
const REVIEW_BODIES = [
  "Perfect in every sense. The pacing, the characters, the ending — nothing feels wasted.",
  "The slow start is intentional. Episode 12 reframes everything. Worth every minute.",
  "Johan Liebert is the greatest villain in anime. 74 episodes of sustained tension.",
  "Season 1 is perfect. What follows is the most ambitious political narrative in anime.",
  "Jazz, space, loneliness. A love letter to noir cinema. Timeless.",
  "The pacifism arc is more complex than most war films. An unexpected masterpiece.",
  "Made me reconsider what makes anime unique as a medium. Quiet and devastating.",
  "First arc is a perfect thriller. Second half stumbles but still essential.",
]
const REVIEW_HELPFUL = [312, 187, 245, 134, 298, 156, 421, 89]
const REVIEW_DATES = ["2d", "5d", "1w", "1w", "2w", "2w", "3w", "1m"]

export default function MyReviewsPage() {
  const { push } = useToast()
  const authUser = useAuthStore(s => s.user)
  const { data: browseData, isLoading } = useBrowseAnime({ limit: 8 })

  // Try to get real user reviews via the reviews search
  const { data: userReviewsData } = useQuery({
    queryKey: ["my-reviews", authUser?.id],
    queryFn: () => api<{ data: Array<{ id: string; animeId: string; score: number; body: string; hasSpoilers: boolean; createdAt: string; _count?: { likes: number }; anime?: { id: string; malId: number; title: string; imageUrl: string | null } }>; meta: { total: number } }>(`/reviews?authorId=${authUser?.id}&limit=20`),
    enabled: !!authUser,
  })

  const apiReviews = (userReviewsData?.data ?? []).map(r => ({
    id: r.id as unknown as number,
    anime: mapDTO({ id: r.anime?.id ?? "", malId: r.anime?.malId ?? 0, title: r.anime?.title ?? "Unknown", titleJapanese: null, synopsis: null, type: null, episodes: null, status: null, airedFrom: null, airedTo: null, season: null, year: null, rating: null, score: null, imageUrl: r.anime?.imageUrl ?? null, trailerUrl: null, source: null, genres: [] as string[], studios: [] as string[] } as any, 0),
    score: r.score,
    body: r.body,
    helpful: r._count?.likes ?? 0,
    date: (() => { const d = Date.now() - new Date(r.createdAt).getTime(); if (d < 86400000) return `${Math.floor(d/3600000)}h ago`; return `${Math.floor(d/86400000)}d ago` })(),
  }))

  const MY_REVIEWS = apiReviews.length > 0 ? apiReviews : (browseData?.data ?? []).map(mapDTO).slice(0, 8).map((anime, i) => ({
    id: i + 1, anime,
    score: REVIEW_SCORES[i] ?? 9,
    body: REVIEW_BODIES[i] ?? "",
    helpful: REVIEW_HELPFUL[i] ?? 0,
    date: (REVIEW_DATES[i] ?? "1m") + " ago",
  }))

  const [reviews, setReviews] = useState<typeof MY_REVIEWS>([])
  const [sort, setSort] = useState<Sort>("recent")

  useEffect(() => { if (MY_REVIEWS.length && !reviews.length) setReviews(MY_REVIEWS) }, [MY_REVIEWS.length])

  const sorted = useMemo(() => [...reviews].sort((a, b) => {
    if (sort === "highest") return b.score - a.score
    if (sort === "lowest")  return a.score - b.score
    if (sort === "helpful") return b.helpful - a.helpful
    return 0
  }), [reviews, sort])

  const deleteReview = (id: number) => {
    setReviews(rs => rs.filter(r => r.id !== id))
    push("Review deleted", "info")
  }

  const totalHelpful = reviews.reduce((s, r) => s + r.helpful, 0)
  const avgScore = reviews.length ? (reviews.reduce((s, r) => s + r.score, 0) / reviews.length).toFixed(1) : "—"

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 pb-32 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-2">Your Opinions</p>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">
            My Reviews<span style={{color:"var(--app-accent)"}}>.</span>
          </h1>
        </div>
        <Link href="/rate" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-bright text-xs font-black uppercase tracking-widest text-foreground transition-all mt-2">
          <PenSquare size={13} /> Write Review
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Reviews", value: String(reviews.length), icon: PenSquare, color: "text-accent-bright" },
          { label: "Avg Score", value: avgScore + "/10", icon: Star, color: "text-accent-bright" },
          { label: "Helpful", value: totalHelpful.toLocaleString(), icon: ThumbsUp, color: "text-emerald-400" },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl bg-surface border border-border text-center space-y-1">
            <s.icon size={16} className={`${s.color} mx-auto`} />
            <p className="text-xl font-black text-foreground">{s.value}</p>
            <p className="text-[9px] font-black uppercase tracking-wider text-subtle">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-2 items-center flex-wrap">
        <Filter size={13} className="text-subtle" />
        {(["recent","highest","lowest","helpful"] as Sort[]).map(s => (
          <button key={s} onClick={() => setSort(s)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all capitalize ${sort===s?"bg-accent text-black":"bg-surface text-muted border border-border hover:bg-surface"}`}
          >{s}</button>
        ))}
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        <AnimatePresence>
          {sorted.map((r, i) => (
            <motion.div key={r.id} layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0 }}
              transition={{ delay:i*0.04 }}
              className="p-5 rounded-2xl bg-surface border border-border hover:border-border transition-colors space-y-4"
            >
              <div className="flex items-center gap-3">
                <Link href={`/anime/${r.anime.id}`} className="relative h-12 w-9 rounded-lg overflow-hidden shrink-0">
                  <Image src={r.anime.image} alt={r.anime.title} fill className="object-cover" sizes="36px" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/anime/${r.anime.id}`} className="text-sm font-black text-muted hover:text-foreground truncate block">{r.anime.title}</Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s=>(
                        <Star key={s} size={9} fill={s<=Math.round(r.score/2)?"var(--app-accent)":"none"} className={s<=Math.round(r.score/2)?"text-accent-bright":"text-subtle"}/>
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-muted">{r.score}/10</span>
                    <span className="text-[9px] text-subtle">{r.date}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => push("Review editing coming soon!", "info")} className="p-2 rounded-lg text-subtle hover:text-white hover:bg-surface transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => deleteReview(r.id)} className="p-2 rounded-lg text-subtle hover:text-red-400 hover:bg-red-500/5 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed line-clamp-3">{r.body}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border text-[9px] text-subtle">
                <span>{r.helpful} people found this helpful</span>
                <Link href={`/anime/${r.anime.id}/reviews`} className="text-accent-bright/60 hover:text-white transition-colors font-black uppercase tracking-widest">
                  View on Anime →
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
