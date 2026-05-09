"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Send,
  Smile,
  UserPlus,
  UserCheck,
  Star,
  TrendingUp,
  Users,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { ANIME_DB } from "@/lib/data/anime"

/* ── Types ── */
type FeedPost = {
  id: number
  author: string
  avatar: string
  time: string
  content: string
  anime?: string
  likes: number
  comments: number
  liked: boolean
  tags: string[]
  isFollowing: boolean
}

type FeedTab = "foryou" | "following" | "latest"

type Suggestion = {
  username: string
  avatar: string
  grade: string
  followers: number
  isFollowing: boolean
}

/* ── Mock data ── */
const FEED_POSTS: FeedPost[] = [
  {
    id: 1,
    author: "Otaku_Arch",
    avatar: "O",
    time: "4m ago",
    content:
      "Frieren's power scaling episode just broke my brain. The concept of mana concealment being the TRUE skill ceiling is one of the most thoughtful magic system reveals I've ever seen. 🤯",
    anime: "Frieren: Beyond Journey's End",
    likes: 312,
    comments: 48,
    liked: false,
    tags: ["power-scaling", "frieren", "magic-system"],
    isFollowing: true,
  },
  {
    id: 2,
    author: "ShadowWatcher",
    avatar: "S",
    time: "22m ago",
    content:
      "Controversial take: Chainsaw Man's anime actually elevated the manga. MAPPA's cinematographic direction in the final arc is something no adaptation has done before. Fight me.",
    anime: "Chainsaw Man",
    likes: 184,
    comments: 93,
    liked: true,
    tags: ["chainsaw-man", "hot-take", "animation"],
    isFollowing: true,
  },
  {
    id: 3,
    author: "NeuralBot_X",
    avatar: "N",
    time: "1h ago",
    content:
      "Just finished Monster for the first time. Why did nobody tell me this exists?? Absolutely floored. 74 episodes and not a single bad one. Johan is the greatest villain in anime history — no debate.",
    anime: "Monster",
    likes: 427,
    comments: 62,
    liked: false,
    tags: ["monster", "underrated", "villain"],
    isFollowing: false,
  },
  {
    id: 4,
    author: "VoidSeeker",
    avatar: "V",
    time: "3h ago",
    content:
      "The way Your Lie in April uses color theory to signal emotional states is graduate-level filmmaking. I've watched the piano duet scene 11 times and I'm not okay.",
    anime: "Your Lie in April",
    likes: 256,
    comments: 34,
    liked: false,
    tags: ["your-lie-in-april", "cinematography", "emotional"],
    isFollowing: true,
  },
  {
    id: 5,
    author: "Cipher_Ronin",
    avatar: "C",
    time: "5h ago",
    content:
      "Solo Leveling Season 2 trailer just dropped and the power gap between Jinwoo and everyone else looks absolutely insane. Monarch arc is going to go crazy if they animate it right.",
    anime: "Solo Leveling",
    likes: 891,
    comments: 147,
    liked: true,
    tags: ["solo-leveling", "hype", "season-2"],
    isFollowing: false,
  },
  {
    id: 6,
    author: "PixelSamurai",
    avatar: "P",
    time: "7h ago",
    content:
      "Dungeon Meshi just proved that a cooking-focused fantasy can be peak anime. Laios's infectious enthusiasm for monster cuisine somehow made me care more about the lore than any exposition dump ever could.",
    anime: "Dungeon Meshi",
    likes: 344,
    comments: 58,
    liked: false,
    tags: ["dungeon-meshi", "delicious-in-dungeon", "slice-of-life"],
    isFollowing: true,
  },
  {
    id: 7,
    author: "ArcaneKomachi",
    avatar: "A",
    time: "10h ago",
    content:
      "Rewatching Steins;Gate for the 4th time. Every rewatch I notice another subtle time-loop clue planted in the first episode. The writers were playing 4D chess with us the whole time.",
    anime: "Steins;Gate",
    likes: 511,
    comments: 76,
    liked: false,
    tags: ["steins-gate", "rewatch", "foreshadowing"],
    isFollowing: true,
  },
  {
    id: 8,
    author: "MirrorMirr",
    avatar: "M",
    time: "14h ago",
    content:
      "Hot take: The Promised Neverland Season 1 finale is still the single best cliffhanger in anime history and I won't be taking questions.",
    anime: "The Promised Neverland",
    likes: 189,
    comments: 112,
    liked: false,
    tags: ["promised-neverland", "thriller", "hot-take"],
    isFollowing: false,
  },
]

const SUGGESTIONS: Suggestion[] = [
  {
    username: "otaku_arch",
    avatar: "O",
    grade: "Crimson Shinobi",
    followers: 1840,
    isFollowing: false,
  },
  {
    username: "voidseeker",
    avatar: "V",
    grade: "Iron Shinobi",
    followers: 612,
    isFollowing: false,
  },
  {
    username: "cipher_ronin",
    avatar: "C",
    grade: "Gold Shinobi",
    followers: 3201,
    isFollowing: false,
  },
]

const TRENDING_ANIME = ANIME_DB.filter((a) => a.rating >= 8.8).slice(0, 4)

/* ── Page ── */
export default function FeedPage() {
  const { push } = useToast()
  const { user } = useAuthStore()
  const [posts, setPosts] = useState<FeedPost[]>(FEED_POSTS)
  const [feedTab, setFeedTab] = useState<FeedTab>("foryou")
  const [draft, setDraft] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>(SUGGESTIONS)

  const authorInitial = user?.username?.slice(0, 1).toUpperCase() ?? "D"

  const toggleLike = (id: number) => {
    setPosts((ps) =>
      ps.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    )
  }

  const submitPost = () => {
    if (!draft.trim()) return
    const newPost: FeedPost = {
      id: Date.now(),
      author: user?.username ?? "darwhite08",
      avatar: authorInitial,
      time: "just now",
      content: draft,
      likes: 0,
      comments: 0,
      liked: false,
      tags: [],
      isFollowing: false,
    }
    setPosts((ps) => [newPost, ...ps])
    setDraft("")
    push("Post published to your feed!", "success")
  }

  const toggleSuggestFollow = (username: string) => {
    setSuggestions((ss) =>
      ss.map((s) => {
        if (s.username !== username) return s
        const next = !s.isFollowing
        push(
          next ? `You're now following @${username}! 🎌` : `Unfollowed @${username}`,
          next ? "success" : "info",
        )
        return { ...s, isFollowing: next }
      }),
    )
  }

  const visiblePosts =
    feedTab === "following"
      ? posts.filter((p) => p.isFollowing)
      : feedTab === "latest"
        ? [...posts].sort((a, b) => a.id - b.id)
        : posts

  const TAB_LABELS: { key: FeedTab; label: string }[] = [
    { key: "foryou", label: "For You" },
    { key: "following", label: "Following" },
    { key: "latest", label: "Latest" },
  ]

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">

      {/* ── Sticky header ── */}
      <div className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-[72px] z-30">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                Your Feed<span className="text-indigo-500">.</span>
              </h1>
              {/* Live badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-white/30 mt-0.5">Posts from people you follow + your own</p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-1 pb-0">
          {TAB_LABELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFeedTab(key)}
              className={`relative px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-colors ${
                feedTab === key ? "text-white" : "text-white/30 hover:text-white/60"
              }`}
            >
              {label}
              {feedTab === key && (
                <motion.div
                  layoutId="feed-tab-line"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8 grid lg:grid-cols-3 gap-8">

        {/* ── LEFT: Feed ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Always-visible compose bar */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/70 border border-indigo-500/20 rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-sm shrink-0">
                {authorInitial}
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Share a theory, hot take, or reaction…"
                rows={3}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 resize-none outline-none leading-relaxed pt-1"
              />
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <button
                onClick={() => push("Emoji picker coming soon!", "info")}
                className="p-1.5 text-white/30 hover:text-amber-400 transition-colors"
              >
                <Smile size={15} />
              </button>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono ${
                    500 - draft.length < 50 ? "text-amber-400" : "text-white/20"
                  }`}
                >
                  {500 - draft.length}
                </span>
                <button
                  onClick={submitPost}
                  disabled={!draft.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-black uppercase tracking-wider text-white transition-all"
                >
                  <Send size={12} /> Post
                </button>
              </div>
            </div>
          </motion.div>

          {/* Posts */}
          <AnimatePresence mode="popLayout">
            {visiblePosts.length === 0 && feedTab === "following" ? (
              <motion.div
                key="empty-following"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-20 text-center space-y-5"
              >
                <div className="h-16 w-16 mx-auto rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
                  <Users size={28} className="text-white/20" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-black tracking-tight text-white/50">
                    Follow some Shinobi to see their posts here
                  </p>
                  <p className="text-sm text-white/25">
                    Discover fellow anime fans and follow them to build your feed.
                  </p>
                </div>
                <Link
                  href="/users"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-black uppercase tracking-widest text-white transition-all"
                >
                  <Users size={14} /> Discover Shinobi
                </Link>
              </motion.div>
            ) : (
              visiblePosts.map((post, i) => (
                <motion.article
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-zinc-900/60 border border-white/8 hover:border-white/15 rounded-2xl p-6 space-y-4 transition-colors"
                >
                  {/* Author row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Link href={`/u/${post.author}`}>
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-sm hover:opacity-80 transition-opacity">
                          {post.avatar}
                        </div>
                      </Link>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/u/${post.author}`}
                            className="text-sm font-black text-white hover:text-indigo-300 transition-colors"
                          >
                            {post.author}
                          </Link>
                          {post.isFollowing && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-[8px] font-black uppercase tracking-widest text-indigo-400">
                              Following
                            </span>
                          )}
                          {post.likes > 300 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-[8px] font-black uppercase tracking-widest text-amber-400">
                              Trending
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/30">{post.time}</p>
                      </div>
                    </div>
                    <button className="p-1.5 text-white/20 hover:text-white/50 transition-colors">
                      <MoreHorizontal size={15} />
                    </button>
                  </div>

                  {/* Anime badge */}
                  {post.anime && (
                    <Link
                      href="/bestanimelist"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/8 border border-indigo-500/15 text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/15 transition-colors"
                    >
                      <Star size={9} /> {post.anime}
                    </Link>
                  )}

                  {/* Content */}
                  <p className="text-sm text-white/75 leading-relaxed">{post.content}</p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-bold text-indigo-400/60 hover:text-indigo-400 cursor-pointer transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-5 pt-1 border-t border-white/5">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                        post.liked ? "text-rose-400" : "text-white/30 hover:text-rose-400"
                      }`}
                    >
                      <Heart size={14} fill={post.liked ? "currentColor" : "none"} />
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-indigo-400 transition-colors">
                      <MessageSquare size={14} />
                      {post.comments}
                    </button>
                    <button
                      onClick={() => push("Post link copied to clipboard!", "success")}
                      className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-white/60 transition-colors ml-auto"
                    >
                      <Share2 size={13} />
                    </button>
                  </div>
                </motion.article>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="space-y-6">

          {/* Who to Follow */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus size={14} className="text-indigo-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                Who to Follow
              </h3>
            </div>
            <div className="space-y-3">
              {suggestions.map((s) => (
                <motion.div
                  key={s.username}
                  layout
                  className="flex items-center gap-3"
                >
                  <Link href={`/u/${s.username}`}>
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-sm shrink-0 hover:opacity-80 transition-opacity">
                      {s.avatar}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/u/${s.username}`}>
                      <p className="text-xs font-black text-white hover:text-indigo-300 transition-colors truncate">
                        @{s.username}
                      </p>
                    </Link>
                    <p className="text-[9px] text-white/30">{s.followers.toLocaleString()} followers</p>
                  </div>
                  <motion.button
                    onClick={() => toggleSuggestFollow(s.username)}
                    whileTap={{ scale: 0.92 }}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                      s.isFollowing
                        ? "bg-white/8 border border-white/15 text-white/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                    }`}
                  >
                    {s.isFollowing ? (
                      <><UserCheck size={10} /> Following</>
                    ) : (
                      <><UserPlus size={10} /> Follow</>
                    )}
                  </motion.button>
                </motion.div>
              ))}
            </div>
            <Link
              href="/users"
              className="flex items-center justify-center gap-1.5 pt-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors border-t border-white/5"
            >
              See all recommendations <ChevronRight size={11} />
            </Link>
          </div>

          {/* Trending Anime */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-violet-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                Trending Anime
              </h3>
            </div>
            <div className="space-y-3">
              {TRENDING_ANIME.map((anime, i) => (
                <motion.div
                  key={anime.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={`/anime/${anime.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="relative h-12 w-9 rounded-lg overflow-hidden shrink-0 border border-white/8 group-hover:border-indigo-500/30 transition-all">
                      <Image
                        src={anime.image}
                        alt={anime.title}
                        fill
                        className="object-cover brightness-75 group-hover:brightness-90 transition-all"
                        sizes="36px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-white/80 group-hover:text-white transition-colors truncate">
                        {anime.title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star size={9} fill="#f59e0b" className="text-amber-400" />
                        <span className="text-[9px] text-white/40 font-bold">
                          {anime.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Community link */}
          <Link
            href="/community"
            className="flex items-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-indigo-500/20 hover:from-indigo-600/20 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Users size={16} className="text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                Community
              </p>
              <p className="text-[10px] text-white/35 mt-0.5">
                Trending posts from all Shinobi
              </p>
            </div>
            <ChevronRight
              size={14}
              className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all"
            />
          </Link>
        </div>
      </div>
    </div>
  )
}
