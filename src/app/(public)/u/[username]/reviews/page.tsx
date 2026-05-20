"use client"

import { use, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronRight, Filter, PenSquare, Star, ThumbsUp, EyeOff,
} from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated } from "@/lib/api/types"
import { useToast } from "@/stores/toast.store"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

/* ── Types ── */
type Sort = "helpful" | "recent" | "highest" | "lowest"

interface Review {
  id: number
  animeId?: string
  anime?: Anime
  score: number
  body: string
  hasSpoilers: boolean
  date: string
  helpful: number
  helpedByMe: boolean
}

/* ── Mock review generator ── */
function buildReviews(username: string, animePool: Anime[]): Review[] {
  const seed = username.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)

  // Pick 6 anime from pool, deterministically seeded
  const pool = animePool.slice(seed % Math.max(1, animePool.length - 6), (seed % Math.max(1, animePool.length - 6)) + 6)

  const BODIES = [
    "An absolute standout. The pacing is deliberate but never slow, and every character arc resolves with genuine weight. Required watching for anyone serious about the medium.",
    "Starts a little rough in the first few episodes, but once it finds its footing the series becomes completely unmissable. The emotional payoff is worth every minute of investment.",
    "I came in with measured expectations and left completely floored. What looks like a familiar premise is executed with such craft that it feels genuinely original.",
    "Nearly a masterpiece. The worldbuilding is immaculate and the soundtrack elevates every key scene. One minor arc loses momentum but the rest is flawless.",
    "Hard to articulate what makes this so affecting without spoilers. Trust the process — the slower episodes are building something important. Stick with it.",
    "Technically brilliant and emotionally devastating in equal measure. This is the kind of anime that recalibrates your standards for what the medium can achieve.",
  ]
  const SCORES   = [10, 9, 8, 9, 10, 8]
  const DATES    = ["2h ago", "1d ago", "3d ago", "1w ago", "2w ago", "1mo ago"]
  const HELPFULS = [312, 187, 245, 134, 298, 156]

  return pool.map((anime, i) => ({
    id: i + 1,
    animeId: anime.id,
    score: SCORES[(i + seed) % SCORES.length],
    body: BODIES[i % BODIES.length],
    hasSpoilers: i === 3,
    date: DATES[i],
    helpful: ((HELPFULS[i] + seed + i * 7) % 400) + 50,
    helpedByMe: i === 1,
  }))
}

const SORTS: { id: Sort; label: string }[] = [
  { id: "helpful", label: "Most Helpful" },
  { id: "recent",  label: "Recent"       },
  { id: "highest", label: "Highest"      },
  { id: "lowest",  label: "Lowest"       },
]

const AVATAR_COLORS = [
  "from-indigo-500 to-violet-600",
  "from-amber-500  to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500   to-pink-600",
  "from-sky-500    to-blue-600",
  "from-violet-500 to-purple-600",
]

/* ── Page ── */
export default function UserReviewsPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = use(params)
  const { push } = useToast()
  const { data: browseData } = useBrowseAnime({ limit: 24 })
  const animePool = useMemo(() => (browseData?.data ?? []).map(mapDTO), [browseData])

  const [sort, setSort] = useState<Sort>("helpful")
  const [helpOverrides, setHelpOverrides] = useState<Record<number, { helpful: number; helpedByMe: boolean }>>({})

  // Try real user reviews API - search by username via query
  type UserReview = { id: string; score: number; body: string; hasSpoilers: boolean; createdAt: string; _count?: { likes: number }; anime?: { id: string; malId: number; title: string; imageUrl: string | null; studios: string[] } }
  const { data: userReviewsData } = useQuery({
    queryKey: ["user-reviews-public", username],
    queryFn: () => api<Paginated<UserReview>>(`/reviews?limit=20`),
  })

  const apiReviews: Review[] = (userReviewsData?.data ?? []).map((r, i) => ({
    id: i + 1,
    anime: mapDTO({ id: r.anime?.id ?? "", malId: r.anime?.malId ?? 0, title: r.anime?.title ?? "Unknown", titleJapanese: null, synopsis: null, type: null, episodes: null, status: null, airedFrom: null, airedTo: null, season: null, year: null, rating: null, score: null, imageUrl: r.anime?.imageUrl ?? null, trailerUrl: null, source: null, genres: [] as string[], studios: (r.anime?.studios ?? []) as string[] } as any, i),
    score: r.score, body: r.body,
    helpful: r._count?.likes ?? 0, helpedByMe: false,
    date: (() => { const d = Date.now() - new Date(r.createdAt).getTime(); return d < 86400000 ? `${Math.floor(d/3600000)}h ago` : `${Math.floor(d/86400000)}d ago` })(),
    hasSpoilers: r.hasSpoilers,
  }))

  const builtReviews = useMemo(() => apiReviews.length > 0 ? apiReviews : buildReviews(username, animePool), [apiReviews.length, username, animePool])
  const reviews = builtReviews.map(r => helpOverrides[r.id] ? { ...r, ...helpOverrides[r.id] } : r)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const TRUNCATE = 220

  const sorted = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sort === "helpful") return b.helpful - a.helpful
      if (sort === "highest") return b.score   - a.score
      if (sort === "lowest")  return a.score   - b.score
      return 0
    })
  }, [reviews, sort])

  const toggleHelp = (id: number) => {
    const r = reviews.find(r => r.id === id)
    setHelpOverrides(prev => {
      const cur = prev[id] ?? { helpful: r?.helpful ?? 0, helpedByMe: r?.helpedByMe ?? false }
      return { ...prev, [id]: { helpful: cur.helpedByMe ? cur.helpful - 1 : cur.helpful + 1, helpedByMe: !cur.helpedByMe } }
    })
    push(r?.helpedByMe ? "Removed helpful vote" : "Marked as helpful!", "success")
  }

  const scoreColor = (s: number) =>
    s >= 9 ? "text-emerald-400" : s >= 7 ? "text-amber-400" : "text-rose-400"

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/25 mb-8">
          <Link href={`/u/${username}`} className="hover:text-white/60 transition-colors">
            @{username}
          </Link>
          <ChevronRight size={11} className="text-white/15" />
          <span className="text-amber-400">Reviews</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white leading-none">
              @{username}&apos;s Reviews<span style={{color:"#f59e0b"}}>.</span>
            </h1>
            <p className="text-white/35 text-sm mt-2">{reviews.length} reviews</p>
          </div>
          <Link
            href="/rate"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-xs font-black uppercase tracking-widest text-white transition-all self-start sm:self-auto shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            <PenSquare size={13} /> Write a Review
          </Link>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <Filter size={13} className="text-white/30" />
          {SORTS.map(s => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                sort === s.id
                  ? "bg-amber-500 text-black"
                  : "bg-white/5 text-white/40 hover:bg-white/8 border border-white/5"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Review list */}
        <div className="space-y-5">
          <AnimatePresence mode="popLayout">
            {sorted.map((r, i) => {
              const anime      = animePool.find(a => a.id === r.animeId)
              const isRevealed = revealed.has(r.id)
              const isExpanded = expanded.has(r.id)

              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-colors space-y-4"
                >
                  {/* Anime header */}
                  <div className="flex items-center gap-4">
                    {anime && (
                      <Link href={`/anime/${anime.id}`} className="relative h-16 w-11 rounded-xl overflow-hidden shrink-0 group">
                        <Image
                          src={anime.image}
                          alt={anime.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="44px"
                        />
                      </Link>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/anime/${r.animeId}`}
                        className="text-base font-black uppercase italic tracking-tighter text-white hover:text-amber-300 transition-colors leading-tight truncate block"
                      >
                        {anime?.title ?? r.animeId}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={10}
                              fill={star <= Math.round(r.score / 2) ? "#f59e0b" : "none"}
                              className={star <= Math.round(r.score / 2) ? "text-amber-400" : "text-white/15"}
                            />
                          ))}
                        </div>
                        <span className={`text-sm font-black ${scoreColor(r.score)}`}>{r.score}</span>
                        <span className="text-[10px] text-white/25">/10</span>
                        {r.hasSpoilers && (
                          <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                            Spoilers
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Author avatar */}
                    <div
                      className={`h-9 w-9 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-sm font-black text-white shrink-0`}
                    >
                      {username.slice(0, 1).toUpperCase()}
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    {r.hasSpoilers && !isRevealed ? (
                      <div className="relative">
                        <p className="text-sm text-white/40 leading-relaxed blur-[4px] select-none line-clamp-3">
                          {r.body}
                        </p>
                        <button
                          onClick={() => setRevealed(s => new Set([...s, r.id]))}
                          className="absolute inset-0 flex items-center justify-center gap-2 bg-black/20 rounded-xl text-xs font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          <EyeOff size={13} /> Reveal Spoilers
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-white/60 leading-relaxed">
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
                            className="text-[10px] font-black text-amber-400 hover:text-amber-300 mt-1.5 transition-colors"
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                      {r.date}
                    </span>
                    <button
                      onClick={() => toggleHelp(r.id)}
                      className={`flex items-center gap-1.5 text-[10px] font-black transition-colors ${
                        r.helpedByMe ? "text-emerald-400" : "text-white/25 hover:text-white/50"
                      }`}
                    >
                      <ThumbsUp size={12} fill={r.helpedByMe ? "currentColor" : "none"} />
                      {r.helpful} helpful
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Write review CTA */}
        <div className="mt-14 flex flex-col items-center gap-3 text-center">
          <p className="text-white/30 text-sm">Watched something great? Share your take.</p>
          <Link
            href="/rate"
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-xs font-black uppercase tracking-widest text-white transition-all shadow-[0_0_24px_rgba(99,102,241,0.3)]"
          >
            <PenSquare size={14} /> Write a Review
          </Link>
        </div>
      </div>
    </div>
  )
}
