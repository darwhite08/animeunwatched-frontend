"use client"

import { motion } from "framer-motion"
import { TopThree } from "@/components/leaderboard/TopThree"
import { RankingTable } from "@/components/leaderboard/RankingTable"
import { Trophy, Zap, Globe, Crown, Star } from "lucide-react"

export default function PremiumLeaderboard() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 space-y-20 pb-32">
      
      {/* 1. CINEMATIC HEADER */}
      <header className="relative py-10 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Season 04 • Global Rankings</span>
          </motion.div>
          
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl">
            The <span className="bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent italic">Pantheon</span>
          </h1>
        </div>
      </header>

      {/* 2. THE PODIUM (Visual centerpiece) */}
      <TopThree />

      {/* 3. ANALYTICS BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <LeaderboardMetric icon={Globe} label="Total Contenders" value="12.4k" trend="+12%" color="text-blue-400" />
        <LeaderboardMetric icon={Zap} label="Peak Velocity" value="840 XP/h" trend="Stable" color="text-yellow-400" />
        <LeaderboardMetric icon={Crown} label="Elite Threshold" value="18.2k" trend="+2.4k" color="text-purple-400" />
        <LeaderboardMetric icon={Trophy} label="Personal Standing" value="#812" trend="Top 4%" color="text-indigo-400" highlight />
      </div>

      {/* 4. THE RANKING LIST */}
      <section className="space-y-10">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-3xl font-black tracking-tighter italic">World Rankings</h2>
          <div className="h-px flex-1 mx-8 bg-gradient-to-r from-white/10 to-transparent" />
        </div>
        <RankingTable />
      </section>
    </div>
  )
}

function LeaderboardMetric({ icon: Icon, label, value, trend, color, highlight = false }: any) {
  return (
    <div className={`group p-8 rounded-[2.5rem] border transition-all duration-500 ${
      highlight ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-white/5 bg-[#0a0a0a]'
    }`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl bg-black border border-white/10 ${color}`}>
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{trend}</span>
      </div>
      <p className="text-4xl font-black text-white tracking-tighter mb-1">{value}</p>
      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</p>
    </div>
  )
}