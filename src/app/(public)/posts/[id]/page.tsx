"use client"

import { use, useState } from "react"
import { motion } from "framer-motion"
import {
  Heart, MessageSquare, Share2, ChevronLeft, Star, Send, MoreHorizontal,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/stores/toast.store"

/* ── Types ── */
type PostDetail = {
  id: string
  author: string
  avatar: string
  time: string
  anime?: string
  content: string
  likes: number
  comments: number
  liked: boolean
  tags: string[]
}

type Comment = {
  id: number
  author: string
  avatar: string
  time: string
  body: string
  likes: number
}

type RelatedPost = {
  id: string
  content: string
  time: string
  likes: number
}

/* ── Mock DB ── */
const POSTS: Record<string, PostDetail> = {
  "1": {
    id: "1",
    author: "Otaku_Arch",
    avatar: "O",
    time: "2 hours ago",
    anime: "Frieren: Beyond Journey's End",
    content:
      "Frieren's power scaling episode just broke my brain. The concept of mana concealment being the TRUE skill ceiling is one of the most thoughtful magic system reveals I've ever seen.\n\nThink about it — every other fantasy series makes power about raw output. The one who blasts the biggest fireball wins. Frieren says: no. The truly powerful mage is the one whose presence you can't detect. The one who can look ordinary right up until the moment they aren't.\n\nThis applies to Frieren herself across the entire series. She's spent centuries looking like an absent-minded spell collector. The Serie exam arc recontextualizes everything. The magic system isn't just well-designed — it's philosophically coherent with what the series is saying about presence, absence, and the danger of underestimating quiet people.\n\nKosehon Atsumi's adaptation deserves every award it has received and more. The decision to keep the color palette muted and the score sparse — trust the silence — is a masterclass in restraint.",
    likes: 312,
    comments: 48,
    liked: false,
    tags: ["power-scaling", "frieren", "magic-system", "anime-theory"],
  },
  "2": {
    id: "2",
    author: "ShadowWatcher",
    avatar: "S",
    time: "4 hours ago",
    anime: "Chainsaw Man",
    content:
      "Controversial take: Chainsaw Man's anime actually elevated the manga. MAPPA's cinematographic direction in the final arc is something no adaptation has done before. Fight me.\n\nFujimoto's original panels are electric, yes — but the adaptation made deliberate choices to slow down, add negative space, and let the horror breathe. The Bomb Devil arc's color grading alone is some of the most intentional visual design in recent anime history.\n\nPeople complained about the ending credits format at the time. Looking back, each episode having its own unique ending felt like a flex of creative confidence. Every director brought a different lens to the series' identity crisis: is this horror, comedy, tragedy, satire? Yes. All of it.\n\nThe Reze arc cinematography especially deserves academic study. The way rain is used to signal emotional temperature shifts — it's not incidental, it's the grammar of the whole arc.",
    likes: 184,
    comments: 93,
    liked: true,
    tags: ["chainsaw-man", "hot-take", "animation", "mappa"],
  },
  "3": {
    id: "3",
    author: "NeuralBot_X",
    avatar: "N",
    time: "6 hours ago",
    anime: "Monster",
    content:
      "Just finished Monster for the first time in 2026. Why did nobody tell me this exists?? Absolutely floored. 74 episodes and not a single bad one. Johan is the greatest villain in anime history — no debate.\n\nI went in expecting a slow procedural. What I got was a character study of evil that refuses to explain itself. The show is deeply uncomfortable with the idea that some evil is simply... present. No trauma flashback that fully explains it. No redemption arc. No final monologue where everything is tied up.\n\nJohan's genius is structural: he is barely in the series. He operates like gravity — invisible, inexorable, felt in the distortion of everything around him. Tenma spends 70 episodes chasing a shape.\n\nThe Eva Heinemann subplot, which I initially dismissed as a detour, turned out to be the series' emotional core. Her relationship with her father and the way it mirrors Tenma's obsession with Johan is something I'll be thinking about for a long time.\n\nWatch Monster. Drop what you're doing and watch Monster.",
    likes: 427,
    comments: 62,
    liked: false,
    tags: ["monster", "underrated", "villain", "johan"],
  },
}

const FALLBACK_POST: PostDetail = {
  id: "0",
  author: "Shinobi",
  avatar: "S",
  time: "recently",
  content: "This post has moved or no longer exists.",
  likes: 0,
  comments: 0,
  liked: false,
  tags: [],
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    author: "VoidSeeker",
    avatar: "V",
    time: "1 hour ago",
    body: "Couldn't agree more. The mana concealment reveal completely reframes your understanding of every interaction Frieren had in the first half of the season. Genius writing.",
    likes: 24,
  },
  {
    id: 2,
    author: "Cipher_Ronin",
    avatar: "C",
    time: "2 hours ago",
    body: "The Serie exam arc had me rewinding every frame of Frieren's fights. What looked casual suddenly looked terrifying in retrospect.",
    likes: 17,
  },
  {
    id: 3,
    author: "AnimationNerd",
    avatar: "A",
    time: "2 hours ago",
    body: "I'd actually argue Frieren's power is even more interesting because it inverts typical shonen logic. Strength is *hiding*, not showing.",
    likes: 31,
  },
  {
    id: 4,
    author: "SakuraFrame",
    avatar: "S",
    time: "3 hours ago",
    body: "This post sent me back to rewatch the exam arc. You're absolutely right — every quiet moment is loaded with menace we couldn't see the first time.",
    likes: 12,
  },
  {
    id: 5,
    author: "GriffinSeer",
    avatar: "G",
    time: "4 hours ago",
    body: "The comparison to Geto's curtain technique in JJK is interesting too. Both systems privilege concealment over brute output. Different vibes, same philosophical axis.",
    likes: 8,
  },
]

const RELATED_POSTS: RelatedPost[] = [
  {
    id: "2",
    content: "Controversial take: Chainsaw Man's anime actually elevated the manga. MAPPA's cinematographic direction in the final arc is something no adaptation has done before.",
    time: "4 hours ago",
    likes: 184,
  },
  {
    id: "3",
    content: "Just finished Monster for the first time in 2026. Why did nobody tell me this exists?? Absolutely floored.",
    time: "6 hours ago",
    likes: 427,
  },
]

/* ── Page ── */
export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { push } = useToast()
  const post = POSTS[id] ?? FALLBACK_POST

  const [liked, setLiked]       = useState(post.liked)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [commentText, setCommentText] = useState("")
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({})

  const toggleLike = () => {
    setLiked(l => !l)
    setLikeCount(c => liked ? c - 1 : c + 1)
  }

  const submitComment = () => {
    if (!commentText.trim()) return
    setCommentText("")
    push("Comment posted!", "success")
  }

  const toggleCommentLike = (id: number) => {
    setCommentLikes(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      push("Link copied!", "success")
    } catch {
      push("Could not copy link", "error")
    }
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-2xl mx-auto px-6 pt-8 space-y-8">

        {/* Back button */}
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
        >
          <ChevronLeft size={13} /> Back to Community
        </Link>

        {/* Author card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/60 border border-white/8 rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-base shrink-0">
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

          {/* Full content */}
          <div className="space-y-3">
            {post.content.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-sm text-white/75 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[9px] font-bold text-indigo-400/60 hover:text-indigo-400 cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-5 pt-2 border-t border-white/5">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                liked ? "text-rose-400" : "text-white/30 hover:text-rose-400"
              }`}
            >
              <Heart size={14} fill={liked ? "currentColor" : "none"} />
              {likeCount}
            </button>
            <span className="flex items-center gap-1.5 text-xs font-bold text-white/30">
              <MessageSquare size={14} />
              {post.comments}
            </span>
            <button
              onClick={share}
              className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-white/60 transition-colors ml-auto"
            >
              <Share2 size={13} />
            </button>
          </div>
        </motion.div>

        {/* Comments section */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
            Comments ({MOCK_COMMENTS.length})
          </h2>

          <div className="space-y-3">
            {MOCK_COMMENTS.map((comment, i) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-black shrink-0">
                    {comment.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">{comment.author}</p>
                    <p className="text-[9px] text-white/25">{comment.time}</p>
                  </div>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{comment.body}</p>
                <button
                  onClick={() => toggleCommentLike(comment.id)}
                  className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${
                    commentLikes[comment.id] ? "text-rose-400" : "text-white/25 hover:text-rose-400"
                  }`}
                >
                  <Heart size={10} fill={commentLikes[comment.id] ? "currentColor" : "none"} />
                  {comment.likes + (commentLikes[comment.id] ? 1 : 0)}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Add comment form */}
          <div className="bg-zinc-900/60 border border-white/8 rounded-2xl p-5 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              Add a Comment
            </p>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Share your thoughts…"
              rows={3}
              className="w-full bg-transparent text-sm text-white placeholder:text-white/20 resize-none outline-none leading-relaxed"
            />
            <div className="flex justify-end border-t border-white/5 pt-3">
              <button
                onClick={submitComment}
                disabled={!commentText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-black uppercase tracking-widest text-white transition-all"
              >
                <Send size={12} /> Post Comment
              </button>
            </div>
          </div>
        </div>

        {/* Related posts from same user */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
            More from the Community
          </h2>
          <div className="space-y-3">
            {RELATED_POSTS.map((rp, i) => (
              <motion.div
                key={rp.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
              >
                <Link
                  href={`/posts/${rp.id}`}
                  className="block p-4 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-indigo-500/20 hover:bg-white/[0.04] transition-all group"
                >
                  <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors line-clamp-2 leading-relaxed">
                    {rp.content}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-[10px] text-white/25">
                    <span>{rp.time}</span>
                    <span className="flex items-center gap-1">
                      <Heart size={9} fill="currentColor" className="text-rose-400/50" /> {rp.likes}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
