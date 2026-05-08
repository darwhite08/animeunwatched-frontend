"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { ANIME_DB, type Anime } from "@/lib/data/anime"
import { useWatchlist } from "@/stores/watchlist.store"
import { useToast } from "@/stores/toast.store"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  Star, Clock, Monitor, Plus, Check, Share2, ChevronLeft,
  MessageSquare, Heart, BookOpen, Play, Sparkles,
} from "lucide-react"

/* ── mock reviews ── */
const MOCK_REVIEWS = [
  { id: 1, user: "Otaku_Arch",     score: 10, body: "An absolute masterpiece. Every arc delivers, the power system is elegant, and the finale is perfection.", date: "3 days ago",  likes: 142 },
  { id: 2, user: "ShadowWatcher",  score: 9,  body: "Nearly flawless. The pacing in the middle drags slightly but the emotional payoff is unmatched in the genre.", date: "1 week ago", likes: 87  },
  { id: 3, user: "NeuralBot_X",    score: 8,  body: "Great entry point for newcomers. Familiar yet fresh, with excellent animation and a likeable cast.", date: "2 weeks ago",likes: 34  },
]

export default function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const anime = ANIME_DB.find(a => a.id === id)
  if (!anime) notFound()

  return <AnimeDetail anime={anime} />
}

function AnimeDetail({ anime }: { anime: Anime }) {
  const { add, remove, has } = useWatchlist()
  const { push } = useToast()
  const inList = has(anime.id)

  const toggle = () => {
    if (inList) { remove(anime.id); push(`Removed "${anime.title}"`, "info") }
    else         { add(anime);       push(`Added "${anime.title}" to watchlist!`, "success") }
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.href}`)
      push("Link copied!", "success")
    } catch { push("Could not copy", "error") }
  }

  /* score → colour */
  const scoreColor = anime.rating >= 9 ? "text-emerald-400" : anime.rating >= 8 ? "text-amber-400" : "text-white/60"

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">

      {/* ── HERO ── */}
      <div className="relative h-[52vh] min-h-[380px] w-full overflow-hidden">
        <Image
          src={anime.image}
          alt={anime.title}
          fill
          className="object-cover object-center brightness-[0.35]"
          sizes="100vw"
          priority
        />
        {/* gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-[#020202]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent" />

        {/* Rank chip */}
        <div className="absolute top-6 left-6 md:left-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))]">
          <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-indigo-500/30 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest">
            #{anime.rank} Neural Ranked
          </span>
        </div>

        {/* Back button */}
        <Link
          href="/bestanimelist"
          className="absolute top-6 right-6 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
        >
          <ChevronLeft size={13} /> All Anime
        </Link>

        {/* Hero content overlay */}
        <div className="absolute bottom-8 left-6 right-6 md:left-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))] md:right-auto max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase italic text-white"
          >
            {anime.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/40 text-sm mt-2 font-mono"
          >
            {anime.titleJapanese}
          </motion.p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-6xl mx-auto px-6 -mt-4">

        {/* Meta bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-4 mb-10"
        >
          {/* Score */}
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3">
            <Star size={16} fill="#f59e0b" className="text-amber-400" />
            <span className={`text-2xl font-black tracking-tighter ${scoreColor}`}>{anime.rating.toFixed(1)}</span>
            <span className="text-xs text-white/30">/10</span>
          </div>

          {/* Metadata chips */}
          {[
            { icon: Clock,   label: anime.episodes ? `${anime.episodes} eps` : "Ongoing"        },
            { icon: Monitor, label: anime.type                                                    },
            { icon: BookOpen,label: anime.studio                                                  },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/8 rounded-xl text-sm font-bold text-white/50">
              <m.icon size={14} className="text-white/30" />
              {m.label}
            </div>
          ))}

          {/* Status */}
          <span className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border ${
            anime.status === "airing"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-white/5 border-white/10 text-white/40"
          }`}>
            {anime.status === "airing" ? "● Airing" : "Completed"}
          </span>

          <span className="text-sm text-white/25">{anime.year}</span>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={toggle}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                inList
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_24px_rgba(99,102,241,0.35)]"
              }`}
            >
              {inList ? <><Check size={14} /> In List</> : <><Plus size={14} /> Add to List</>}
            </motion.button>

            <button
              onClick={share}
              className="p-3 rounded-2xl border border-white/10 bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <Share2 size={16} />
            </button>
          </div>
        </motion.div>

        {/* 2-col layout */}
        <div className="grid lg:grid-cols-3 gap-10">

          {/* LEFT — main info */}
          <div className="lg:col-span-2 space-y-10">

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {anime.genres.map(g => (
                <span key={g} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider text-white/50">
                  {g}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Synopsis</h2>
              <p className="text-white/70 text-base leading-relaxed font-medium">{anime.synopsis}</p>
            </div>

            {/* Tags */}
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Neural Tags</h2>
              <div className="flex flex-wrap gap-2">
                {anime.tags.map(t => (
                  <span key={t} className="px-3 py-1 rounded-lg bg-indigo-500/8 border border-indigo-500/15 text-[10px] font-bold text-indigo-400/80 uppercase tracking-wider">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Community Reviews</h2>
                <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
                  Write a Review
                </button>
              </div>

              <div className="space-y-4">
                {MOCK_REVIEWS.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-black">
                          {r.user[0]}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">{r.user}</p>
                          <p className="text-[9px] text-white/25 mt-0.5">{r.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star size={12} fill="#f59e0b" className="text-amber-400" />
                        <span className="text-sm font-black text-white">{r.score}</span>
                        <span className="text-xs text-white/25">/10</span>
                      </div>
                    </div>
                    <p className="text-sm text-white/55 leading-relaxed">{r.body}</p>
                    <button className="flex items-center gap-1.5 text-[10px] text-white/25 hover:text-white/50 transition-colors">
                      <Heart size={11} /> {r.likes} helpful
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — sidebar */}
          <div className="space-y-6">

            {/* Quick facts */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">Quick Facts</h3>
              {[
                { label: "Studio",   value: anime.studio },
                { label: "Type",     value: anime.type   },
                { label: "Year",     value: String(anime.year) },
                { label: "Episodes", value: anime.episodes ? String(anime.episodes) : "Ongoing" },
                { label: "Status",   value: anime.status === "airing" ? "Currently Airing" : "Finished" },
                { label: "Rating",   value: `${anime.rating.toFixed(1)} / 10` },
              ].map(f => (
                <div key={f.label} className="flex justify-between items-center text-sm">
                  <span className="text-white/35 font-medium">{f.label}</span>
                  <span className="font-bold text-white/80">{f.value}</span>
                </div>
              ))}
            </div>

            {/* Related */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">More Like This</h3>
              <div className="space-y-3">
                {ANIME_DB
                  .filter(a => a.id !== anime.id && a.genres.some(g => anime.genres.includes(g)))
                  .slice(0, 4)
                  .map(related => (
                    <Link
                      key={related.id}
                      href={`/anime/${related.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="relative h-12 w-9 rounded-lg overflow-hidden shrink-0">
                        <Image src={related.image} alt={related.title} fill className="object-cover" sizes="36px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white/70 group-hover:text-white transition-colors truncate">
                          {related.title}
                        </p>
                        <p className="text-[9px] text-white/30 mt-0.5 flex items-center gap-1">
                          <Star size={9} fill="#f59e0b" className="text-amber-400" /> {related.rating.toFixed(1)}
                        </p>
                      </div>
                    </Link>
                  ))
                }
              </div>
            </div>

            {/* AI Discover CTA */}
            <Link
              href="/ai-discover"
              className="flex items-center gap-3 p-5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/15 transition-colors group"
            >
              <Sparkles size={16} className="text-indigo-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">Find Similar Anime</p>
                <p className="text-[10px] text-white/35 mt-0.5">Use Neural Oracle to discover more</p>
              </div>
              <ChevronLeft size={14} className="text-indigo-400/50 group-hover:text-indigo-400 rotate-180 ml-auto transition-all group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
