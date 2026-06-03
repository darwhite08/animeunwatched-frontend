"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Flame, TrendingUp, Users, BarChart2,
  Heart, MessageSquare, Vote,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useTrending } from "@/hooks/usePosts"
import { useBrowseAnime } from "@/hooks/useAnime"

/* ── Mock data ── */

type TrendingPost = {
  id: number
  author: string
  avatar: string
  excerpt: string
  likes: number
  comments: number
  time: string
}

const TRENDING_POSTS: TrendingPost[] = [
  { id: 1, author: "Otaku_Arch",    avatar: "O", excerpt: "Frieren's power scaling episode just broke my brain. The concept of mana concealment being the TRUE skill ceiling is one of the most thought…", likes: 312, comments: 48, time: "2m ago"   },
  { id: 2, author: "ShadowWatcher", avatar: "S", excerpt: "Controversial take: Chainsaw Man's anime actually elevated the manga. MAPPA's cinematographic direction in the final arc is something no adap…",  likes: 184, comments: 93, time: "18m ago"  },
  { id: 3, author: "NeuralBot_X",   avatar: "N", excerpt: "Just finished Monster for the first time in 2026. Why did nobody tell me this exists?? Absolutely floored. 74 episodes and not a single bad…",  likes: 427, comments: 62, time: "1h ago"   },
  { id: 4, author: "VoidSeeker",    avatar: "V", excerpt: "The way Your Lie in April uses color theory to signal emotional states is graduate-level filmmaking. I've watched the piano duet scene 11 ti…",  likes: 256, comments: 34, time: "3h ago"   },
  { id: 5, author: "Cipher_Ronin",  avatar: "C", excerpt: "Solo Leveling Season 2 trailer just dropped and the power gap between Jinwoo and everyone else looks absolutely insane. Monarch arc is going…",  likes: 891, comments: 147, time: "5h ago"  },
  { id: 6, author: "PixelSamurai",  avatar: "P", excerpt: "Rewatched Code Geass for the fourth time and the ending still hits like a truck. Lelouch is legitimately the greatest anti-hero in anime h…",  likes: 203, comments: 29, time: "7h ago"   },
]

type TrendingPoll = {
  id: number
  question: string
  votes: number
  options: string[]
}

const TRENDING_POLLS: TrendingPoll[] = [
  { id: 1, question: "Best anime of 2024?",        votes: 4203, options: ["Dungeon Meshi", "Solo Leveling", "Frieren S2"] },
  { id: 2, question: "Strongest anime character?", votes: 6841, options: ["Goku", "Saitama", "Anos Voldigoad"] },
  { id: 3, question: "Most emotional finale?",     votes: 2917, options: ["Frieren", "Violet Evergarden", "YLIA"] },
]

type Creator = {
  id: number
  name: string
  avatar: string
  followers: string
  topArticle: string
}

const TOP_CREATORS: Creator[] = [
  { id: 1, name: "Otaku_Arch",    avatar: "O", followers: "12.4k", topArticle: "Why Frieren Is the Best Fantasy Anime of the Decade" },
  { id: 2, name: "NeuralBot_X",   avatar: "N", followers: "8.9k",  topArticle: "Monster: A Complete Psychological Breakdown" },
  { id: 3, name: "Cipher_Ronin",  avatar: "C", followers: "6.1k",  topArticle: "Solo Leveling and the Power Fantasy Formula" },
]

const PERCENT_CHANGES: Record<string, string> = {
  "mob-psycho-100":  "+22%",
  "jujutsu-kaisen":  "+18%",
  "demon-slayer":    "+15%",
  "spy-x-family":    "+11%",
}

/* ── Page ── */
export default function TrendingPage() {
  const { data: trendingData } = useTrending(20)
  const { data: browseData }   = useBrowseAnime({ limit: 6 })
  const apiPosts = trendingData?.data ?? []
  const apiAnime = browseData?.data?.slice(0, 4) ?? []
  const [votedPolls, setVotedPolls] = useState<Record<number, string>>({})

  const vote = (pollId: number, option: string) => {
    setVotedPolls(v => ({ ...v, [pollId]: option }))
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">

      {/* Header */}
      <div className="border-b border-border bg-black/40 backdrop-blur-md sticky top-[72px] z-30">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <Flame size={18} className="text-orange-400" />
            <h1 className="text-2xl font-black tracking-tighter uppercase italic text-foreground">
              Trending<span className="text-orange-500">.</span>
            </h1>
          </div>
          <p className="text-xs text-subtle mt-0.5">What the Shinobi are watching, saying, and voting on right now</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-10 space-y-16">

        {/* ── Section 1: Trending Discussions ── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare size={14} className="text-accent-bright" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Trending Discussions</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {(apiPosts.length > 0 ? apiPosts : TRENDING_POSTS).map((post, i) => {
              const isAPI = "author" in post && typeof post.author === "object"
              const author  = isAPI ? ((post as any).author?.displayName ?? (post as any).author?.username ?? "?") : (post as any).author
              const excerpt = (post as any).content?.slice(0, 100) ?? (post as any).excerpt?.slice(0, 100) ?? ""
              const likes   = isAPI ? ((post as any)._count?.likes ?? 0) : (post as any).likes
              const comments = isAPI ? ((post as any)._count?.comments ?? 0) : (post as any).comments
              const time    = isAPI ? (() => { const d = Date.now() - new Date((post as any).createdAt).getTime(); return d < 3600000 ? `${Math.floor(d/60000)}m ago` : `${Math.floor(d/3600000)}h ago` })() : (post as any).time
              return (
              <motion.article key={post.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-5 rounded-2xl bg-surface-2 border border-border hover:border-border transition-colors space-y-3 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-xs shrink-0">
                    {author[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-foreground truncate">{author}</p>
                    <p className="text-[9px] text-subtle">{time}</p>
                  </div>
                </div>
                <p className="text-xs text-muted leading-relaxed line-clamp-2">{excerpt}…</p>
                <div className="flex items-center gap-4 pt-1">
                  <span className={`flex items-center gap-1 text-xs font-bold ${likes > 200 ? "text-orange-400" : "text-subtle"}`}>
                    {likes > 200 ? <Flame size={12} /> : <Heart size={12} />}{likes}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-subtle">
                    <MessageSquare size={12} />{comments}
                  </span>
                </div>
              </motion.article>
            )})}
          </div>
        </section>

        {/* ── Section 2: Anime Getting Attention ── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={14} className="text-emerald-400" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Anime Getting Attention This Week</h2>
          </div>

          <div className="space-y-4">
            {apiAnime.map((anime, i) => (
              <motion.div
                key={anime.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/anime/${anime.malId}`}
                  className="flex gap-5 p-4 rounded-2xl bg-surface-2 border border-border hover:border-border transition-colors group"
                >
                  {/* Cover image */}
                  <div className="relative h-24 w-16 rounded-xl overflow-hidden shrink-0">
                    {anime.imageUrl && <Image
                      src={anime.imageUrl}
                      alt={anime.title}
                      fill
                      className="object-cover brightness-90 group-hover:brightness-100 transition-all"
                      sizes="64px"
                    />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-foreground group-hover:text-accent-bright transition-colors truncate">{anime.title}</p>
                        <p className="text-[10px] text-subtle mt-0.5">{anime.studios[0] ?? "Unknown"} · {anime.year}</p>
                      </div>
                      <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400">
                        {"+9%"} this week
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {anime.genres.slice(0, 3).map(g => (
                        <span key={g} className="text-[9px] px-2 py-0.5 rounded-full bg-surface text-subtle font-bold uppercase tracking-wide">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Section 3: Trending Polls ── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Vote size={14} className="text-accent-bright" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Trending Polls</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {TRENDING_POLLS.map((poll, i) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="p-5 rounded-2xl bg-surface border border-border space-y-4"
              >
                <p className="text-sm font-bold text-muted">{poll.question}</p>
                <p className="text-[10px] text-subtle">{poll.votes.toLocaleString()} votes</p>

                <div className="space-y-2">
                  {poll.options.map(option => {
                    const voted = votedPolls[poll.id]
                    const isSelected = voted === option
                    return (
                      <button
                        key={option}
                        onClick={() => vote(poll.id, option)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                          voted
                            ? isSelected
                              ? "bg-accent/15 border border-accent/30 text-accent-bright"
                              : "bg-surface border border-border text-subtle"
                            : "bg-white/[0.04] border border-border text-muted hover:text-foreground hover:border-accent/20 hover:bg-accent/5"
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Section 4: Top Creators This Week ── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Users size={14} className="text-violet-400" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Top Creators This Week</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {TOP_CREATORS.map((creator, i) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="p-5 rounded-2xl bg-surface border border-border hover:border-violet-500/20 transition-colors space-y-3 cursor-pointer"
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                    {creator.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground">{creator.name}</p>
                    <p className="text-[10px] text-subtle flex items-center gap-1 mt-0.5">
                      <Users size={9} /> {creator.followers} followers
                    </p>
                  </div>
                </div>

                {/* Rank badge */}
                <div className="flex items-center gap-2">
                  <BarChart2 size={11} className="text-violet-400/60" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-violet-400/60">
                    #{i + 1} this week
                  </span>
                </div>

                {/* Top article */}
                <p className="text-xs text-muted leading-relaxed line-clamp-2">
                  {creator.topArticle}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
