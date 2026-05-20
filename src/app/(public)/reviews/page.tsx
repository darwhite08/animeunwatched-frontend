"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Star, Eye, EyeOff, ThumbsUp, PenSquare, Filter } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated } from "@/lib/api/types"

type Review = {
  id: number; animeId: string; author: string; score: number
  body: string; hasSpoilers: boolean; date: string; helpful: number; helpedByMe: boolean
}

const MOCK_REVIEWS: Review[] = [
  { id:1,  animeId:"fullmetal-alchemist-brotherhood", author:"Otaku_Arch",    score:10, body:"A perfect anime in every sense. The pacing is flawless, every character has an arc, and the final act delivers on every promise made in episode one. The alchemy system is clever without being overly complicated. Required watching.",                    hasSpoilers:false, date:"2d ago",  helpful:312, helpedByMe:false },
  { id:2,  animeId:"steins-gate",                     author:"ShadowWatcher", score:9,  body:"Starts slow — intentionally so. The first half feels like a comedy about time travel nerds. Then episode 12 happens and the show completely changes what it is. The emotional devastation in the second half earns every minute of setup.",                  hasSpoilers:false, date:"5d ago",  helpful:187, helpedByMe:true  },
  { id:3,  animeId:"monster",                         author:"NeuralBot_X",   score:10, body:"Johan Liebert is the greatest villain in anime history. Not because he's powerful — because he's philosophically terrifying. This show will haunt you. Every episode tightens the knot. 74 episodes and not one is wasted.",                             hasSpoilers:false, date:"1w ago",  helpful:245, helpedByMe:false },
  { id:4,  animeId:"attack-on-titan",                 author:"VoidSeeker",    score:9,  body:"The first season was lightning in a bottle. What follows is one of the most ambitious political narratives in the medium. The final arc is controversial but the journey to get there is unmatched. [SPOILER WARNING — The ending subverts everything you thought this show was about.]", hasSpoilers:true, date:"1w ago",  helpful:134, helpedByMe:false },
  { id:5,  animeId:"cowboy-bebop",                    author:"Cipher_Ronin",  score:10, body:"Space, jazz, loneliness, and the best English dub ever recorded. Each episode is a short film. The show never explains itself or panders to the audience. Spike Spiegel is one of the most elegantly written protagonists in fiction.",                   hasSpoilers:false, date:"2w ago",  helpful:298, helpedByMe:true  },
  { id:6,  animeId:"vinland-saga",                    author:"AlphaWatcher",  score:9,  body:"Season 1 is a masterclass in setting up a character study. Season 2 pays it off. Thorfinn's arc is one of the most emotionally mature character developments I've seen. The pacifism theme lands because the show made you feel the violence first.", hasSpoilers:false, date:"2w ago",  helpful:156, helpedByMe:false },
  { id:7,  animeId:"frieren",                         author:"DeltaWeeb",     score:10, body:"Quiet, melancholic, and deeply moving. Frieren made me think about mortality and what it means to love people who don't live as long as you do. The magic system is elegant. A rare anime that improves on reflection.",                               hasSpoilers:false, date:"3w ago",  helpful:421, helpedByMe:false },
  { id:8,  animeId:"death-note",                      author:"Kurosaki_Fan",  score:8,  body:"The first arc is a perfect thriller — the smartest battle of wits in anime. The second half loses momentum after the midpoint but gets enough right to still be exceptional. Light Yagami remains one of the most compelling anti-heroes ever.",        hasSpoilers:true,  date:"1m ago",  helpful:89,  helpedByMe:true  },
]

type Sort = "helpful" | "recent" | "highest" | "lowest"

export default function ReviewsPage() {
  const { push } = useToast()
  const [sort, setSort] = useState<Sort>("helpful")
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const { data: browseData } = useBrowseAnime({ limit: 24 })
  const animeList = browseData?.data ?? []

  const { data: apiReviewsData } = useQuery({
    queryKey: ["public-reviews", sort],
    queryFn: () => api<Paginated<{ id: string; score: number; body: string; hasSpoilers: boolean; createdAt: string; _count?: { likes: number }; author: { username: string; displayName: string }; anime?: { id: string; malId: number; title: string; imageUrl: string | null } }>>(`/reviews?sort=${sort}&limit=24`),
  })

  const apiReviews = (apiReviewsData?.data ?? []).map((r, i) => ({
    id: i + 1,
    animeId: r.anime?.id ?? "",
    animeMalId: r.anime?.malId ?? 0,
    animeTitle: r.anime?.title ?? "Unknown Anime",
    animeImage: r.anime?.imageUrl ?? "",
    author: r.author?.displayName ?? r.author?.username ?? "Anonymous",
    score: r.score, body: r.body,
    helpful: r._count?.likes ?? 0, helpedByMe: false,
    date: (() => { const d = Date.now() - new Date(r.createdAt).getTime(); return d < 86400000 ? `${Math.floor(d/3600000)}h ago` : `${Math.floor(d/86400000)}d ago` })(),
    hasSpoilers: r.hasSpoilers,
    excerpt: r.body.slice(0, 200),
  }))

  const baseReviews = apiReviews.length > 0 ? apiReviews : MOCK_REVIEWS
  const [helpOverrides, setHelpOverrides] = useState<Record<number, { helpful: number; helpedByMe: boolean }>>({})
  const reviews = baseReviews.map(r => helpOverrides[r.id] ? { ...r, ...helpOverrides[r.id] } : r)

  const sorted = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sort === "helpful") return b.helpful - a.helpful
      if (sort === "highest") return b.score - a.score
      if (sort === "lowest")  return a.score - b.score
      return 0
    })
  }, [reviews, sort])

  const toggleHelp = (id: number) => {
    const current = reviews.find(r => r.id === id)
    if (!current) return
    setHelpOverrides(prev => ({
      ...prev,
      [id]: { helpful: current.helpedByMe ? current.helpful - 1 : current.helpful + 1, helpedByMe: !current.helpedByMe }
    }))
  }

  const SORTS: { id: Sort; label: string }[] = [
    { id: "helpful", label: "Most Helpful" },
    { id: "recent",  label: "Recent" },
    { id: "highest", label: "Highest Rated" },
    { id: "lowest",  label: "Lowest Rated" },
  ]

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-10">
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60 mb-3">Community Voices</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white leading-none mb-2">
              Reviews<span className="text-indigo-500">.</span>
            </h1>
            <p className="text-white/35 text-sm">{reviews.length} community reviews</p>
          </div>
          <Link href="/rate"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-xs font-black uppercase tracking-widest text-white transition-all self-start sm:self-auto"
          >
            <PenSquare size={13} /> Write a Review
          </Link>
        </div>

        {/* Sort tabs */}
        <div className="flex items-center gap-2 mt-6 flex-wrap">
          <Filter size={13} className="text-white/30" />
          {SORTS.map(s => (
            <button key={s.id} onClick={() => setSort(s.id)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                sort === s.id ? "bg-indigo-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/8 border border-white/5"
              }`}
            >{s.label}</button>
          ))}
        </div>
      </div>

      {/* Reviews grid */}
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {sorted.map((r, i) => {
            const animeDto = animeList.find((a: AnimeDTO) => String(a.malId) === r.animeId)
            const anime = animeDto ? { id: String(animeDto.malId), title: animeDto.title, image: animeDto.imageUrl ?? "" } : null
            const isRevealed = revealed.has(r.id)
            const isExpanded = expanded.has(r.id)
            const TRUNCATE = 180

            return (
              <motion.div key={r.id} layout initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: i*0.04 }}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-colors space-y-4"
              >
                {/* Anime info */}
                <div className="flex items-center gap-3">
                  {anime && (
                    <Link href={`/anime/${anime.id}`} className="relative h-12 w-9 rounded-lg overflow-hidden shrink-0">
                      <Image src={anime.image} alt={anime.title} fill className="object-cover" sizes="36px" />
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={`/anime/${r.animeId}`}
                      className="text-sm font-black text-white/80 hover:text-white transition-colors truncate block"
                    >
                      {anime?.title ?? r.animeId}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} size={10}
                            fill={star <= Math.round(r.score/2) ? "#f59e0b" : "none"}
                            className={star <= Math.round(r.score/2) ? "text-amber-400" : "text-white/15"}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-white/50">{r.score}/10</span>
                      {r.hasSpoilers && (
                        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                          Spoilers
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Review body */}
                <div className="relative">
                  {r.hasSpoilers && !isRevealed ? (
                    <div className="relative">
                      <p className="text-sm text-white/40 leading-relaxed blur-[4px] select-none line-clamp-3">{r.body}</p>
                      <button onClick={() => setRevealed(s => new Set([...s, r.id]))}
                        className="absolute inset-0 flex items-center justify-center gap-2 bg-black/20 rounded-xl text-xs font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <EyeOff size={13} /> Reveal Spoilers
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-white/65 leading-relaxed">
                        {isExpanded || r.body.length <= TRUNCATE ? r.body : r.body.slice(0, TRUNCATE) + "…"}
                      </p>
                      {r.body.length > TRUNCATE && (
                        <button onClick={() => setExpanded(s => { const n = new Set(s); isExpanded ? n.delete(r.id) : n.add(r.id); return n })}
                          className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 mt-1 transition-colors"
                        >
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2 text-[10px] text-white/25">
                    <span className="font-black text-white/40">{r.author}</span>
                    <span>·</span>
                    <span>{r.date}</span>
                  </div>
                  <button onClick={() => { toggleHelp(r.id); push(r.helpedByMe ? "Removed helpful vote" : "Marked as helpful!", "success") }}
                    className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${r.helpedByMe ? "text-emerald-400" : "text-white/25 hover:text-white/50"}`}
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
    </div>
  )
}
