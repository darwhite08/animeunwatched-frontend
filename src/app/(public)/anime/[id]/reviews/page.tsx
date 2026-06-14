"use client"

import { use, useState, useMemo } from "react"
import { notFound } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  Star, ChevronRight, PenSquare, ThumbsUp, EyeOff, Filter,
  ChevronLeft, ChevronRight as ChevronRightIcon,
} from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"
import { useToast } from "@/stores/toast.store"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

/* ── Types ── */
type Sort = "helpful" | "recent" | "highest" | "lowest"

interface Review {
  id: number
  author: string
  avatar: string
  score: number
  body: string
  hasSpoilers: boolean
  date: string
  helpful: number
  helpedByMe: boolean
}

/* ── Mock review generator ── */
function getMockReviews(animeId: string): Review[] {
  // Deterministic-ish based on animeId hash
  const seed = animeId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)

  const AUTHORS = [
    "Otaku_Arch", "ShadowWatcher", "NeuralBot_X", "VoidSeeker",
    "CipherRonin", "AlphaWatcher",
  ]
  const AVATARS = ["O", "S", "N", "V", "C", "A"]
  const BODIES = [
    "An absolute standout that exceeded every expectation. The pacing is deliberate but never slow, and the emotional payoff in the final act is one of the most satisfying in the medium. A must-watch for anyone serious about anime.",
    "The first half drags a little, but once it finds its footing around episode 8, it becomes completely unmissable. The character writing is exceptional and the animation quality is consistent throughout.",
    "I came in with tempered expectations and left completely floored. What looks like a familiar premise is executed with such care and precision that it feels genuinely original. Rare achievement.",
    "Nearly a masterpiece. The worldbuilding is immaculate, the side characters are as compelling as the leads, and the soundtrack elevates every key scene. One minor arc loses momentum but the rest is flawless.",
    "Hard to articulate what makes this so affecting without spoilers. Just trust the process — the slower episodes are building something important. Stick with it and you'll be rewarded.",
    "Technically brilliant and emotionally devastating in equal measure. This is the kind of anime that recalibrates your standards for what the medium can achieve. One of my top ten of all time.",
  ]
  const SCORES = [10, 9, 8, 9, 8, 10]
  const DATES = ["1d ago", "3d ago", "1w ago", "2w ago", "3w ago", "1mo ago"]
  const HELPFUL = [312, 187, 245, 134, 298, 156].map((n, i) => ((n + seed + i * 7) % 400) + 50)

  return AUTHORS.map((author, i) => ({
    id: i + 1,
    author,
    avatar: AVATARS[i],
    score: SCORES[(i + seed) % SCORES.length],
    body: BODIES[i],
    hasSpoilers: i === 3,
    date: DATES[i],
    helpful: HELPFUL[i],
    helpedByMe: i === 1 || i === 4,
  }))
}

const SORTS: { id: Sort; label: string }[] = [
  { id: "helpful", label: "Most Helpful" },
  { id: "recent",  label: "Recent"       },
  { id: "highest", label: "Highest"      },
  { id: "lowest",  label: "Lowest"       },
]

/* ── Avatar colours ── */
const AVATAR_COLORS = [
  "from-indigo-500 to-violet-600",
  "from-accent to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
]

/* ── Page ── */
export default function AnimeReviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: browseData, isLoading } = useBrowseAnime({ limit: 1 })
  const allAnime = (browseData?.data ?? []).map(mapDTO)
  const anime = allAnime.find(a => a.id === id)
  if (!isLoading && !anime) notFound()
  if (isLoading || !anime) return <div className="min-h-screen bg-background flex items-center justify-center text-subtle text-sm">Loading…</div>

  const { push } = useToast()
  const [sort, setSort] = useState<Sort>("helpful")
  const [reviews, setReviews] = useState<Review[]>(() => getMockReviews(id))
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const TRUNCATE = 220

  const sorted = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sort === "helpful") return b.helpful - a.helpful
      if (sort === "highest") return b.score - a.score
      if (sort === "lowest")  return a.score - b.score
      return 0 // recent — keep insertion order
    })
  }, [reviews, sort])

  const toggleHelp = (reviewId: number) => {
    setReviews(rs =>
      rs.map(r =>
        r.id === reviewId
          ? { ...r, helpful: r.helpedByMe ? r.helpful - 1 : r.helpful + 1, helpedByMe: !r.helpedByMe }
          : r,
      ),
    )
    const r = reviews.find(r => r.id === reviewId)
    push(r?.helpedByMe ? "Removed helpful vote" : "Marked as helpful!", "success")
  }

  const scoreColor = (s: number) =>
    s >= 9 ? "text-emerald-400" : s >= 7 ? "text-accent-bright" : "text-rose-400"

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-subtle mb-8">
          <Link href="/bestanimelist" className="hover:text-muted transition-colors">Anime Archive</Link>
          <ChevronRight size={11} className="text-subtle" />
          <Link href={`/anime/${anime.id}`} className="hover:text-muted transition-colors truncate max-w-[180px]">
            {anime.title}
          </Link>
          <ChevronRight size={11} className="text-subtle" />
          <span className="text-accent-bright">Reviews</span>
        </nav>

        {/* Anime mini header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5 p-5 rounded-2xl bg-surface border border-border mb-10"
        >
          <Link href={`/anime/${anime.id}`} className="relative h-20 w-14 rounded-xl overflow-hidden shrink-0 group">
            <Image src={anime.image} alt={anime.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="56px" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/anime/${anime.id}`}>
              <h1 className="text-xl font-black uppercase italic tracking-tighter text-foreground hover:text-white transition-colors leading-tight truncate">
                {anime.title}
              </h1>
            </Link>
            <p className="text-[10px] text-subtle mt-0.5 font-mono">{anime.titleJapanese}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                <Star size={11} fill="var(--app-accent)" className="text-accent-bright" />
                <span className="text-xs font-black text-accent-bright">{anime.rating.toFixed(1)}</span>
              </div>
              <span className="text-[10px] text-subtle">{anime.studio} · {anime.year}</span>
            </div>
          </div>

          {/* Write review CTA */}
          <Link
            href="/rate"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-accent hover:bg-accent-bright text-[10px] font-black uppercase tracking-widest text-foreground transition-all shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            <PenSquare size={12} /> Write a Review
          </Link>
        </motion.div>

        {/* Section heading + sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-foreground leading-none">
              Reviews<span style={{color:"var(--app-accent)"}}>.</span>
            </h2>
            <p className="text-subtle text-xs mt-1">{reviews.length} reviews · Page 1 of 3</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={12} className="text-subtle" />
            {SORTS.map(s => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${
                  sort === s.id
                    ? "bg-accent text-black"
                    : "bg-surface text-subtle hover:bg-surface border border-border"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews list */}
        <div className="space-y-5">
          <AnimatePresence mode="popLayout">
            {sorted.map((r, i) => {
              const isRevealed = revealed.has(r.id)
              const isExpanded = expanded.has(r.id)

              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-6 rounded-2xl bg-surface border border-border hover:border-border transition-colors space-y-4"
                >
                  {/* Author row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-sm font-black text-foreground shrink-0`}>
                        {r.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground">{r.author}</p>
                        <p className="text-[9px] text-subtle mt-0.5">{r.date}</p>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            size={11}
                            fill={star <= Math.round(r.score / 2) ? "var(--app-accent)" : "none"}
                            className={star <= Math.round(r.score / 2) ? "text-accent-bright" : "text-subtle"}
                          />
                        ))}
                      </div>
                      <span className={`text-sm font-black ${scoreColor(r.score)}`}>{r.score}</span>
                      <span className="text-[10px] text-subtle">/10</span>
                      {r.hasSpoilers && (
                        <span className="ml-1 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/15 text-accent-bright border border-accent/20">
                          Spoilers
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    {r.hasSpoilers && !isRevealed ? (
                      <div className="relative">
                        <p className="text-sm text-muted leading-relaxed blur-[4px] select-none line-clamp-3">{r.body}</p>
                        <button
                          onClick={() => setRevealed(s => new Set([...s, r.id]))}
                          className="absolute inset-0 flex items-center justify-center gap-2 bg-black/20 rounded-xl text-xs font-black uppercase tracking-widest text-accent-bright hover:text-white transition-colors"
                        >
                          <EyeOff size={13} /> Reveal Spoilers
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-muted leading-relaxed">
                          {isExpanded || r.body.length <= TRUNCATE
                            ? r.body
                            : r.body.slice(0, TRUNCATE) + "…"}
                        </p>
                        {r.body.length > TRUNCATE && (
                          <button
                            onClick={() =>
                              setExpanded(s => {
                                const n = new Set(s)
                                isExpanded ? n.delete(r.id) : n.add(r.id)
                                return n
                              })
                            }
                            className="text-[10px] font-black text-accent-bright hover:text-white mt-1.5 transition-colors"
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <button
                      onClick={() => toggleHelp(r.id)}
                      className={`flex items-center gap-1.5 text-[10px] font-black transition-colors ${
                        r.helpedByMe ? "text-emerald-400" : "text-subtle hover:text-muted"
                      }`}
                    >
                      <ThumbsUp size={12} fill={r.helpedByMe ? "currentColor" : "none"} />
                      {r.helpful} helpful
                    </button>
                    <Link
                      href={`/u/${r.author}`}
                      className="text-[9px] font-black uppercase tracking-widest text-subtle hover:text-muted transition-colors"
                    >
                      View Profile →
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <p className="text-center text-[9px] text-subtle mt-10 font-mono">{reviews.length} {reviews.length === 1 ? "review" : "reviews"} shown</p>

        {/* Write review CTA footer */}
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-subtle text-sm">Watched this anime? Share your take.</p>
          <Link
            href="/rate"
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-accent hover:bg-accent-bright text-xs font-black uppercase tracking-widest text-foreground transition-all shadow-[0_0_24px_rgba(99,102,241,0.3)]"
          >
            <PenSquare size={14} /> Write a Review
          </Link>
        </div>
      </div>
    </div>
  )
}
