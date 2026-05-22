"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, ShieldCheck, Crown, Zap, Activity, Swords } from "lucide-react";

// Mock data to give distinct visual identities to the top 3
const PANTHEON_DATA = [
  {
    rank: 1,
    name: "Otaku_Arch",
    title: "Legendary Shinobi",
    level: 99,
    xp: "1.2M",
    accent: "from-amber-400 to-orange-600",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_30px_-5px_rgba(251,191,36,0.3)]",
    Icon: Crown,
  },
  {
    rank: 2,
    name: "Shadow_Watcher",
    title: "Arch-Mage",
    level: 88,
    xp: "840K",
    accent: "from-indigo-400 to-purple-600",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_30px_-5px_rgba(99,102,241,0.2)]",
    Icon: Swords,
  },
  {
    rank: 3,
    name: "Void_Seeker",
    title: "Elite Jonin",
    level: 75,
    xp: "620K",
    accent: "from-emerald-400 to-teal-600",
    border: "border-emerald-500/30",
    glow: "shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]",
    Icon: Zap,
  },
];

export default function DojoLeaderboard() {
  return (
    <section className="py-32 bg-[#020202] relative overflow-hidden border-y border-white/[0.03]">
      
      {/* 1. BACKGROUND GRID & TOP SCANLINE */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

      {/* 2. ATMOSPHERIC GLOW */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[800px] h-[800px] bg-amber-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">
        
        {/* LEFT COLUMN: TYPOGRAPHY & CTA */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Status Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.05] backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="text-amber-300 text-[10px] font-black uppercase tracking-[0.3em]">
              Global Server Rankings • Live
            </span>
          </div>

          <h2 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-[0.85] uppercase">
            The <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400 animate-shimmer bg-[length:200%_auto]">
              Pantheon
            </span>
            <br /> Of Watchers.
          </h2>

          <p className="text-white/40 text-sm md:text-base max-w-md leading-relaxed font-medium">
            Every episode logged, every review verified, and every poll won contributes to your standing. Ascend from <span className="text-white/80 italic">Neophyte</span> to <span className="text-white/80 italic">Legendary Shinobi</span>.
          </p>

          {/* High-End Cyber Button */}
          <Link href="/leaderboard" className="group relative inline-block px-8 py-4 bg-white text-black font-black uppercase text-[11px] tracking-[0.3em] overflow-hidden rounded-sm transition-all hover:scale-105 active:scale-95">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
            <span className="relative z-10 group-hover:text-white transition-colors duration-500 flex items-center gap-2">
              <Trophy size={14} /> Ascend The Ranks
            </span>
          </Link>
        </motion.div>

        {/* RIGHT COLUMN: THE LEADERBOARD CARDS */}
        <div className="relative">
          {/* Connecting HUD Line (Desktop only) */}
          <div className="absolute top-1/2 -left-20 w-16 h-[1px] bg-gradient-to-r from-transparent to-indigo-500/50 hidden lg:block" />

          <div className="space-y-4">
            {PANTHEON_DATA.map((user, index) => (
              <motion.div
                key={user.rank}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6, type: "spring", stiffness: 60 }}
                className={`group relative flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border ${user.border} backdrop-blur-xl transition-all hover:bg-white/[0.04] hover:-translate-y-1 ${user.glow}`}
              >
                {/* Background Gradient Hover Sweep */}
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-center gap-6 relative z-10">
                  {/* Rank Number */}
                  <div className="relative w-12 text-center">
                    <span className="absolute -inset-2 bg-gradient-to-b from-white/10 to-transparent blur-sm text-transparent bg-clip-text font-black text-4xl italic">
                      0{user.rank}
                    </span>
                    <span className="relative text-3xl font-black italic text-white/90">
                      0{user.rank}
                    </span>
                  </div>

                  {/* Avatar/Badge */}
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${user.accent} p-[2px] shadow-lg`}>
                     <div className="h-full w-full rounded-2xl bg-[#0a0a0a] flex items-center justify-center">
                        <user.Icon size={20} className={`text-transparent bg-clip-text bg-gradient-to-br ${user.accent} drop-shadow-md`} color="currentColor" />
                     </div>
                  </div>

                  {/* User Meta */}
                  <div>
                    <h4 className="text-white font-black text-lg uppercase tracking-tight flex items-center gap-2">
                      {user.name}
                      {user.rank === 1 && <ShieldCheck size={14} className="text-amber-400" />}
                    </h4>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-0.5">
                      LVL {user.level} <span className="text-white/20 mx-1">•</span> <span className="text-amber-400">{user.title}</span>
                    </p>
                  </div>
                </div>

                {/* Score & HUD Elements */}
                <div className="text-right relative z-10 flex flex-col items-end">
                  <div className="flex items-center gap-1.5 text-white">
                    <Activity size={12} className="text-white/40" />
                    <span className="font-mono text-lg font-bold">{user.xp}</span>
                    <span className="text-[9px] text-white/30 uppercase tracking-widest font-black">XP</span>
                  </div>
                  {/* Decorative corner brackets on hover */}
                  <div className="absolute -top-2 -right-2 w-3 h-3 border-t border-r border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -bottom-2 -right-2 w-3 h-3 border-b border-r border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
      </div>
    </section>
  );
}