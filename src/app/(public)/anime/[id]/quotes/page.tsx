"use client"

import { use, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Quote, ChevronLeft, Heart, Share2, Copy } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

const QUOTE_POOL = [
  "Even if I can't see it, even if I can't feel it, the truth is always there.",
  "The world is not beautiful, therefore it is.",
  "If you don't take risks, you can't create a future.",
  "The only home is one built with your own hands.",
  "People's lives don't end when they die. It ends when they lose faith.",
  "Fear is not evil. It tells you what your weakness is.",
  "Whatever you lose, you'll find it again. But what you throw away you'll never get back.",
  "Knowing what it feels to be in pain is exactly why we try to be kind to others.",
]

const SPEAKERS = ["Protagonist", "Antagonist", "Mentor", "Companion"]

export default function AnimeQuotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: browseData, isLoading } = useBrowseAnime({ limit: 1 })
  const anime = (browseData?.data ?? []).map(mapDTO)[0] ?? null
  const { push } = useToast()

  const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  const quotes = QUOTE_POOL.map((q, i) => ({
    id: i, text: q,
    speaker: SPEAKERS[(seed + i) % SPEAKERS.length],
    episode: `Episode ${((seed + i * 3) % (anime?.episodes ?? 12)) + 1}`,
    liked: false,
  }))

  const [liked, setLiked] = useState<Set<number>>(new Set())

  const copy = (text: string) => {
    navigator.clipboard.writeText(`"${text}" — ${anime?.title ?? ""}`).then(() => push("Quote copied!", "success"))
  }

  if (isLoading) return <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center text-white/30">Loading…</div>

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-32 space-y-8">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
          <Link href={`/anime/${id}`} className="hover:text-white transition-colors">{anime?.title ?? id}</Link>
          <span>·</span><span className="text-white/60">Quotes</span>
        </div>

        <div className="flex items-center gap-3">
          <Quote size={20} className="text-amber-400" />
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
            Memorable Quotes<span style={{color:"#f59e0b"}}>.</span>
          </h1>
        </div>

        <div className="space-y-4">
          {quotes.map((q, i) => (
            <motion.div key={q.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
              className="group p-6 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-amber-500/20 transition-colors space-y-4"
            >
              <div className="flex items-start gap-4">
                <Quote size={20} className="text-amber-400/40 shrink-0 mt-1" />
                <p className="text-base text-white/80 leading-relaxed italic font-medium flex-1">{q.text}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-white/30">
                  <span className="font-black text-white/50">— {q.speaker}</span>
                  <span>·</span><span>{q.episode}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setLiked(s => { const n=new Set(s); n.has(q.id)?n.delete(q.id):n.add(q.id); return n }) }}
                    className={`p-2 rounded-lg transition-colors ${liked.has(q.id)?"text-rose-400":"text-white/30 hover:text-white"}`}
                  >
                    <Heart size={14} fill={liked.has(q.id)?"currentColor":"none"} />
                  </button>
                  <button onClick={() => copy(q.text)} className="p-2 rounded-lg text-white/30 hover:text-white transition-colors">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <Link href={`/anime/${id}`} className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors justify-center">
          <ChevronLeft size={14} /> Back to {anime?.title ?? id}
        </Link>
      </div>
    </div>
  )
}
