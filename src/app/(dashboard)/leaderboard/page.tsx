"use client"

import { motion } from "framer-motion";
import { TopThree } from "@/components/leaderboard/TopThree";
import { RankingTable } from "@/components/leaderboard/RankingTable";
import { Trophy, Globe, Zap, Crown } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-mesh pb-20 px-6">
      <div className="max-w-7xl mx-auto pt-16 space-y-16">
        
        {/* HEADER SECTION */}
        <header className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest"
          >
            <Crown size={12} /> Global Hall of Fame
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white">
            The <span className="text-indigo-500 text-glow-indigo">Pantheon</span>
          </h1>
        </header>

        {/* TOP 3 PODIUM */}
        <TopThree />

        {/* BENTO STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={Globe} label="Global Users" value="12,402" color="text-blue-400" />
          <StatCard icon={Zap} label="Daily Active" value="1,120" color="text-yellow-400" />
          <StatCard icon={Trophy} label="Your Standing" value="#812" color="text-indigo-400" isUser />
        </div>

        {/* RANKING TABLE */}
        <section className="space-y-8">
          <h2 className="text-3xl font-black italic tracking-tighter">Live Rankings</h2>
          <RankingTable />
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, isUser }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] border ${isUser ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/5 bg-black/40'} glass-card flex items-center gap-6 group hover:-translate-y-1 transition-all duration-500`}>
      <div className={`p-4 rounded-2xl bg-black border border-white/5 ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</p>
        <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
      </div>
    </div>
  );
}