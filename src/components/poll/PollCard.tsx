"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Users, Clock, Flame, CheckCircle2 } from "lucide-react"

export const PollCard = ({ poll }: { poll: any }) => {
  const [voted, setVoted] = useState<string | null>(null)

  return (
    <div className="relative group p-10 rounded-[3rem] border border-border bg-surface overflow-hidden transition-all duration-500 hover:border-accent/30">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 space-y-8">
        {/* Meta Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-subtle">
            <span className="flex items-center gap-1.5"><Users size={12} /> {poll.totalVotes.toLocaleString()} Votes</span>
            <span className="h-1 w-1 rounded-full bg-surface" />
            <span className="flex items-center gap-1.5"><Clock size={12} /> {poll.timeLeft} left</span>
          </div>
          {poll.isHot && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[9px] font-black uppercase">
              <Flame size={12} fill="currentColor" /> Trending
            </div>
          )}
        </div>

        {/* Question */}
        <h3 className="text-3xl font-black text-foreground tracking-tighter leading-tight">
          {poll.question}
        </h3>

        {/* Options Stack */}
        <div className="space-y-4">
          {poll.options.map((option: any) => {
            const percentage = Math.round((option.votes / poll.totalVotes) * 100)
            const isSelected = voted === option.id

            return (
              <button
                key={option.id}
                onClick={() => setVoted(option.id)}
                disabled={!!voted}
                className={`relative w-full text-left p-6 rounded-2xl border transition-all duration-500 group/opt ${
                  isSelected 
                  ? "border-accent/50 bg-accent/5" 
                  : "border-border bg-surface hover:bg-surface"
                } ${voted && !isSelected ? "opacity-50 grayscale" : ""}`}
              >
                {/* Progress Background (Shows after voting) */}
                {voted && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`absolute inset-0 opacity-10 rounded-xl ${option.color}`}
                  />
                )}

                <div className="relative z-10 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`h-2 w-2 rounded-full ${option.color} ${voted ? 'shadow-[0_0_10px_currentColor]' : ''}`} />
                    <span className="font-bold text-foreground">{option.text}</span>
                  </div>
                  {voted ? (
                    <span className="text-sm font-black text-foreground italic">{percentage}%</span>
                  ) : (
                    <CheckCircle2 size={16} className="text-subtle group-hover/opt:text-muted transition-colors" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Status Footer */}
        {voted && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-[11px] font-bold text-accent-bright uppercase tracking-widest pt-4"
          >
            Vote Transmitted • Data Synced
          </motion.p>
        )}
      </div>
    </div>
  )
}