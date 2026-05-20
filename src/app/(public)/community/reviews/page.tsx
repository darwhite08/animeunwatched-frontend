"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useBrowseAnime } from "@/hooks/useAnime"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated } from "@/lib/api/types"
import { Star, ThumbsUp, Eye, SortAsc, PenSquare } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

const MOCK_AUTHORS = ["Otaku_Arch","ShadowWatcher","NeuralBot_X","VoidSeeker","CipherRonin","AlphaWatcher","DeltaWeeb","KurosakiFan"]
const MOCK_SCORES = [10, 9, 10, 9, 8, 9, 9, 8]
const MOCK_BODIES = [
  "A perfect anime in every sense. Every arc delivers and the finale earns everything it built.",
  "Starts slow, but episode 12 changes everything. The payoff is worth every minute.",
  "Johan Liebert is the greatest villain in anime history. 74 episodes, not one wasted.",
  "Season 1 is lightning in a bottle. What follows is the most ambitious political narrative in the medium.",
  "Space, jazz, loneliness, and the best dub ever recorded. Timeless in every sense.",
  "Season 2 pays off everything season 1 set up. The pacifism arc is mature beyond its genre.",
  "Quiet, melancholic, and deeply moving. Made me think about mortality in ways no anime has.",
  "The first arc is a perfect thriller. The battle of wits is unmatched in anime.",
]
const MOCK_HELPFUL = [312,187,245,134,298,156,421,89]
const MOCK_HELPED_BY_ME = [false,true,false,false,true,false,false,true]
const MOCK_DATES = ["2d","5d","1w","1w","2w","2w","3w","1m"]
const MOCK_HAS_SPOILERS = [false,false,false,true,false,false,false,true]

type ApiReview = { id: string; animeId: string; score: number; body: string; hasSpoilers: boolean; createdAt: string; _count?: { likes: number }; author: { username: string; displayName: string }; anime?: { id: string; malId: number; title: string; imageUrl: string | null } }

export default function CommunityReviewsPage() {
  const { push } = useToast()
  const { data: browseData } = useBrowseAnime({ limit: 12 })

  const { data: reviewsApiData } = useQuery({
    queryKey: ["community-reviews"],
    queryFn: () => api<Paginated<ApiReview>>("/reviews?sort=helpful&limit=20"),
  })

  const apiReviews = (reviewsApiData?.data ?? []).map((r, i) => ({
    id: i + 1,
    anime: mapDTO({ id: r.anime?.id ?? "", malId: r.anime?.malId ?? 0, title: r.anime?.title ?? "Unknown", titleJapanese: null, synopsis: null, type: null, episodes: null, status: null, airedFrom: null, airedTo: null, season: null, year: null, rating: null, score: null, imageUrl: r.anime?.imageUrl ?? null, trailerUrl: null, source: null, genres: [] as string[], studios: [] as string[] } as any, i),
    author: r.author?.displayName ?? r.author?.username ?? "Anonymous",
    score: r.score, body: r.body,
    helpful: r._count?.likes ?? 0, helpedByMe: false,
    date: (() => { const d = Date.now() - new Date(r.createdAt).getTime(); return d < 86400000 ? `${Math.floor(d/3600000)}h ago` : `${Math.floor(d/86400000)}d ago` })(),
    hasSpoilers: r.hasSpoilers,
  }))

  const MOCK = apiReviews.length > 0 ? apiReviews : (browseData?.data ?? []).map(mapDTO).slice(0, 8).map((anime, i) => ({
    id: i + 1, anime, author: MOCK_AUTHORS[i] ?? "Anon", score: MOCK_SCORES[i] ?? 9,
    body: MOCK_BODIES[i] ?? "", helpful: MOCK_HELPFUL[i] ?? 0, helpedByMe: MOCK_HELPED_BY_ME[i] ?? false,
    date: (MOCK_DATES[i] ?? "1m") + " ago", hasSpoilers: MOCK_HAS_SPOILERS[i] ?? false,
  }))
  const [sort, setSort] = useState<"helpful"|"recent"|"highest"|"lowest">("helpful")
  const [helpedBy, setHelpedBy] = useState<Set<number>>(new Set(MOCK.filter(r=>r.helpedByMe).map(r=>r.id)))
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  const sorted = useMemo(() => [...MOCK].sort((a,b) => {
    if (sort==="helpful") return b.helpful - a.helpful
    if (sort==="highest") return b.score - a.score
    if (sort==="lowest")  return a.score - b.score
    return 0
  }), [sort, MOCK])

  const toggleHelp = (id: number) => {
    setHelpedBy(s => { const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n })
    push("Vote recorded!", "success")
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-4xl mx-auto px-6 pt-32 space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60 mb-2">Community Voices</p>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white">
              Reviews<span className="text-indigo-500">.</span>
            </h1>
            <p className="text-white/35 text-sm mt-1">{MOCK.length} community reviews</p>
          </div>
          <Link href="/rate" className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-xs font-black uppercase tracking-widest text-white transition-all">
            <PenSquare size={13} /> Write a Review
          </Link>
        </div>

        {/* Sort */}
        <div className="flex gap-2 flex-wrap items-center">
          <SortAsc size={13} className="text-white/30" />
          {(["helpful","recent","highest","lowest"] as const).map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all capitalize ${sort===s?"bg-amber-500 text-black":"bg-white/5 text-white/40 border border-white/5 hover:bg-white/8"}`}
            >{s}</button>
          ))}
        </div>

        {/* Reviews */}
        <div className="grid md:grid-cols-2 gap-5">
          {sorted.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-colors space-y-4"
            >
              <div className="flex items-center gap-3">
                <Link href={`/anime/${r.anime.id}`} className="relative h-12 w-9 rounded-lg overflow-hidden shrink-0">
                  <Image src={r.anime.image} alt={r.anime.title} fill className="object-cover" sizes="36px"/>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/anime/${r.anime.id}`} className="text-sm font-black text-white/80 hover:text-white truncate block">{r.anime.title}</Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s=>(
                        <Star key={s} size={9} fill={s<=Math.round(r.score/2)?"#f59e0b":"none"} className={s<=Math.round(r.score/2)?"text-amber-400":"text-white/15"}/>
                      ))}
                    </div>
                    <span className="text-[9px] font-black text-white/50">{r.score}/10</span>
                    {r.hasSpoilers && <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">Spoilers</span>}
                  </div>
                </div>
              </div>

              <div>
                {r.hasSpoilers && !revealed.has(r.id)
                  ? <button onClick={()=>setRevealed(s=>new Set([...s,r.id]))} className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
                      <Eye size={12} className="inline mr-1"/>Reveal spoiler review
                    </button>
                  : <p className="text-sm text-white/60 leading-relaxed line-clamp-3">{r.body}</p>
                }
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 text-[9px] text-white/25">
                  <span className="font-black text-white/40">{r.author}</span>
                  <span>·</span><span>{r.date}</span>
                </div>
                <button onClick={()=>toggleHelp(r.id)}
                  className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${helpedBy.has(r.id)?"text-emerald-400":"text-white/25 hover:text-white/50"}`}
                >
                  <ThumbsUp size={11} fill={helpedBy.has(r.id)?"currentColor":"none"}/>
                  {r.helpful + (helpedBy.has(r.id) !== r.helpedByMe ? (helpedBy.has(r.id)?1:-1) : 0)}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
