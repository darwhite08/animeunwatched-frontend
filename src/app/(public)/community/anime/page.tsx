"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  MessageSquare,
  Search,
  Users,
  TrendingUp,
  Clock,
  Flame,
  ChevronRight,
  Star,
  ArrowRight,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ANIME_DB, type Anime } from "@/lib/data/anime"

// ─── Mock thread data ────────────────────────────────────────────────────────

const THREAD_DATA = [
  {
    id: "thread-fmab-ending",
    animeId: "fullmetal-alchemist-brotherhood",
    title: "The ending of FMA:B is a masterpiece — here's why",
    author: "AlchemyFan42",
    replies: 214,
    lastActivity: "2h ago",
    trending: true,
  },
  {
    id: "thread-steins-gate-ep23",
    animeId: "steins-gate",
    title: "Episode 23 destroyed me. Anyone else still not over it?",
    author: "TuturuFan",
    replies: 187,
    lastActivity: "4h ago",
    trending: true,
  },
  {
    id: "thread-aot-ending-debate",
    animeId: "attack-on-titan",
    title: "AoT ending debate: did Eren make the right choice? [SPOILERS]",
    author: "TitanSlayer99",
    replies: 342,
    lastActivity: "30m ago",
    trending: true,
  },
  {
    id: "thread-hxh-return",
    animeId: "hunter-x-hunter-2011",
    title: "HxH 2024 — are you excited for the manga return?",
    author: "GonFreecss_fan",
    replies: 156,
    lastActivity: "6h ago",
    trending: false,
  },
  {
    id: "thread-death-note-l-vs-light",
    animeId: "death-note",
    title: "L vs Light — who was actually smarter?",
    author: "DeductiiveMind",
    replies: 98,
    lastActivity: "1d ago",
    trending: false,
  },
  {
    id: "thread-frieren-pacing",
    animeId: "frieren",
    title: "Frieren pacing: underrated slow burn or overrated slice-of-life?",
    author: "elfwatcher",
    replies: 73,
    lastActivity: "12h ago",
    trending: false,
  },
  {
    id: "thread-chainsaw-anime-vs-manga",
    animeId: "chainsaw-man",
    title: "Chainsaw Man anime vs manga — which version do you prefer?",
    author: "PowerSimp01",
    replies: 129,
    lastActivity: "3h ago",
    trending: true,
  },
  {
    id: "thread-mob-psycho-animation",
    animeId: "mob-psycho-100",
    title: "Mob Psycho 100 has the best animation in anime — fight me",
    author: "Reigen_is_GOAT",
    replies: 88,
    lastActivity: "8h ago",
    trending: false,
  },
]

// ─── Featured anime (top 3 by rating) ────────────────────────────────────────

const FEATURED_ANIME = [...ANIME_DB]
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 3)

// ─── Thread count per anime ──────────────────────────────────────────────────

function getThreadCount(animeId: string): number {
  return THREAD_DATA.filter((t) => t.animeId === animeId).length
}

function getLatestPost(animeId: string): { title: string; author: string } | null {
  const thread = THREAD_DATA.find((t) => t.animeId === animeId)
  return thread ? { title: thread.title, author: thread.author } : null
}

// ─── Components ───────────────────────────────────────────────────────────────

function FeaturedAnimeCard({ anime, index }: { anime: Anime; index: number }) {
  const threadCount = getThreadCount(anime.id)
  const latest = getLatestPost(anime.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.45 }}
      className="relative rounded-[2rem] overflow-hidden border border-white/5 bg-[#0a0a0a] group hover:border-indigo-500/30 transition-all duration-500"
    >
      {/* Blurred BG */}
      <div className="absolute inset-0">
        <Image
          src={anime.image}
          alt={anime.title}
          fill
          className="object-cover brightness-[0.15] blur-sm scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
      </div>

      <div className="relative z-10 p-6 flex gap-5">
        {/* Cover */}
        <div className="shrink-0 w-20 h-28 rounded-xl overflow-hidden shadow-xl">
          <div className="relative w-full h-full">
            <Image
              src={anime.image}
              alt={anime.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black uppercase italic tracking-tight text-white leading-tight line-clamp-2 mb-2">
              {anime.title}
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center gap-1 text-[10px] font-black text-amber-400">
                <Star size={10} fill="#f59e0b" /> {anime.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400">
                <MessageSquare size={10} />
                {threadCount} thread{threadCount !== 1 ? "s" : ""}
              </span>
            </div>
            {latest && (
              <p className="text-[10px] text-white/30 line-clamp-2 leading-relaxed">
                <span className="text-white/50 font-bold">{latest.author}:</span> {latest.title}
              </p>
            )}
          </div>
          <Link
            href="/threads/some-id"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase tracking-widest text-white transition-all w-fit"
          >
            Join Discussion <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

function ThreadRow({
  thread,
  index,
}: {
  thread: (typeof THREAD_DATA)[number]
  index: number
}) {
  const anime = ANIME_DB.find((a) => a.id === thread.animeId)
  if (!anime) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.35 }}
      className="group flex items-center gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.035] transition-all duration-300 cursor-pointer"
    >
      {/* Anime thumbnail */}
      <div className="shrink-0 w-12 h-16 rounded-xl overflow-hidden shadow-lg">
        <div className="relative w-full h-full">
          <Image
            src={anime.image}
            alt={anime.title}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">
            {anime.title}
          </span>
          {thread.trending && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/20 text-[8px] font-black uppercase tracking-wider text-orange-400">
              <Flame size={8} /> Hot
            </span>
          )}
        </div>
        <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors line-clamp-1 leading-snug">
          {thread.title}
        </p>
        <p className="text-[10px] text-white/30 mt-0.5 font-medium">
          by <span className="text-white/50">{thread.author}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="shrink-0 flex flex-col items-end gap-1.5 text-right">
        <span className="flex items-center gap-1 text-[10px] font-black text-white/40">
          <MessageSquare size={10} /> {thread.replies}
        </span>
        <span className="flex items-center gap-1 text-[9px] font-bold text-white/20">
          <Clock size={9} /> {thread.lastActivity}
        </span>
      </div>

      <ChevronRight size={14} className="shrink-0 text-white/10 group-hover:text-white/30 transition-colors" />
    </motion.div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AnimeDiscussionsPage() {
  const [query, setQuery] = useState("")

  const filteredThreads = useMemo(() => {
    if (!query.trim()) return THREAD_DATA
    const q = query.toLowerCase()
    return THREAD_DATA.filter((t) => {
      const anime = ANIME_DB.find((a) => a.id === t.animeId)
      return (
        t.title.toLowerCase().includes(q) ||
        anime?.title.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q)
      )
    })
  }, [query])

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* ── Page Header ── */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-transparent to-violet-950/30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-indigo-600/8 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 max-w-2xl"
          >
            <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">
              <Users size={12} />
              Community · Anime Threads
            </div>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-[0.9] text-white">
              Anime<br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                Discussions
              </span>
            </h1>
            <p className="text-white/40 text-sm font-medium leading-relaxed max-w-md">
              Community threads, debates, and deep dives on every anime. Join the conversation or start one of your own.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-14">
        {/* ── Featured Most Discussed ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={14} className="text-violet-400" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
              Most Discussed
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURED_ANIME.map((anime, i) => (
              <FeaturedAnimeCard key={anime.id} anime={anime} index={i} />
            ))}
          </div>
        </section>

        {/* ── Search ── */}
        <section>
          <div className="relative max-w-xl">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search discussions by anime, topic, or author…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-4 rounded-2xl bg-white/[0.04] border border-white/8 focus:border-indigo-500/40 focus:bg-white/[0.06] text-white text-sm font-medium placeholder:text-white/20 outline-none transition-all"
            />
          </div>
        </section>

        {/* ── Thread List ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <MessageSquare size={14} className="text-indigo-400" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                All Threads
                <span className="ml-2 text-white/20">({filteredThreads.length})</span>
              </h2>
            </div>
          </div>

          {filteredThreads.length === 0 ? (
            <div className="py-20 text-center">
              <MessageSquare size={32} className="text-white/10 mx-auto mb-4" />
              <p className="text-white/30 font-bold text-sm">No threads match your search</p>
              <p className="text-white/15 text-xs mt-1">Try a different anime name or topic</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredThreads.map((thread, i) => (
                <ThreadRow key={thread.id} thread={thread} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* ── CTA ── */}
        <section className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0a0a0a] p-10 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/8 via-transparent to-indigo-600/8 pointer-events-none" />
          <div className="relative z-10 max-w-md mx-auto space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center mx-auto">
              <MessageSquare size={22} className="text-indigo-400" />
            </div>
            <h3 className="text-3xl font-black uppercase italic tracking-tight text-white">
              Start a Discussion
            </h3>
            <p className="text-white/30 text-sm font-medium leading-relaxed">
              Have something to say about an anime? Create a thread in a club and invite the community.
            </p>
            <Link
              href="/clubs"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-sm font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 active:scale-[0.98]"
            >
              Browse Clubs <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
