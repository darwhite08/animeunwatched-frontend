"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Flame, TrendingUp, Users, Vote,
  Heart, MessageSquare, Share2, MoreHorizontal,
  Plus, Send, AtSign, Hash, Image as ImageIcon, Star,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/stores/toast.store"
import ShareCard from "@/components/ui/ShareCard"

/* ── Types ── */
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

type FeedTab = "trending" | "following" | "latest"

/* ── Mock data ── */
const MOCK_POSTS: Post[] = [
  {
    id: 1, author: "Otaku_Arch", avatar: "O", time: "2m ago",
    content: "Frieren's power scaling episode just broke my brain. The concept of mana concealment being the TRUE skill ceiling is one of the most thoughtful magic system reveals I've ever seen. 🤯",
    anime: "Frieren: Beyond Journey's End", likes: 312, comments: 48, liked: false,
    tags: ["power-scaling", "frieren", "magic-system"],
  },
  {
    id: 2, author: "ShadowWatcher", avatar: "S", time: "18m ago",
    content: "Controversial take: Chainsaw Man's anime actually elevated the manga. MAPPA's cinematographic direction in the final arc is something no adaptation has done before. Fight me.",
    anime: "Chainsaw Man", likes: 184, comments: 93, liked: true,
    tags: ["chainsaw-man", "hot-take", "animation"],
  },
  {
    id: 3, author: "NeuralBot_X", avatar: "N", time: "1h ago",
    content: "Just finished Monster for the first time in 2026. Why did nobody tell me this exists?? Absolutely floored. 74 episodes and not a single bad one. Johan is the greatest villain in anime history — no debate.",
    anime: "Monster", likes: 427, comments: 62, liked: false,
    tags: ["monster", "underrated", "villain"],
  },
  {
    id: 4, author: "VoidSeeker", avatar: "V", time: "3h ago",
    content: "The way Your Lie in April uses color theory to signal emotional states is graduate-level filmmaking. I've watched the piano duet scene 11 times and I'm not okay.",
    anime: "Your Lie in April", likes: 256, comments: 34, liked: false,
    tags: ["your-lie-in-april", "cinematography", "emotional"],
  },
  {
    id: 5, author: "Cipher_Ronin", avatar: "C", time: "5h ago",
    content: "Solo Leveling Season 2 trailer just dropped and the power gap between Jinwoo and everyone else looks absolutely insane. Monarch arc is going to go crazy if they animate it right.",
    anime: "Solo Leveling", likes: 891, comments: 147, liked: true,
    tags: ["solo-leveling", "hype", "season-2"],
  },
]

const TRENDING_TAGS = ["frieren", "chainsaw-man", "solo-leveling", "power-scaling", "monster", "emotional", "hot-take"]

const ACTIVE_POLLS = [
  { id: 1, question: "Best anime of 2024?",       votes: 4203, options: ["Dungeon Meshi", "Solo Leveling", "Frieren S2"] },
  { id: 2, question: "Strongest anime character?", votes: 6841, options: ["Goku", "Saitama", "Anos Voldigoad"] },
]

/* ── Page ── */
export default function CommunityPage() {
  const { push } = useToast()
  const [posts, setPosts]   = useState<Post[]>(MOCK_POSTS)
  const [feedTab, setFeedTab] = useState<FeedTab>("trending")
  const [composing, setComposing] = useState(false)
  const [draft, setDraft]   = useState("")
  const [sharingPost, setSharingPost] = useState<Post | null>(null)

  const toggleLike = (id: number) => {
    setPosts(ps => ps.map(p =>
      p.id === id
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    ))
  }

  const submitPost = () => {
    if (!draft.trim()) return
    const newPost: Post = {
      id: Date.now(), author: "darwhite08", avatar: "D", time: "just now",
      content: draft, likes: 0, comments: 0, liked: false, tags: [],
    }
    setPosts(ps => [newPost, ...ps])
    setDraft("")
    setComposing(false)
    push("Post published!", "success")
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-[72px] z-30">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">
              Community<span className="text-indigo-500">.</span>
            </h1>
            <p className="text-xs text-white/30 mt-0.5">What the Shinobi are watching and saying</p>
          </div>
          <button
            onClick={() => setComposing(c => !c)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black uppercase tracking-widest text-white transition-all"
          >
            <Plus size={13} /> New Post
          </button>
        </div>

        {/* Feed tabs */}
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-1 pb-0">
          {(["trending", "following", "latest"] as FeedTab[]).map(t => (
            <button
              key={t}
              onClick={() => setFeedTab(t)}
              className={`relative px-5 py-3 text-[11px] font-black uppercase tracking-widest capitalize transition-colors ${
                feedTab === t ? "text-white" : "text-white/30 hover:text-white/60"
              }`}
            >
              {t}
              {feedTab === t && (
                <motion.div layoutId="feed-tab-line" className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8 grid lg:grid-cols-3 gap-8">

        {/* LEFT: Feed */}
        <div className="lg:col-span-2 space-y-5">

          {/* Composer */}
          <AnimatePresence>
            {composing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-zinc-900 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="Share a theory, hot take, or reaction…"
                    rows={4}
                    autoFocus
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/25 resize-none outline-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex gap-2">
                      {[AtSign, Hash, ImageIcon].map((Icon, i) => (
                        <button key={i} className="p-1.5 text-white/30 hover:text-white transition-colors">
                          <Icon size={15} />
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono ${500 - draft.length < 50 ? "text-amber-400" : "text-white/20"}`}>
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Posts */}
          <AnimatePresence mode="popLayout">
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
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
                  <Link href={`/bestanimelist`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/8 border border-indigo-500/15 text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/15 transition-colors">
                    <Star size={9} /> {post.anime}
                  </Link>
                )}

                {/* Content */}
                <p className="text-sm text-white/75 leading-relaxed">{post.content}</p>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-bold text-indigo-400/60 hover:text-indigo-400 cursor-pointer transition-colors">
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
                    onClick={() => setSharingPost(post)}
                    className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-white/60 transition-colors ml-auto"
                  >
                    <Share2 size={13} />
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-6">

          {/* Trending tags */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-indigo-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Trending Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TAGS.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-[10px] font-bold text-white/50 hover:text-indigo-400 hover:border-indigo-500/25 cursor-pointer transition-all"
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Active polls */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
            <div className="flex items-center gap-2">
              <Vote size={14} className="text-amber-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Active Polls</h3>
            </div>
            {ACTIVE_POLLS.map(poll => (
              <Link key={poll.id} href="/poll" className="block p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 hover:bg-white/[0.04] transition-all group">
                <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                  {poll.question}
                </p>
                <p className="text-[10px] text-white/25 mt-1">{poll.votes.toLocaleString()} votes</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {poll.options.map(o => (
                    <span key={o} className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/8 text-amber-400/60">{o}</span>
                  ))}
                </div>
              </Link>
            ))}
            <Link href="/poll" className="block text-center text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
              View All Polls →
            </Link>
          </div>

          {/* Community stats */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-3">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-orange-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Live Activity</h3>
            </div>
            {[
              { label: "Posts today",     value: "842"   },
              { label: "Shinobi online",  value: "12.4k" },
              { label: "Votes cast today",value: "3,201" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-white/35">{label}</span>
                <span className="text-sm font-black text-white">{value}</span>
              </div>
            ))}
          </div>

          {/* Creator CTA */}
          <Link
            href="/creators"
            className="flex items-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-indigo-500/20 hover:from-indigo-600/20 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Users size={16} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                Creator Studio
              </p>
              <p className="text-[10px] text-white/35 mt-0.5">Publish blogs, polls, and feeds</p>
            </div>
          </Link>
        </div>
      </div>

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
