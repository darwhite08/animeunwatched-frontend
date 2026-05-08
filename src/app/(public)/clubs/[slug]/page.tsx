"use client"

import { use, useState } from "react"
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
} from "lucide-react"
import { useToast } from "@/stores/toast.store"

/* ── Types ── */
type ClubTab = "threads" | "members" | "about"

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
  MOD:   "bg-indigo-500/15 border-indigo-500/30 text-indigo-400",
  USER:  "bg-white/5 border-white/10 text-white/40",
}

const ROLE_ICONS: Record<MemberEntry["role"], typeof Crown> = {
  ADMIN: Crown,
  MOD:   Shield,
  USER:  Users,
}

/* ── Page ── */
export default function ClubDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const { push } = useToast()

  const [club, setClub] = useState<ClubData>(() => buildClubData(slug))
  const [activeTab, setActiveTab] = useState<ClubTab>("threads")

  const toggleJoin = () => {
    setClub((prev) => {
      const next = { ...prev, isJoined: !prev.isJoined }
      push(
        next.isJoined ? `Joined ${prev.name}!` : `Left ${prev.name}`,
        next.isJoined ? "success" : "info",
      )
      return next
    })
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
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_32px_rgba(99,102,241,0.4)] hover:-translate-y-0.5"
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
          {(["threads", "members", "about"] as ClubTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-4 text-[11px] font-black uppercase tracking-widest capitalize transition-colors ${
                activeTab === tab ? "text-white" : "text-white/30 hover:text-white/60"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="club-tab-line"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-full"
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
                  {MOCK_THREADS.length} threads
                </p>
                <Link
                  href={`/clubs/${slug}/new-thread`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                >
                  <Plus size={11} /> New Thread
                </Link>
              </div>

              {MOCK_THREADS.map((thread, i) => (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/threads/${thread.id}`}
                    className="group flex items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-indigo-500/25 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {thread.isTrending && (
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
                          {thread.replyCount} replies
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={9} />
                          {thread.lastActivity}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0"
                    />
                  </Link>
                </motion.div>
              ))}
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
                  <BookOpen size={14} className="text-indigo-400" />
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
                      <span className="shrink-0 h-5 w-5 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-[9px] font-black text-indigo-400">
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
    </div>
  )
}
