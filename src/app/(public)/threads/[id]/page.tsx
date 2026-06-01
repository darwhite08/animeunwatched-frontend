"use client"

import { use, useState } from "react"
import { useThread, useReplies, useCreateReply } from "@/hooks/useThreads"
import { useLiveThread } from "@/hooks/useRealtime"
import { useAuthStore } from "@/stores/auth.store"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  ArrowLeft,
  MessageSquare,
  Heart,
  Send,
  Pin,
  Lock,
  ChevronRight,
  Reply,
  Clock,
} from "lucide-react"
import { useToast } from "@/stores/toast.store"

/* ── Types ── */
type ReplyItem = {
  id: string
  author: string
  avatar: string
  date: string
  content: string
  likes: number
  liked: boolean
}

type ThreadData = {
  id: string
  title: string
  author: string
  avatar: string
  createdAt: string
  content: string
  clubName: string
  clubSlug: string
  isPinned: boolean
  isLocked: boolean
  replyCount: number
}

/* ── Mock factory ── */
const THREAD_OVERRIDES: Record<string, Partial<ThreadData>> = {
  t1: {
    title: "Who had the best character arc across all seasons?",
    author: "Otaku_Arch",
    avatar: "O",
    createdAt: "2h ago",
    content: `Let's settle this once and for all. We've had 4 seasons and countless characters evolve in ways we never expected.

My personal pick: **Armin Arlert**. His transition from terrified strategist to ruthless idealist is one of the most psychologically rich arcs in the entire medium. He starts the series unable to lift himself up and ends it as arguably the most important human alive.

What makes it hit so hard is that it's not a power fantasy — it's a cost. Every step forward leaves him less of who he was. The final arc dialogue with Eren recontextualizes the friendship entirely.

Honourable mentions: Hange's quiet disillusionment, and Reiner's shattered identity. Fight me.`,
    clubName: "Attack on Titan Discussion",
    clubSlug: "attack-on-titan-discussion",
    isPinned: true,
    isLocked: false,
    replyCount: 48,
  },
  t2: {
    title: "Unpopular opinion thread — let's hear your hot takes",
    author: "ShadowWatcher",
    avatar: "S",
    createdAt: "4h ago",
    content: `Drop your most controversial takes here. All opinions welcome — defend them with receipts.

I'll start: **The 2013 animated sequences actually enhanced character immersion in ways the manga could not.** The pacing complaints are mostly from manga readers who already knew what was coming.

Also: **Levi's hype is partially built on contrarianism.** He's elite, yes, but the community's elevation of him to godhood is partially just pushback against Eren-centrism.

Don't @ me. Or do, that's literally the point of this thread.`,
    clubName: "Attack on Titan Discussion",
    clubSlug: "attack-on-titan-discussion",
    isPinned: false,
    isLocked: false,
    replyCount: 93,
  },
}

function buildThreadData(id: string): ThreadData {
  const override = THREAD_OVERRIDES[id] ?? {}
  return {
    id,
    title: override.title ?? "Thread Discussion",
    author: override.author ?? "AnimeUser",
    avatar: override.avatar ?? "A",
    createdAt: override.createdAt ?? "1d ago",
    content:
      override.content ??
      "Welcome to this thread. Share your thoughts, analysis, and theories below.",
    clubName: override.clubName ?? "Anime Club",
    clubSlug: override.clubSlug ?? "anime-club",
    isPinned: override.isPinned ?? false,
    isLocked: override.isLocked ?? false,
    replyCount: override.replyCount ?? 10,
  }
}

const INITIAL_REPLIES: ReplyItem[] = [
  {
    id: "r1",
    author: "NeuralBot_X",
    avatar: "N",
    date: "1h ago",
    content:
      "Hard agree on Armin. What seals it for me is the Shiganshina arc — the moment he pulls the trigger on Bertholdt without hesitation. That's the old Armin gone. The new one is terrifying and brilliant in equal measure.",
    likes: 34,
    liked: false,
  },
  {
    id: "r2",
    author: "VoidSeeker",
    avatar: "V",
    date: "1h ago",
    content:
      "Reiner for me. The complexity of his identity crisis is staggering. He's a soldier, a warrior, a traitor, and a victim all at once. The basement reveal scene from his perspective absolutely destroyed me.",
    likes: 27,
    liked: true,
  },
  {
    id: "r3",
    author: "Cipher_Ronin",
    avatar: "C",
    date: "2h ago",
    content:
      "Controversial pick: Floch. His arc is a perfect critique of ideological radicalization. He starts as a coward, becomes a true believer, and ends as a monster. The show never lets you forget he was once just scared.",
    likes: 19,
    liked: false,
  },
  {
    id: "r4",
    author: "FrameRate_Fan",
    avatar: "F",
    date: "3h ago",
    content:
      "Jean Kirstein doesn't get enough credit. He goes from 'I want the easy life in the capital' to charging into hell for his friends. No grand speeches — just quiet growth. That's the most human arc in the show.",
    likes: 41,
    liked: false,
  },
  {
    id: "r5",
    author: "TitanSlayer_X",
    avatar: "T",
    date: "4h ago",
    content:
      "Excellent thread. One angle I haven't seen mentioned: Historia's arc from 'I'll live for others' to becoming a ruler who acts for herself. Short but devastatingly efficient writing.",
    likes: 23,
    liked: false,
  },
]

/* ── Reply inline composer ── */
function InlineReply({
  authorName,
  onSubmit,
  onCancel,
}: {
  authorName: string
  onSubmit: (text: string) => void
  onCancel: () => void
}) {
  const [text, setText] = useState("")
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mt-3"
    >
      <div className="p-4 rounded-xl bg-zinc-900/80 border border-accent/20 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-accent-bright">
          Replying to {authorName}
        </p>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your reply…"
          rows={3}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-subtle resize-none outline-none leading-relaxed"
        />
        <div className="flex items-center gap-2 justify-end border-t border-border pt-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-surface text-[10px] font-black uppercase tracking-widest text-muted hover:text-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (text.trim()) { onSubmit(text); setText("") } }}
            disabled={!text.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-bright disabled:opacity-40 text-[10px] font-black uppercase tracking-widest text-foreground transition-all"
          >
            <Send size={10} /> Reply
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Page ── */
export default function ThreadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { push } = useToast()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const authUser = useAuthStore(s => s.user)

  const { data: threadData } = useThread(id)
  const { data: repliesData } = useReplies(id)
  const createReplyMut = useCreateReply(id)
  // Realtime: new replies appear instantly without refresh
  useLiveThread(id)

  // Merge real data with mock fallback
  const apiThread = threadData?.thread
  const thread = apiThread ? {
    ...buildThreadData(id),
    title: apiThread.title,
    content: apiThread.content,
    author: apiThread.author?.displayName ?? apiThread.author?.username ?? "Anonymous",
    isPinned: apiThread.isPinned,
    isLocked: apiThread.isLocked,
    createdAt: apiThread.createdAt,
  } : buildThreadData(id)

  const apiReplies: ReplyItem[] = (repliesData?.data ?? []).map(r => ({
    id: r.id,
    author: r.author?.displayName ?? r.author?.username ?? "Anonymous",
    avatar: (r.author?.displayName ?? r.author?.username ?? "?")[0].toUpperCase(),
    content: r.content,
    likes: 0, liked: false,
    date: (() => { const d = Date.now() - new Date(r.createdAt).getTime(); return d < 3600000 ? `${Math.floor(d/60000)}m ago` : `${Math.floor(d/3600000)}h ago` })(),
  }))

  const [replies, setReplies] = useState<ReplyItem[]>(() => apiReplies.length > 0 ? apiReplies : INITIAL_REPLIES)
  const [composerText, setComposerText] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const toggleLike = (replyId: string) => {
    setReplies((prev) =>
      prev.map((r) =>
        r.id === replyId
          ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 }
          : r,
      ),
    )
  }

  const submitReply = (text: string) => {
    if (!isAuthenticated) { push("Sign in to reply", "info"); return }
    createReplyMut.mutate(
      { content: text, parentId: replyingTo ?? undefined },
      {
        onSuccess: () => {
          const newReply: ReplyItem = {
            id: `r-${Date.now()}`,
            author: authUser?.displayName ?? authUser?.username ?? "You",
            avatar: (authUser?.displayName ?? authUser?.username ?? "?")[0].toUpperCase(),
            date: "just now",
            content: text,
            likes: 0, liked: false,
          }
          setReplies(prev => [newReply, ...prev])
          push("Reply posted!", "success")
          setReplyingTo(null)
        },
        onError: () => push("Failed to post reply", "error"),
      }
    )
  }

  const submitMainReply = () => {
    if (!composerText.trim()) return
    submitReply(composerText)
    setComposerText("")
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-10">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-subtle mb-8 flex-wrap"
        >
          <Link href="/clubs" className="hover:text-muted transition-colors">
            Clubs
          </Link>
          <ChevronRight size={9} />
          <Link
            href={`/clubs/${thread.clubSlug}`}
            className="hover:text-muted transition-colors"
          >
            {thread.clubName}
          </Link>
          <ChevronRight size={9} />
          <span className="text-muted line-clamp-1">{thread.title}</span>
        </motion.div>

        {/* Thread header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {thread.isPinned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-[9px] font-black uppercase tracking-wider text-accent-bright">
                <Pin size={8} /> Pinned
              </span>
            )}
            {thread.isLocked && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-black uppercase tracking-wider text-red-400">
                <Lock size={8} /> Locked
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-foreground leading-tight mb-4">
            {thread.title}
          </h1>

          {/* Author meta */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-sm text-foreground">
              {thread.avatar}
            </div>
            <div>
              <p className="text-sm font-black text-foreground">{thread.author}</p>
              <p className="text-[10px] text-subtle flex items-center gap-1">
                <Clock size={9} /> {thread.createdAt}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Thread body */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="p-7 rounded-3xl bg-surface border border-border mb-8"
        >
          <p className="text-sm text-muted leading-[1.8] whitespace-pre-line">
            {thread.content}
          </p>
        </motion.div>

        {/* Reply count + add reply */}
        <div className="flex items-center justify-between mb-6">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-subtle">
            <MessageSquare size={12} />
            {replies.length + thread.replyCount - INITIAL_REPLIES.length} replies
          </p>
          <Link href="#composer">
            <button
              onClick={() => document.getElementById("composer")?.focus()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-bright text-[10px] font-black uppercase tracking-widest text-foreground transition-all shadow-[0_0_20px_rgba(99,102,241,0.25)]"
            >
              <Reply size={11} /> Add Reply
            </button>
          </Link>
        </div>

        {/* Reply composer (top) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl bg-zinc-900/60 border border-border mb-8 space-y-4"
          id="composer"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-subtle">
            Your Reply
          </p>
          <textarea
            id="composer"
            value={composerText}
            onChange={(e) => setComposerText(e.target.value)}
            placeholder="Share your thoughts on this thread…"
            rows={4}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-subtle resize-none outline-none leading-relaxed focus:outline-none"
          />
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span
              className={`text-[10px] font-mono ${
                composerText.length > 450 ? "text-accent-bright" : "text-subtle"
              }`}
            >
              {500 - composerText.length} chars left
            </span>
            <button
              onClick={submitMainReply}
              disabled={!composerText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-bright disabled:opacity-40 text-[10px] font-black uppercase tracking-widest text-foreground transition-all"
            >
              <Send size={11} /> Post Reply
            </button>
          </div>
        </motion.div>

        {/* Reply list */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {replies.map((reply, i) => (
              <motion.div
                key={reply.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04 }}
                className="p-5 rounded-2xl bg-surface border border-border hover:border-border transition-all space-y-4"
              >
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/70 to-violet-600/70 flex items-center justify-center font-black text-sm text-foreground shrink-0">
                    {reply.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground">{reply.author}</p>
                    <p className="text-[10px] text-subtle">{reply.date}</p>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-muted leading-relaxed">{reply.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 border-t border-border pt-3">
                  <button
                    onClick={() => toggleLike(reply.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                      reply.liked ? "text-rose-400" : "text-subtle hover:text-rose-400"
                    }`}
                  >
                    <Heart size={13} fill={reply.liked ? "currentColor" : "none"} />
                    {reply.likes}
                  </button>
                  <button
                    onClick={() =>
                      setReplyingTo(replyingTo === reply.id ? null : reply.id)
                    }
                    className="flex items-center gap-1.5 text-xs font-bold text-subtle hover:text-accent-bright transition-colors"
                  >
                    <Reply size={12} /> Reply
                  </button>
                </div>

                {/* Inline reply composer */}
                <AnimatePresence>
                  {replyingTo === reply.id && (
                    <InlineReply
                      authorName={reply.author}
                      onSubmit={submitReply}
                      onCancel={() => setReplyingTo(null)}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Back link */}
        <div className="mt-12">
          <Link
            href={`/clubs/${thread.clubSlug}`}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-subtle hover:text-muted transition-colors group"
          >
            <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to {thread.clubName}
          </Link>
        </div>
      </div>
    </div>
  )
}
