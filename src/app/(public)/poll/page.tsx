"use client"

import { motion } from "framer-motion"
import { Vote, Users, Clock, Flame } from "lucide-react"
import { PollCard  } from "@/components/poll/PollCard"


const ACTIVE_POLLS = [
  {
    id: 1,
    question: "Who is the most iconic Shonen protagonist of all time?",
    totalVotes: 12402,
    timeLeft: "2 days",
    options: [
      { id: 'a', text: "Goku (Dragon Ball)", votes: 5400, color: "bg-orange-500" },
      { id: 'b', text: "Luffy (One Piece)", votes: 4200, color: "bg-red-500" },
      { id: 'c', text: "Naruto (Naruto)", votes: 2802, color: "bg-yellow-500" },
    ],
    isHot: true
  },
  {
    id: 2,
    question: "Which Studio Ghibli film has the best soundtrack?",
    totalVotes: 8540,
    timeLeft: "5 hours",
    options: [
      { id: 'a', text: "Spirited Away", votes: 4100, color: "bg-indigo-500" },
      { id: 'b', text: "Howl's Moving Castle", votes: 3200, color: "bg-purple-500" },
      { id: 'c', text: "Princess Mononoke", votes: 1240, color: "bg-emerald-500" },
    ],
    isHot: false
  }
]

export default function PollsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-16 pb-32">
      {/* HEADER SECTION */}
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">
          <Vote size={14} /> Community Consensus • Live
        </div>
        <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-white">
          The <span className="text-indigo-500 italic">Ballot</span>
        </h1>
        <p className="text-white/40 text-lg font-medium max-w-2xl leading-relaxed">
          Shape the archives. Your vote directly influences community rankings and featured highlights.
        </p>
      </header>

      {/* POLLS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {ACTIVE_POLLS.map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>
    </div>
  )
}