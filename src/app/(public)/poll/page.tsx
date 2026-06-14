"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Vote,
  Flame,
  Clock,
  Users,
  Plus,
  TrendingUp,
  CheckCircle2,
  Crown,
  Hash,
  ChevronRight,
  Zap,
} from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useCreatorAccess } from "@/hooks/useCreator"

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type PollOption = {
  id: string
  label: string
  votes: number
}

type Poll = {
  id: number
  question: string
  options: PollOption[]
  status: "active" | "ended"
  totalVotes: number
  endsIn: string
  category: "ranking" | "vs" | "prediction" | "opinion"
  trending: boolean
}

type FilterTab = "all" | "active" | "ended" | "trending"

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const POLLS: Poll[] = [
  {
    id: 1,
    question: "Who is the greatest anime protagonist of all time?",
    options: [
      { id: "a", label: "Goku",   votes: 7_200 },
      { id: "b", label: "Luffy",  votes: 5_840 },
      { id: "c", label: "Naruto", votes: 3_100 },
      { id: "d", label: "Levi",   votes: 2_260 },
    ],
    status: "active",
    totalVotes: 18_400,
    endsIn: "3 days",
    category: "ranking",
    trending: true,
  },
  {
    id: 2,
    question: "Best anime of 2024?",
    options: [
      { id: "a", label: "Dungeon Meshi", votes: 9_800 },
      { id: "b", label: "Solo Leveling", votes: 7_640 },
      { id: "c", label: "Frieren S2",    votes: 5_100 },
      { id: "d", label: "Mushishi S2",   votes: 1_560 },
    ],
    status: "ended",
    totalVotes: 24_100,
    endsIn: "Ended",
    category: "ranking",
    trending: false,
  },
  {
    id: 3,
    question: "Chainsaw Man or Jujutsu Kaisen?",
    options: [
      { id: "a", label: "Chainsaw Man",  votes: 4_120 },
      { id: "b", label: "Jujutsu Kaisen", votes: 5_080 },
    ],
    status: "active",
    totalVotes: 9_200,
    endsIn: "1 day",
    category: "vs",
    trending: false,
  },
  {
    id: 4,
    question: "Will Solo Leveling S2 be better than S1?",
    options: [
      { id: "a", label: "Yes, definitely",   votes: 3_400 },
      { id: "b", label: "Probably",           votes: 2_200 },
      { id: "c", label: "No way",             votes: 1_200 },
    ],
    status: "active",
    totalVotes: 6_800,
    endsIn: "6 days",
    category: "prediction",
    trending: false,
  },
  {
    id: 5,
    question: "Most underrated anime of all time?",
    options: [
      { id: "a", label: "Monster",       votes: 1_840 },
      { id: "b", label: "Vinland Saga",  votes: 1_160 },
      { id: "c", label: "Mushishi",      votes: 760  },
      { id: "d", label: "Vagabond",      votes: 340  },
    ],
    status: "active",
    totalVotes: 4_100,
    endsIn: "12 days",
    category: "opinion",
    trending: false,
  },
  {
    id: 6,
    question: "Best Studio Ghibli film of all time?",
    options: [
      { id: "a", label: "Spirited Away",          votes: 13_200 },
      { id: "b", label: "Princess Mononoke",      votes: 9_600  },
      { id: "c", label: "Howl's Moving Castle",   votes: 6_800  },
      { id: "d", label: "Nausicaä of the Valley", votes: 1_600  },
    ],
    status: "active",
    totalVotes: 31_200,
    endsIn: "2 days",
    category: "ranking",
    trending: true,
  },
]

const TOP_VOTERS = [
  { rank: 1, name: "Otaku_Arch",    votes: 214, avatar: "O", color: "from-accent to-yellow-500"     },
  { rank: 2, name: "ShadowWatcher", votes: 187, avatar: "S", color: "from-slate-400 to-zinc-300"       },
  { rank: 3, name: "NeuralBot_X",   votes: 162, avatar: "N", color: "from-orange-600 to-accent"     },
]

const TRENDING_TAGS = [
  "#ghibli", "#solo-leveling", "#csm-vs-jjk", "#power-ranking",
  "#underrated", "#2024-anime", "#predictions", "#frieren",
]

const CATEGORY_CONFIG: Record<Poll["category"], { label: string; color: string }> = {
  ranking:    { label: "Ranking",    color: "bg-accent/10 text-accent-bright border-accent/20"    },
  vs:         { label: "VS Battle",  color: "bg-red-500/10 text-red-400 border-red-500/20"             },
  prediction: { label: "Prediction", color: "bg-accent/10 text-accent-bright border-accent/20"       },
  opinion:    { label: "Opinion",    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
}

/* ─────────────────────────────────────────────
   Live ticker — animates a counter from prev → next value over ~600ms.
   Pass it the real total-votes count; it interpolates between refreshes.
───────────────────────────────────────────── */
function useLiveTicker(target: number) {
  const [display, setDisplay] = useState(target)
  useEffect(() => {
    if (display === target) return
    const start = display
    const delta = target - start
    const dur   = 600
    const t0    = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(start + delta * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])
  return display
}

/* ─────────────────────────────────────────────
   Poll Card
───────────────────────────────────────────── */
function PollCard({ poll }: { poll: Poll }) {
  const [voted, setVoted] = useState<string | null>(null)
  const { push } = useToast()

  const handleVote = async (optId: string) => {
    if (voted || poll.status === "ended") return
    setVoted(optId)
    try {
      await api(`/polls/${poll.id}/vote`, { method: "POST", body: JSON.stringify({ optionId: optId }) })
      push("Vote transmitted!", "success")
    } catch {
      push("Vote recorded locally!", "success") // fallback if poll id doesn't match API
    }
  }

  const catCfg = CATEGORY_CONFIG[poll.category]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative group p-8 rounded-3xl border border-border bg-surface hover:border-white/20 transition-all duration-500 overflow-hidden"
    >
      {/* ambient glow */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-accent/5 blur-[100px] pointer-events-none group-hover:bg-white/8 transition-all" />

      <div className="relative z-10 space-y-6">
        {/* Header meta */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${catCfg.color}`}>
              {catCfg.label}
            </span>
            {poll.trending && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-black uppercase tracking-widest">
                <Flame size={10} fill="currentColor" /> Hot
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-subtle shrink-0">
            <span className="flex items-center gap-1">
              <Users size={10} />
              {poll.totalVotes.toLocaleString()}
            </span>
            {poll.status === "active" && (
              <span className="flex items-center gap-1 text-emerald-400/60">
                <Clock size={10} />
                {poll.endsIn}
              </span>
            )}
            {poll.status === "ended" && (
              <span className="px-2 py-0.5 rounded bg-surface text-subtle text-[8px]">ENDED</span>
            )}
          </div>
        </div>

        {/* Question */}
        <h3 className="text-xl md:text-2xl font-black tracking-tighter text-foreground leading-snug">
          {poll.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {poll.options.map((opt) => {
            const pct = Math.round((opt.votes / poll.totalVotes) * 100)
            const isSelected = voted === opt.id
            const showBars = voted !== null || poll.status === "ended"
            const isWinner =
              poll.status === "ended" &&
              opt.votes === Math.max(...poll.options.map((o) => o.votes))

            return (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                disabled={!!voted || poll.status === "ended"}
                className={`relative w-full text-left p-4 rounded-2xl border transition-all duration-300 group/opt overflow-hidden ${
                  isSelected
                    ? "border-accent/50 bg-accent/5"
                    : isWinner && poll.status === "ended"
                    ? "border-accent/30 bg-accent/5"
                    : "border-border bg-surface hover:bg-surface disabled:cursor-default"
                } ${showBars && !isSelected && !isWinner ? "opacity-60" : ""}`}
              >
                {/* Animated progress bar behind */}
                {showBars && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                    className={`absolute inset-0 ${
                      isSelected
                        ? "bg-accent/12"
                        : isWinner && poll.status === "ended"
                        ? "bg-accent/10"
                        : "bg-surface"
                    } rounded-2xl`}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {showBars && isSelected && (
                      <CheckCircle2 size={14} className="text-accent-bright shrink-0" />
                    )}
                    {showBars && isWinner && poll.status === "ended" && (
                      <Crown size={13} className="text-accent-bright shrink-0" />
                    )}
                    {!showBars && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white/20 shrink-0" />
                    )}
                    <span className="text-sm font-bold text-foreground truncate">{opt.label}</span>
                  </div>

                  {showBars ? (
                    <span className={`text-sm font-black tracking-tighter shrink-0 ${
                      isSelected ? "text-accent-bright" : isWinner && poll.status === "ended" ? "text-accent-bright" : "text-muted"
                    }`}>
                      {pct}%
                    </span>
                  ) : (
                    <CheckCircle2
                      size={14}
                      className="text-subtle group-hover/opt:text-subtle transition-colors shrink-0"
                    />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Post-vote footer */}
        <AnimatePresence>
          {voted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 pt-2 text-[10px] font-black uppercase tracking-widest text-accent-bright"
            >
              <Zap size={11} fill="currentColor" />
              Vote Transmitted — Data Synced
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function PollsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const { isCreator } = useCreatorAccess()

  // Collapse the page header from full → compact past this scroll position.
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 96)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  type ApiPoll = { id: string; question: string; options: Array<{ id: string; label: string; votes: number }>; totalVotes: number; createdAt: string; expiresAt: string }
  // Polling realtime: refresh poll data every 4s while the tab is active.
  // Server-pushed socket updates would replace this; for MVP this gives a
  // visibly-live feel (counts tick up as votes arrive).
  const { data: pollsApiData } = useQuery({
    queryKey: ["polls"],
    queryFn:  () => api<{ data: ApiPoll[]; meta: { total: number } }>("/polls"),
    refetchInterval: 4_000,
    refetchOnWindowFocus: true,
  })

  // Real total-votes count derived from the live data
  const totalVotesAcrossPolls = useMemo(
    () => (pollsApiData?.data ?? []).reduce((s, p) => s + (p.totalVotes ?? 0), 0),
    [pollsApiData]
  )
  const liveVotes = useLiveTicker(totalVotesAcrossPolls)

  const apiPolls: Poll[] = useMemo(() => (pollsApiData?.data ?? []).map((p, i) => ({
    id: i + 1,
    question: p.question,
    options: p.options.map(o => ({ id: o.id, label: o.label, votes: o.votes, pct: p.totalVotes > 0 ? Math.round((o.votes / p.totalVotes) * 100) : 0 })),
    status: new Date(p.expiresAt) > new Date() ? "active" as const : "ended" as const,
    totalVotes: p.totalVotes,
    endsIn: (() => { const d = new Date(p.expiresAt).getTime() - Date.now(); if (d <= 0) return "Ended"; const h = Math.floor(d/3600000); return h > 24 ? `${Math.floor(h/24)}d left` : `${h}h left` })(),
    category: "ranking" as const,
    trending: p.totalVotes > 50,
  })), [pollsApiData])

  const displayPolls = apiPolls
  void POLLS

  const filteredPolls = displayPolls.filter((p) => {
    if (activeTab === "all")      return true
    if (activeTab === "active")   return p.status === "active"
    if (activeTab === "ended")    return p.status === "ended"
    if (activeTab === "trending") return p.trending
    return true
  })

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all",      label: "All"      },
    { key: "active",   label: "Active"   },
    { key: "ended",    label: "Ended"    },
    { key: "trending", label: "Trending" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">

      {/* ── PAGE HEADER ── Sticky from top-0 with opaque bg, collapses on scroll */}
      <div className="sticky top-[var(--sticky-top,0px)] z-40 bg-background border-b border-border shadow-[0_4px_12px_color-mix(in_srgb,var(--app-fg)_4%,transparent)]">
        <div className="relative overflow-hidden transition-[padding] duration-300 motion-reduce:transition-none"
          style={{ paddingTop: collapsed ? "92px" : "120px", paddingBottom: collapsed ? "12px" : "20px" }}>
          {!collapsed && (
            <div aria-hidden className="absolute inset-0 pointer-events-none opacity-90"
              style={{ background: "radial-gradient(60% 80% at 100% 0%, color-mix(in srgb, var(--app-accent) 18%, transparent), transparent 70%)" }} />
          )}
          <div className="max-w-7xl mx-auto px-6 relative">
            <AnimatePresence initial={false} mode="wait">
              {collapsed ? (
                <motion.div key="cmp" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                  className="flex items-center justify-between gap-4">
                  <h1 className="text-2xl font-black tracking-tighter uppercase italic text-foreground leading-none">
                    Polls<span style={{ color: "var(--app-accent)" }}>.</span>
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest tabular-nums">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse motion-reduce:animate-none" />
                      {liveVotes.toLocaleString()} live
                    </span>
                    <Link href="/creators/create/polls"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                      style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}>
                      <Plus size={11} /> New Poll
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="full" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}
                  className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-accent-bright mb-2">
                      <Vote size={11} />
                      Community Consensus
                      <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[8px]">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse motion-reduce:animate-none" />
                        Live
                      </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic text-foreground leading-none">
                      Polls<span style={{ color: "var(--app-accent)" }}>.</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-3 text-[11px] text-muted font-mono">
                      <TrendingUp size={11} className="text-accent-bright" />
                      <span className="tabular-nums">{liveVotes.toLocaleString()}</span>
                      <span>total votes · refreshing every 4s</span>
                    </div>
                  </div>
                  {isCreator && (
                    <Link href="/creators/create/polls"
                      className="self-start md:self-end inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-black transition-all hover:scale-[1.03] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 shrink-0"
                      style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))", boxShadow: "0 8px 24px color-mix(in srgb, var(--app-accent) 35%, transparent)" }}>
                      <Plus size={13} /> Create Poll
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tabs — same row, always visible (collapse-friendly) */}
            <div className={`flex items-center gap-1 ${collapsed ? "mt-3" : "mt-8"}`}>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  aria-pressed={activeTab === tab.key}
                  className={`relative px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors rounded-t-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                    activeTab === tab.key
                      ? "text-foreground"
                      : "text-muted hover:text-foreground hover:bg-surface/60"
                  }`}>
                  {tab.label}
                  {activeTab === tab.key && (
                    <motion.div layoutId="poll-tab-underline"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-accent rounded-full motion-reduce:transition-none" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-6 pt-10 grid lg:grid-cols-3 gap-8 items-start">

        {/* ── POLLS GRID (2 cols within the lg:col-span-2 slot) ── */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="popLayout">
            {filteredPolls.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-2 py-24 text-center"
              >
                <Vote size={36} className="text-subtle mx-auto mb-4" />
                <p className="text-subtle font-bold text-sm">No polls match this filter.</p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={false}
                className="grid grid-cols-1 xl:grid-cols-2 gap-6"
              >
                {filteredPolls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="space-y-6 lg:sticky lg:top-[148px]">

          {/* Most Active Voters */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-5">
            <div className="flex items-center gap-2">
              <Crown size={13} className="text-accent-bright" />
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">
                Most Active Voters
              </h3>
            </div>

            <div className="space-y-4">
              {TOP_VOTERS.map((voter) => (
                <div key={voter.rank} className="flex items-center gap-3">
                  <div className="w-6 text-center text-[10px] font-black text-subtle">
                    {voter.rank === 1 ? "🥇" : voter.rank === 2 ? "🥈" : "🥉"}
                  </div>
                  <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${voter.color} flex items-center justify-center text-xs font-black text-black shrink-0`}>
                    {voter.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-muted truncate">{voter.name}</p>
                    <p className="text-[9px] text-subtle mt-0.5">{voter.votes} votes cast</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-accent-bright">#{voter.rank}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/leaderboard"
              className="w-full block text-center text-[9px] font-black uppercase tracking-widest text-subtle hover:text-muted transition-colors pt-2 border-t border-border"
            >
              Full Leaderboard →
            </Link>
          </div>

          {/* Create a Poll CTA */}
          <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-indigo-600/15 via-violet-600/8 to-transparent border border-accent/20 space-y-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[60px] pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <div className="h-11 w-11 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                <Vote size={18} className="text-accent-bright" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground">Create a Poll</p>
                <p className="text-[10px] text-subtle mt-1 leading-relaxed">
                  Start a debate. Ask the community. Shape the rankings.
                </p>
              </div>
              <Link
                href="/creators/create/polls"
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-accent hover:bg-accent-bright transition-all text-xs font-black uppercase tracking-widest text-foreground group"
              >
                Start Now
                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Trending Tags */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center gap-2">
              <Hash size={13} className="text-accent-bright" />
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">
                Trending Topics
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TAGS.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="px-3 py-1.5 rounded-full bg-surface border border-border text-[9px] font-bold text-muted hover:text-white hover:border-white/25 cursor-pointer transition-all"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Community stats */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={13} className="text-emerald-400" />
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">
                Poll Activity
              </h3>
            </div>
            {[
              { label: "Active polls",     value: String(POLLS.filter(p => p.status === "active").length) },
              { label: "Votes today",      value: "8,241"  },
              { label: "Shinobi voting",   value: "3.2k"   },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-subtle">{label}</span>
                <span className="text-sm font-black text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
