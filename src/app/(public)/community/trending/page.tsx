"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Flame, TrendingUp, MessageSquare, Vote,
  Heart, ChevronRight, Star, BarChart2,
  ArrowUpRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useBrowseAnime } from "@/hooks/useAnime"
import { useDiscover } from "@/hooks/usePosts"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

/* ── Mock data ── */
type TrendingPost = {
  id: number
  author: string
  avatar: string
  content: string
  anime?: string
  likes: number
  comments: number
  timeAgo: string
  tags: string[]
}

const TRENDING_POSTS: TrendingPost[] = [
  {
    id: 1,
    author: "Otaku_Arch",
    avatar: "O",
    content:
      "Frieren's mana concealment arc is the single best power-scaling episode of the decade. Fight me.",
    anime: "Frieren: Beyond Journey's End",
    likes: 842,
    comments: 137,
    timeAgo: "14m ago",
    tags: ["frieren", "power-scaling", "must-watch"],
  },
  {
    id: 2,
    author: "NeuralBot_X",
    avatar: "N",
    content:
      "Johan Liebert is the greatest villain in anime history and Monster deserves a 4K remaster. This is not up for debate.",
    anime: "Monster",
    likes: 619,
    comments: 84,
    timeAgo: "32m ago",
    tags: ["monster", "villain", "underrated"],
  },
  {
    id: 3,
    author: "ShadowWatcher",
    avatar: "S",
    content:
      "Just rewatched Brotherhood start to finish in 3 days. Some anime just never age. The alchemy system is still unmatched worldbuilding.",
    anime: "Fullmetal Alchemist: Brotherhood",
    likes: 507,
    comments: 62,
    timeAgo: "1h ago",
    tags: ["FMA", "rewatch", "worldbuilding"],
  },
  {
    id: 4,
    author: "VoidSeeker",
    avatar: "V",
    content:
      "Hot take: Chainsaw Man Part 2 is actually better than Part 1 once you stop expecting a sequel and treat it as something entirely new.",
    anime: "Chainsaw Man",
    likes: 388,
    comments: 201,
    timeAgo: "2h ago",
    tags: ["chainsaw-man", "hot-take", "part2"],
  },
  {
    id: 5,
    author: "Cipher_Ronin",
    avatar: "C",
    content:
      "Vinland Saga Season 2 is one of the quietest, most profound things anime has ever done. No fights. Just philosophy and farming. Perfection.",
    anime: "Vinland Saga",
    likes: 344,
    comments: 49,
    timeAgo: "3h ago",
    tags: ["vinland-saga", "masterpiece", "slow-burn"],
  },
  {
    id: 6,
    author: "GlitchMage",
    avatar: "G",
    content:
      "Dungeon Meshi is proof that the premise doesn't matter — execution is everything. 'Cooking dungeon monsters' became the most wholesome show of 2024.",
    anime: "Delicious in Dungeon",
    likes: 301,
    comments: 37,
    timeAgo: "4h ago",
    tags: ["dungeon-meshi", "cozy", "cooking"],
  },
]

type TrendingPoll = {
  id: number
  question: string
  votes: number
  options: { label: string; pct: number }[]
}

const TRENDING_POLLS: TrendingPoll[] = [
  {
    id: 1,
    question: "Best anime of 2024?",
    votes: 14832,
    options: [
      { label: "Dungeon Meshi", pct: 48 },
      { label: "Solo Leveling", pct: 30 },
      { label: "Frieren S2",    pct: 22 },
    ],
  },
  {
    id: 2,
    question: "Most rewatch-worthy anime ever?",
    votes: 9410,
    options: [
      { label: "FMA: Brotherhood", pct: 41 },
      { label: "Steins;Gate",      pct: 35 },
      { label: "Hunter x Hunter",  pct: 24 },
    ],
  },
  {
    id: 3,
    question: "Which MAPPA show wins AOTY?",
    votes: 7203,
    options: [
      { label: "Chainsaw Man",  pct: 52 },
      { label: "Attack on Titan Final", pct: 33 },
      { label: "Jujutsu Kaisen S2",     pct: 15 },
    ],
  },
]

const DISCUSSION_COUNTS = [2841, 1940, 1603, 1287]

/* ── Sub-components ── */
function PostCard({ post, index }: { post: TrendingPost; index: number }) {
  const [liked, setLiked] = useState(false)
  const isHot = post.likes > 300

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="relative p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-all space-y-3"
    >
      {isHot && (
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/25">
          <Flame size={10} className="text-orange-400" />
          <span className="text-[9px] font-black uppercase tracking-widest text-orange-400">Hot</span>
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-sm shrink-0">
          {post.avatar}
        </div>
        <div>
          <p className="text-sm font-black text-white">{post.author}</p>
          <p className="text-[10px] text-white/30">{post.timeAgo}</p>
        </div>
      </div>

      {/* Anime badge */}
      {post.anime && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-500/8 border border-indigo-500/15 text-[9px] font-bold text-indigo-400">
          <Star size={8} /> {post.anime}
        </span>
      )}

      {/* Content */}
      <p className="text-sm text-white/70 leading-relaxed line-clamp-3">{post.content}</p>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <span key={t} className="text-[9px] font-bold text-indigo-400/50">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 border-t border-white/5">
        <button
          onClick={() => setLiked((l) => !l)}
          className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
            liked ? "text-rose-400" : "text-white/30 hover:text-rose-400"
          }`}
        >
          <Heart size={13} fill={liked ? "currentColor" : "none"} />
          {liked ? post.likes + 1 : post.likes}
        </button>
        <button className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-indigo-400 transition-colors">
          <MessageSquare size={13} />
          {post.comments}
        </button>
      </div>
    </motion.article>
  )
}

function PollBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  )
}

const POLL_COLORS = ["bg-indigo-500", "bg-violet-500", "bg-blue-500"]

/* ── Page ── */
export default function CommunityTrendingPage() {
  const { data: browseData } = useBrowseAnime({ limit: 4 })
  const ANIME_DISCUSSION = (browseData?.data ?? []).map(mapDTO).slice(0, 4)
  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-5xl mx-auto px-6 pt-28">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/25 mb-8">
          <Link href="/community" className="hover:text-white/60 transition-colors">Community</Link>
          <ChevronRight size={11} className="text-white/15" />
          <span className="text-indigo-400">Trending</span>
        </nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-3">
            Live · Updated every 15 min
          </p>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
              Trending<br />
              <span className="text-indigo-400">Now</span>
              <span style={{color:"#f59e0b"}}>.</span>
            </h1>
            {/* Live pulse */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/25 self-start mt-4">
              <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-rose-400">Live</span>
            </div>
          </div>
          <p className="text-white/35 text-sm">What the Shinobi community can&apos;t stop talking about.</p>
        </motion.div>

        {/* ── SECTION 1: Trending Posts ── */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                <Flame size={15} className="text-orange-400" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Section 01</p>
                <h2 className="text-lg font-black uppercase italic tracking-tighter text-white">Trending Posts</h2>
              </div>
            </div>
            <Link
              href="/community/feed"
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View All <ArrowUpRight size={11} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRENDING_POSTS.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        </section>

        {/* ── SECTION 2: Trending Anime Discussions ── */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                <TrendingUp size={15} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Section 02</p>
                <h2 className="text-lg font-black uppercase italic tracking-tighter text-white">Trending Discussions</h2>
              </div>
            </div>
            <Link
              href="/community/anime"
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View All <ArrowUpRight size={11} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ANIME_DISCUSSION.map((anime, i) => (
              <motion.div
                key={anime.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.07 }}
                className="group relative rounded-2xl overflow-hidden border border-white/8 hover:border-indigo-500/30 transition-all cursor-pointer"
              >
                <Link href={`/anime/${anime.id}`} className="block">
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={anime.image}
                      alt={anime.title}
                      fill
                      className="object-cover brightness-60 group-hover:brightness-75 transition-all duration-500 scale-105 group-hover:scale-100"
                      sizes="200px"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
                      <p className="text-xs font-black text-white uppercase italic tracking-tight leading-tight line-clamp-2 mb-2">
                        {anime.title}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare size={10} className="text-indigo-400" />
                        <span className="text-[10px] font-black text-white/60">
                          {DISCUSSION_COUNTS[i].toLocaleString()} posts
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── SECTION 3: Trending Polls ── */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                <Vote size={15} className="text-amber-400" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Section 03</p>
                <h2 className="text-lg font-black uppercase italic tracking-tighter text-white">Trending Polls</h2>
              </div>
            </div>
            <Link
              href="/poll"
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View All <ArrowUpRight size={11} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {TRENDING_POLLS.map((poll, i) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.08 }}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-amber-500/20 transition-all space-y-4"
              >
                <div>
                  <p className="text-sm font-black text-white leading-snug">{poll.question}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <BarChart2 size={10} className="text-amber-400" />
                    <span className="text-[10px] text-white/30">{poll.votes.toLocaleString()} votes</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {poll.options.map((opt, oi) => (
                    <div key={opt.label} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-white/70">{opt.label}</span>
                        <span className="font-black text-white/50">{opt.pct}%</span>
                      </div>
                      <PollBar pct={opt.pct} color={POLL_COLORS[oi % POLL_COLORS.length]} />
                    </div>
                  ))}
                </div>
                <Link
                  href="/poll"
                  className="block text-center text-[10px] font-black uppercase tracking-widest text-amber-400/60 hover:text-amber-400 transition-colors"
                >
                  Vote →
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA — full trending page */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 pt-8 border-t border-white/5 flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Want more?</p>
            <p className="text-sm text-white/50 mt-0.5">See the full trending board with live rankings.</p>
          </div>
          <Link
            href="/trending"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600/15 border border-indigo-500/25 text-[11px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-600/25 transition-all"
          >
            Full Trending <ArrowUpRight size={12} />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
