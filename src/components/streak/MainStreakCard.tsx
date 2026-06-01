// src/components/streak/MainStreakCard.tsx
import { Flame, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

export const MainStreakCard = ({ currentStreak, bestStreak }: { currentStreak: number; bestStreak: number }) => (
  <section className="relative overflow-hidden rounded-[3rem] border border-border bg-gradient-to-br from-indigo-950/40 to-black p-12 shadow-2xl group">
    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
    
    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
      <div className="space-y-4 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 animate-pulse">
            <Flame size={32} fill="currentColor" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.3em] text-muted">Active Momentum</span>
        </div>
        <h2 className="text-8xl font-black tracking-tighter text-foreground">
          {currentStreak}<span className="text-3xl text-subtle ml-2 italic">days</span>
        </h2>
      </div>

      <div className="h-px md:h-24 w-full md:w-px bg-surface" />

      <div className="flex flex-col items-center md:items-end gap-2 text-right">
        <p className="text-muted text-xs font-bold uppercase tracking-widest">Personal Legend</p>
        <p className="text-4xl font-black tracking-tight text-white/90">{bestStreak} Days</p>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase">
          <TrendingUp size={12} /> Top 2% Globally
        </div>
      </div>
    </div>
  </section>
)