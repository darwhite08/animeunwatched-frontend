"use client"

import { use, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Users,
  MessageSquare,
  Plus,
  ArrowLeft,
  Crown,
  Shield,
  TrendingUp,
  Clock,
  ChevronRight,
  CalendarDays,
  BookOpen,
  AlertTriangle,
  Trophy,
  Swords,
  CheckCircle2,
  Timer,
  X,
} from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useClub, useJoinClub } from "@/hooks/useClubs"
import { useClubThreads, useCreateClubThread, useCreateReply } from "@/hooks/useThreads"
import { useAuthStore } from "@/stores/auth.store"

/* ── Types ── */
type ClubTab = "threads" | "challenges" | "members" | "about"

interface ChallengeData {
  type: "WATCH_CHALLENGE"
  description: string
  animeTitle: string
  malId: number
  imageUrl: string
  deadline: string
  prize?: string
}

interface Challenge {
  id: string
  threadId: string
  animeTitle: string
  malId: number
  imageUrl: string
  description: string
  deadline: string
  prize?: string
  createdAt: string
  authorName: string
  replyCount: number
}

type ThreadEntry = {
  id: string
  title: string
  author: string
  replyCount: number
  lastActivity: string
  isTrending: boolean
}

type MemberEntry = {
  id: string
  username: string
  avatar: string
  role: "USER" | "MOD" | "ADMIN"
}

type ClubData = {
  slug: string
  name: string
  description: string
  memberCount: number
  threadCount: number
  category: string
  coverGradient: string
  rules: string[]
  createdAt: string
  owner: string
  isJoined: boolean
}

/* ── Mock factory ── */
const CLUB_OVERRIDES: Record<string, Partial<ClubData>> = {
  "attack-on-titan-discussion": {
    name: "Attack on Titan Discussion",
    description:
      "Deep dives into lore, symbolism, and the philosophical questions AoT poses. Rumbling theories welcome. Spoilers allowed — tag them.",
    memberCount: 641,
    threadCount: 184,
    category: "Series Discussion",
    coverGradient: "from-red-900 via-red-950 to-black",
    rules: [
      "Use spoiler tags for anything past episode 50.",
      "No toxicity — debate the ideas, not the person.",
      "Stay on topic: AoT and related themes only.",
    ],
    createdAt: "January 2024",
    owner: "TitanSlayer_X",
  },
  "shonen-power-rankings": {
    name: "Shonen Power Rankings",
    description:
      "The definitive space for ranking fights, arcs, and power systems. Scaling debates done right — with receipts.",
    memberCount: 1204,
    threadCount: 512,
    category: "Rankings",
    coverGradient: "from-orange-900 via-orange-950 to-black",
    rules: [
      "Back your claims with source material.",
      "Feats only — no statements without context.",
      "Respect differing interpretations.",
    ],
    createdAt: "November 2023",
    owner: "PowerCalc_9000",
  },
}

function buildClubData(slug: string): ClubData {
  const override = CLUB_OVERRIDES[slug] ?? {}
  return {
    slug,
    name: override.name ?? slug.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" "),
    description:
      override.description ??
      "A community club dedicated to sharing anime knowledge, discussion, and recommendations.",
    memberCount: override.memberCount ?? 120,
    threadCount: override.threadCount ?? 34,
    category: override.category ?? "General",
    coverGradient: override.coverGradient ?? "from-indigo-900 via-indigo-950 to-black",
    rules: override.rules ?? [
      "Be respectful to all members.",
      "No spam or self-promotion.",
      "Keep discussions anime-related.",
    ],
    createdAt: override.createdAt ?? "March 2024",
    owner: override.owner ?? "ClubFounder",
    isJoined: false,
  }
}

const MOCK_THREADS: ThreadEntry[] = [
  {
    id: "t1",
    title: "Who had the best character arc across all seasons?",
    author: "Otaku_Arch",
    replyCount: 48,
    lastActivity: "2h ago",
    isTrending: true,
  },
  {
    id: "t2",
    title: "Unpopular opinion thread — let's hear your hot takes",
    author: "ShadowWatcher",
    replyCount: 93,
    lastActivity: "4h ago",
    isTrending: true,
  },
  {
    id: "t3",
    title: "Breaking down the symbolism in the final arc",
    author: "NeuralBot_X",
    replyCount: 31,
    lastActivity: "1d ago",
    isTrending: false,
  },
  {
    id: "t4",
    title: "Animation quality comparison: 2013 vs 2023",
    author: "FrameRate_Fan",
    replyCount: 22,
    lastActivity: "2d ago",
    isTrending: false,
  },
  {
    id: "t5",
    title: "Manga readers — how did you react to the ending?",
    author: "VoidSeeker",
    replyCount: 67,
    lastActivity: "3d ago",
    isTrending: false,
  },
  {
    id: "t6",
    title: "Best OST moments? Compile your favourites",
    author: "Cipher_Ronin",
    replyCount: 15,
    lastActivity: "5d ago",
    isTrending: false,
  },
]

const MOCK_MEMBERS: MemberEntry[] = [
  { id: "m1", username: "TitanSlayer_X", avatar: "T", role: "ADMIN" },
  { id: "m2", username: "Otaku_Arch",    avatar: "O", role: "MOD"   },
  { id: "m3", username: "ShadowWatcher", avatar: "S", role: "MOD"   },
  { id: "m4", username: "NeuralBot_X",   avatar: "N", role: "USER"  },
  { id: "m5", username: "VoidSeeker",    avatar: "V", role: "USER"  },
  { id: "m6", username: "Cipher_Ronin",  avatar: "C", role: "USER"  },
]

const ROLE_STYLES: Record<MemberEntry["role"], string> = {
  ADMIN: "bg-amber-500/15 border-amber-500/30 text-amber-400",
  MOD:   "bg-amber-500/15 border-amber-500/30 text-amber-400",
  USER:  "bg-white/5 border-white/10 text-white/40",
}

const ROLE_ICONS: Record<MemberEntry["role"], typeof Crown> = {
  ADMIN: Crown,
  MOD:   Shield,
  USER:  Users,
}

const MOCK_CHALLENGES: Challenge[] = [
  {
    id: "c1",
    threadId: "t-challenge-1",
    animeTitle: "Fullmetal Alchemist: Brotherhood",
    malId: 5114,
    imageUrl: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
    description: "Watch FMA:B and discuss the themes of equivalent exchange in our threads.",
    deadline: new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString(),
    prize: "Legendary badge + 500 XP",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    authorName: "TitanSlayer_X",
    replyCount: 24,
  },
  {
    id: "c2",
    threadId: "t-challenge-2",
    animeTitle: "Vinland Saga",
    malId: 37521,
    imageUrl: "https://cdn.myanimelist.net/images/anime/1170/124312.jpg",
    description: "Experience Thorfinn's journey. Season 1 mandatory, Season 2 recommended.",
    deadline: new Date(Date.now() + 28 * 24 * 3600 * 1000).toISOString(),
    prize: "Viking badge",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    authorName: "PowerCalc_9000",
    replyCount: 11,
  },
]

function parseChallenge(thread: { id: string; title: string; content: string; author?: { displayName?: string; username?: string } | null; _count?: { replies: number } | null; createdAt: string }): Challenge | null {
  if (!thread.title.startsWith("[CHALLENGE]")) return null
  try {
    const data = JSON.parse(thread.content) as ChallengeData
    if (data.type !== "WATCH_CHALLENGE") return null
    return {
      id: thread.id,
      threadId: thread.id,
      animeTitle: data.animeTitle,
      malId: data.malId,
      imageUrl: data.imageUrl,
      description: data.description,
      deadline: data.deadline,
      prize: data.prize,
      createdAt: thread.createdAt,
      authorName: thread.author?.displayName ?? thread.author?.username ?? "Unknown",
      replyCount: thread._count?.replies ?? 0,
    }
  } catch {
    return null
  }
}

function CountdownBadge({ deadline }: { deadline: string }) {
  const now = Date.now()
  const end = new Date(deadline).getTime()
  const diff = end - now
  if (diff <= 0) return <span className="text-[9px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">Ended</span>
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const label = days > 0 ? `${days}d ${hours}h left` : `${hours}h left`
  const urgent = diff < 3 * 86400000
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${urgent ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"}`}>
      <Timer size={8} /> {label}
    </span>
  )
}

function ChallengeCard({ challenge, onAccept, accepted }: { challenge: Challenge; onAccept: (c: Challenge) => void; accepted: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#0a0a0a] hover:border-amber-500/20 transition-all duration-300"
    >
      <div className="flex gap-5 p-6">
        {/* Anime thumbnail */}
        <div className="shrink-0 w-20 h-28 rounded-xl overflow-hidden bg-white/5 border border-white/8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={challenge.imageUrl}
            alt={challenge.animeTitle}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Swords size={11} className="text-amber-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.35em] text-amber-400/70">Watch Challenge</span>
              </div>
              <h3 className="text-base font-black uppercase italic tracking-tight text-white leading-snug group-hover:text-amber-300 transition-colors">
                {challenge.animeTitle}
              </h3>
            </div>
            <CountdownBadge deadline={challenge.deadline} />
          </div>

          <p className="text-xs text-white/45 leading-relaxed line-clamp-2">{challenge.description}</p>

          {challenge.prize && (
            <div className="flex items-center gap-1.5">
              <Trophy size={10} className="text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400/80">{challenge.prize}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-3 text-[9px] text-white/25 font-bold">
              <span className="flex items-center gap-1"><Users size={8} /> {challenge.replyCount} joined</span>
              <span>by @{challenge.authorName}</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/anime/${challenge.malId}`}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/15 transition-all"
              >
                View Anime
              </Link>
              <button
                onClick={() => onAccept(challenge)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${accepted
                  ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 cursor-default"
                  : "text-black hover:scale-105"
                }`}
                style={!accepted ? { background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 2px 12px rgba(245,158,11,0.3)" } : undefined}
                disabled={accepted}
              >
                {accepted ? <><CheckCircle2 size={9} className="inline mr-1" />Accepted</> : "Accept Challenge"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function CreateChallengeModal({ slug, onClose }: { slug: string; onClose: () => void }) {
  const { push } = useToast()
  const createThread = useCreateClubThread(slug)
  const [animeTitle, setAnimeTitle] = useState("")
  const [malId, setMalId] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState("")
  const [prize, setPrize] = useState("")

  const submit = () => {
    if (!animeTitle || !malId || !deadline) { push("Fill in all required fields", "error"); return }
    const content: ChallengeData = {
      type: "WATCH_CHALLENGE",
      animeTitle,
      malId: Number(malId),
      imageUrl: `https://cdn.myanimelist.net/images/anime/1/default.jpg`,
      description: description || `Watch ${animeTitle} with the club!`,
      deadline,
      prize: prize || undefined,
    }
    createThread.mutate(
      { title: `[CHALLENGE] ${animeTitle}`, content: JSON.stringify(content) },
      {
        onSuccess: () => { push("Challenge created!", "success"); onClose() },
        onError: () => push("Failed to create challenge", "error"),
      }
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-[2rem] p-7 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords size={14} className="text-amber-400" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Create Challenge</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {[
            { label: "Anime Title *", value: animeTitle, setter: setAnimeTitle, placeholder: "e.g. Fullmetal Alchemist: Brotherhood" },
            { label: "MAL ID *", value: malId, setter: setMalId, placeholder: "e.g. 5114 (from MyAnimeList URL)" },
            { label: "Prize (optional)", value: prize, setter: setPrize, placeholder: "e.g. Legendary badge + 500 XP" },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/35">{label}</label>
              <input
                type="text"
                value={value}
                onChange={e => setter(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 transition-all"
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/35">Deadline *</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-sm text-white focus:outline-none focus:border-amber-500/40 transition-all"
              style={{ colorScheme: "dark" }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/35">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's the challenge about? Any rules?"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 resize-none transition-all"
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={createThread.isPending}
          className="w-full py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 4px 20px rgba(245,158,11,0.3)" }}
        >
          {createThread.isPending ? "Creating…" : "Launch Challenge"}
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ── Page ── */
export default function ClubDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const { push } = useToast()
  const authUser = useAuthStore(s => s.user)
  const { data: clubData } = useClub(slug)
  const { data: threadsData } = useClubThreads(slug)
  const acceptReply = useCreateReply

  const [acceptedChallenges, setAcceptedChallenges] = useState<Set<string>>(new Set())
  const [showCreateChallenge, setShowCreateChallenge] = useState(false)

  const allThreads = threadsData?.data ?? []
  const displayThreads = allThreads.filter(t => !t.title.startsWith("[CHALLENGE]")).length > 0
    ? allThreads.filter(t => !t.title.startsWith("[CHALLENGE]")).map(t => ({
        id: t.id as unknown as number,
        title: t.title,
        excerpt: t.content.slice(0, 120) + (t.content.length > 120 ? "…" : ""),
        author: t.author?.displayName ?? t.author?.username ?? "Anonymous",
        avatar: (t.author?.displayName ?? t.author?.username ?? "?")[0].toUpperCase(),
        replies: t._count?.replies ?? 0, views: 0,
        time: (() => { const d = Date.now() - new Date(t.createdAt).getTime(); return d < 86400000 ? `${Math.floor(d/3600000)}h ago` : `${Math.floor(d/86400000)}d ago` })(),
        isPinned: t.isPinned, tags: [],
      }))
    : MOCK_THREADS

  // Parse real challenges from threads, fall back to mock
  const realChallenges = useMemo(
    () => allThreads.map(parseChallenge).filter((c): c is Challenge => c !== null),
    [allThreads]
  )
  const challenges: Challenge[] = realChallenges.length > 0 ? realChallenges : MOCK_CHALLENGES

  const joinMut = useJoinClub(slug)

  const apiClub = clubData?.club
  const [clubState] = useState<ClubData>(() => buildClubData(slug))
  const [activeTab, setActiveTab] = useState<ClubTab>("threads")
  const [joined, setJoined] = useState(false)

  // Merge real data into club state
  const club: ClubData = apiClub ? {
    ...clubState,
    name: apiClub.name,
    slug: apiClub.slug,
    description: apiClub.description ?? clubState.description,
    memberCount: apiClub._count?.members ?? clubState.memberCount,
    threadCount: apiClub._count?.threads ?? clubState.threadCount,
    isJoined: joined,
  } : clubState

  const toggleJoin = () => {
    if (!authUser) { push("Sign in to join clubs", "info"); return }
    const next = !joined
    joinMut.mutate(
      { join: next },
      {
        onSuccess: () => { setJoined(next); push(next ? `Joined ${club.name}!` : `Left ${club.name}`, next ? "success" : "info") },
        onError: () => push("Failed to update membership", "error"),
      }
    )
  }

  const handleAcceptChallenge = (challenge: Challenge) => {
    if (!authUser) { push("Sign in to accept challenges", "info"); return }
    if (acceptedChallenges.has(challenge.id)) return
    const reply = acceptReply(challenge.threadId)
    reply.mutate(
      { content: `ACCEPTED: I'm in for the ${challenge.animeTitle} watch challenge! Let's go!` },
      {
        onSuccess: () => {
          setAcceptedChallenges(prev => new Set(prev).add(challenge.id))
          push(`Challenge accepted! Watch ${challenge.animeTitle} by ${new Date(challenge.deadline).toLocaleDateString()}`, "success")
        },
        onError: () => {
          setAcceptedChallenges(prev => new Set(prev).add(challenge.id))
          push(`Challenge accepted! Watch ${challenge.animeTitle}`, "success")
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* Hero banner */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${club.coverGradient}`}
        style={{ minHeight: "260px" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-[#020202]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-16">
          {/* Back */}
          <Link
            href="/clubs"
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors mb-8 group"
          >
            <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
            All Clubs
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">
              {club.category}
            </p>
            <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-none mb-4">
              {club.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mb-6">
              <span className="flex items-center gap-1.5 text-xs font-bold text-white/50">
                <Users size={12} />
                {club.memberCount.toLocaleString()} members
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-white/50">
                <MessageSquare size={12} />
                {club.threadCount} threads
              </span>
            </div>

            <button
              onClick={toggleJoin}
              className={`px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                club.isJoined
                  ? "bg-white/8 border border-white/15 text-white/60 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                  : "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_32px_rgba(99,102,241,0.4)] hover:-translate-y-0.5"
              }`}
            >
              {club.isJoined ? "Leave Club" : "Join Club"}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="sticky top-[72px] z-30 border-b border-white/5 bg-[#020202]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-1">
          {(["threads", "challenges", "members", "about"] as ClubTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-4 text-[11px] font-black uppercase tracking-widest capitalize transition-colors ${
                activeTab === tab ? "text-white" : "text-white/30 hover:text-white/60"
              }`}
            >
              {tab}
              {tab === "challenges" && challenges.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-[8px] font-black text-black" style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}>
                  {challenges.length}
                </span>
              )}
              {activeTab === tab && (
                <motion.div
                  layoutId="club-tab-line"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <AnimatePresence mode="wait">
          {/* ── Threads ── */}
          {activeTab === "threads" && (
            <motion.div
              key="threads"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
                  {club.threadCount || MOCK_THREADS.length} threads
                </p>
                <Link
                  href={`/clubs/${slug}/new-thread`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                >
                  <Plus size={11} /> New Thread
                </Link>
              </div>

              {displayThreads.map((thread, i) => (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/threads/${thread.id}`}
                    className="group flex items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-amber-500/25 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!!((thread as Record<string, unknown>).isTrending) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider text-amber-400">
                            <TrendingUp size={8} /> Trending
                          </span>
                        )}
                        <h3 className="text-sm font-bold text-white/85 group-hover:text-white transition-colors line-clamp-1">
                          {thread.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-white/30">
                        <span>by {thread.author}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={9} />
                          {(thread as Record<string, unknown>).replyCount as number ?? 0} replies
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={9} />
                          {(thread as Record<string, unknown>).lastActivity as string ?? ""}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-white/20 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0"
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── Challenges ── */}
          {activeTab === "challenges" && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
                    {challenges.length} active challenge{challenges.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-white/20 mt-0.5">Complete challenges together, earn rewards as a club.</p>
                </div>
                {authUser && (
                  <button
                    onClick={() => setShowCreateChallenge(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-black transition-all hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 0 20px rgba(245,158,11,0.25)" }}
                  >
                    <Swords size={11} /> New Challenge
                  </button>
                )}
              </div>

              {challenges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="h-20 w-20 rounded-3xl bg-white/[0.03] border border-white/8 flex items-center justify-center">
                    <Trophy size={28} className="text-white/15" />
                  </div>
                  <p className="text-sm font-black uppercase italic text-white/25">No active challenges</p>
                  <p className="text-xs text-white/15">Be the first to create a watch challenge for this club</p>
                  {authUser && (
                    <button
                      onClick={() => setShowCreateChallenge(true)}
                      className="mt-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-black"
                      style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
                    >
                      Create First Challenge
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {challenges.map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onAccept={handleAcceptChallenge}
                      accepted={acceptedChallenges.has(challenge.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Members ── */}
          {activeTab === "members" && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-6">
                {club.memberCount.toLocaleString()} members total — showing core team
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {MOCK_MEMBERS.map((member, i) => {
                  const RoleIcon = ROLE_ICONS[member.role]
                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-all flex flex-col items-center gap-3 text-center group"
                    >
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-xl text-white group-hover:scale-105 transition-transform">
                        {member.avatar}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-white">{member.username}</p>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${
                            ROLE_STYLES[member.role]
                          }`}
                        >
                          <RoleIcon size={8} />
                          {member.role}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── About ── */}
          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl space-y-8"
            >
              {/* Description */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-amber-400" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    About
                  </h2>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{club.description}</p>
              </div>

              {/* Rules */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-400" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    Club Rules
                  </h2>
                </div>
                <ol className="space-y-3">
                  {club.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                      <span className="shrink-0 h-5 w-5 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-[9px] font-black text-amber-400">
                        {i + 1}
                      </span>
                      {rule}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Meta */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-violet-400" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    Club Info
                  </h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/35">Created</span>
                    <span className="font-bold text-white/70">{club.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/35">Owner</span>
                    <span className="font-bold text-white/70">@{club.owner}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/35">Category</span>
                    <span className="font-bold text-white/70">{club.category}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCreateChallenge && (
          <CreateChallengeModal slug={slug} onClose={() => setShowCreateChallenge(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
