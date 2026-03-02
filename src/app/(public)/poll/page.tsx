"use client"

import { useState } from "react"
import { motion } from "framer-motion"

type Option = {
  id: string
  label: string
  votes: number
}

export default function PollPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [voted, setVoted] = useState(false)

  const [options, setOptions] = useState<Option[]>([
    { id: "1", label: "Attack on Titan", votes: 120 },
    { id: "2", label: "Demon Slayer", votes: 95 },
    { id: "3", label: "One Piece", votes: 150 },
    { id: "4", label: "Jujutsu Kaisen", votes: 80 },
  ])

  const totalVotes = options.reduce((acc, o) => acc + o.votes, 0)

  const handleVote = () => {
    if (!selected) return

    setOptions(prev =>
      prev.map(o =>
        o.id === selected ? { ...o, votes: o.votes + 1 } : o
      )
    )

    setVoted(true)
  }

  return (
    <main className="min-h-screen bg-black text-white pt-32 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
            Weekly Anime Poll
          </h1>
          <p className="text-white/60 mt-3">
            Which anime deserves the #1 spot this week?
          </p>
        </div>

        {/* Poll Card */}
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">

          {options.map(option => {
            const percentage = totalVotes
              ? ((option.votes / totalVotes) * 100).toFixed(1)
              : 0

            return (
              <div key={option.id} className="space-y-2">

                {/* Option Button */}
                <button
                  onClick={() => !voted && setSelected(option.id)}
                  className={`relative w-full text-left p-4 rounded-xl border transition
                    ${
                      selected === option.id
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-white/10 hover:bg-white/5"
                    }
                  `}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <span>{option.label}</span>
                    {voted && (
                      <span className="text-sm text-white/60">
                        {percentage}%
                      </span>
                    )}
                  </div>

                  {/* Result Bar */}
                  {voted && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6 }}
                      className="absolute left-0 top-0 h-full bg-indigo-600/20 rounded-xl"
                    />
                  )}
                </button>
              </div>
            )
          })}

          {/* Vote Button */}
          {!voted && (
            <button
              onClick={handleVote}
              disabled={!selected}
              className="w-full mt-4 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 transition font-medium disabled:opacity-40"
            >
              Submit Vote
            </button>
          )}

          {voted && (
            <p className="text-center text-sm text-white/50 mt-4">
              Total Votes: {totalVotes}
            </p>
          )}
        </div>

        {/* Extra Section */}
        <div className="mt-16 text-center text-white/50 text-sm">
          New poll every Sunday • Results update in real time
        </div>

      </div>
    </main>
  )
}