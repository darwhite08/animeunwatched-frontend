"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Vote, Plus, Clock, BarChart2, Users, CheckCircle2, Flame } from "lucide-react"

type PollStatus = "active" | "closed" | "draft"

type Poll = {
  id: string
  question: string
  options: { label: string; votes: number }[]
  status: PollStatus
  duration: string
  totalVotes: number
  createdAt: string
}

const MOCK_POLLS: Poll[] = [
  {
    id: "1",
    question: "Who is the strongest anime character of all time?",
    options: [
      { label: "Goku", votes: 1240 },
      { label: "Saitama", votes: 980 },
      { label: "Naruto", votes: 560 },
      { label: "Levi", votes: 320 },
    ],
    status: "active",
    duration: "3 days left",
    totalVotes: 3100,
    createdAt: "2d ago",
  },
  {
    id: "2",
    question: "Best anime of 2024?",
    options: [
      { label: "Dungeon Meshi", votes: 2100 },
      { label: "Solo Leveling", votes: 1800 },
      { label: "Mushishi", votes: 400 },
    ],
    status: "closed",
    duration: "Ended",
    totalVotes: 4300,
    createdAt: "1w ago",
  },
  {
    id: "3",
    question: "Power scaling: who beats Gojo?",
    options: [
      { label: "Rimuru", votes: 0 },
      { label: "Anos", votes: 0 },
    ],
    status: "draft",
    duration: "Not started",
    totalVotes: 0,
    createdAt: "just now",
  },
]

const STATUS_BADGE: Record<PollStatus, { label: string; cls: string }> = {
  active:  { label: "Active",  cls: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" },
  closed:  { label: "Closed",  cls: "bg-zinc-600/20 text-zinc-400 border-zinc-500/30" },
  draft:   { label: "Draft",   cls: "bg-accent/20 text-accent-bright border-accent/30" },
}

type Filter = "all" | PollStatus

export default function PollsPage() {
  const [filter, setFilter] = useState<Filter>("all")
  const visible = filter === "all" ? MOCK_POLLS : MOCK_POLLS.filter(p => p.status === filter)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
            <Vote size={18} className="text-accent-bright" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Your Polls</h1>
            <p className="text-sm text-muted">{MOCK_POLLS.length} polls total</p>
          </div>
        </div>

        <Link
          href="/creators/create/polls"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent transition text-sm font-medium"
        >
          <Plus size={15} />
          New Poll
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Flame} label="Total Votes" value="7,400" color="text-orange-400" />
        <StatCard icon={Users} label="Avg Participation" value="2.5k" color="text-accent-bright" />
        <StatCard icon={CheckCircle2} label="Polls Run" value="2" color="text-emerald-400" />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "active", "closed", "draft"] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm capitalize transition ${
              filter === f
                ? "bg-surface text-foreground"
                : "text-muted hover:bg-surface hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Poll list */}
      <div className="space-y-4">
        {visible.map((poll, i) => (
          <PollCard key={poll.id} poll={poll} index={i} />
        ))}

        {visible.length === 0 && (
          <div className="text-center py-16 text-subtle">
            <Vote size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No polls in this category</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PollCard({ poll, index }: { poll: Poll; index: number }) {
  const badge = STATUS_BADGE[poll.status]
  const top = poll.options.reduce((a, b) => a.votes > b.votes ? a : b, poll.options[0])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-zinc-900 border border-border hover:border-border rounded-2xl p-5 space-y-4 transition cursor-pointer"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <p className="font-medium leading-snug">{poll.question}</p>
        <span className={`shrink-0 text-xs border px-3 py-1 rounded-full ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      {/* Bars */}
      <div className="space-y-2">
        {poll.options.map(opt => {
          const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0
          const isWinner = poll.status === "closed" && opt.label === top.label
          return (
            <div key={opt.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className={isWinner ? "text-accent-bright font-medium" : "text-muted"}>
                  {opt.label}
                </span>
                <span className="text-muted">{pct}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${isWinner ? "bg-accent" : "bg-accent"}`}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 text-xs text-subtle pt-1 border-t border-border">
        <span className="flex items-center gap-1.5">
          <Users size={11} />
          {poll.totalVotes.toLocaleString()} votes
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={11} />
          {poll.duration}
        </span>
        <span className="flex items-center gap-1.5">
          <BarChart2 size={11} />
          Created {poll.createdAt}
        </span>
      </div>
    </motion.div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-zinc-900 border border-border rounded-2xl p-4 flex items-center gap-3">
      <Icon size={18} className={color} />
      <div>
        <p className="text-lg font-semibold">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  )
}
