"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Star,
  Flame,
  Clock,
} from "lucide-react"
import Link from "next/link"
import TrendingWidget from "@/components/social/TrendingWidget"
import WatchlistPreviewWidget from "@/components/social/WatchlistPreviewWidget"
import ShareCard from "@/components/ui/ShareCard"

// ─── Types ────────────────────────────────────────────────────────────────────

type Post = {
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
}

type FeedTab = "trending" | "latest"

// ─── Mock data — 8 posts ──────────────────────────────────────────────────────

const MOCK_POSTS: Post[] = [
  {
    id: 1,
    author: "Otaku_Arch",
    avatar: "O",
    time: "2m ago",
    content:
      "Frieren's power scaling episode just broke my brain. The concept of mana concealment being the TRUE skill ceiling is one of the most thoughtful magic system reveals I've ever seen. 🤯",
    anime: "Frieren: Beyond Journey's End",
    likes: 312,
    comments: 48,
    liked: false,
    tags: ["power-scaling", "frieren", "magic-system"],
  },
  {
    id: 2,
    author: "ShadowWatcher",
    avatar: "S",
    time: "18m ago",
    content:
      "Controversial take: Chainsaw Man's anime actually elevated the manga. MAPPA's cinematographic direction in the final arc is something no adaptation has done before. Fight me.",
    anime: "Chainsaw Man",
    likes: 184,
    comments: 93,
    liked: true,
    tags: ["chainsaw-man", "hot-take", "animation"],
  },
  {
    id: 3,
    author: "NeuralBot_X",
    avatar: "N",
    time: "1h ago",
    content:
      "Just finished Monster for the first time in 2026. Why did nobody tell me this exists?? Absolutely floored. 74 episodes and not a single bad one. Johan is the greatest villain in anime history — no debate.",
    anime: "Monster",
    likes: 427,
    comments: 62,
    liked: false,
    tags: ["monster", "underrated", "villain"],
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
  },
  {
    id: 6,
    author: "MushiMaster",
    avatar: "M",
    time: "7h ago",
    content:
      "Mushishi is what happens when anime becomes literature. Every episode is a short story about longing, nature, and the uncanny. If you haven't watched it you're missing one of the medium's finest achievements.",
    anime: "Mushishi",
    likes: 318,
    comments: 29,
    liked: false,
    tags: ["mushishi", "atmospheric", "underrated"],
  },
  {
    id: 7,
    author: "RealmWalker",
    avatar: "R",
    time: "10h ago",
    content:
      "Delicious in Dungeon might be the most ambitious worldbuilding project in recent anime. The food ecology is literally consistent across 24 episodes. Trigger delivered something special.",
    anime: "Delicious in Dungeon",
    likes: 203,
    comments: 41,
    liked: false,
    tags: ["dungeon-meshi", "worldbuilding", "2024"],
  },
  {
    id: 8,
    author: "SpecterFang",
    avatar: "P",
    time: "14h ago",
    content:
      "Violet Evergarden episode 10 destroyed me. That letter. That ending. KyoAni put more emotion into 24 minutes than most shows do in their entire run. Mandatory watch.",
    anime: "Violet Evergarden",
    likes: 744,
    comments: 88,
    liked: true,
    tags: ["violet-evergarden", "emotional", "kyoani"],
  },
]

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  onLike,
  onShare,
}: {
  post: Post
  onLike: (id: number) => void
  onShare: (post: Post) => void
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/60 border border-white/8 hover:border-white/15 rounded-2xl p-6 space-y-4 transition-colors"
    >
      {/* Author */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-sm">
            {post.avatar}
          </div>
          <div>
            <p className="text-sm font-black text-white">{post.author}</p>
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
          onClick={() => onLike(post.id)}
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
          onClick={() => onShare(post)}
          className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-white/60 transition-colors ml-auto"
        >
          <Share2 size={13} />
        </button>
      </div>
    </motion.article>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicFeedPage() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [feedTab, setFeedTab] = useState<FeedTab>("trending")
  const [sharingPost, setSharingPost] = useState<Post | null>(null)

  const toggleLike = (id: number) => {
    setPosts((ps) =>
      ps.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    )
  }

  // For "latest" tab, sort by id descending (newest first); trending keeps default order
  const displayPosts =
    feedTab === "latest" ? [...posts].sort((a, b) => b.id - a.id) : posts

  const TAB_ICONS: Record<FeedTab, React.ReactNode> = {
    trending: <Flame size={11} />,
    latest: <Clock size={11} />,
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-[72px] z-30">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                Community Feed<span className="text-indigo-500">.</span>
              </h1>
              <p className="text-xs text-white/30 mt-0.5">
                Discover what the Shinobi are watching and saying
              </p>
            </div>
            <Link
              href="/register"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black uppercase tracking-widest text-white transition-all"
            >
              Join Now
            </Link>
          </div>

          {/* Feed tabs — trending + latest only (public) */}
          <div className="flex items-center gap-1 mt-4">
            {(["trending", "latest"] as FeedTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setFeedTab(t)}
                className={`relative flex items-center gap-1.5 px-5 py-3 text-[11px] font-black uppercase tracking-widest capitalize transition-colors ${
                  feedTab === t ? "text-white" : "text-white/30 hover:text-white/60"
                }`}
              >
                {TAB_ICONS[t]}
                {t}
                {feedTab === t && (
                  <motion.div
                    layoutId="public-feed-tab-line"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-full"
                  />
                )}
              </button>
            ))}

            {/* Login gate for following tab */}
            <Link
              href="/register"
              className="relative flex items-center gap-1.5 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white/15 hover:text-white/30 transition-colors"
            >
              Following
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 text-[8px] font-black uppercase tracking-wider">
                Login
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8 grid lg:grid-cols-3 gap-8">
        {/* LEFT: Feed */}
        <div className="lg:col-span-2 space-y-5">
          {/* Join CTA banner */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white/80">
                Want to post your own takes?
              </p>
              <p className="text-[10px] text-white/35 mt-0.5">
                Join thousands of Shinobi sharing anime hot-takes daily.
              </p>
            </div>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[11px] font-black uppercase tracking-widest text-white transition-all whitespace-nowrap"
            >
              Sign Up Free
            </Link>
          </motion.div>

          {/* Posts */}
          <AnimatePresence mode="popLayout">
            {displayPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <PostCard post={post} onLike={toggleLike} onShare={setSharingPost} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Load more CTA */}
          <div className="py-8 text-center border border-dashed border-white/5 rounded-2xl">
            <p className="text-white/20 text-xs font-bold mb-3">
              Sign in to see more posts from the community
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white text-[11px] font-black uppercase tracking-widest transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-6">
          <WatchlistPreviewWidget />
          <TrendingWidget />

          {/* Community stats */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-3">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-orange-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                Live Activity
              </h3>
            </div>
            {[
              { label: "Posts today", value: "842" },
              { label: "Shinobi online", value: "12.4k" },
              { label: "Votes cast today", value: "3,201" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-white/35">{label}</span>
                <span className="text-sm font-black text-white">{value}</span>
              </div>
            ))}
          </div>

          {/* Sign-up CTA */}
          <Link
            href="/register"
            className="flex flex-col gap-3 p-5 rounded-2xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-indigo-500/20 hover:from-indigo-600/20 transition-all"
          >
            <p className="text-sm font-black text-white">
              Join AnimeUnwatched<span className="text-indigo-400">.</span>
            </p>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Track what you watch, share your takes, join clubs, and discover hidden gems — all for free.
            </p>
            <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[11px] font-black uppercase tracking-widest text-white transition-all">
              Get Started Free
            </span>
          </Link>
        </div>
      </div>

      {/* Share modal */}
      <ShareCard
        isOpen={sharingPost !== null}
        onClose={() => setSharingPost(null)}
        title={(sharingPost?.content.slice(0, 60) ?? "") + "…"}
        subtitle={`by @${sharingPost?.author ?? ""}`}
        url={`https://animeunwatched.com/posts/${sharingPost?.id ?? ""}`}
        type="post"
      />
    </div>
  )
}
