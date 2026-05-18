"use client"

import { use, useState } from "react"
import Link from "next/link"
import { Star, ThumbsUp, ChevronLeft, Flag } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { motion } from "framer-motion"
import Image from "next/image"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

export default function ReviewDetailPage({ params }: { params: Promise<{ id: string; reviewId: string }> }) {
  const { id, reviewId } = use(params)
  const { data: browseData, isLoading } = useBrowseAnime({ limit: 1 })
  const anime = (browseData?.data ?? []).map(mapDTO)[0] ?? null
  const { push } = useToast()

  const seed = reviewId.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  const authors = ["Otaku_Arch","ShadowWatcher","NeuralBot_X","VoidSeeker","CipherRonin"]
  const bodies = [
    `An absolute masterpiece in every definition of the word. ${anime?.title ?? ""} manages to weave together themes of sacrifice, ambition, and human connection in a way that few anime—or any medium—have achieved. Every arc delivers on the promises made early on, and the finale earns every emotional beat.

The animation quality maintained by ${anime?.studio ?? ""} is consistently high, with key fight sequences and emotional moments given particular attention. The music composition ties everything together into a cohesive world.

If you have not yet watched ${anime?.title ?? ""}, stop what you're doing. This is required viewing for any anime enthusiast, and even for those who consider themselves casual fans. It will change your perspective on what animation can accomplish.`,
    `I'll be honest: I went into ${anime?.title ?? ""} with low expectations. Everyone hyped it so much that I braced for disappointment. I was wrong.

The character writing is exceptional. Every major player has an arc that feels earned and complete. The pacing trusts the audience—it doesn't rush to deliver payoff, and it doesn't linger unnecessarily.

${anime?.studio ?? ""}'s production values are evident throughout. The directing choices feel intentional rather than formulaic. This is anime made by people who care deeply about the craft.

My only minor criticism is that the middle section has a few episodes that feel slightly slower, but in retrospect, those episodes are doing crucial groundwork. The payoff justified every moment.`,
  ]

  const review = {
    id: reviewId,
    anime,
    author: authors[seed % authors.length],
    score: 7 + (seed % 4),
    body: bodies[seed % bodies.length],
    helpful: 80 + (seed % 250),
    date: ["2 days", "1 week", "2 weeks", "1 month"][seed % 4] + " ago",
    hasSpoilers: seed % 3 === 0,
  }

  const [liked, setLiked] = useState(false)
  const [helpCount, setHelpCount] = useState(review.helpful)

  const toggleLike = () => {
    setLiked(l => !l)
    setHelpCount(c => liked ? c - 1 : c + 1)
  }

  if (isLoading) return <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center text-white/30">Loading…</div>

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-32 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
          <Link href={`/anime/${id}`} className="hover:text-white transition-colors">{anime?.title ?? id}</Link>
          <span>·</span>
          <Link href={`/anime/${id}/reviews`} className="hover:text-white transition-colors">Reviews</Link>
          <span>·</span>
          <span className="text-white/60">#{reviewId}</span>
        </div>

        {/* Anime mini header */}
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/8">
          <div className="relative h-14 w-10 rounded-xl overflow-hidden shrink-0">
            <Image src={anime?.image ?? ""} alt={anime?.title ?? ""} fill className="object-cover" sizes="40px" />
          </div>
          <div>
            <Link href={`/anime/${id}`} className="font-black text-white hover:text-indigo-300 transition-colors">{anime?.title ?? id}</Link>
            <p className="text-[10px] text-white/35 mt-0.5">{anime?.studio} · {anime?.year}</p>
          </div>
        </div>

        {/* Review */}
        <div className="space-y-6">
          {/* Author + score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/u/${review.author}`} className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-lg hover:scale-105 transition-transform">
                {review.author[0]}
              </Link>
              <div>
                <Link href={`/u/${review.author}`} className="font-black text-white hover:text-indigo-300 transition-colors">{review.author}</Link>
                <p className="text-[10px] text-white/30 mt-0.5">{review.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <Star size={16} fill="#f59e0b" className="text-amber-400" />
              <span className="text-xl font-black text-amber-400">{review.score}</span>
              <span className="text-white/30 text-sm">/10</span>
            </div>
          </div>

          {/* Spoiler badge */}
          {review.hasSpoilers && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
              ⚠️ This review contains spoilers
            </div>
          )}

          {/* Body */}
          <div className="prose prose-invert max-w-none">
            {review.body.split("\n\n").map((para, i) => (
              <motion.p key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
                className="text-white/70 leading-relaxed text-base mb-4"
              >
                {para}
              </motion.p>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <button onClick={toggleLike}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${
                liked ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "border-white/10 bg-white/5 text-white/50 hover:text-white"
              }`}
            >
              <ThumbsUp size={14} fill={liked?"currentColor":"none"} />
              {helpCount} Helpful
            </button>
            <button onClick={() => push("Report submitted. Thank you.", "success")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/8 bg-white/[0.02] text-white/30 hover:text-red-400 hover:border-red-500/20 font-bold text-xs uppercase tracking-widest transition-all"
            >
              <Flag size={13}/> Report
            </button>
            <Link href={`/anime/${id}/reviews`} className="ml-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
              <ChevronLeft size={11}/> All Reviews
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
